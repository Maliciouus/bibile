import Elysia from "elysia";
import { englishTable as db } from "../lib/db";
import { deleteFile, deliverFile, saveFile } from "../lib/file-s3";
export const EngilshTableController = new Elysia({
  prefix: "/englishtable",
})

  .post("/create", async ({ set, body }: any) => {
    try {
      const { titles } = body;

      if (!titles || !Array.isArray(titles) || titles.length === 0) {
        set.status = 400;
        return {
          message: "No titles provided",
        };
      }

      db.exec(
        "CREATE TABLE IF NOT EXISTS englishTable (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, englishPdf TEXT, englishAudio TEXT, wrapper TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
      );

      const insertStmt = db.prepare(
        "INSERT INTO englishTable (title) VALUES (?)"
      );
      titles.forEach((title: string) => {
        insertStmt.run(title);
      });

      set.status = 200;
      return {
        message: "success",
        insertedTitles: titles.length,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .put("/updatetitle", async ({ set, query, body }: any) => {
    try {
      const { id } = query;
      const { name } = body;
      if (!id) {
        set.status = 400;
        return {
          message: "No id provided",
        };
      }
      if (!name) {
        set.status = 400;
        return {
          message: "No name provided",
        };
      }

      db.exec("UPDATE englishTable SET title=? WHERE id=?", [name, id]);

      set.status = 200;
      return {
        message: "success",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .post("/upload", async ({ set, body }: any) => {
    try {
      const { id, englishPdf, wrapper, englishAudio } = body;

      if (!id) {
        set.status = 400;
        return { status: 400, message: "No id provided" };
      }

      const processFile = async (file: any, fileType: any, fieldName: any) => {
        if (file) {
          let fileBlob = new Blob([file], { type: file.type });
          let { ok, filename } = await saveFile(
            fileBlob,
            `englishTable-${fileType}`
          );
          if (!ok) {
            throw new Error(`Failed to save ${fileType}`);
          }
          db.prepare(
            `UPDATE englishTable SET ${fieldName} = ? WHERE id = ?`
          ).run(filename, id);
        }
      };

      if (englishPdf) await processFile(englishPdf, "pdf", "englishPdf");
      if (wrapper) await processFile(wrapper, "wrapper", "wrapper");
      if (englishAudio)
        await processFile(englishAudio, "audio", "englishAudio");

      set.status = 200;
      return { status: 200, message: "success" };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return { status: 400, message: error.message };
    }
  })
  .get("/getall", async ({ set, query }) => {
    try {
      const { search, page, limit } = query;

      let data: any;
      let totalCount: any = 0;
      if (search) {
        totalCount = db
          .prepare(
            "SELECT COUNT(*) AS total FROM englishTable WHERE title LIKE ?"
          )
          .get(`%${search}%`);
      } else {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM englishTable")
          .get();
      }

      if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        const offset = (_page - 1) * _limit;

        if (search) {
          data = db
            .prepare(
              "SELECT id,title,englishPdf,englishAudio,wrapper FROM englishTable   WHERE title LIKE ? LIMIT ? OFFSET ? "
            )
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db
            .prepare(
              "SELECT id,title,englishPdf,englishAudio,wrapper FROM englishTable ORDER BY id  LIMIT ? OFFSET ?"
            )
            .all(_limit, offset);
        }
      }

      for (let item of data) {
        const files = ["englishPdf", "wrapper", "englishAudio"];
        for (let file of files) {
          if (item[file]) {
            const { ok, data: fileData } = await deliverFile(item[file]);
            if (ok) {
              item[`${file}url`] = fileData;
            }
          }
        }
      }

      set.status = 200;
      return {
        data,
        totalCount,
      };
    } catch (error: any) {
      console.log(error);
    }
  })
  .get("/filteredby", async ({ set, query }) => {
    try {

      const filters = [
        "englishAudio",
        "englishPdf",
        "wrapper",
      ];

      const { search, page, limit, filter }: any = query;
      let data: any;

      let _page = Number(page) || 1;
      let _limit = Number(limit) || 10;
      const offset = (_page - 1) * _limit;

      if (!filters.includes(filter)) {
        set.status = 400;
        return {
          message: "Invalid filter type"
        }
      }

      if (filter === "englishAudio") {
        if (search) {
          data = db.prepare("SELECT id,title,englishAudio FROM englishTable WHERE englishAudio IS NOT NULL AND title  LIKE ? LIMIT ? OFFSET ?").all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id,title,englishAudio FROM englishTable WHERE englishAudio IS NOT NULL  ORDER BY title  LIMIT ? OFFSET ?").all(_limit, offset);
        }
        for (let item of data) {
          if (item.englishAudio) {
            let { data, ok } = await deliverFile(item.englishAudio)
            if (ok) {
              item.audiourl = data
            }
          }
        }
        return {
          data,
          status: true
        }
      }

      if (filter === "englishPdf") {
        if (search) {
          data = db.prepare("SELECT id, title, englishPdf FROM englishTable WHERE englishPdf IS NOT NULL AND title LIKE ? LIMIT ? OFFSET ?")
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id, title, englishPdf FROM englishTable WHERE englishPdf IS NOT NULL ORDER BY title LIMIT ? OFFSET ?")
            .all(_limit, offset);
        }

        for (let item of data) {
          if (item.englishPdf) {
            let { data: fileUrl, ok } = await deliverFile(item.englishPdf);
            if (ok) {
              item.englishpdfurl = fileUrl;
            }
          }
        }
        return {
          data,
          status: true
        };
      }

      if (filter === "wrapper") {
        if (search) {
          data = db.prepare("SELECT id, title, wrapper FROM englishTable WHERE wrapper IS NOT NULL AND title LIKE ? LIMIT ? OFFSET ?")
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id, title, wrapper FROM englishTable WHERE wrapper IS NOT NULL ORDER BY title LIMIT ? OFFSET ?")
            .all(_limit, offset);
        }

        for (let item of data) {
          if (item.wrapper) {
            let { data: fileUrl, ok } = await deliverFile(item.wrapper);
            if (ok) {
              item.wrapperurl = fileUrl;
            }
          }
        }
        return {
          data,
          status: true
        };
      }



    } catch (error: any) {
      console.log(error)
      set.status = 500
      return {
        message: error
      }
    }
  })
  .get("/getalltitles", async ({ set, query }: any) => {
    try {
      const { search, page, limit } = query;

      let data: any;
      let totalCount: any = 0;
      if (search) {
        totalCount = db
          .prepare(
            "SELECT COUNT(*) AS total FROM englishTable WHERE title LIKE ?"
          )
          .get(`%${search}%`);
      } else {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM englishTable")
          .get();
      }

      if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        const offset = (_page - 1) * _limit;

        if (search) {
          data = db
            .prepare(
              "SELECT id,title FROM englishTable  WHERE title LIKE ? LIMIT ? OFFSET ? "
            )
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db
            .prepare(
              "SELECT id,title FROM englishTable ORDER BY id  LIMIT ? OFFSET ?"
            )
            .all(_limit, offset);
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
  .delete("/delete", async ({ set, query }: any) => {
    try {
      const { sermonId, type } = query;

      if (!sermonId || !type) {
        set.status = 400;
        return { status: 400, message: "No id provided " };
      }

      const sermon: any = db
        .prepare("SELECT * FROM englishTable WHERE id = ?")
        .get(sermonId);

      if (!sermon) {
        set.status = 400;
        return { status: 400, message: "sermon not found" };
      }

      const processFile = async (file: any, fileType: any) => {
        const { ok, error } = await deleteFile(file);

        if (!ok) {
          set.status = 400;
          return {
            message: error,
          };
        }

        db.exec(
          "UPDATE englishTable SET " + fileType + " = null WHERE id = ?",
          [sermonId]
        );
      };

      if (type === "englishPdf")
        await processFile(sermon.englishPdf, "englishPdf");
      if (type === "wrapper") await processFile(sermon.wrapper, "wrapper");
      if (type === "englishAudio")
        await processFile(sermon.englishAudio, "englishAudio");

      set.status = 200;
      return {
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error,
      };
    }
  });
