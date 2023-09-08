const User = require('../models/userModel')
const verifyEmail = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    try {
        // Check if the OTP matches
        const user = await User.findOne({ email: email });
        // const fromStorg = localStorage.getItem(email) 
       
        if (!user || user.otp !== otp) {
            return res.status(400).send({ message: "Invalid OTP" });
        }

        // Mark the email as verified
        await User.findOneAndUpdate({ email: email }, { isEmailVerified: true ,otp:null});
    
        // localStorage.setItem('user', JSON.stringify({ email: email, isEmailVerified: true }));

        return res.status(200).send({ message: "Email verified successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Failed to verify email" });
    }
};

module.exports ={verifyEmail}