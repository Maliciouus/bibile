import Elysia from "elysia";
import mammoth from "mammoth";
import { publishedBooks as db } from "../lib/db";
import { unlink } from "node:fs/promises";
import { allowedFormats } from "../lib/audio-file-format";
import { deleteFile, saveFile, deliverFile } from "../lib/file-s3";

export const PublishedBooksController = new Elysia({
  prefix: "/publishedbooks",
})
  .post("/create", async ({ set, body }) => {
    try {
      let { files }: any = body;

      db.exec(
        "CREATE TABLE IF NOT EXISTS publishedbooks (id INTEGER PRIMARY KEY AUTOINCREMENT,booktitle TEXT,content TEXT,extraxtedname TEXT,audiopath TEXT,audioname TEXT,imagepath TEXT,imagename TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP) "
      );

      if (!Array.isArray(files)) {
        files = [files];
      }

      for (let i = 0; i < files.length; i++) {
        const allowedFormats = [".docx"];
        const fileExtension = files[i].name.split(".").pop();
        if (!allowedFormats.includes("." + fileExtension)) {
          throw new Error("Invalid file format");
        }

        let filename = "tmp/" + i + ".docx";

        await Bun.write(filename, files[i]);
        const result = await mammoth.convertToHtml({
          path: filename,
        });

        db.exec(
          "INSERT INTO publishedbooks (id,booktitle,content,extraxtedname,audiopath,audioname,imagepath,imagename,created_at) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
          [
            files[i].name.split(".")[0],
            result.value,
            files[i].name.split(".")[0],
            null,
            null,
            null,
            null,
          ]
        );

        await unlink(filename);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      set.status = 200;

      return {
        status: 200,
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        status: 400,
        error: error.message,
      };
    }
  })
  .get("/getall", async ({ set, query }) => {
    try {
      let data;
      const { id, page, limit, search }: any = query;
      let _id = Number(id || 1);
      let totalCount: any = 0;

      if (search) {
        totalCount = db
          .prepare(
            "SELECT COUNT(*) AS total FROM publishedbooks WHERE booktitle LIKE ?"
          )
          .get(`%${search}%`);
      } else {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM publishedbooks")
          .get();
      }

      if (id) {
        data = db.prepare("SELECT * FROM publishedbooks WHERE id = ?").all(_id);
        for (let i of data) {
          //@ts-ignore
          let { ok, data } = await deliverFile(i.audiopath);
          if (ok) {
            //@ts-ignore
            i.audiourl = data;
          }
        }
      } else if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        let offset = (_page - 1) * _limit;

        if (search) {
          data = db
            .prepare(
              "SELECT booktitle, id FROM publishedbooks WHERE booktitle LIKE ? ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db
            .prepare(
              "SELECT booktitle, id FROM publishedbooks ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(_limit, offset);
        }
      } else {
        if (search) {
          data = db
            .prepare(
              "SELECT booktitle, id FROM publishedbooks WHERE booktitle LIKE ? ORDER BY id"
            )
            .all(`%${search}%`);
        } else {
          data = db
            .prepare("SELECT booktitle, id FROM publishedbooks ORDER BY id")
            .all();
        }
      }

      set.status = 200;
      return {
        data,
        totalCount,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .put("/updatecontent", async ({ set, body, query }) => {
    try {
      let { id }: any = query;
      if (!id) {
        set.status = 400;
        return {
          message: "Book ID not found",
        };
      }
      let { content }: any = body;
      db.exec("UPDATE publishedbooks SET content = ? WHERE id = ?", [
        content,
        id,
      ]);
      set.status = 200;
      return {
        message: "Book  updated successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .delete("/deleteBook", async ({ set, query }) => {
    try {
      const { id } = query;
      if (!id) {
        set.status = 400;
        return {
          message: "Book ID not found",
        };
      }

      db.exec("DELETE FROM publishedbooks WHERE id = ?", [id]);
      set.status = 200;
      return {
        message: "Book deleted successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .put("/updatename", async ({ set, body, query }) => {
    try {
      let { id }: any = query;
      if (!id) {
        set.status = 400;
        return {
          message: "Book ID not found",
        };
      }
      let { name }: any = body;

      db.exec("UPDATE publishedbooks  SET booktitle = ? WHERE id = ?", [
        name,
        id,
      ]);
      set.status = 200;
      return {
        message: "Book name updated successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .post("/uploadaudio", async ({ body, set, query }: any) => {
    try {
      const { id }: any = query;
      const { audio }: any = body;
      if (!id) {
        set.status = 400;
        return {
          message: "Book ID not found",
        };
      }
      if (!audio) {
        set.status = 400;
        return {
          message: "Audio not found",
        };
      }

      const fileExtension = audio.name.split(".").pop();
      if (!allowedFormats.includes(fileExtension)) {
        throw new Error("Invalid file format");
      }

      const blob = new Blob([audio], {
        type: audio.type,
      });

      let { ok, filename } = await saveFile(blob, "publishedbooks");

      if (!ok) {
        set.status = 400;
        return {
          message: "Failed to upload audio",
        };
      }

      db.exec(
        "UPDATE publishedbooks SET audiopath = ?, audioname = ? WHERE id = ?",
        [filename, audio.name, id]
      );

      set.status = 200;
      return {
        message: "Audio uploaded successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .delete("/deleteaudio", async ({ set, query }) => {
    try {
      const { id } = query;

      if (!id) {
        set.status = 400;
        return {
          message: "Book ID not found",
        };
      }

      const book: any = db
        .prepare("SELECT * FROM publishedbooks WHERE id = ?")
        .get(id);
      if (!book) {
        set.status = 400;
        return {
          message: "Book not found",
        };
      }
      db.exec(
        "UPDATE publishedbooks SET audiopath = null, audioname = null WHERE id = ?",
        [id]
      );
      const { ok, error } = await deleteFile(book.audiopath);
      if (!ok) {
        set.status = 400;
        return {
          message: error,
        };
      }
      set.status = 200;
      return {
        message: "Audio deleted successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .get("/getallpublishedbooks", async ({ set, query }: any) => {
    try {
      const page: any = parseInt(query.page) || 1;
      const limit: any = parseInt(query.limit) || 10;
      const search: any = query.search || "";
      let totalCount: any = 0;
      const offset: any = (page - 1) * limit;

      totalCount = db
        .prepare("SELECT COUNT(*) AS count FROM publishedbooks")
        .get();

      let allbooks = db
        .prepare(
          "SELECT * FROM publishedbooks WHERE booktitle LIKE ? ORDER BY id LIMIT ?, ?"
        )
        .all("%" + search + "%", offset, limit);

      for (let i of allbooks) {
        //@ts-ignore
        let { ok, data } = await deliverFile(i.audiopath);
        if (ok) {
          //@ts-ignore
          i.audiourl = data;
        }
      }

      set.status = 200;
      return {
        data: allbooks,
        totalCount,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  });
