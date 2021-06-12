export default function isValidTimestamp(timestamp) {
  if (!timestamp || Number.isNaN(timestamp) || typeof timestamp !== 'number') {
    return false;
  }
  if (timestamp > 999999999 && timestamp < 10000000000) {
    return true;
  }
  return false;
}
