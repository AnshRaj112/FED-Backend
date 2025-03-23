const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const uploadImage = require("../../utils/image/uploadImage");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { loadImage, createCanvas } = require("canvas");
const { count } = require("console");
const { sendMail } = require("../../utils/email/nodeMailer");

const createEvent = async (req, res) => {
  try {
    const { name, description, attendees, organisationId } = req.body;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        attendees,
        organisationId,
      },
    });

    res.status(200).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function convertToJSON(value) {
  // If the value is already an object, return it
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  // If the value is a string, try parsing it as JSON
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn("Invalid JSON string:", value);
    }
  }

  // Return the original value if it cannot be converted
  return value;
}

const addCertificateTemplate = async (req, res) => {
  try {
    const { eventId } = req.body;

    var fields = req.body.fields;

    if (!req.file) {
      console.log("req.file was not found, file could not be uploaded");
      return next(new ApiError(400, "No file uploaded"));
    }

    fields = convertToJSON(fields);

    //handle template image
    const image = await uploadImage(req.file.path);
    var certificate;

    //create certificate
    if (image) {
      certificate = await prisma.certificate.create({
        data: {
          fields,
          eventId,
          template: image.url,
        },
      });
    }

    //adding certificate to event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: {
        certificates: {
          connect: { id: certificate.id },
        },
      },
    });

    res.status(200).json({
      message: "Certificate template added successfully",
      certificate: certificate,
      event: event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const getCertificate = async (req, res) => {
//   try {
//     const { eventId, batchSize } = req.body;

//     // Validate the event exists
//     const event = await prisma.event.findUnique({
//       where: { id: eventId },
//     });

//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     // Fetch attendees in batches if batchSize is provided
//     if (batchSize) {
//       var attendees = await prisma.event.findUnique({
//         where: { id: eventId },
//       });

//       attendees = attendees.attendees;

//       if (!attendees.length) {
//         return res.status(404).json({
//           error: "No attendees found for the event",
//         });
//       }

//       const generatedCertificates = [];

//       let count = 0;

//       // Generate certificates for each attendee
//       for (const attendee of attendees) {
//         if (count >= batchSize) {
//           break;
//         }
//         const { fieldValues, certificateId } = attendee;

//         // console.log(fieldValues, certificateId, attendee);
//         try {
//           if (certificateId) {
//             const certificateImageSrc = await generateCertificate(
//               certificateId,
//               fieldValues,
//               eventId,
//               attendee
//               // email,
//               // false
//             ); // Change `false` to `true` if you want to email certificates
//             generatedCertificates.push({ attendee, certificateImageSrc });
//           } else {
//             generatedCertificates.push({
//               attendee,
//               error: "Certificate not found",
//             });
//           }
//         } catch (error) {
//           console.error(
//             `Failed to generate certificate for attendee ID: ${attendee}`,
//             error.message
//           );
//           generatedCertificates.push({ attendee, error: error.message });
//         }
//         count++;
//       }

//       // Return generated certificates or errors
//       return res.status(200).json({
//         message: "Certificates generated successfully for the batch",
//         data: generatedCertificates,
//       });
//     }

//     return res
//       .status(400)
//       .json({ error: "Batch size is required for batch processing" });
//   } catch (error) {
//     console.error("Error in getCertificate:", error.message);
//     return res.status(500).json({ error: "An unexpected error occurred" });
//   }
// };

// const generateCertificate = async (
//   certificateId,
//   fieldValues,
//   eventId,
//   attendee
// ) => {
//   try {
//     // Fetch the certificate template
//     const certificate = await prisma.certificate.findUnique({
//       where: { id: certificateId },
//     });

//     if (!certificate || !certificate.template) {
//       throw new Error("Certificate template or URL not found");
//     }

//     const { template, fields } = certificate;

//     if (!fields || !Array.isArray(fields)) {
//       throw new Error("Invalid or missing fields in certificate template");
//     }

//     //remove attendee from attendees array from event schema
//     const event = await prisma.event.findUnique({
//       where: { id: eventId },
//     });

//     if (!event) {
//       throw new Error("Event not found");
//     }

//     // Remove the attendee with the specific `id` from the array
//     const updatedAttendees = event.attendees.filter((attendeeVal) => {
//       return (
//         attendeeVal?.fieldValues?.email &&
//         attendeeVal.fieldValues.email !== attendee?.fieldValues?.email
//       );
//     });

//     // Update the `attendees` field in the database
//     await prisma.event.update({
//       where: { id: eventId },
//       data: {
//         attendees: updatedAttendees,
//       },
//     });

//     if (!certificateId || !eventId || !fieldValues || !fieldValues.email) {
//       throw new Error("Missing required data for creating issuedCertificate");
//     }

//     console.log("Certificate ID:", certificateId);
//     console.log("Event ID:", eventId);
//     console.log("Field Values:", fieldValues);
//     console.log("Certificate Fields:", fields);

//     //add the attendee to the issuedcertificates schema
//     const issuedCertificate = await prisma.issuedCertificates.create({
//       data: {
//         certificateId,
//         eventId,
//         email: fieldValues.email || "unknown-email",
//         fieldValues: fieldValues,
//         fields,
//       },
//     });

//     //push issued certificate to issuedCertificates issuedCertificates[] in event schema
//     await prisma.event.update({
//       where: { id: eventId },
//       data: {
//         issuedCertificates: {
//           connect: { id: issuedCertificate.id },
//         },
//       },
//     });

//     // Load the template image
//     const templateImage = await loadImage(template);
//     const { width, height } = templateImage;

//     // Create a canvas
//     const canvas = createCanvas(width, height);
//     const context = canvas.getContext("2d");

//     // Draw the template image on the canvas
//     context.drawImage(templateImage, 0, 0, width, height);

//     let field;
//     // Iterate over the fields and populate text
//     for (field of fields) {
//       const {
//         fieldName,
//         x,
//         y,
//         font = "Arial",
//         fontSize = 40,
//         fontColor = "#000000",
//       } = field;

//       const value = fieldValues[fieldName];

//       if (fieldName === "qr") {
//         qrX = x;
//         qrY = y;
//       }

//       if (!value) {
//         console.warn(`Missing value for field: ${fieldName}`);
//         continue;
//       }

//       context.font = `${fontSize}px ${font}`;
//       context.fillStyle = fontColor;
//       context.textAlign = "center";
//       // context.fillText(value, x, y);
//       context.fillText(value, (x / 100) * width, (y / 100) * height);
//     }

//     // Generate a QR code containing the certificate link
//     const qrCodeData = `${
//       process.env.DOMAIN || "testDomain"
//     }/verify/certificate?id=${issuedCertificate.id}`;

//     const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
//       width: 150,
//       margin: 1,
//     });

//     // // Draw the QR code on the canvas (bottom-right corner)
//     // const qrX = width - 170; // Adjust placement based on canvas dimensions
//     // const qrY = height - 170;

//     const qrCodeImage = await loadImage(qrCodeBuffer);
//     context.drawImage(
//       qrCodeImage,
//       qrX || width - 170,
//       qrY || height - 170,
//       150,
//       150
//     );

//     // Generate the final image buffer
//     const buffer = canvas.toBuffer("image/png");

//     // //saving image locally only for testing should resolve this
//     // const outputPath = path.resolve(__dirname, `certificate-${Date.now()}.png`);
//     // fs.writeFileSync(outputPath, buffer);

//     // Convert the buffer to a Base64-encoded image source
//     const base64Image = buffer.toString("base64");
//     const imageSrc = `data:image/png;base64,${base64Image}`;

//     // await prisma.issuedCertificates.update({
//     //   where: { id: issuedCertificate.id },
//     //   data: { imageSrc },
//     // });

//     return imageSrc;
//   } catch (error) {
//     console.error("Error generating certificate:", error);
//     throw error;
//   }
// };

const getCertificate = async (req, res) => {
  try {
    const { eventId, batchSize } = req.body;

    if (!eventId || !batchSize) {
      return res
        .status(400)
        .json({ error: "Event ID and batch size are required" });
    }

    // Fetch event with attendees and issued certificates
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { attendees: true, issuedCertificates: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    let attendees = event.attendees || [];

    if (attendees.length === 0) {
      return res
        .status(201)
        .json({ message: "No attendees found for this event" });
    }

    // Limit attendees to batch size
    attendees = attendees.slice(0, batchSize);

    const generatedCertificates = [];

    for (const attendee of attendees) {
      try {
        const { fieldValues, certificateId } = attendee;
        const attendeeEmail = fieldValues?.email;

        if (!certificateId) {
          generatedCertificates.push({
            attendee,
            error: "No certificate ID found",
          });
          continue;
        }

        // Remove any previous issued certificates for this attendee (ensuring overwrite)
        await prisma.issuedCertificates.deleteMany({
          where: { eventId, email: attendeeEmail },
        });

        // Generate new certificate
        const certificateImageSrc = await generateCertificate(
          certificateId,
          fieldValues,
          eventId
        );

        generatedCertificates.push({ attendee, certificateImageSrc });
      } catch (error) {
        console.error(
          `Failed to generate certificate for ${attendee.fieldValues?.email}:`,
          error
        );
        generatedCertificates.push({ attendee, error: error.message });
      }
    }

    return res.status(200).json({
      message: "Certificates generated/updated successfully",
      data: generatedCertificates,
    });
  } catch (error) {
    console.error("Error in getCertificate:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

const generateCertificate = async (certificateId, fieldValues, eventId) => {
  try {
    if (!certificateId || !fieldValues?.email) {
      throw new Error("Missing certificate ID or attendee email");
    }

    const attendeeEmail = fieldValues.email;

    // Fetch certificate template
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate || !certificate.template) {
      throw new Error("Certificate template not found");
    }

    const { template, fields } = certificate;

    // Remove previous issued certificates for this attendee (avoid duplicates)
    await prisma.issuedCertificates.deleteMany({
      where: {
        eventId,
        email: attendeeEmail,
      },
    });

    // Fetch event attendees and filter out the current attendee
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { attendees: true },
    });

    if (event?.attendees) {
      const updatedAttendees = event.attendees.filter(
        (attendee) => attendee.fieldValues.email !== attendeeEmail
      );

      // Update event attendees list
      await prisma.event.update({
        where: { id: eventId },
        data: { attendees: updatedAttendees },
      });
    }

    // Add to issuedCertificates
    const issuedCertificate = await prisma.issuedCertificates.create({
      data: {
        certificateId,
        eventId,
        email: attendeeEmail,
        fieldValues,
        fields,
      },
    });

    // Attach issued certificate to event
    await prisma.event.update({
      where: { id: eventId },
      data: {
        issuedCertificates: {
          connect: { id: issuedCertificate.id },
        },
      },
    });

    // Generate certificate image
    const imageSrc = await generateCertificateImage(
      template,
      fields,
      fieldValues,
      issuedCertificate.id
    );

    return imageSrc;
  } catch (error) {
    console.error("Error generating certificate:", error);
    return null; // Don't stop execution, just return null if an error occurs
  }
};

const generateCertificateImage = async (
  template,
  fields,
  fieldValues,
  certificateId
) => {
  const templateImage = await loadImage(template);
  const { width, height } = templateImage;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  context.drawImage(templateImage, 0, 0, width, height);

  for (const field of fields) {
    const {
      fieldName,
      x,
      y,
      font = "Arial",
      fontSize = 40,
      fontColor = "#000000",
    } = field;
    const value = fieldValues[fieldName];

    if (!value) continue;

    context.font = `${fontSize}px ${font}`;
    context.fillStyle = fontColor;
    context.textAlign = "center";
    context.fillText(value, (x / 100) * width, (y / 100) * height);
  }

  const qrCodeData = `${
    process.env.DOMAIN || "testDomain/"
  }verify/certificate?id=${certificateId}`;
  const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
    width: 150,
    margin: 1,
  });
  const qrCodeImage = await loadImage(qrCodeBuffer);

  context.drawImage(qrCodeImage, width - 170, height - 170, 150, 150);

  const buffer = canvas.toBuffer("image/png");
  return `data:image/png;base64,${buffer.toString("base64")}`;
};

const getVerifyCertficate = async (req, res) => {
  const { issuedCertificate } = req.body;

  try {
    const certificate = await prisma.issuedCertificates.findUnique({
      where: { id: issuedCertificate },
    });
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    res.json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const addAttendee = async (req, res) => {
//   try {
//     const { eventId, attendees } = req.body;

//     if (Array.isArray(attendees) && attendees.length > 0) {
//       // Only one update call to add all attendees
//       await prisma.event.update({
//         where: { id: eventId },
//         data: {
//           attendees: {
//             push: attendees, // Push all attendees at once
//           },
//         },
//       });
//     } else {
//       // Add a single attendee
//       await prisma.event.update({
//         where: { id: eventId },
//         data: {
//           attendees: {
//             push: [attendees], // Ensure it's wrapped in an array
//           },
//         },
//       });
//     }
//     res.status(200).json({ message: "Attendees added successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const addAttendee = async (req, res) => {
//   try {
//     const { eventId, attendees } = req.body;

//     if (!eventId || !attendees || !Array.isArray(attendees)) {
//       return res.status(400).json({ error: "Invalid request data" });
//     }

//     // Fetch the existing attendees for the event
//     const event = await prisma.event.findUnique({
//       where: { id: eventId },
//       select: { attendees: true },
//     });

//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     const existingAttendees = event.attendees || [];

//     // Extract emails of existing attendees
//     const existingEmails = new Set(
//       existingAttendees.map((attendee) => attendee.fieldValues?.email)
//     );

//     // Filter out attendees with duplicate emails
//     const newAttendees = attendees.filter(
//       (attendee) => !existingEmails.has(attendee.fieldValues?.email)
//     );

//     if (newAttendees.length === 0) {
//       return res.status(202).json({ message: "No new attendees to add" });
//     }

//     // Update event with new attendees
//     await prisma.event.update({
//       where: { id: eventId },
//       data: {
//         attendees: {
//           push: newAttendees, // Add only non-duplicate attendees
//         },
//       },
//     });

//     res.status(200).json({ message: "Attendees added successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const addAttendee = async (req, res) => {
  try {
    const { eventId, attendees } = req.body;

    if (!eventId || !attendees || attendees.length === 0) {
      return res
        .status(400)
        .json({ error: "Event ID and attendees are required" });
    }

    const addedAttendees = [];

    for (const attendee of attendees) {
      const existingAttendee = await prisma.attendee.findFirst({
        where: { eventId, email: attendee.email }, // Ensure we check by email and eventId
      });

      if (existingAttendee) {
        // Update existing attendee instead of inserting a new one
        const updatedAttendee = await prisma.attendee.update({
          where: { id: existingAttendee.id },
          data: { ...attendee, updatedAt: new Date() }, // Update necessary fields
        });
        addedAttendees.push(updatedAttendee);
      } else {
        // Insert new attendee if not found
        const newAttendee = await prisma.attendee.create({
          data: { ...attendee, eventId },
        });
        addedAttendees.push(newAttendee);
      }
    }

    return res.status(200).json({
      message: "Attendees added/updated successfully",
      data: addedAttendees,
    });
  } catch (error) {
    console.error("Error in addAttendee:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

const getEvent = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Received event ID:", id); // Log to debug
    const event = await prisma.event.findUnique({
      where: { id },
      include: { certificates: true, issuedCertificates: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCertificateTest = async (req, res) => {
  try {
    const { id } = req.body;
    const certificate = await prisma.certificate.findUnique({ where: { id } });

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const dummyCertificate = async (req, res) => {
  let fields;

  try {
    // Extract and parse fields from form-data
    if (typeof req.body.fields === "string") {
      fields = JSON.parse(req.body.fields); // Parse the stringified JSON
    } else {
      fields = req.body.fields; // Handle it as JSON (unlikely for form-data but safe)
    }

    // Validate fields is an array
    if (!Array.isArray(fields)) {
      return res
        .status(400)
        .json({ error: "Invalid input. 'fields' must be an array." });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON format for 'fields'." });
  }

  const fieldValues = {};

  // Populate dummy values for each field
  fields.forEach((key) => {
    if (key.fieldName === "qr") {
      return;
    }
    fieldValues[key.fieldName] = `Dummy ${key.fieldName}`;
  });

  let image, templateImage;

  if (req.body.imageLink) {
    templateImage = req.body.imageLink;
  } else {
    image = req.file;
    templateImage = image.path;
  }

  console.log("templateImage", templateImage);

  if (!templateImage) {
    return res.status(400).json({ error: "Template image is required." });
  }

  try {
    // Load the template image
    templateImage = await loadImage(templateImage);
    const { width, height } = templateImage;

    // Create a canvas
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Draw the template image on the canvas
    context.drawImage(templateImage, 0, 0, width, height);

    let qrX;
    let qrY;

    // Iterate over the fields and populate text
    for (const field of fields) {
      const {
        fieldName,
        x,
        y,
        font = "Arial",
        fontSize = 40,
        fontColor = "#000000",
      } = field;

      let value;
      if (fieldName === "qr") {
        qrX = x;
        qrY = y;
      } else {
        value = fieldValues[fieldName];

        if (!value) {
          console.warn(`Missing value for field: ${fieldName}`);
          continue;
        }
      }
      context.font = `${fontSize}px ${font}`;
      context.fillStyle = fontColor;
      context.textAlign = "center";
      // context.fillText(value, x, y);
      context.fillText(value, (x / 100) * width, (y / 100) * height);
    }

    // Generate a QR code containing the certificate link
    const qrCodeData = `${process.env.DOMAIN || "testDomain/"}test`;

    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
      width: 150,
      margin: 1,
    });

    // // Draw the QR code on the canvas (bottom-right corner)
    // const qrX =  || width - 170; // Adjust placement based on canvas dimensions
    // const qrY = height - 170;

    const qrCodeImage = await loadImage(qrCodeBuffer);
    context.drawImage(
      qrCodeImage,
      qrX || width - 170,
      qrY || height - 170,
      150,
      150
    );

    // Generate the final image buffer
    const buffer = canvas.toBuffer("image/png");

    // // Save the image locally (for testing)
    // const outputPath = path.resolve(__dirname, `certificate-${Date.now()}.png`);
    // fs.writeFileSync(outputPath, buffer);

    // Convert the buffer to a Base64-encoded image source
    const base64Image = buffer.toString("base64");
    const imageSrc = `data:image/png;base64,${base64Image}`;

    // Return the generated image source
    return res.status(200).json({ imageSrc });
  } catch (error) {
    console.error("Error generating the certificate:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate the certificate." });
  }
};
const getEventByFormId = async (req, res) => {
  try {
    const formId = req.body.formId?.trim();

    if (!formId) {
      return res.status(400).json({ error: "Form ID is required" });
    }

    const event = await prisma.event.findFirst({
      where: { formId },
      include: { certificates: true, issuedCertificates: true },
    });

    if (!event) {
      return res
        .status(201)
        .json({ message: "No event found for the given formId" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if necessary
      return res.status(201).json({ message: "Database query error" });
    }

    return res.status(201).json({ message: "Internal server error" });
  }
};

// const sendBatchMails = async (req, res) => {
//   try {
//     const { batchSize, formId, subject, htmlContent } = req.body;

//     const event = await prisma.event.findFirst({
//       where: { formId },
//       include: { issuedCertificates: true },
//     });

//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }

//     const certificatesToMail = await prisma.issuedCertificates.findMany({
//       where: { eventId: event.id, mailed: false },
//       take: batchSize,
//     });

//     if (certificatesToMail.length === 0) {
//       return res.status(200).json({ message: "No pending emails to send" });
//     }

//     for (const cert of certificatesToMail) {
//       try {
//         let attachments = [];

//         if (cert.imageSrc && cert.imageSrc.startsWith("data:image")) {
//           const base64Data = cert.imageSrc.split(",")[1]; // Extract base64 data
//           const buffer = Buffer.from(base64Data, "base64"); // Convert to Buffer

//           attachments = [
//             {
//               filename: `certificate-${cert.name}.png`, // Include name in filename
//               content: buffer, // Ensure content is a buffer
//               encoding: "base64", // Proper encoding
//             },
//           ];
//         }

//         // Send email with attachment
//         await sendMail(
//           cert.email,
//           subject,
//           htmlContent,
//           "Please find your certificate attached.",
//           attachments
//         );

//         // Update DB: Mark as mailed
//         await prisma.issuedCertificates.update({
//           where: { id: cert.id },
//           data: { mailed: true },
//         });

//         console.log(`Mail sent to ${cert.email}`);
//       } catch (error) {
//         console.error(`Failed to send mail to ${cert.email}:`, error);
//       }
//     }

//     res.status(200).json({
//       message: `${certificatesToMail.length} emails sent successfully`,
//     });
//   } catch (error) {
//     console.error("Error in sendBatchMails:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
const sendBatchMails = async (req, res) => {
  try {
    const { batchSize, eventId, subject, htmlContent } = req.body;

    // Fetch the event and issued certificates
    // const event = await prisma.event.findFirst({
    //   where: { formId },
    //   include: { issuedCertificates: true },
    // });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Get the pending certificates
    const certificatesToMail = await prisma.issuedCertificates.findMany({
      where: { eventId: event.id, mailed: false },
      take: batchSize,
    });

    if (certificatesToMail.length === 0) {
      return res.status(200).json({ message: "No pending emails to send" });
    }

    for (const cert of certificatesToMail) {
      try {
        let attachments = [];

        // Fetch the certificate template
        const certificate = await prisma.certificate.findUnique({
          where: { id: cert.certificateId },
        });

        if (!certificate || !certificate.template) {
          console.error(`Certificate template not found for ${cert.email}`);
          continue; // Skip this email if template is missing
        }

        const { template, fields } = certificate;
        const fieldValues = cert.fieldValues;

        // Load the template image
        const templateImage = await loadImage(template);
        const { width, height } = templateImage;

        // Create a canvas and draw the template image
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        context.drawImage(templateImage, 0, 0, width, height);

        let qrX, qrY;

        // Iterate over fields and populate text
        for (const field of fields) {
          const {
            fieldName,
            x,
            y,
            font = "Arial",
            fontSize = 40,
            fontColor = "#000000",
          } = field;
          const value = fieldValues[fieldName];

          if (fieldName === "qr") {
            qrX = x;
            qrY = y;
            continue;
          }

          if (!value) {
            console.warn(`Missing value for field: ${fieldName}`);
            continue;
          }

          context.font = `${fontSize}px ${font}`;
          context.fillStyle = fontColor;
          context.textAlign = "center";
          context.fillText(value, (x / 100) * width, (y / 100) * height);
        }

        // Generate a QR code containing the certificate link
        const qrCodeData = `${
          process.env.DOMAIN || "testDomain/"
        }verify/certificate?id=${cert.id}`;
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
          width: 150,
          margin: 1,
        });

        // Draw the QR code on the canvas
        const qrCodeImage = await loadImage(qrCodeBuffer);
        context.drawImage(
          qrCodeImage,
          qrX || width - 170,
          qrY || height - 170,
          150,
          150
        );

        // Convert canvas to image buffer
        const buffer = canvas.toBuffer("image/png");

        attachments = [
          {
            filename: `certificate-${cert.email}.png`,
            content: buffer,
            encoding: "base64",
          },
        ];

        // Send email with the certificate as an attachment
        await sendMail(
          cert.email,
          subject,
          htmlContent,
          "Please find your certificate attached.",
          attachments
        );

        // Update DB: Mark as mailed
        await prisma.issuedCertificates.update({
          where: { id: cert.id },
          data: { mailed: true },
        });

        console.log(`Mail sent to ${cert.email}`);
      } catch (error) {
        console.error(`Failed to send mail to ${cert.email}:`, error);
      }
    }

    res.status(200).json({
      message: `${certificatesToMail.length} emails sent successfully`,
    });
  } catch (error) {
    console.error("Error in sendBatchMails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const testCertificateSending = async (req, res) => {
  try {
    const { eventId, email, name, subject } = req.body;

    // 1. Fetch the event using eventId
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { certificates: true },
    });

    if (!event || event.certificates.length === 0) {
      return res
        .status(404)
        .json({ error: "Event or certificate template not found" });
    }

    // 2. Get certificate template & fields
    const certificateTemplate =
      event.certificates[event.certificates.length - 1].template;
    const fields = event.certificates[event.certificates.length - 1].fields;

    // 3. Create a dummy certificate
    // const dummyCert = await api.post("/api/certificate/dummyCertificate", {
    //   imageLink: certificateTemplate,
    //   fields,
    // });

    // if (!dummyCert.data || !dummyCert.data.id) {
    //   return res
    //     .status(500)
    //     .json({ error: "Failed to create dummy certificate" });
    // }

    // const certificateId = dummyCert.data.id;
    const certificateId = event.certificates[event.certificates.length - 1].id;

    // Load the template image
    const templateImage = await loadImage(certificateTemplate);
    const { width, height } = templateImage;

    // Create a canvas and draw the template image
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.drawImage(templateImage, 0, 0, width, height);

    let qrX, qrY;

    // 4. Populate dummy values in certificate fields
    // const fieldValues = {
    //   name: "Test User",
    //   date: "01-01-2025",
    //   course: "Test Course",
    //   qr: "testQR",
    // };

    const fieldValues = {
      name,
      date: "01-01-2025",
      course: "Test Course",
      qr: "testQR",
    };

    for (const field of fields) {
      const {
        fieldName,
        x,
        y,
        font = "Arial",
        fontSize = 40,
        fontColor = "#000000",
      } = field;
      const value = fieldValues[fieldName] || "Sample Data";

      if (fieldName === "qr") {
        qrX = x;
        qrY = y;
        continue;
      }

      context.font = `${fontSize}px ${font}`;
      context.fillStyle = fontColor;
      context.textAlign = "center";
      context.fillText(value, (x / 100) * width, (y / 100) * height);
    }

    // Generate a QR code for dummy certificate
    const qrCodeData = `testDomain/verify/certificate?id=${certificateId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
      width: 150,
      margin: 1,
    });

    // Draw the QR code
    const qrCodeImage = await loadImage(qrCodeBuffer);
    context.drawImage(
      qrCodeImage,
      qrX || width - 170,
      qrY || height - 170,
      150,
      150
    );

    // Convert canvas to image buffer
    const buffer = canvas.toBuffer("image/png");

    const attachments = [
      {
        filename: `test-certificate-${email}.png`,
        content: buffer,
        encoding: "base64",
      },
    ];

    // 5. Send the test email
    await sendMail(email, "Test Certificate", subject, "", attachments);

    res.status(200).json({ message: `Test certificate sent to ${email}` });
  } catch (error) {
    console.error("Error in testCertificateSending:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifyCertificate = async (req, res) => {
  const { id } = req.body;

  // Get the certificate by ID
  const certificate = await prisma.issuedCertificates.findUnique({
    where: { id },
  });
  // console.log(certificate);

  if (!certificate) {
    return res.status(404).json({ error: "Certificate not found" });
  }

  const { fieldValues, certificateId } = certificate;

  // Get the certificate template by ID
  const template = await prisma.certificate.findUnique({
    where: { id: certificateId },
  });

  const event = await prisma.event.findUnique({
    where: { id: certificate.eventId },
  });

  const fields = template.fields;

  if (!template) {
    return res.status(404).json({ error: "Certificate template not found" });
  }

  // Load the template image
  const templateImage = await loadImage(template.template);
  const { width, height } = templateImage;

  // Create a canvas to draw the image
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Draw the template image on the canvas
  context.drawImage(templateImage, 0, 0, width, height);

  let qrX, qrY;

  // Iterate over the fields and populate text
  for (let field of fields) {
    const {
      fieldName,
      x,
      y,
      font = "Arial",
      fontSize = 40,
      fontColor = "#000000",
    } = field;

    const value = fieldValues[fieldName];

    // Define position for QR code
    if (fieldName === "qr") {
      qrX = x;
      qrY = y;
    }

    if (!value) {
      console.warn(`Missing value for field: ${fieldName}`);
      continue;
    }

    // Set text properties and draw the text on the image
    context.font = `${fontSize}px ${font}`;
    context.fillStyle = fontColor;
    context.textAlign = "center";
    context.fillText(value, (x / 100) * width, (y / 100) * height);
  }

  // Generate a QR code containing the certificate verification URL
  const qrCodeData = `${
    process.env.DOMAIN || "testDomain/"
  }verify/certificate?id=${certificate.id}`;
  const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
    width: 150,
    margin: 1,
  });

  // Load the generated QR code image
  const qrCodeImage = await loadImage(qrCodeBuffer);

  // Draw the QR code on the canvas (bottom-right corner or position specified by the template)
  context.drawImage(
    qrCodeImage,
    qrX || width - 170, // Default position if QR X is not provided
    qrY || height - 170, // Default position if QR Y is not provided
    150,
    150
  );

  // Generate the final image buffer in PNG format
  const buffer = canvas.toBuffer("image/png");

  // Optionally save image locally (for testing)
  // const outputPath = path.resolve(__dirname, `certificate-${Date.now()}.png`);
  // fs.writeFileSync(outputPath, buffer);

  // Convert the buffer to a Base64-encoded image source
  const base64Image = buffer.toString("base64");
  const imageSrc = `data:image/png;base64,${base64Image}`;

  // Save the imageSrc to the database if necessary
  // await prisma.issuedCertificates.update({
  //   where: { id: certificate.id },
  //   data: { imageSrc },
  // });

  return res.json({ imageSrc, certificate, event });
};

// const sendCertificates = async (req, res) => {
//   const { attendees } = req.body;

//   const certificate = await prisma.certificate.findUnique({
//     where: { id: certificateId },
//   });

// }

const sendCertViaEmail = async (req, res) => {
  try {
    const { eventId, attendees, subject, body } = req.body;

    if (!eventId || !attendees || attendees.length === 0) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Fetch existing issued certificates to prevent duplicates
    const existingCertificates = await prisma.issuedCertificates.findMany({
      where: {
        eventId,
        email: { in: attendees.map((attendee) => attendee.fieldValues.email) },
      },
    });

    const existingEmails = new Set(
      existingCertificates.map((cert) => cert.email)
    );

    const newCertificates = attendees.filter(
      (attendee) => !existingEmails.has(attendee.fieldValues.email)
    );

    if (newCertificates.length === 0) {
      return res
        .status(200)
        .json({ message: "All certificates already issued" });
    }

    let certificatesToMail = [];

    for (const attendee of newCertificates) {
      const { fieldValues, certificateId } = attendee;

      // Save certificate in DB
      const issuedCert = await prisma.issuedCertificates.create({
        data: {
          eventId,
          email: fieldValues.email,
          fieldValues,
          certificateId,
          mailed: false,
        },
      });

      certificatesToMail.push(issuedCert);
    }

    // Proceed with sending certificates via email
    for (const cert of certificatesToMail) {
      try {
        let attachments = [];

        const certificate = await prisma.certificate.findUnique({
          where: { id: cert.certificateId },
        });

        if (!certificate || !certificate.template) {
          console.error(`Certificate template missing for ${cert.email}`);
          continue;
        }

        const { template, fields } = certificate;
        const fieldValues = cert.fieldValues;

        const templateImage = await loadImage(template);
        const { width, height } = templateImage;

        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        context.drawImage(templateImage, 0, 0, width, height);

        let qrX, qrY;

        for (const field of fields) {
          const {
            fieldName,
            x,
            y,
            font = "Arial",
            fontSize = 40,
            fontColor = "#000000",
          } = field;
          const value = fieldValues[fieldName];

          if (fieldName === "qr") {
            qrX = x;
            qrY = y;
            continue;
          }

          if (!value) {
            console.warn(`Missing value for ${fieldName}`);
            continue;
          }

          context.font = `${fontSize}px ${font}`;
          context.fillStyle = fontColor;
          context.textAlign = "center";
          context.fillText(value, (x / 100) * width, (y / 100) * height);
        }

        const qrCodeData = `${
          process.env.DOMAIN || "testDomain/"
        }verify/certificate?id=${cert.id}`;
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
          width: 150,
          margin: 1,
        });

        const qrCodeImage = await loadImage(qrCodeBuffer);
        context.drawImage(
          qrCodeImage,
          qrX || width - 170,
          qrY || height - 170,
          150,
          150
        );

        const buffer = canvas.toBuffer("image/png");

        attachments = [
          {
            filename: `certificate-${cert.email}.png`,
            content: Buffer.from(buffer), // Fixing the Nodemailer ESTREAM error
            encoding: "base64",
          },
        ];

        await sendMail(
          cert.email,
          subject || "Your Certificate",
          body || "Please find your certificate attached.",
          "Thank you for participating.",
          attachments
        );

        await prisma.issuedCertificates.update({
          where: { id: cert.id },
          data: { mailed: true },
        });

        console.log(`Mail sent to ${cert.email}`);
      } catch (error) {
        console.error(`Failed to send mail to ${cert.email}:`, error);
      }
    }

    res.status(200).json({
      message: `${certificatesToMail.length} emails sent successfully`,
    });
  } catch (error) {
    console.error("Error in sendCertViaEmail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addCertificateTemplate,
  getCertificate,
  createEvent,
  addAttendee,
  getEvent,
  getCertificateTest,
  dummyCertificate,
  getEventByFormId,
  sendBatchMails,
  testCertificateSending,
  verifyCertificate,
  sendCertViaEmail,
};
