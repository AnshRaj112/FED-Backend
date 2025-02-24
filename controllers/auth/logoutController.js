const expressAsyncHandler = require('express-async-handler');

//@description     Logout a User
//@route           POST /api/auth/logout
//@access          Logged In user
const logout = expressAsyncHandler(async (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});

module.exports = { logout };
