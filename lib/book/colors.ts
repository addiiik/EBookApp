const BASE_BOOK_COLORS = [
  { h: 24, s: 40, l: 35 },
  { h:  30, s: 35, l: 45 },
  { h: 35, s: 30, l: 55 },
  { h: 40, s: 25, l: 60 },
  { h: 20, s: 45, l: 30 },
  { h: 15, s: 50, l: 25 },
  { h: 45, s: 20, l: 65 },
  { h: 28, s: 55, l: 40 },
  { h: 10, s: 35, l: 35 },
  { h:  0, s: 30, l: 30 },
  { h: 200, s: 25, l: 35 },
  { h:  160, s:  20, l: 35 },
  { h: 280, s: 20, l: 35 },
  { h:  340, s: 25, l: 35 },
  { h: 90, s: 20, l: 35 },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str. length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getBookCoverColor(bookId: string): string {
  const hash = hashString(bookId);
  
  const baseColorIndex = hash % BASE_BOOK_COLORS.length;
  const baseColor = BASE_BOOK_COLORS[baseColorIndex];
  
  const secondaryHash = hashString(bookId + 'salt');
  const lightnessModifier = (secondaryHash % 21) - 10;
  
  const tertiaryHash = hashString(bookId + 'pepper');
  const saturationModifier = (tertiaryHash % 11) - 5;
  
  const finalL = Math.max(20, Math.min(70, baseColor.l + lightnessModifier));
  const finalS = Math. max(15, Math.min(60, baseColor.s + saturationModifier));
  
  return `hsl(${baseColor.h}, ${finalS}%, ${finalL}%)`;
}