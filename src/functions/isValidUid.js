const uidRegexp = /^\d{10,25}$/;

export default function isValidUid(uid) {
  if (!uid) return false;
  return uidRegexp.test(uid);
};
