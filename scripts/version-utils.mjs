export function isVersionAtLeast(version, minimum) {
  const actual = String(version).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const required = String(minimum).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(actual.length, required.length);
  for (let index = 0; index < length; index += 1) {
    const left = actual[index] ?? 0;
    const right = required[index] ?? 0;
    if (left > right) return true;
    if (left < right) return false;
  }
  return true;
}
