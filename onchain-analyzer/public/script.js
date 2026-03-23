// Initialize Background Particles
particlesJS("particles-js", {
    particles: {
        number: { value: 70 },
        color: { value: "#ff003c" },
        shape: { type: "circle" },
        opacity: { value: 0.3 },
        size: { value: 2 },
        move: { speed: 1 }
    }
});

async function analyze() {
    const address = document.getElementById("address").value;
    const resultDiv = document.getElementById("result");

    if (!address) {
        alert("Please enter a valid contract address.");
        return;
    }

    // Show the result panel and the loading animation
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
        <h3 style="text-align: center; color: #ff003c;">SCANNING BLOCKCHAIN...</h3>
        <div class="loader"></div>
    `;

    try {
        const res = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address })
        });

        if (!res.ok) throw new Error("Analysis failed");

        const data = await res.json();
        
        // Calculate dynamic threat meter
        let riskClass = data.risk.toLowerCase();
        let meter = "";
        
        if(data.risk === "LOW") meter = "<span style='color: #00ff9c;'>█░░░░░</span>";
        if(data.risk === "MEDIUM") meter = "<span style='color: orange;'>████░░</span>";
        if(data.risk === "HIGH") meter = "<span style='color: #ff003c;'>██████</span>";

        // Inject the final UI results
        resultDiv.innerHTML = `
            <h3>Threat Level: <span class="${riskClass}">${data.risk}</span></h3>
            <p><strong>Threat Meter:</strong> ${meter}</p>
            <p><strong>Verified:</strong> ${data.verified ? "✅ Yes" : "⚠️ No (Bytecode Scanned)"}</p>
            <p><strong>Summary:</strong> ${data.summary}</p>
            <h4 style="margin-top: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Raw Findings:</h4>
            <pre>${JSON.stringify(data.findings, null, 2)}</pre>
        `;

    } catch (err) {
        resultDiv.innerHTML = `<h3 style="color: red;">Error: Could not complete scan. Check console.</h3>`;
        console.error(err);
    }
}

async function downloadPDF() {
    const address = document.getElementById("address").value;
    
    if (!address) {
        alert("Please enter an address to generate a report.");
        return;
    }

    try {
        const res = await fetch("/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address })
        });

        if (!res.ok) throw new Error("Report generation failed");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `RoninScan_Report_${address.substring(0, 6)}.pdf`;
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert("Failed to download PDF.");
        console.error(err);
    }
}
