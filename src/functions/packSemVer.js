export const packSemVer = (val) => {
  const [major, minor, patch] = val.split('.');
  return Number(major) * 1000000 + Number(minor) *  1000 + Number(patch);
}
