import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        req.user = verified; // מוסיף את ה־user decoded לבקשה
        next();

    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Token is invalid or expired" });
    }
};
