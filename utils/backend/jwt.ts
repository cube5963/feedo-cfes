import jwt from "jsonwebtoken";

const secret = process.env.BACKEND_JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET が設定されていません");
}

export function getJWTToken() {
    const payload = {
        user: "frontend",
        iss: "feedo",
        aud: "authenticated",
        sub: "frontend"
    };
    return jwt.sign(payload, secret as string, { algorithm: "HS256", expiresIn: 10 });
}
