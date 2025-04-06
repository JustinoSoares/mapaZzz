require("dotenv").config();
const jwt = require("jsonwebtoken");

const userAuthorization = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Acesso negado",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({
        status: false,
        message: "Acesso negado",
      });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Token inválido",
    });
  }
};

const adminAuthorization = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Acesso negado",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({
        status: false,
        message: "Acesso negado",
      });
    }
    if (decoded.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Acesso negado",
      });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Token inválido",
    });
  }
};

module.exports = {
  userAuthorization,
  adminAuthorization,
};
