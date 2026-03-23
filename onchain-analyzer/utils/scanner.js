function scanData(source) {
    const findings = [];
    let score = 0;

    // 1. SELF-DESTRUCT (Critical)
    if (source.includes("selfdestruct") || source.includes("suicide")) {
        findings.push({ type: "Critical: Self-Destruct", details: "Contract can be destroyed, potentially locking or deleting funds." });
        score += 5;
    }

    // 2. DELEGATECALL (High)
    if (source.includes("delegatecall")) {
        findings.push({ type: "High: DelegateCall", details: "Allows external contract to modify internal storage. Common in hacks." });
        score += 4;
    }

    // 3. LOW-LEVEL CALLS (Medium)
    if (source.includes(".call{") || source.includes(".call(")) {
        findings.push({ type: "Medium: External Call", details: "Low-level call detected. Potential reentrancy risk." });
        score += 2;
    }

    // 4. TX.ORIGIN (Medium)
    if (source.includes("tx.origin")) {
        findings.push({ type: "Medium: Phishing Vector", details: "Uses tx.origin for auth. Vulnerable to phishing attacks." });
        score += 2;
    }

    // Calculate Risk
    let risk = "LOW";
    if (score >= 6) risk = "HIGH";
    else if (score >= 2) risk = "MEDIUM";

    return { findings, risk };
}

function generateSummary(findings, risk) {
    if (risk === "HIGH") return "🚨 CRITICAL: Dangerous functions found. High probability of malicious intent or severe vulnerability.";
    if (risk === "MEDIUM") return "⚠️ WARNING: Suspicious logic detected. This contract requires manual review before use.";
    return "✅ CLEAR: No immediate high-risk patterns detected during static analysis.";
}

module.exports = { scanData, generateSummary };
