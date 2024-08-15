const { PrismaClient, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const generateOtp = require('../otp/generateOTP');
const { sendMail } = require('../email/nodeMailer');
const loadTemplate = require('../email/loadTemplate');

const createUser = async (data, sendMailFlag = false) => {
    data.editProfileCount = 5;
    console.log(data, sendMailFlag);
    console.log("Creating new user");

    let password;
    let hashedPassword;
    let autoGeneratedPassword = false;

    if (data.password) {
        hashedPassword = data.password;
        // hashedPassword = await bcrypt.hash(password, 10);
    } else {
        console.log("Generating hashed password");
        password = generateOtp(7,true,false,false);
        hashedPassword = await bcrypt.hash(password, 10);
        autoGeneratedPassword = true;
    }

    try {
        // Check if a user with the given email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            console.log(`User with email ${data.email} already exists!`);
            throw new Error('User already exists');
        }

        const user = await prisma.user.create({
            data: {
                password: hashedPassword,
                ...data
            },
        });

        console.log(`Created user with email ${data.email} and access ${data.access} successfully!`);

        if (sendMailFlag || autoGeneratedPassword) {
            const subject = 'Welcome to FED KIIT';
            let templateName, placeholders;
            if (autoGeneratedPassword) {
                // Send email with password to the new auto-generated user
                templateName = 'newUserAutoRegistration';
                placeholders = { password: password, name: user.name };
            } else {
                // Send email to the newly registered user
                templateName = "newUserRegistration";
<<<<<<< HEAD
                placeholders = { name: user.name };
=======
                placeholders = { name: user.name || " " };
>>>>>>> docker/test
            }

            const templateContent = loadTemplate(templateName, placeholders);
            console.log("Sending email to", user.email);
            sendMail(user.email, subject, templateContent);
        }

        return user;
    } catch (error) {
        if (error.message === 'User already exists' || error.code === 'P2002') {
            console.error(`Error creating user: A user with email ${data.email} already exists.`);
            throw new Error(`A user with email ${data.email} already exists.`);
        }
        console.error('Error creating user:', error);
        throw new Error('User creation failed');
    }
};

module.exports = createUser;
