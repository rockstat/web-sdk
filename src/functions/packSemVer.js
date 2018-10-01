export function packSemVer(val) {
  const [major, minor, patch] = val.split('.');
  return Number(major || 0) * 1000000 + Number(minor || 0) * 1000 + Number(patch || 0);
}
