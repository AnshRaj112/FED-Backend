const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { ApiError } = require("../../utils/error/ApiError");
const expressAsyncHandler = require("express-async-handler");

const deleteRegistration = expressAsyncHandler(async (req, res, next) => {
    try {
        const { email, formId } = req.body;

        if (email && formId) {
            try {
                // Step 1: Remove formId from the user's regForm array
                await prisma.user.update({
                    where: { email: email },
                    data: {
                        regForm: {
                            set: req.user.regForm.filter(id => id !== formId),
                        },
                    },
                });
            } catch (error) {
                throw new ApiError(500, "Failed to update user registration forms.");
            }

            try {
                // Step 2: Remove the user's email from formRegistration's regTeamMemEmails list
                const formRegistration = await prisma.formRegistration.findFirst({
                    where: { formId: formId, regTeamMemEmails: { has: email } },
                });

                if (formRegistration) {
                    const updatedRegTeamMemEmails = formRegistration.regTeamMemEmails.filter(
                        memEmail => memEmail !== email
                    );

                    const updatedTeamSize = formRegistration.teamSize - 1;

                    if (updatedTeamSize === 0) {
                        try {
                            // Delete the form registration entry if team size becomes zero
                            await prisma.formRegistration.delete({
                                where: { id: formRegistration.id },
                            });

                            // Step 3: Update the registrationTracker by removing the team name and email
                            await prisma.registrationTracker.update({
                                where: { formId: formId },
                                data: {
                                    regUserEmails: {
                                        set: formRegistration.regTeamMemEmails.filter(e => e !== email),
                                    },
                                    regTeamNames: {
                                        set: formRegistration.teamName
                                            ? formRegistration.teamName.filter(name => name !== formRegistration.teamName)
                                            : [],
                                    },
                                    totalRegistrationCount: {
                                        decrement: 1,
                                    },
                                },
                            });
                        } catch (error) {
                            throw new ApiError(500, "Failed to delete form registration and update tracker.");
                        }
                    } else {
                        try {
                            // Update the form registration entry
                            await prisma.formRegistration.update({
                                where: { id: formRegistration.id },
                                data: {
                                    regTeamMemEmails: { set: updatedRegTeamMemEmails },
                                    teamSize: updatedTeamSize,
                                },
                            });

                            // Step 3: Update the registrationTracker
                            await prisma.registrationTracker.update({
                                where: { formId: formId },
                                data: {
                                    regUserEmails: {
                                        set: formRegistration.regTeamMemEmails.filter(e => e !== email),
                                    },
                                    totalRegistrationCount: {
                                        decrement: 1,
                                    },
                                },
                            });
                        } catch (error) {
                            throw new ApiError(500, "Failed to update form registration and tracker.");
                        }
                    }
                }
            } catch (error) {
                throw new ApiError(500, "Failed to find and update form registration.");
            }

            res.status(200).json({ message: "Registration deleted successfully" });
        } else {
            throw new ApiError(400, "Invalid request parameters");
        }
    } catch (error) {
        next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error", error));
    }
});

module.exports = { deleteRegistration };
