const API_URL = "https://eth-mainnet.g.alchemy.com/v2/LW_0eKUleepdRPITppJ8FTNtNVICMvw-"; 
const gasData = { labels: [], gasUsed: [] };
const ctx = document.getElementById("gasChart").getContext("2d");

const gasChart = new Chart(ctx, {
    type: "bar", 
    data: {
        labels: gasData.labels,
        datasets: [
            { 
                label: "Gas Used", 
                data: gasData.gasUsed, 
                backgroundColor: "orange" 
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Block Number", color: "#fff" }, ticks: { color: "#fff" } },
            y: { title: { display: true, text: "Gas Used", color: "#fff" }, ticks: { color: "#fff" } }
        },
        plugins: {
            legend: { labels: { color: "#fff" } }
        }
    }
});

async function fetchGasUsed() {
    try {
        const latestBlockResponse = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] })
        });
        const latestBlockData = await latestBlockResponse.json();
        if (!latestBlockData.result) throw new Error("Failed to fetch latest block");
        const latestBlock = parseInt(latestBlockData.result, 16);

        const gasUsedPromises = [];
        for (let i = 0; i < 10; i++) {
            gasUsedPromises.push(fetchBlockGasUsed(latestBlock - i));
        }

        const gasUsedData = await Promise.all(gasUsedPromises);
        gasData.labels = gasUsedData.map(data => data.block);
        gasData.gasUsed = gasUsedData.map(data => data.gasUsed);
        gasChart.data.labels = gasData.labels;
        gasChart.data.datasets[0].data = gasData.gasUsed;
        gasChart.update();
    } catch (error) {
        console.error("Error fetching gas used data:", error);
    }
}

async function fetchBlockGasUsed(blockNumber) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["0x" + blockNumber.toString(16), false] })
        });
        const data = await response.json();
        if (!data.result) throw new Error("Block data not available");
        return {
            block: blockNumber,
            gasUsed: parseInt(data.result.gasUsed, 16)
        };
    } catch (error) {
        console.error("Error fetching block data:", error);
        return { block: blockNumber, gasUsed: 0 };
    }
}

fetchGasUsed();
setInterval(fetchGasUsed, 3000);
