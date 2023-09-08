const User = require('../models/userModel')
const jwt = require('jsonwebtoken');

const bcrypt = require("bcrypt")

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, retypePassword } = req.body;

    // Verify the token
    const decoded = jwt.verify(token, "secretkey");

    // Check if new password and retype password match
    if (newPassword !== retypePassword) {
      return res.status(400).send({ error: "New password and retype password do not match" });
    }

    // Find user account by decoded ID
    const user = await User.findById(decoded.data);
    if (!user) {
      return res.status(400).send({ error: "User account not found" });
    }

    // Check if token has expired
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).send({ error: "Password reset link has expired" });
    }
        // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
 // Update user's password and clear reset token and expiration date
 user.password =hashedPassword;
 user.resetPasswordToken = undefined;
 user.resetPasswordExpires = undefined;
 await user.save();

 // Send response with success message
 return res.status(200).send({ message: "Password reset successfully" });
} catch (err) {
 console.log(err);
 if (err.name === "TokenExpiredError") {
   return res.status(400).send({ error: "Password reset link has expired" });
 }
 return res.status(500).send({ error: "Something went wrong" });
}
};

// const bcrypt = require("bcrypt")
// const validator = require('validator')
// const ResetPassword = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const newPassword = req.body.newPassword;
//     const retypedPassword = req.body.retypedPassword;

//     if (!validator.isEmail(email)) {
//       return res.status(400).send({ error: "Invalid Email" });
//     }

//     if (!newPassword || newPassword.length < 5) {
//       return res.status(400).send({ error: "New password must be at least 5 characters" });
//     }

//     if (newPassword !== retypedPassword) {
//       return res.status(400).send({ error: "Re-typed password do not match" });
//     }

//     const user = await User.findOne({ email: email });
//     if (!user) {
//       return res.status(400).json({ error: "User Not Exists" });
//     }

    
//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     await User.updateOne({ email: email }, { password: hashedPassword });

//     return res.status(200).json({ message: "Password reset successfully" });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };
module.exports={resetPassword}