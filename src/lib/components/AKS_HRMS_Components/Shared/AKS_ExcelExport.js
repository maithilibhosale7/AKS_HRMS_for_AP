import * as XLSX from 'xlsx-js-style';

/**
 * Generate and download an Excel file (.xlsx).
 * @param {Object} config
 * @param {string} config.fileName - File name without extension
 * @param {Array}  config.sheets   - Array of { name, headers, rows, colWidths? }
 *
 * header shape: { label: string, key: string, type?: 'date'|'currency'|'number' }
 */
export function downloadExcel({ fileName, sheets }) {
    const wb = XLSX.utils.book_new();

    for (const sheet of sheets) {
        const rows = sheet.rows ?? [];

        // Build header row
        const headerRow = sheet.headers.map(h => ({
            v: h.label,
            t: 's',
            s: { font: { bold: true }, fill: { fgColor: { rgb: 'F3F4F6' } } }
        }));

        // Build data rows
        const dataRows = rows.map(row =>
            sheet.headers.map(h => {
                let val = row[h.key];

                if (h.type === 'date' && val) {
                    try {
                        val = new Date(val).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        });
                    } catch { /* keep raw */ }
                }

                if (val === null || val === undefined) val = '';

                const isNumeric =
                    h.type === 'currency' || h.type === 'number' ||
                    (h.type !== 'date' && typeof val === 'number');

                if (isNumeric && val !== '') {
                    const n = Number(val);
                    if (!isNaN(n)) return { v: n, t: 'n' };
                }

                return { v: String(val), t: 's' };
            })
        );

        const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

        // Column widths
        ws['!cols'] = sheet.headers.map((h, i) => {
            if (sheet.colWidths?.[i]?.wch) return { wch: sheet.colWidths[i].wch };
            let maxLen = h.label.length;
            for (const row of rows) {
                const len = String(row[h.key] ?? '').length;
                if (len > maxLen) maxLen = len;
            }
            return { wch: Math.min(Math.max(maxLen + 2, 8), 40) };
        });

        XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
    }

    XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/** Format a date string for display */
export function fmtDate(d) {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return d; }
}

/** Get current month string (YYYY-MM) */
export function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Get month display name from YYYY-MM string */
export function getMonthName(monthStr) {
    if (!monthStr) return '';
    const [y, m] = monthStr.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-IN', {
        month: 'long', year: 'numeric'
    });
}
