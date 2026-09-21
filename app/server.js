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
app.get("/payment", (req, res) => {
    res.json({
        payment: "SUCCESS",
        message: "Payment processing fixed in version 4.2.1",
        version: VERSION
    });
});
// app.get("/health", (req, res) => {
//     res.status(200).json({
//         status: "UP",
//         version: VERSION
//     });
// });
app.get("/health", (req, res) => {
    res.status(500).json({
        status: "DOWN",
        version: VERSION,
        message: "Intentional failure injection for rollback testing"
    });
});

app.listen(PORT, () => {
    console.log(`Retail Platform ${VERSION} running on port ${PORT}`);
});