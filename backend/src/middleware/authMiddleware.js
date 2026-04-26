const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401);
        return next(new Error("Not authorized, token missing"));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            res.status(401);
            return next(new Error("Not authorized, user does not exist"));
        }

        req.user = user;
        return next();
    } catch (error) {
        res.status(401);
        return next(new Error("Not authorized, token invalid"));
    }
};

module.exports = {
    protect,
};
