import Elysia from "elysia";
import { dailymanna as db } from "../lib/db";
import { deleteFile, deliverFile, saveFile } from "../lib/file-s3";
import { allowedFormats } from "../lib/audio-file-format";

export const DailymannaController = new Elysia({
  prefix: "/dailymanna",
})

  .post("/upload", async ({ set, body }) => {
    try {
      const formData = body as any;
      if (!formData || Object.keys(formData).length === 0) {
        set.status = 400;
        return {
          ok: false,
          message: "No data found",
        };
      }

      for (const datestring of Object.keys(formData)) {
        const file = formData[datestring];
        if (!file) {
          set.status = 400;
          return {
            ok: false,
            message: "File not found for datestring: " + datestring,
          };
        }

        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (!allowedFormats.includes(fileExtension)) {
          set.status = 400;
          return {
            ok: false,
            message: "File format not allowed",
            fileExtension,
          };
        }

        const blob = new Blob([file], {
          type: file.type,
        });

        const { ok, filename } = await saveFile(
          blob,
          "இன்றையமன்னா",
          datestring
        );
        if (!ok) {
          set.status = 400;
          return {
            ok: false,
            message: "Failed to save file",
            filename,
          };
        }

        db.exec(
          "CREATE TABLE IF NOT EXISTS dailymanna (id INTEGER PRIMARY KEY AUTOINCREMENT, datestring TEXT, audiopath TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
        );

        const existingRecord = db
          .prepare("SELECT * FROM dailymanna WHERE datestring = ?")
          .get(datestring);

        if (existingRecord) {
          db.prepare(
            "UPDATE dailymanna SET audiopath = ? WHERE datestring = ?"
          ).run(filename, datestring);
        } else {
          db.prepare(
            "INSERT INTO dailymanna (datestring, audiopath) VALUES (?, ?)"
          ).run(datestring, filename);
        }
      }

      set.status = 200;
      return {
        ok: true,
        message: "File uploaded successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  })
  .get("/getaudios", async ({ set, query }: any) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;

      const offset = (page - 1) * limit;
      let totalCount: any = 0;
      totalCount = db.prepare("SELECT COUNT(*) as count FROM dailymanna").get();
      const data = db
        .prepare(
          "SELECT * FROM dailymanna ORDER BY datestring LIMIT ? OFFSET ? "
        )
        .all(limit, offset);

      for (let i of data) {
        //@ts-ignore
        let { ok, data } = await deliverFile(i.audiopath);
        if (ok) {
          // @ts-ignore
          i.audiourl = data;
        }
      }

      set.status = 200;
      return {
        data,
        ok: true,
        totalCount: totalCount.count,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  })
  .delete("/deleteaudio", async ({ query, set }) => {
    try {
      const { id } = query;
      if (!id) {
        set.status = 400;
        return {
          ok: false,
          message: "id not found",
        };
      }

      const audio: any = db
        .prepare("SELECT audiopath, datestring FROM dailymanna WHERE id = ?")
        .get(id);
      if (!audio) {
        set.status = 400;
        return {
          ok: false,
          message: "audio not found",
        };
      }

      const { ok, error } = await deleteFile(audio.audiopath);

      if (!ok) {
        set.status = 400;
        return {
          ok: false,
          message: error,
        };
      }

      db.exec("DELETE FROM dailymanna WHERE id = ?", [id]);
      set.status = 200;
      return {
        ok: true,
        message: "audio deleted successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  })
  .get("/todayaudio", async ({ set, query }) => {
    try {
      const { datestring } = query;

      if (!datestring) {
        set.status = 400;
        return {
          ok: false,
          message: "datestring not found",
        };
      }

      const _data: any = db
        .prepare("SELECT * FROM dailymanna WHERE datestring = ?")
        .get(datestring);

      let { ok, data } = await deliverFile(_data.audiopath);
      if (ok) {
        // @ts-ignore
        _data.audiourl = data;
      }

      set.status = 200;
      return {
        data: _data,
        ok: true,
      };
    } catch (error) {}
  });
