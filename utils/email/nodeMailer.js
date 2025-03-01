const mailTransporter = require('../../config/nodeMailer');

function sendMail(to, subject, htmlContent, textContent) {
    return new Promise((resolve, reject) => {
        let mailDetails = {
            from: process.env.MAIL_USER || "i.m.saurav003@gmail.com",
            to: to,
            subject: subject,
            html: htmlContent,
            text: textContent || htmlContent.replace(/<[^>]+>/g, '')
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                console.log('Error:', err);
                reject(err);
            } else {
                console.log('Email sent successfully', data);
                resolve(data);
            }
        });
    });
}

module.exports = { sendMail };
