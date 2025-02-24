const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { ApiError } = require("../../utils/error/ApiError");
const uploadimage = require("../../utils/image/uploadImage");
const status = require("http-status");

const QrImageHeight = 150;
const QrImageWidth = 400;

const FormImageHeight = 350.67;
const FormImageWidth = 196.37;


// @description     Add regForm
// @route           POST /api/form/addForm
// @access          Admins
const addForm = async (req, res, next) => {
  try {
    const {
      eventTitle,
      eventdescription,
      eventDate,
      eventType,
      upi,
      eventAmount,
      eventMaxReg,
      relatedEvent,
      participationType,
      maxTeamSize,
      minTeamSize,
      regDateAndTime,
      eventPriority,
      successMessage,
      isPublic,
      isRegistrationClosed,
      isEventPast,
    } = req.body;

    const info = {
      eventTitle,
      eventdescription,
      eventDate,
      eventType,
      eventAmount,
      eventMaxReg,
      relatedEvent,
      participationType,
      maxTeamSize,
      minTeamSize,
      regDateAndTime,
      eventPriority,
      successMessage,
      isPublic: Boolean(isPublic) || false,
      isRegistrationClosed: Boolean(isRegistrationClosed) || false,
      isEventPast: Boolean(isEventPast) || false,
      receiverDetails: { upi: upi, media: null },
    };

    const eventImgFile = req.files
      ? req.files?.eventImg
        ? req.files.eventImg[0]
        : null
      : null;
    const qrmediaFile = req.files
      ? req.files?.media
        ? req.files.media[0]
        : null
      : null;

    if (eventImgFile) {
      const result = await uploadimage(eventImgFile.path, "FormImages", FormImageHeight, FormImageWidth);
      info.eventImg = result ? result.secure_url : null;
    } else {
      new ApiError(status.BAD_REQUEST, "Event image not found");
    }

    if (qrmediaFile) {
      const result = await uploadimage(qrmediaFile.path, "QRMediaImages", QrImageWidth, QrImageHeight);
      info.receiverDetails.media = result ? result.secure_url : null;
    } else {
      new ApiError(status.BAD_REQUEST, "QR media image not found");
    }

    const newForm = await prisma.form.create({
      data: {
        info: info,
        sections: JSON.parse(req.body.sections || "[]"),
      },
    });

    res.status(status.OK).json({
      success: true,
      message: "Form created successfully",
      form: newForm,
    });
  } catch (error) {
    console.error("Error in creating form:", error);
    if (error.code === "P2002") {
      return next(
        new ApiError(
          status.INTERNAL_SERVER_ERROR,
          "Duplicate form ID. Form ID must be unique",
          error
        )
      );
    }
    return next(
      new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Error in creating form",
        error
      )
    );
  }
};

module.exports = { addForm };