import Elysia from "elysia";
import { songbook as db } from "../lib/db";
import mammoth from "mammoth";
import { unlink } from "node:fs/promises";
import {
  deleteFile,
  deliverFile,
  renameS3Object,
  saveFile,
} from "../lib/file-s3";
import { allowedFormats } from "../lib/audio-file-format";

export const songbookController = new Elysia({
  prefix: "/songbook",
})

  .post("/create", async ({ body, set }) => {
    try {
      let { files }: any = body;

      db.exec(
        "CREATE TABLE IF NOT EXISTS songbooks (id INTEGER PRIMARY KEY AUTOINCREMENT,lyrics TEXT,name TEXT, audiopath TEXT,audioname TEXT)"
      );

      if (!Array.isArray(files)) {
        files = [files];
      }

      for (let i = 0; i < files.length; i++) {
        const allowedFormats = [".docx"],
          fileExtension = files[i].name.split(".").pop();
        if (!allowedFormats.includes("." + fileExtension)) {
          throw new Error("Invalid file format");
        }

        let blob = new Blob([files[i]]);
        let filename = "tmp/" + i + ".docx";
        const options = {
          ignoreEmptyParagraphs: false,
          styleMap: ["p[style-name=''] => br"],
        };
        await Bun.write(filename, blob);

        const result = await mammoth.convertToHtml(
          {
            path: filename,
          },
          options
        );

        const processedHtml = result.value.replace(/<p>\s*<\/p>/g, "<br>");

        db.exec(
          "INSERT INTO songbooks (lyrics,name,audiopath,audioname) VALUES (?,?,?,?)",
          [processedHtml, files[i].name.split(".docx")[0], null, null]
        );

        await unlink(filename);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      set.status = 200;
      return {
        message: "Songbook created successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .get("/", async ({ set, query }) => {
    try {
      let data;
      const { id, page, limit, search, tamilLetter }: any = query;
      let _id = Number(id || 1);
      let totalCount: any = 0;

      if (search) {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM songbooks WHERE name LIKE ?")
          .get(`%${search}%`);
      } else if (tamilLetter) {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM songbooks WHERE name LIKE ?")
          .get(`${tamilLetter}%`);
      } else {
        totalCount = db
          .prepare("SELECT COUNT(*) AS total FROM songbooks")
          .get();
      }

      if (id) {
        data = db.prepare("SELECT * FROM songbooks WHERE id = ?").all(_id);
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
              "SELECT name, id FROM songbooks WHERE name LIKE ? ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(`%${search}%`, _limit, offset);
        } else if (tamilLetter) {
          data = db
            .prepare(
              "SELECT name, id FROM songbooks WHERE name LIKE ? ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(`${tamilLetter}%`, _limit, offset);
        } else {
          data = db
            .prepare(
              "SELECT name, id FROM songbooks ORDER BY id LIMIT ? OFFSET ?"
            )
            .all(_limit, offset);
        }
      } else {
        if (search) {
          data = db
            .prepare(
              "SELECT name, id FROM songbooks WHERE name LIKE ? ORDER BY id"
            )
            .all(`%${search}%`);
        } else if (tamilLetter) {
          data = db
            .prepare(
              "SELECT name, id FROM songbooks WHERE name LIKE ? ORDER BY id"
            )
            .all(`${tamilLetter}%`);
        } else {
          data = db.prepare("SELECT name, id FROM songbooks ORDER BY id").all();
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
  .get("/getsongnames", async ({ set }: any) => {
    try {
      const data = db.prepare("SELECT id,name FROM songbooks").all();

      set.status = 200;
      return {
        data,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .get("/song", async ({ set, query }) => {
    try {
      const { id }: any = query;
      if (!id) {
        set.status = 400;
        return {
          message: "Song ID not found",
        };
      }
      const data = db.prepare("SELECT * FROM songbooks WHERE id = ?").all(id);

      set.status = 200;
      return {
        data,
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
          message: "Song ID not found",
        };
      }
      let { name }: any = body;

      db.exec("UPDATE songbooks SET name = ? WHERE id = ?", [name, id]);
      set.status = 200;
      return {
        message: "Song name updated successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .put("/updatelyrics", async ({ set, body, query }) => {
    try {
      let { id }: any = query;
      if (!id) {
        set.status = 400;
        return {
          message: "Song ID not found",
        };
      }
      let { lyrics }: any = body;
      db.exec("UPDATE songbooks SET lyrics = ? WHERE id = ?", [lyrics, id]);
      set.status = 200;
      return {
        message: "Lyrics updated successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .delete("/deletesong", async ({ set, query }) => {
    try {
      const { id } = query;
      if (!id) {
        set.status = 400;
        return {
          message: "Song ID not found",
        };
      }

      db.exec("DELETE FROM songbooks WHERE id = ?", [id]);
      set.status = 200;
      return {
        message: "Song deleted successfully",
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
          message: "Song ID not found",
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

      let { ok, filename } = await saveFile(blob, "songbookaudios");

      if (!ok) {
        set.status = 400;
        return {
          message: "Failed to upload audio",
        };
      }

      db.exec(
        "UPDATE songbooks SET audiopath = ?, audioname = ? WHERE id = ?",
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
          message: "Song ID not found",
        };
      }

      const song: any = db
        .prepare("SELECT * FROM songbooks WHERE id = ?")
        .get(id);
      if (!song) {
        set.status = 400;
        return {
          message: "song not found",
        };
      }
      db.exec(
        "UPDATE songbooks SET audiopath = null, audioname = null WHERE id = ?",
        [id]
      );
      const { ok, error } = await deleteFile(song.audiopath);
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
  .get("/getallsongs", async ({ set, query }: any) => {
    try {
      const page: any = parseInt(query.page) || 1;
      const limit: any = parseInt(query.limit) || 10;
      const search: any = query.search || "";
      let totalCount: any = 0;
      const offset: any = (page - 1) * limit;

      // totalCount = db
      //   .prepare(`SELECT COUNT(*) AS count FROM songbooks WHERE name LIKE ?`)
      //   .get("%" + search + "%");

      totalCount = db.prepare("SELECT COUNT(*) AS count FROM songbooks").get();

      let allsongs = db
        .prepare(
          "SELECT * FROM songbooks WHERE name LIKE ? ORDER BY name LIMIT ?, ?"
        )
        .all("%" + search + "%", offset, limit);

      for (let i of allsongs) {
        //@ts-ignore
        let { ok, data } = await deliverFile(i.audiopath);
        if (ok) {
          //@ts-ignore
          i.audiourl = data;
        }
      }

      set.status = 200;
      return {
        data: allsongs,
        totalCount,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })

  // ***********test purpose
  .post("/uploadhashtesting", async ({ body, set, query }: any) => {
    try {
      const { id }: any = query;
      const { audio }: any = body;
      if (!id) {
        set.status = 400;
        return {
          message: "Song ID not found",
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

      let { ok, filename } = await saveFile(blob, "testing");

      if (!ok) {
        set.status = 400;
        return {
          message: "Failed to upload audio",
        };
      }

      db.exec(
        "UPDATE songbooks SET audiopath = ?, audioname = ? WHERE id = ?",
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
  .post("/renamefiles", async ({ set, body }: any) => {
    try {
      const { files } = body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        set.status = 400;
        return { ok: false, message: "No files provided" };
      }

      const results = [];

      for (const file of files) {
        const { id, filename: oldFilename } = file;

        if (!id || !oldFilename) {
          results.push({
            id,
            oldFilename,
            error: "Missing id or filename",
          });
          continue;
        }

        const parts = oldFilename.split(".");
        if (parts.length < 3) {
          results.push({
            id,
            oldFilename,
            error: "Filename format is unexpected, no hash found",
          });
          continue;
        }

        // Remove the last part (hash)
        parts.pop();

        // Create the new filename
        const newFilename = parts.join(".");

        // Rename the file in S3
        const { ok, message, error } = await renameS3Object(
          oldFilename,
          newFilename
        );

        if (ok) {
          // Update the SQLite database
          db.exec(
            "UPDATE songbooks SET audiopath = ? WHERE id = ?",
            [newFilename, id]
          );

          results.push({ id, oldFilename, newFilename, message });
        } else {
          results.push({
            id,
            oldFilename,
            newFilename,
            error: `Failed to rename ${oldFilename}`,
          });
        }
      }

      return {
        ok: true,
        message: "File renaming and database update completed",
        results,
      };
    } catch (error) {
      console.error("Error in /renamefiles:", error);
      set.status = 500;
      return { ok: false, message: "Internal server error" };
    }
  });


// .post("/renamefiles", async ({ set, body }: any) => {
//   try {
//     const { filenames } = body;

//     if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
//       return (set.status = 400);
//     }

//     const results = [];

//     for (const oldFilename of filenames) {
//       // Split the filename by dots
//       const parts = oldFilename.split(".");

//       // Check if we have at least 3 parts (name, extension, hash)
//       if (parts.length < 3) {
//         results.push({
//           oldFilename,
//           newFilename: oldFilename,
//           error: "Filename format is unexpected, no hash found",
//         });
//         continue;
//       }

//       // Remove the last part (assumed to be the hash)
//       parts.pop();

//       // Join the remaining parts to form the new filename
//       const newFilename = parts.join(".");

//       // Rename the object in S3
//       const { ok, message, error } = await renameS3Object(
//         oldFilename,
//         newFilename
//       );

//       if (ok) {
//         results.push({ oldFilename, newFilename, message });
//       } else {
//         results.push({
//           oldFilename,
//           newFilename,
//           error: `Failed to rename ${oldFilename}`,
//         });
//       }
//     }

//     return {
//       ok: true,
//       message: "File renaming operation completed",
//       results,
//     };
//   } catch (error) {
//     console.error("Error renaming files:", error);
//     set.status = 500;
//     return { ok: false, message: "Internal server error" };
//   }
// });

