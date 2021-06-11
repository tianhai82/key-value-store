export default function isValidTimestamp(timestamp) {
  if (!timestamp || timestamp.length !== 10) {
    return false;
  }
  const t = parseInt(timestamp, 10);
  if (Number.isNaN(t)) {
    return false;
  }
  if (t > 999999999 && t < 10000000000) {
    return true;
  }
  return false;
}
