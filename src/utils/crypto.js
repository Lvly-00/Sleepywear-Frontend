import CryptoJS from "crypto-js";

const SECRET_KEY =
    import.meta.env.VITE_ENCRYPT_KEY || "sleepywear_secure_key_2025";

export function encryptToken(token) {
    try {
        return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    } catch (err) {
        console.error("Token encryption failed:", err);
        return null;
    }
}

export function decryptToken(encryptedToken) {
    if (!encryptedToken) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch (err) {
        console.error("Token decryption failed:", err);
        return null;
    }
}