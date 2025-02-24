const otpGenerator = require("otp-generator");
const generateOtp = (length = 6, includeUpperCaseCharacters = false, includeLowerCaseCharacters = false, includeSpecialCharacters = false) => {
  let generatedOTP = otpGenerator.generate(length, {
    upperCaseAlphabets: includeUpperCaseCharacters,
    lowerCaseAlphabets: includeLowerCaseCharacters,
    specialChars: includeSpecialCharacters,
  });
  return generatedOTP;
};

module.exports = generateOtp;