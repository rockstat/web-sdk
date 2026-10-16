#!/usr/bin/env python3
"""Расшифровка значений полей форм, собранных web-sdk (FormTracker + encryptionKey).

Формат evalue: "1:<wrappedKey b64>:<iv b64>:<ciphertext b64>"
  - wrappedKey -- сессионный ключ AES-256-GCM, обёрнутый RSA-OAEP(SHA-256)
  - iv         -- 12 байт, уникален для каждого значения
  - ciphertext -- AES-256-GCM, auth tag в последних 16 байтах
                  (AESGCM из cryptography ожидает его именно там)

Зависимость: pip install cryptography

Использование:
    python3 decrypt_field_value.py path/to/private.pem "<evalue>"

Или как модуль:
    decryptor = FieldDecryptor.from_pem_file("private.pem")
    plaintext = decryptor.decrypt(event["data"]["evalue"])
"""
import base64
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

FORMAT_VERSION = "1"


class FieldDecryptor:
    def __init__(self, private_key):
        self._private_key = private_key
        # Кеш сессионных ключей: один wrappedKey на все события страницы
        self._session_keys = {}

    @classmethod
    def from_pem_file(cls, path, password=None):
        with open(path, "rb") as f:
            key = serialization.load_pem_private_key(f.read(), password=password)
        return cls(key)

    def decrypt(self, evalue: str) -> str:
        parts = evalue.split(":")
        if len(parts) != 4 or parts[0] != FORMAT_VERSION:
            raise ValueError(f"Unsupported evalue format: {evalue[:32]}...")
        _, wrapped_b64, iv_b64, ct_b64 = parts

        session_key = self._session_keys.get(wrapped_b64)
        if session_key is None:
            session_key = self._private_key.decrypt(
                base64.b64decode(wrapped_b64),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                ),
            )
            self._session_keys[wrapped_b64] = session_key

        plaintext = AESGCM(session_key).decrypt(
            base64.b64decode(iv_b64), base64.b64decode(ct_b64), None
        )
        return plaintext.decode("utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print('Usage: python3 decrypt_field_value.py <private.pem> "<evalue>"', file=sys.stderr)
        sys.exit(1)
    decryptor = FieldDecryptor.from_pem_file(sys.argv[1])
    print(decryptor.decrypt(sys.argv[2]))
