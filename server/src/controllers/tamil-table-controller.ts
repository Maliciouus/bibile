import Elysia from "elysia";
import { message as db } from "../lib/db";
import { deleteFile, deliverFile, saveFile } from "../lib/file-s3";

export const TamilTableController = new Elysia({
  prefix: "/tamiltable",
})
  .get("/getall", async ({ set, query }) => {
    try {
      const { search, page, limit } = query;

      let data: any;
      let totalCount: any = 0;
      if (search) {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM messages WHERE name LIKE ?")
          .get(`%${search}%`);
      } else {
        totalCount = db.prepare("SELECT COUNT(*) AS total FROM messages").get();
      }

      if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        const offset = (_page - 1) * _limit;

        if (search) {
          data = db
            .prepare(
              "SELECT id,name,audiopath,tamilpdf,eng_to_tam_audio,wrapper FROM messages   WHERE name LIKE ? LIMIT ? OFFSET ? "
            )
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db
            .prepare(
              "SELECT id,name,audiopath,tamilpdf,eng_to_tam_audio,wrapper FROM messages ORDER BY name  LIMIT ? OFFSET ?"
            )
            .all(_limit, offset);
        }
      }

      for (let item of data) {
        const files = ["audiopath", "tamilpdf", "wrapper", "eng_to_tam_audio"];
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
        "tamilaudio",
        "tamilpdf",
        "wrapper",
        "eng_to_tam_audio",
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

      if (filter === "tamilaudio") {
        if (search) {
          data = db.prepare("SELECT id,name,audiopath FROM messages WHERE audiopath IS NOT NULL AND name  LIKE ? LIMIT ? OFFSET ?").all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id,name,audiopath FROM messages WHERE audiopath IS NOT NULL  ORDER BY name  LIMIT ? OFFSET ?").all(_limit, offset);
        }
        for (let item of data) {
          if (item.audiopath) {
            let { data, ok } = await deliverFile(item.audiopath)
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

      if (filter === "tamilpdf") {
        if (search) {
          data = db.prepare("SELECT id, name, tamilpdf FROM messages WHERE tamilpdf IS NOT NULL AND name LIKE ? LIMIT ? OFFSET ?")
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id, name, tamilpdf FROM messages WHERE tamilpdf IS NOT NULL ORDER BY name LIMIT ? OFFSET ?")
            .all(_limit, offset);
        }

        for (let item of data) {
          if (item.tamilpdf) {
            let { data: fileUrl, ok } = await deliverFile(item.tamilpdf);
            if (ok) {
              item.tamilpdfurl = fileUrl;
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
          data = db.prepare("SELECT id, name, wrapper FROM messages WHERE wrapper IS NOT NULL AND name LIKE ? LIMIT ? OFFSET ?")
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id, name, wrapper FROM messages WHERE wrapper IS NOT NULL ORDER BY name LIMIT ? OFFSET ?")
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

      if (filter === "eng_to_tam_audio") {
        if (search) {
          data = db.prepare("SELECT id, name, eng_to_tam_audio FROM messages WHERE eng_to_tam_audio IS NOT NULL AND name LIKE ? LIMIT ? OFFSET ?")
            .all(`%${search}%`, _limit, offset);
        } else {
          data = db.prepare("SELECT id, name, eng_to_tam_audio FROM messages WHERE eng_to_tam_audio IS NOT NULL ORDER BY name LIMIT ? OFFSET ?")
            .all(_limit, offset);
        }

        for (let item of data) {
          if (item.eng_to_tam_audio) {
            let { data: fileUrl, ok } = await deliverFile(item.eng_to_tam_audio);
            if (ok) {
              item.eng_to_tam_audio_url = fileUrl;
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

  .post("/upload", async ({ set, body }: any) => {
    try {
      const { id, tamilpdf, wrapper, eng_to_tam_audio } = body;

      if (!id) {
        set.status = 400;
        return { status: 400, message: "No id provided" };
      }

      const processFile = async (file: any, fileType: any, fieldName: any) => {
        if (file) {
          let fileBlob = new Blob([file], { type: file.type });
          let { ok, filename } = await saveFile(
            fileBlob,
            `tamilTable-${fileType}`
          );
          if (!ok) {
            throw new Error(`Failed to save ${fileType}`);
          }
          db.prepare(`UPDATE messages SET ${fieldName} = ? WHERE id = ?`).run(
            filename,
            id
          );
        }
      };

      if (tamilpdf) await processFile(tamilpdf, "pdf", "tamilpdf");
      if (wrapper) await processFile(wrapper, "wrapper", "wrapper");
      if (eng_to_tam_audio)
        await processFile(
          eng_to_tam_audio,
          "eng_to_tam_audio",
          "eng_to_tam_audio"
        );

      set.status = 200;
      return { status: 200, message: "success" };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return { status: 400, message: error.message };
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
        .prepare("SELECT * FROM messages WHERE id = ?")
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

        db.exec("UPDATE messages SET " + fileType + " = null WHERE id = ?", [
          sermonId,
        ]);
      };

      if (type === "tamilpdf") await processFile(sermon.tamilpdf, "tamilpdf");
      if (type === "wrapper") await processFile(sermon.wrapper, "wrapper");
      if (type === "eng_to_tam_audio")
        await processFile(sermon.eng_to_tam_audio, "eng_to_tam_audio");

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
