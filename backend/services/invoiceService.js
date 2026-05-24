const PDFDocument = require("pdfkit");

/**
 * Generates a professional Gryork invoice PDF.
 * Returns a Buffer containing the PDF bytes.
 * @param {Object} reg - TechPreneurRegistration document
 * @returns {Promise<Buffer>}
 */
function generateInvoicePDF(reg) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 595.28;  // A4 width
    const pageH = 841.89; // A4 height
    const BLUE = "#1E3A8A";
    const LIGHT_BLUE = "#3B82F6";
    const DARK = "#111827";
    const GRAY = "#6B7280";
    const LIGHT_GRAY = "#F9FAFB";
    const GREEN = "#16A34A";
    const WHITE = "#FFFFFF";
    const BORDER = "#E5E7EB";

    const invoiceNumber = `GRK-${new Date(reg.createdAt).getFullYear()}-${String(reg._id).slice(-6).toUpperCase()}`;
    const paymentDate = new Date(reg.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const paymentId = reg.razorpayPaymentId || reg.transactionId || "N/A";
    const orderId = reg.razorpayOrderId || "N/A";

    // ─── HEADER BAND ───────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 110).fill(BLUE);

    // Company name
    doc.fillColor(WHITE).fontSize(26).font("Helvetica-Bold")
       .text("GRYORK", 50, 28, { continued: true })
       .fillColor(LIGHT_BLUE).fontSize(26).text(" Consultants");

    // Tagline
    doc.fillColor("rgba(255,255,255,0.6)").fontSize(9).font("Helvetica")
       .text("Empowering Future TechPreneurs", 50, 62);

    // INVOICE label on right
    doc.fillColor(WHITE).fontSize(28).font("Helvetica-Bold")
       .text("INVOICE", W - 200, 30, { width: 150, align: "right" });

    // Invoice number
    doc.fillColor("rgba(255,255,255,0.7)").fontSize(9).font("Helvetica")
       .text(`# ${invoiceNumber}`, W - 200, 70, { width: 150, align: "right" });

    // ─── META ROW (Date / Status) ───────────────────────────────────────────────
    doc.rect(0, 110, W, 48).fill(LIGHT_GRAY);

    const statusColor = reg.paymentVerified ? GREEN : "#D97706";
    const statusLabel = reg.paymentVerified ? "PAID & VERIFIED" : "PENDING";

    doc.fillColor(GRAY).fontSize(8).font("Helvetica")
       .text("DATE", 50, 122).text("PAYMENT ID", 200, 122).text("STATUS", W - 160, 122);

    doc.fillColor(DARK).fontSize(9.5).font("Helvetica-Bold")
       .text(paymentDate, 50, 133)
       .text(paymentId, 200, 133, { width: 200 });

    // Status badge
    doc.roundedRect(W - 160, 118, 110, 22, 4).fill(reg.paymentVerified ? "#D1FAE5" : "#FEF3C7");
    doc.fillColor(statusColor).fontSize(9).font("Helvetica-Bold")
       .text(statusLabel, W - 158, 124, { width: 106, align: "center" });

    // ─── DIVIDER ───────────────────────────────────────────────────────────────
    doc.moveTo(50, 174).lineTo(W - 50, 174).strokeColor(BORDER).lineWidth(1).stroke();

    // ─── BILL TO ───────────────────────────────────────────────────────────────
    doc.fillColor(GRAY).fontSize(8).font("Helvetica-Bold")
       .text("BILL TO", 50, 186);

    doc.fillColor(DARK).fontSize(14).font("Helvetica-Bold")
       .text(reg.name, 50, 200);

    doc.fillColor(GRAY).fontSize(9.5).font("Helvetica")
       .text(reg.email, 50, 220)
       .text(reg.phone ? `+91 ${reg.phone}` : "", 50, 234)
       .text(reg.college, 50, 248)
       .text(`${reg.branch} • ${reg.year}`, 50, 262);

    // ─── GRYORK INFO (right side) ───────────────────────────────────────────────
    doc.fillColor(GRAY).fontSize(8).font("Helvetica-Bold")
       .text("FROM", 380, 186);

    doc.fillColor(DARK).fontSize(11).font("Helvetica-Bold")
       .text("Gryork Consultants", 380, 200);

    doc.fillColor(GRAY).fontSize(9.5).font("Helvetica")
       .text("contact@gryork.com", 380, 220)
       .text("training.gryork.com", 380, 234)
       .text("India", 380, 248);

    // ─── ITEMS TABLE ────────────────────────────────────────────────────────────
    const tableTop = 306;
    const tableBottom = tableTop + 54;

    // Header row
    doc.rect(50, tableTop, W - 100, 24).fill(BLUE);
    doc.fillColor(WHITE).fontSize(8.5).font("Helvetica-Bold")
       .text("ITEM DESCRIPTION", 62, tableTop + 8)
       .text("TRACK", 360, tableTop + 8)
       .text("AMOUNT", W - 110, tableTop + 8, { width: 60, align: "right" });

    // Item row
    doc.rect(50, tableTop + 24, W - 100, 30).fill(WHITE).strokeColor(BORDER).lineWidth(0.5).stroke();

    doc.fillColor(DARK).fontSize(9.5).font("Helvetica-Bold")
       .text("TechPreneur Industrial Training 2026", 62, tableTop + 33);
    doc.fillColor(GRAY).fontSize(8.5).font("Helvetica")
       .text("Session schedule will be shared on email after registration", 62, tableTop + 44);

    doc.fillColor(GRAY).fontSize(9).font("Helvetica")
       .text(reg.trackPreference, 360, tableTop + 37, { width: 130 });

    doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold")
       .text(`₹${reg.feeAmount}`, W - 110, tableTop + 37, { width: 60, align: "right" });

    // ─── TOTALS BOX ─────────────────────────────────────────────────────────────
    const totalTop = tableBottom + 24;

    doc.rect(380, totalTop, W - 430, 28).fill(LIGHT_GRAY).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.fillColor(GRAY).fontSize(9).font("Helvetica")
       .text("Original Price:", 390, totalTop + 8);
    doc.fillColor(GRAY).fontSize(9).font("Helvetica")
       .text(`₹5999`, W - 110, totalTop + 8, { width: 60, align: "right" });

    doc.rect(380, totalTop + 28, W - 430, 28).fill(LIGHT_GRAY).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.fillColor(GREEN).fontSize(9).font("Helvetica-Bold")
       .text("Early Bird Discount:", 390, totalTop + 36);
    doc.fillColor(GREEN).fontSize(9).font("Helvetica-Bold")
       .text(`- ₹${5999 - reg.feeAmount}`, W - 110, totalTop + 36, { width: 60, align: "right" });

    doc.rect(380, totalTop + 56, W - 430, 36).fill(BLUE);
    doc.fillColor(WHITE).fontSize(11).font("Helvetica-Bold")
       .text("TOTAL PAID:", 390, totalTop + 67);
    doc.fillColor(WHITE).fontSize(13).font("Helvetica-Bold")
       .text(`₹${reg.feeAmount}`, W - 110, totalTop + 64, { width: 60, align: "right" });

    // ─── TRANSACTION DETAILS ─────────────────────────────────────────────────────
    const txTop = totalTop + 118;
    doc.rect(50, txTop, W - 100, 1).fill(BORDER);

    doc.fillColor(GRAY).fontSize(8).font("Helvetica-Bold")
       .text("PAYMENT DETAILS", 50, txTop + 12);

    const txFields = [
      ["Payment ID", paymentId],
      ["Order ID", orderId],
      ["Payment Method", "Razorpay (UPI / Card / Net Banking)"],
      ["Payment Date", paymentDate],
      ["Payment Status", reg.paymentVerified ? "✓  Confirmed & Verified" : "Pending Verification"],
    ];

    let txY = txTop + 28;
    txFields.forEach(([label, value]) => {
      doc.fillColor(GRAY).fontSize(8.5).font("Helvetica").text(label + ":", 50, txY);
      doc.fillColor(DARK).fontSize(8.5).font("Helvetica-Bold").text(value, 200, txY);
      txY += 16;
    });

    // ─── FOOTER ─────────────────────────────────────────────────────────────────
    doc.rect(0, pageH - 70, W, 70).fill(BLUE);

    doc.fillColor(WHITE).fontSize(11).font("Helvetica-Bold")
       .text("Thank you for joining TechPreneur 2026! 🚀", 0, pageH - 52, { align: "center" });

    doc.fillColor("rgba(255,255,255,0.6)").fontSize(8.5).font("Helvetica")
       .text("Questions? Reach us at contact@gryork.com  |  training.gryork.com", 0, pageH - 34, { align: "center" });

    doc.end();
  });
}

module.exports = { generateInvoicePDF };
