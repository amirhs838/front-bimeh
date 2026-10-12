/** Converts Latin digits in a string to Persian digits. */
export function toFa(input: string | number): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return String(input).replace(/\d/g, (d) => fa[Number(d)]);
}

/** Converts Persian/Arabic digits to Latin digits. */
export function toEn(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** CSS px (on the 450px design frame) → rem string, so it scales with the root font-size. */
export function px(n: number): string {
  return `${n / 16}rem`;
}
