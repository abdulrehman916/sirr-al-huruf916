// RFC 4180 records can span lines inside quoted notes or meanings.
export function parseDictionaryCSV(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell === '') quoted = !quoted;
      else cell += char;
    } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  const headers = (rows.shift() || []).map(value => value.trim());
  return rows.map(values => Object.fromEntries(headers.map((key, index) => {
    const value = (values[index] || '').trim();
    return [key, key === 'aliases' ? value.split('|').map(alias => alias.trim()).filter(Boolean) : key === 'is_active' ? value.toLowerCase() !== 'false' : value];
  })));
}
