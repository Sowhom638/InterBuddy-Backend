const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "token isn't provided",
    });
  }
  const isTokenblacklisted = await tokenBlacklistModel.findOne({token});
  if(isTokenblacklisted){
    return res.status(401).json({
      message: "token is invalid",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
}

module.exports = { authUser };
// const token = req.cookies.token;
// const decdded = jwt.verify(token, p.env.jwt secret);
// req.user = deocded;
// next();