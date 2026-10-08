/** Small, dependency-free, paginated PDF for a textual clinical record. */
export function textPdf(lines: string[]): Buffer {
  const clean = lines.flatMap(line => {
    const text = line.normalize('NFKD').replace(/[^\x20-\x7e]/g, '?');
    return text.match(/.{1,85}(?:\s|$)|.{1,85}/g) || [''];
  });
  const pages: string[][] = [];
  for (let i = 0; i < clean.length; i += 48) pages.push(clean.slice(i, i + 48));
  const objects: string[] = ['', '<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const kids: string[] = [];
  for (const page of pages) {
    const id = objects.length;
    kids.push(`${id} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${id + 1} 0 R >>`);
    const content = 'BT /F1 11 Tf 45 795 Td 15 TL\n' + page.map(l => '(' + l.replace(/[\\()]/g, '\\$&') + ') Tj T*').join('\n') + '\nET';
    objects.push(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
  }
  objects[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n` + offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
