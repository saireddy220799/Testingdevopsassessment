const express = require("express");

const app = express();

const PORT = process.env.PORT || 8081;
const VERSION = process.env.APP_VERSION || "4.2.0";

app.get("/", (req, res) => {
    res.json({
        application: "Retail Platform",
        version: VERSION,
        status: "Running"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        version: VERSION
    });
});

app.listen(PORT, () => {
    console.log(`Retail Platform ${VERSION} running on port ${PORT}`);
});