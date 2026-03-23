const PDFDocument = require("pdfkit");

function generatePDF(data, res) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=RoninScan_Report.pdf`);

    doc.pipe(res);

    // --- HEADER: THEMED STRIPE ---
    doc.rect(0, 0, 612, 100).fill('#05070d'); 
    doc.rect(0, 95, 612, 5).fill('#ff003c'); // Neon Red Signature Line

    // --- BRANDING ---
    doc.fillColor('#ff003c').fontSize(24).text("RONINSCAN", 50, 40, { characterSpacing: 2 });
    doc.fillColor('#ffffff').fontSize(10).text("SECURITY LABS | THREAT INTELLIGENCE REPORT", 50, 70);

    doc.moveDown(5);

    // --- TARGET INFO ---
    doc.fillColor('#1e293b').fontSize(14).text("AUDIT TARGET:", 50, 130);
    doc.fillColor('#000000').fontSize(11).text(data.address, 50, 150);
    
    // --- RISK BADGE ---
    const riskColor = data.risk === "HIGH" ? "#ff003c" : (data.risk === "MEDIUM" ? "#ffa500" : "#00ff9c");
    doc.rect(400, 125, 150, 40).fill(riskColor);
    doc.fillColor('#ffffff').fontSize(14).text(data.risk, 410, 138, { width: 130, align: 'center' });

    doc.moveDown(4);

    // --- FINDINGS ---
    doc.fillColor('#000000').fontSize(16).text("TECHNICAL SUMMARY", 50, 210);
    doc.rect(50, 230, 510, 1).fill('#cccccc');
    
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#444444').text(data.summary);
    doc.moveDown(2);

    data.findings.forEach((f, i) => {
        doc.fillColor('#ff003c').fontSize(12).text(`[!] ${f.type}`);
        doc.fillColor('#000000').fontSize(10).text(f.details || JSON.stringify(f.data), { indent: 20 });
        doc.moveDown();
    });

    // --- FOOTER SIGNATURE ---
    doc.fontSize(8).fillColor('#999999').text("VERIFIED BY RONINSCAN AUTO-SCAN ENGINE v2.0", 50, 780, { align: 'center' });

    doc.end();
}

module.exports = { generatePDF };
