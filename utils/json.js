function parseJsonArray(raw, { filterEmptyObjects = true } = {}) {
  if (raw == null) return [];
  const text = String(raw).trim();
  if (!text) return [];

  const value = JSON.parse(text);
  if (!Array.isArray(value)) return [];

  if (!filterEmptyObjects) return value;

  return value.filter((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return true;
    return Object.values(item).some((v) => {
      if (v == null) return false;
      if (typeof v === 'string') return v.trim() !== '';
      return true;
    });
  });
}

module.exports = {
  parseJsonArray
};
