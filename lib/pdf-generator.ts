import { formatDirham } from "dirham";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export async function generateCertificatePDF() {
  const certificateElement = document.getElementById("certificate-preview");

  if (!certificateElement) {
    console.error("Certificate element not found");
    return;
  }

  try {
    const dataUrl = await toPng(certificateElement, {
      quality: 1,
      pixelRatio: 3,
      cacheBust: true,
    });

    const imgWidth = 210;
    const pageHeight = 297;

    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const imgHeight = (img.height * imgWidth) / img.width;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Use full width, start from top
    const margin = 5;
    const maxWidth = imgWidth - margin * 2;

    let finalWidth = maxWidth;
    let finalHeight = (img.height * finalWidth) / img.width;

    // If still too tall, scale down proportionally
    const maxHeight = pageHeight - margin * 2;
    if (finalHeight > maxHeight) {
      const ratio = maxHeight / finalHeight;
      finalWidth = finalWidth * ratio;
      finalHeight = maxHeight;
    }

    // Center horizontally, start from top with small margin
    const x = (imgWidth - finalWidth) / 2;
    const y = margin;

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, imgWidth, pageHeight, "F");

    doc.addImage(dataUrl, "PNG", x, y, finalWidth, finalHeight);
    doc.save("Mazal-Certificate.pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
}

export async function generateInvoice(transaction: any) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Mazal Platform Invoice", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Invoice ID: ${transaction.id}`, 14, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);
  doc.text(`Buyer: ${transaction.buyerName}`, 14, 52);

  const startY = 60;
  doc.setFillColor(10, 59, 158);
  doc.rect(14, startY, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Description", 18, startY + 6);
  doc.text("Amount", 180, startY + 6, { align: "right" });

  const formatPdfAmount = (amount: number) =>
    formatDirham(amount, { decimals: 0, locale: "en-AE" });

  const rows = [
    ["Plate Price", formatPdfAmount(transaction.price)],
    ["1% Escrow Fee", formatPdfAmount(transaction.price * 0.01)],
    ["4% Platform Fee", formatPdfAmount(transaction.price * 0.04)],
    ["3% Service Fee", formatPdfAmount(transaction.price * 0.03)],
  ];

  rows.forEach((row, index) => {
    const y = startY + 10 + index * 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(row[0], 18, y);
    doc.text(row[1], 180, y, { align: "right" });
  });

  const totalY = startY + 10 + rows.length * 8 + 2;
  doc.setDrawColor(10, 59, 158);
  doc.line(14, totalY - 2, 196, totalY - 2);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 18, totalY + 6);
  doc.text(formatPdfAmount(transaction.total), 180, totalY + 6, { align: "right" });

  doc.save(`Invoice-${transaction.id}.pdf`);
}
