const multer = require("multer");
const path = require("path");

// Configuration for image files
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images/");
  },
  filename: function (req, file, cb) {
    let prefix;

    // Determine prefix based on the route
    if (req.originalUrl.includes("/user/editProfileImage")) {
      prefix = `1-editProfile-${req.user.email}-`; // Prefix '1' for profile pictures
    } else if (req.originalUrl?.includes("/form/register")) {
      prefix = `2-paymentScreenshot-${req.user.email}-`; // Prefix '2' for document uploads
    } else if (req.originalUrl?.includes("/user/addMember")) {
      prefix = `3-AddMember-${req.body.email}-`; // Prefix '2' for document uploads
    } else if (req.originalUrl?.includes("/form/addForm") || req.originalUrl.includes("/form/addEdit")) {
      prefix = `4-FormImages-${req.body.email}-`; // Prefix '2' for document uploads
    } else {
      prefix = "0"; // Default prefix
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${prefix}.${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log(`Image filename generated: ${filename}`);
    cb(null, filename);
  },
});

module.exports = multer({ storage: imageStorage });


const imageUpload = multer({
  storage: imageStorage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extname) {
      console.log(`Image file accepted: ${file.originalname}`);
      return cb(null, true);
    }

    console.log(`Image file rejected: ${file.originalname}`);
    cb(new Error("Only image files are allowed"));
  },
  // limits: {
  //   fileSize: 1024 * 1024 * 10,
  // },
});

// Configuration for Excel files
const excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/excel/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const excelUpload = multer({
  storage: excelStorage,
  fileFilter: function (req, file, cb) {
    cb(null, true); // Accept any file type
  },
  // limits: {
  //   fileSize: 1024 * 1024 * 20, // Limit file size to 20MB
  // },
});

module.exports = { imageUpload, excelUpload };
