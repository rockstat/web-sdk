const uidRegexp = /^\d{10,25}$/;
const uidRE = new RegExp('^[0-9]{10,22}$');

export function isValidUid(uid) {
  if (!uid) return false;
  return uidRE.test(uid);
};

export function cleanUid(uid) {
  return isValidUid(uid) ? uid : undefined;
}
