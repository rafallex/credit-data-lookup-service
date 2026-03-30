const express = require("express");
const { getCreditData } = require("./creditDataService");

const router = express.Router();

function maskSsn(ssn) {
  return ssn.length >= 4 ? `***-**-${ssn.slice(-4)}` : "****";
}

router.get("/ping", (_req, res) => {
  res.sendStatus(200);
});

router.get("/credit-data/:ssn", async (req, res) => {
  try {
    const data = await getCreditData(req.params.ssn);
    res.json(data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.sendStatus(404);
    }
    console.error(`Error fetching credit data for ${maskSsn(req.params.ssn)}:`, err.message);
    res.status(502).json({ error: "Failed to retrieve credit data" });
  }
});

module.exports = router;
