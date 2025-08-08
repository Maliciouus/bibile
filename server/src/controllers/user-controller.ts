import Elysia from "elysia";
import { userTable as db } from "../lib/db";

export const userController = new Elysia({
    prefix: "/user",
})
    .post("/login", async ({ set, body }: any) => {
        try {
            const { email, mobile } = body;

            if (!email && !mobile) {
                set.status = 400
                return {
                    message: "At least one of Email or Mobile Required"
                }
            }

            db.exec(`
            CREATE TABLE IF NOT EXISTS users (
               id TEXT PRIMARY KEY,  -- Custom unique ID,
                email TEXT, 
                mobile TEXT, 
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
                lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

            const existingUser: any = db.prepare(`SELECT * FROM users WHERE email = ? OR mobile = ? `).get(email, mobile)

            if (existingUser) {
                db.prepare(`UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?`).run(existingUser.id)
                return { status: true, message: "Login successful", user: existingUser };
            } else {
                const customId = crypto.randomUUID();
                db.exec(`INSERT INTO users (id, email, mobile) VALUES (?, ?, ?)`, [customId, email || null, mobile || null])
                return { status: true, message: "User created and logged in", user: customId };
            }

        } catch (error) {
            console.error("Error creating table:", error);
            set.status = 500;
            return { status: false, message: "Internal Server Error" };
        }
    });
