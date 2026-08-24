import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
      success: false,
    });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Invalid token", success: false });
  }
};

export default auth;
