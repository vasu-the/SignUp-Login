const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    const tokenHeader = req.header("authorization");
    if (!tokenHeader) {
      return res.status(401).send({ msg: "Unauthorized" });
    }
    const token = tokenHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ msg: "Unauthorized" });
    }
    const tokenData = jwt.verify(token, "secretkey");
    req.user = tokenData.data; // assuming that the decoded token contains a "data" property with user information
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};





module.exports = {verifyToken};
