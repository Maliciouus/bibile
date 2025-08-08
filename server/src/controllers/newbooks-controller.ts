import Elysia from "elysia";
import { newbooks as db } from "../lib/db";
export const newbooksController = new Elysia({
  prefix: "/newbooks",
})

  .post("/create", async ({ set, body }: any) => {
    try {
      const {
        title,
        subtitles,
      }: {
        title: string;
        subtitles: Array<{ subtitle: string; books: Array<{ name: string }> }>;
      } = body;

      const formattedSubtitles = subtitles.map((subtitleItem) => ({
        subtitle: subtitleItem.subtitle,
        books: subtitleItem.books.map((book) => ({ name: book.name })),
      }));

      console.log(formattedSubtitles);

      db.exec(
        `CREATE TABLE IF NOT EXISTS newbooks (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          title TEXT, 
          subtitles TEXT, 
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      );

      db.exec(
        `INSERT INTO newbooks (title, subtitles, created_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [title, JSON.stringify(formattedSubtitles)]
      );

      set.status = 201;

      return {
        message: "Books created successfully",
      };
    } catch (error: any) {
      console.error(error);
      set.status = 400;
      return {
        message: error.message || "An error occurred while creating books",
      };
    }
  })
  .get("/getall", async ({ query, set }) => {
    try {
      const { page, limit, search } = query;
      let totalCount: any = 0;
      let allnewbooks;

      if (search) {
        totalCount = db
          .prepare("SELECT COUNT(*) AS count  FROM newbooks WHERE title LIKE ?")
          .get(`%${search}%`);
      } else {
        totalCount = db.prepare("SELECT COUNT(*) AS count FROM newbooks").get();
      }

      if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        const offset = (_page - 1) * _limit;

        if (search) {
          allnewbooks = db
            .prepare(
              "SELECT * FROM newbooks WHERE title LIKE ? LIMIT ? OFFSET ?"
            )
            .all(`%${search}%`, _limit, offset);
        } else {
          allnewbooks = db
            .prepare("SELECT * FROM newbooks LIMIT ? OFFSET ?")
            .all(_limit, offset);
        }
      } else {
        if (search) {
          allnewbooks = db
            .prepare("SELECT * FROM newbooks WHERE title LIKE ?")
            .all(`%${search}%`);
        } else {
          allnewbooks = db.prepare("SELECT * FROM newbooks").all();
        }
      }

      const parsedBooks = allnewbooks.map((book: any) => {
        return {
          id: book.id,
          title: book.title,
          subtitles: JSON.parse(book.subtitles),
        };
      });
      return {
        message: "New books fetched successfully",
        parsedBooks,
        totalCount,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error,
      };
    }
  })
  .put("/updatebook", async ({ set, query, body }: any) => {
    try {
      let { id }: any = query;
      if (!id) {
        set.status = 400;
        return {
          message: "No book id provided",
        };
      }

      const {
        title,
        subtitles,
      }: {
        title: string;
        subtitles: Array<{ subtitle: string; books: Array<{ name: string }> }>;
      } = body;

      const filteredSubtitles = subtitles.map((subtitleItem) => ({
        subtitle: subtitleItem.subtitle,
        books: subtitleItem.books.map((book) => ({ name: book.name })),
      }));

      db.exec("UPDATE newbooks SET title = ?, subtitles = ? WHERE id = ?", [
        title,
        JSON.stringify(filteredSubtitles),
        id,
      ]);

      set.status = 200;
      return {
        message: "Book updated successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message || "An error occurred",
      };
    }
  })
  .delete("/deletebook", async ({ set, query }) => {
    try {
      const { id }: any = query;

      if (!id) {
        set.status = 400;
        return {
          message: "No book id provided",
        };
      }

      const exist = db.prepare("SELECT * FROM newbooks WHERE id = ?").all(id);

      if (!exist) {
        set.status = 400;
        return {
          message: "No book found with this id",
        };
      }

      db.exec("DELETE FROM newbooks WHERE id = ?", [id]);

      set.status = 200;

      return {
        message: "Book deleted successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error,
      };
    }
  });
