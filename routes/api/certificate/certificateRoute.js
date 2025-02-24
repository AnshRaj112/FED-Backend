const express = require("express");
const router = express.Router();
const {
  saveCertificate,
  getCertificateByEventId,
  deleteCertificate,
} = require("../../../controllers/certificate/certificateController");
const { testNamePosition } = require("../../../controllers/certificate/testNameController");

// Save or Update Certificate
router.post("/certificate", saveCertificate);

// Get Certificate by Event ID
router.get("/certificate/:eventId", getCertificateByEventId);

// Delete Certificate
router.delete("/certificate/:eventId", deleteCertificate);

// Test Name Position
router.post("/testNamePosition", testNamePosition);

module.exports = router;
