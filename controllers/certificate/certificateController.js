const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Save or Update Certificate
 */
const saveCertificate = async (req, res) => {
  try {
    const { eventId, certificateImg, nameX, nameY, qrX, qrY } = req.body;

    if (!eventId || !certificateImg) {
      return res.status(400).json({ error: "Event ID and Certificate Image are required" });
    }

    const certificate = await prisma.certificate.upsert({
      where: { eventId },
      update: { certificateImg, nameX, nameY, qrX, qrY },
      create: { eventId, certificateImg, nameX, nameY, qrX, qrY },
    });

    res.status(200).json({ message: "Certificate saved successfully", certificate });
  } catch (error) {
    console.error("Error saving certificate:", error);
    res.status(500).json({ error: "An error occurred while saving the certificate" });
  }
};

/**
 * Get Certificate by Event ID
 */
const getCertificateByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { eventId },
    });

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.status(200).json({ certificate });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ error: "An error occurred while fetching the certificate" });
  }
};

/**
 * Delete Certificate
 */
const deleteCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;

    await prisma.certificate.delete({
      where: { eventId },
    });

    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ error: "An error occurred while deleting the certificate" });
  }
};

// Export all controllers
module.exports = {
  saveCertificate,
  getCertificateByEventId,
  deleteCertificate,
};
