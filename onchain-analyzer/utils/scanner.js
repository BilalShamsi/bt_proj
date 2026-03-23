function scanData(source) {
    const findings = [];

    const urlRegex = /(https?:\/\/[^\s"]+)/g;
    const urls = source.match(urlRegex);
    if (urls) {
        findings.push({ type: "URL", data: urls });
    }

    const base64Regex = /[A-Za-z0-9+/=]{20,}/g;
    const base64Matches = source.match(base64Regex) || [];

    base64Matches.forEach(str => {
        try {
            const decoded = Buffer.from(str, "base64").toString("utf-8");
            if (decoded.includes("http") || decoded.includes("function")) {
                findings.push({
                    type: "Base64",
                    original: str,
                    decoded
                });
            }
        } catch {}
    });

    const keywordsList = ["eval", "fetch", "script", "iframe", "document.write"];
    const detectedKeywords = keywordsList.filter(k => source.includes(k));

    if (detectedKeywords.length > 0) {
        findings.push({
            type: "Keywords",
            data: detectedKeywords
        });
    }

    let score = 0;
    if (urls) score += 2;
    if (base64Matches.length > 0) score += 3;
    if (detectedKeywords.length > 0) score += 4;

    let risk = "LOW";
    if (score > 6) risk = "HIGH";
    else if (score > 2) risk = "MEDIUM";

    return { findings, risk };
}

function generateSummary(findings, risk) {
    if (risk === "HIGH") {
        return "⚠️ High risk: Encoded payloads and suspicious execution patterns detected.";
    }
    if (risk === "MEDIUM") {
        return "⚠️ Medium risk: External references or encoded data found.";
    }
    return "✅ Low risk: No major suspicious indicators.";
}

module.exports = { scanData, generateSummary };
