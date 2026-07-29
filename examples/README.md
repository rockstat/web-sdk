# Примеры: расшифровка значений полей форм

FormTracker с опцией `encryptionKey` шифрует значения полей ввода на клиенте.
В событиях `field_*` приходит `data.evalue` (зашифрованная строка) и флаг `data.eenc: 1`.

## Схема

Гибридное шифрование через Web Crypto API:

1. При загрузке страницы SDK генерирует случайный сессионный ключ **AES-256-GCM**
   и один раз оборачивает его публичным ключом сайта (**RSA-OAEP, SHA-256**).
2. Каждое значение поля шифруется сессионным ключом с новым случайным IV (12 байт).
3. Расшифровать может только сервер, владеющий приватным ключом.

Формат `evalue`:

```
1:<wrappedKey base64>:<iv base64>:<ciphertext base64>
│  │                   │           └─ AES-256-GCM, последние 16 байт — auth tag
│  │                   └─ 12 байт, уникален для каждого значения
│  └─ сессионный AES-ключ, обёрнутый RSA-OAEP(SHA-256) — одинаков для всех
│     событий одной страницы, расшифрованный ключ можно кешировать
└─ версия формата
```

Если Web Crypto недоступен (страница не в secure context, старый браузер),
значение не отправляется вовсе — открытый текст никогда не покидает браузер.
Поля `type=password` и `type=file` не собираются никогда.

## Генерация ключей

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem
```

Публичный ключ (содержимое `public.pem` целиком или только base64-тело) —
в конфиг SDK:

```js
rstat4('configure', {
  trackForms: {
    encryptionKey: '<public key>'
  }
});
```

Приватный ключ — только на сервер. В git он попадать не должен.

## Расшифровка

Node.js (без зависимостей):

```bash
node decrypt-field-value.js private.pem "1:AC+6l4fJ...:t7UcBX...:RCUNkR..."
```

Python (`pip install cryptography`):

```bash
python3 decrypt_field_value.py private.pem "1:AC+6l4fJ...:t7UcBX...:RCUNkR..."
```

Оба файла можно использовать как модули — см. докстринги.
