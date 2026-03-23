const PDFDocument = require("pdfkit");

function generatePDF(data, res) {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("On-Chain Threat Intelligence Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Contract Address: ${data.address}`);
    doc.text(`Verified: ${data.verified ? "Yes" : "No"}`);
    doc.text(`Risk Level: ${data.risk}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);

    doc.moveDown();

    doc.fontSize(14).text("Summary:");
    doc.fontSize(12).text(data.summary);

    doc.moveDown();

    doc.fontSize(14).text("Findings:");
    doc.fontSize(10);

    data.findings.forEach((f, i) => {
        doc.text(`${i + 1}. Type: ${f.type}`);
        doc.text(JSON.stringify(f, null, 2));
        doc.moveDown();
    });

    doc.end();
}

module.exports = { generatePDF };
