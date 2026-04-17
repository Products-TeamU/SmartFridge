export interface ParsedReceiptItem {
  name: string;
  qty: number | null;
  price: number | null;
  rawLine: string;
}

const normalizePrice = (value: string): number | null => {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractQty = (line: string): number | null => {
  const qtyMatch =
    line.match(/(\d+[.,]?\d*)\s*(шт|ш|кг|г|л|мл)\b/i);

  if (!qtyMatch) return null;

  const qty = Number(qtyMatch[1].replace(',', '.'));
  return Number.isFinite(qty) ? qty : null;
};

const isTrashLine = (line: string): boolean => {
  const trashPatterns = [
    /^чек/i,
    /^итог/i,
    /^спасибо/i,
    /^кассир/i,
    /^дата/i,
    /^время/i,
    /^инн/i,
    /^сдача/i,
    /^скидка/i,
    /^налич/i,
    /^безнал/i,
  ];

  return trashPatterns.some((pattern) => pattern.test(line));
};

export const parseReceiptText = (lines: string[]): ParsedReceiptItem[] => {
  const items: ParsedReceiptItem[] = [];

  for (const originalLine of lines) {
    const line = originalLine.trim();

    if (!line || isTrashLine(line)) {
      continue;
    }

    // Ищем цену в конце строки
    const priceMatch = line.match(/(\d+[.,]\d{2})\s*$/);

    if (!priceMatch) {
      continue;
    }

    const price = normalizePrice(priceMatch[1]);
    const qty = extractQty(line);

    const name = line
      .replace(/(\d+[.,]\d{2})\s*$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!name || name.length < 2) {
      continue;
    }

    items.push({
      name,
      qty,
      price,
      rawLine: originalLine,
    });
  }

  return items;
};