require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const { scanData, generateSummary } = require("./utils/scanner");
const { generatePDF } = require("./utils/pdfGenerator");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.ETHERSCAN_API_KEY;

// ANALYZE
app.post("/analyze", async (req, res) => {
    try {
        const { address } = req.body;

        const response = await axios.get(
            `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`
        );

        const result = response.data.result[0];
        const source = result.SourceCode;
        const isVerified = source && source.length > 0;

        let scanResult;

        if (isVerified) {
            scanResult = scanData(source);
        } else {
            const bytecodeRes = await axios.get(
                `https://api.etherscan.io/api?module=proxy&action=eth_getCode&address=${address}&tag=latest&apikey=${API_KEY}`
            );

            const bytecode = bytecodeRes.data.result;
            const decoded = Buffer.from(bytecode.slice(2), "hex").toString("utf-8");
            scanResult = scanData(decoded);
        }

        const summary = generateSummary(scanResult.findings, scanResult.risk);

        res.json({
            address,
            verified: isVerified,
            risk: scanResult.risk,
            findings: scanResult.findings,
            summary
        });

    } catch (err) {
        res.status(500).json({ error: "Analysis failed" });
    }
});

// PDF REPORT
app.post("/report", async (req, res) => {
    try {
        const { address } = req.body;

        const response = await axios.get(
            `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`
        );

        const result = response.data.result[0];
        const source = result.SourceCode;
        const isVerified = source && source.length > 0;

        let scanResult;

        if (isVerified) {
            scanResult = scanData(source);
        } else {
            const bytecodeRes = await axios.get(
                `https://api.etherscan.io/api?module=proxy&action=eth_getCode&address=${address}&tag=latest&apikey=${API_KEY}`
            );

            const bytecode = bytecodeRes.data.result;
            const decoded = Buffer.from(bytecode.slice(2), "hex").toString("utf-8");
            scanResult = scanData(decoded);
        }

        const summary = generateSummary(scanResult.findings, scanResult.risk);

        generatePDF({
            address,
            verified: isVerified,
            risk: scanResult.risk,
            findings: scanResult.findings,
            summary
        }, res);

    } catch (err) {
        res.status(500).send("PDF generation failed");
    }
});

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
