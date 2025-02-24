const { PrismaClient, OtpPurpose } = require('@prisma/client');
const prisma = new PrismaClient();
const sendOtpToMail = require('../email/generateOtpAndSendMail');
const { ApiError } = require('../error/ApiError');

const verifyOtp = async (email, otp, purpose, deleteOtp = false) => {
    console.log("Entering verify otp");
    try {
        console.log(email, otp, purpose);
        const hasOtp = await prisma.otp.findFirst({
            where: { email: email, otp: otp, for: purpose }
        });

        console.log(hasOtp);

        if (!hasOtp) {
            return { message: "OTP mismatch or not found", expired: false, id: null, status : 404 };
        }

        // Calculate if the OTP has expired
        const currentTime = new Date();
        const otpCreationTime = new Date(hasOtp.createdAt);
        const otpValidityDuration = hasOtp.age * 60000;
        const otpExpirationTime = new Date(otpCreationTime.getTime() + otpValidityDuration);
        
        console.log(currentTime);
        console.log(otpCreationTime);
        console.log(otpValidityDuration);
        console.log(otpExpirationTime);
        
        if (currentTime > otpExpirationTime) {

            console.log("OTP has expired, sending a new OTP");
            // Send the new OTP to the user

            // Use Promise to send the email
            const updatedOtp = sendOtpToMail(email, hasOtp.for, hasOtp.template, hasOtp.subject, true, {}, hasOtp.age)
                .then(() => {
                    console.log(`OTP sent successfully to ${email}`);
                })
                .catch(error => {
                    console.error('Error sending OTP:', error);
                });

            return { message: `OTP expired. A new OTP has been sent to ${email}.`, expired: true, is: updatedOtp.id, status : 201 };
        }

        if (deleteOtp) {
            try {
                await prisma.otp.delete({
                    where: { id: hasOtp.id }
                });
            } catch (error) {
                throw new ApiError(500, "Error deleting the OTP from the database");
            }
        }

        return { message: "Valid OTP", expired: false, id:hasOtp.id, status : 200 }; // OTP verified successfully
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new ApiError(error.statusCode || 500, 'Error verifying OTP', error);
    }
};

module.exports = verifyOtp;
