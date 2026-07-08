import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateInvoice(transaction: any) {
  const doc = new jsPDF();

  // Invoice address
  doc.setFontSize(18);
  doc.text("Mazal Platform Invoice", 105, 20, { align: "center" });

  // Customer Details
  doc.setFontSize(10);
  doc.text(`Invoice ID: ${transaction.id}`, 14, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);
  doc.text(`Buyer: ${transaction.buyerName}`, 14, 52);

  // Price and Fee Schedule
  autoTable(doc, {
    startY: 60,
    head: [["Description", "Amount"]],
    body: [
      ["Plate Price", `${transaction.price} AED`],
      ["1% Escrow Fee", `${(transaction.price * 0.01).toFixed(0)} AED`],
      ["4% Platform Fee", `${(transaction.price * 0.04).toFixed(0)} AED`],
      ["3% Service Fee", `${(transaction.price * 0.03).toFixed(0)} AED`],
    ],
    foot: [["Total", `${transaction.total} AED`]],
  });

  // Save file
  doc.save(`Invoice-${transaction.id}.pdf`);
}
