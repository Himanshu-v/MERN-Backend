const jwt = require("jsonwebtoken");
const secretkey = "Himanshu'sSecret";

const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  console.log(token);
  if (!token) {
    res.status(401).send({ error: "Required Auth Token" });
  }
  try {
    const data = await jwt.verify(token, secretkey);
    console.log(data)
    req.user = data.data;
    next();
  } catch (e) {
    res.status(401).send({ error: "Invalid Auth Token" });
  }
};

module.exports = fetchUser;
