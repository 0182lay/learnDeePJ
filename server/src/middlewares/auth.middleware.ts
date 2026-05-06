import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            return res.status(401).json({ message: "NO_TOKEN" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;

        return next();
    } catch (error: any) {
        if (error?.name === "TokenExpiredError") {
            return res.status(401).json({ message: "TOKEN_EXPIRED" });
        }

        return res.status(401).json({ message: "INVALID_TOKEN" });
    }
};
