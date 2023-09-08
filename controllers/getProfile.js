const User = require("../models/userModel");

const getProfileDetails = async (req, res) => {
  try {
    const email = req.body.email; // assuming the user ID is passed as a property of the request object by the authentication middleware
    const profileDetails = await User.find({ email });
    if (!profileDetails) {
      return res.status(404).send({ message: 'User not found' });
    } 
    return res.status(200).send({ data: profileDetails, message: 'Success' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};


module.exports = { getProfileDetails};
