const { createCanvas, loadImage } = require("canvas");

/**
 * Controller to test name position on the certificate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testNamePosition = async (req, res) => {
  try {
    const { certificateImage, namePosition, sampleName } = req.body;

    if (!certificateImage || !namePosition || !sampleName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a canvas to overlay the sample name
    const image = await loadImage(certificateImage);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the certificate image on the canvas
    ctx.drawImage(image, 0, 0);

    // Add the sample name at the specified position
    const fontSize = Math.floor(image.width / 20); // Adjust font size relative to image width
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      sampleName,
      (namePosition.x / 100) * image.width, // Convert percentage to pixels
      (namePosition.y / 100) * image.height // Convert percentage to pixels
    );

    // Convert the canvas back to a base64 image
    const updatedImage = canvas.toDataURL();

    res.status(200).json({ message: "Name position tested successfully", updatedImage });
  } catch (error) {
    console.error("Error in testing name position:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  testNamePosition,
};
