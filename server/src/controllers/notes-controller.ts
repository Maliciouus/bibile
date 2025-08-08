import Elysia from "elysia";
import { NotesTable as db } from "../lib/db";

export const notesController = new Elysia({
    prefix: "/notes",
})

    .post("/create", async ({ set, body }: any) => {
        try {
            const types = ["bible", "message"]
            const { userId, content, title, type } = body

            if (!userId || !content || !title || !type) {
                set.status = 400;
                return {
                    message: "All fields are required"
                }
            }

            if (!types.includes(type)) {
                set.status = 400;
                return {
                    message: "Invalid type"
                }
            }

            db.exec(`
                CREATE TABLE IF NOT EXISTS notes (
                   id TEXT PRIMARY KEY,  -- Custom unique ID,
                    userId TEXT, 
                    content TEXT, 
                    title TEXT,
                    type TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            const customId = crypto.randomUUID();
            db.exec(`INSERT INTO notes (id, userId, content, title, type) VALUES (?, ?, ?, ?, ?)`, [customId, userId, content, title, type])
            return { status: true, message: "Note created" };

        } catch (error: any) {
            console.log(error)
            set.status = 500
            return {
                message: error
            }
        }
    })
    .get("/getall", async ({ set, query }) => {
        try {

            const { search, page, limit, userId }: any = query
            let data: any;
            let _page = Number(page) || 1;
            let _limit = Number(limit) || 10;
            const offset = (_page - 1) * _limit;

            if (search) {
                data = db
                    .prepare(
                        "SELECT * FROM notes WHERE title LIKE ? AND userId = ? LIMIT ? OFFSET ? "
                    )
                    .all(`%${search}%`, userId, _limit, offset);
            } else {
                data = db
                    .prepare(
                        "SELECT * FROM notes WHERE userId = ? ORDER BY createdAt  LIMIT ? OFFSET ?"
                    )
                    .all(userId, _limit, offset);
            }

            set.status = 200

            return {
                data,
                status: true
            }



        } catch (error: any) {
            console.log(error)
            set.status = 500
            return {
                message: error
            }
        }
    })
    .delete("/deletenote", async ({ set, query }: any) => {
        try {
            const { noteId } = query;
            db.exec("DELETE FROM notes WHERE id = ?", [noteId]);
            set.status = 200;
            return {
                message: "success",
                status: 200,
            };
        } catch (error: any) {
            set.status = 400;
            return {
                message: error.message,
                status: 400,
            };
        }
    })