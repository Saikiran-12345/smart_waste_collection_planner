import { jsPDF } from 'jspdf';

/**
 * Service for generating and exporting CSV and PDF reports.
 */
export const reportService = {
  /**
   * Convert an array of objects to a CSV string.
   */
  convertToCSV(data: Array<Record<string, any>>): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName];
            // Format strings to escape double quotes and wrap in quotes if commas exist
            if (typeof val === 'string') {
              const escaped = val.replace(/"/g, '""');
              return `"${escaped}"`;
            }
            return val !== undefined && val !== null ? val : '';
          })
          .join(','),
      ),
    ];
    return csvRows.join('\n');
  },

  /**
   * Trigger browser download of a CSV file.
   */
  downloadCSV(data: Array<Record<string, any>>, filename: string) {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export a basic waste collection report as a PDF using jsPDF.
   */
  exportSummaryPDF(
    title: string,
    headers: string[],
    rows: Array<string[]>,
    filename: string,
  ) {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Draw simple custom table
    let currentY = 40;
    const colWidth = 180 / headers.length;

    // Header fill
    doc.setFillColor(34, 197, 94); // Tailwind emerald-500
    doc.rect(14, currentY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');

    headers.forEach((header, index) => {
      doc.text(header, 16 + index * colWidth, currentY + 6);
    });

    currentY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('Helvetica', 'normal');

    rows.forEach((row, rowIndex) => {
      // Alternating row background
      if (rowIndex % 2 === 0) {
        doc.setFillColor(243, 244, 246); // gray-100
        doc.rect(14, currentY, 182, 8, 'F');
      }
      row.forEach((cell, cellIndex) => {
        doc.text(cell.toString(), 16 + cellIndex * colWidth, currentY + 6);
      });
      currentY += 8;

      // Handle page break
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(filename);
  },
};
