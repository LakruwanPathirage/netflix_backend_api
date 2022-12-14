const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  console.log("heyyyy");
  let token = req.headers.token.split(" ")[1];

  if (!token) {
    return res.status(401).json("You are not authenticated!");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        res.status(403).json("Token is not valid!");
      } else {
        req.user = decoded;

        next();
      }
    });
  }
};

module.exports = verify;
