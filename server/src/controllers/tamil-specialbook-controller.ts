import Elysia from "elysia";
import { tamilSpecialBook as db } from "../lib/db";
import mammoth from "mammoth";
import { deleteFile, deliverFile, saveFile } from "../lib/file-s3";

export const TamilSpecialBookController = new Elysia({
  prefix: "/tamil-specialbook",
})
  .post("/create", async ({ set, body }: any) => {
    try {
      let { files } = body;

      if (!files) {
        set.status = 400;
        return {
          message: "No files uploaded",
          ok: false,
        };
      }

      if (!Array.isArray(files)) {
        files = [files];
      }

      db.exec(
        "CREATE TABLE IF NOT EXISTS tamilSpecialBook (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT, content TEXT, pdffilepath TEXT, pdffilename TEXT, type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
      );

      for (let i = 0; i < files.length; i++) {
        const allowedFormats = [".pdf", ".docx"];
        const fileExtension = files[i].name.split(".").pop();
        if (!allowedFormats.includes("." + fileExtension)) {
          throw new Error("Invalid file format");
        }

        if (fileExtension == "pdf") {
          const blob = new Blob([files[i]], {
            type: files[i].type,
          });

          let { ok, filename } = await saveFile(blob, "tamilSpecialBook");

          if (!ok) {
            set.status = 400;
            return {
              message: "Failed to save PDF",
              ok: false,
            };
          }

          db.exec(
            "INSERT INTO tamilSpecialBook (title, content, pdffilepath, pdffilename, type,created_at) VALUES (?, ?, ?, ?, ?,CURRENT_TIMESTAMP)",
            [
              files[i].name.split(".")[0],
              null,
              filename,
              files[i].name,
              fileExtension,
            ]
          );
        } else if (fileExtension == "docx") {
          let filename = "tmp/" + i + ".docx";
          await Bun.write(filename, files[i]);

          const result = await mammoth.convertToHtml({
            path: filename,
          });

          db.exec(
            "INSERT INTO tamilSpecialBook (title, content, pdffilepath, pdffilename, type,created_at) VALUES (?, ?, ?, ?, ?,CURRENT_TIMESTAMP)",
            [
              files[i].name.split(".")[0],
              result.value,
              null,
              null,
              fileExtension,
            ]
          );
        } else {
          set.status = 400;
          return {
            message: "Invalid file format",
            ok: false,
          };
        }
      }

      set.status = 200;
      return {
        message: "Files uploaded successfully",
        ok: true,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
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
            "SELECT COUNT(*) AS total FROM tamilSpecialBook WHERE title LIKE ?"
          )
          .get(`%${search}%`);
      } else {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM tamilSpecialBook")
          .get();
      }

      if (id) {
        data = db
          .prepare("SELECT * FROM tamilSpecialBook WHERE id = ?")
          .all(_id);
        for (let i of data) {
          //@ts-ignore
          let { ok, data } = await deliverFile(i.pdffilepath);
          if (ok) {
            //@ts-ignore
            i.pdfurl = data;
          } else {
            //@ts-ignore
            i.pdfurl = null;
          }
        }
      } else if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        let offset = (_page - 1) * _limit;

        if (search) {
          data = db
            .prepare(
              "SELECT title,type, id FROM tamilSpecialBook  WHERE title LIKE ? ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db
            .prepare(
              "SELECT title,type, id FROM tamilSpecialBook  ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(_limit, offset);
        }
      } else {
        if (search) {
          data = db
            .prepare(
              "SELECT title,type, id FROM tamilSpecialBook  WHERE title LIKE ? ORDER BY id"
            )
            .all(`%${search}%`);
        } else {
          data = db
            .prepare("SELECT title,type, id FROM tamilSpecialBook  ORDER BY id")
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
      db.exec("UPDATE tamilSpecialBook SET content = ? WHERE id = ?", [
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

      const data: any = db
        .prepare("SELECT * FROM tamilSpecialBook WHERE id = ?")
        .get(id);
      if (!data) {
        set.status = 400;
        return {
          message: "Book not found",
        };
      }

      if (data.pdffilepath) {
        const { ok, error } = await deleteFile(data.pdffilepath);
        if (!ok) {
          console.log("Error deleting file:", error);
        }
      }

      db.exec("DELETE FROM tamilSpecialBook WHERE id = ?", [id]);

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

      db.exec("UPDATE tamilSpecialBook  SET title = ? WHERE id = ?", [
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
  .get("/getalltamil-specialbooks", async ({ set, query }: any) => {
    try {
      const page: any = parseInt(query.page) || 1;
      const limit: any = parseInt(query.limit) || 10;
      const search: any = query.search || "";
      let totalCount: any = 0;
      const offset: any = (page - 1) * limit;

      totalCount = db
        .prepare("SELECT COUNT(*) AS count FROM tamilSpecialBook")
        .get();

      let allbooks = db
        .prepare(
          "SELECT * FROM tamilSpecialBook WHERE title LIKE ? ORDER BY id LIMIT ?, ?"
        )
        .all("%" + search + "%", offset, limit);

      for (let i of allbooks) {
        //@ts-ignore
        let { ok, data } = await deliverFile(i.pdffilepath);
        if (ok) {
          //@ts-ignore
          i.pdfurl = data;
        } else {
          //@ts-ignore
          i.pdfurl = null;
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
