import Elysia from "elysia";
import mammoth from "mammoth";
import { unlink } from "node:fs/promises";
import { message as db } from "../lib/db";
import { deliverFile } from "../lib/file-s3";

const timeOrder = {
  S: 1, // Sunrise
  B: 2, // Breakfast
  M: 3, // Morning
  A: 4, // Afternoon
  E: 5, // Evening
  X: 6, // Unknown
};

const parseMessageName = (name: any) => {
  const parts = name.split(" ");
  const dateTime = parts[0];
  const date = dateTime.slice(0, 8);
  const time = dateTime.slice(8);
  //@ts-ignore
  return { date, timeOrder: timeOrder[time] || 7 };
};

export const messageController = new Elysia({
  prefix: "/message",
})

  .post("/create", async ({ set, body }) => {
    try {
      let { files }: any = body;

      db.exec(
        "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, name TEXT , audiopath TEXT,audioname TEXT)"
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
          "INSERT INTO messages (id, message, name, audiopath, audioname) VALUES (NULL, ?, ?, ?, ?)",
          [result.value, files[i].name.split(".")[0], null, null]
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
  .post("/local", async ({ set, body }) => {
    try {
      const fs = require("fs");
      let files = fs.readdirSync("tmp");

      db.exec(
        "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, name TEXT)"
      );

      console.log(files);
      set.status = 200;

      for (let i = 0; i < files.length; i++) {
        const result = await mammoth.convertToHtml({
          path: "tmp/" + files[i],
        });

        db.exec("INSERT INTO messages (message, name) VALUES (?, ?)", [
          result.value,
          files[i].split(".")[0],
        ]);

        fs.unlinkSync("tmp/" + files[i]);
      }

      return {
        files,
        status: 200,
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
  .get("/", async ({ set, query }) => {
    try {
      let data;
      db.exec(
        "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, name TEXT)"
      );

      let { m, page, limit, search }: any = query;
      let _m = Number(m || 1);
      let totalCount: any = 0;

      totalCount = db.prepare("SELECT COUNT(*) AS count FROM messages").get();

      // Handle single message fetch based on id (if m is passed)
      if (m) {
        data = db
          .prepare(
            "SELECT id,message,name,audiopath,audioname FROM messages WHERE id = ?"
          )
          .all(_m);
      }
      // Handle pagination and optional search logic
      else if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        let offset = (_page - 1) * _limit;

        // Check if search query is provided
        if (search) {
          // Using wildcard matching for search (e.g., partial search)
          let searchQuery = `%${search}%`;
          data = db
            .prepare(
              `SELECT name as messageName, id as messageId, audiopath 
               FROM messages 
               WHERE name LIKE ? 
               ORDER BY name 
               LIMIT ? OFFSET ?`
            )
            .all(searchQuery, _limit, offset);
        } else {
          // Default pagination logic without search
          data = db
            .prepare(
              `SELECT name as messageName, id as messageId, audiopath 
               FROM messages 
               ORDER BY name 
               LIMIT ? OFFSET ?`
            )
            .all(_limit, offset);
        }
      }
      // Handle fetching all messages (no pagination, no search)
      else {
        if (search) {
          let searchQuery = `%${search}%`;
          data = db
            .prepare(
              `SELECT name as messageName, id as messageId, audiopath 
               FROM messages 
               WHERE name LIKE ? 
               ORDER BY name`
            )
            .all(searchQuery);
        } else {
          data = db
            .prepare(
              `SELECT name as messageName, id as messageId, audiopath 
               FROM messages 
               ORDER BY name`
            )
            .all();
        }
      }

      // Sort messages based on date and timeOrder logic
      data.sort((a: any, b: any) => {
        const aParsed = parseMessageName(a.messageName);
        const bParsed = parseMessageName(b.messageName);

        if (aParsed.date < bParsed.date) return -1;
        if (aParsed.date > bParsed.date) return 1;

        return aParsed.timeOrder - bParsed.timeOrder;
      });

      // Process audio file delivery if audiopath is available
      for (let i of data) {
        // @ts-ignore
        if (i.audiopath) {
          // @ts-ignore
          let { data, ok } = await deliverFile(i.audiopath);
          if (ok) {
            // @ts-ignore
            i.audiourl = data;
          }
        }
      }

      set.status = 200;
      return {
        data,
        totalCount,
        status: true,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
    }
  })
  // .get("/", async ({ set, query }) => {
  //   try {
  //     let data;
  //     db.exec(
  //       "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, name TEXT)"
  //     );

  //     let { m, page, limit }: any = query;
  //     let _m = Number(m || 1);
  //     let totalCount: any = 0;

  //     totalCount = db.prepare("SELECT COUNT(*) AS count FROM messages").get();

  //     if (m) {
  //       data = db
  //         .prepare(
  //           "SELECT id,message,name,audiopath,audioname FROM messages WHERE id = ?"
  //         )
  //         .all(_m);
  //     } else if (page && limit) {
  //       let _page = Number(page) || 1;
  //       let _limit = Number(limit) || 10;
  //       let offset = (_page - 1) * _limit;
  //       data = db
  //         .prepare(
  //           `SELECT name as messageName, id as messageId, audiopath
  //            FROM messages
  //            ORDER BY name
  //            LIMIT ? OFFSET ?`
  //         )
  //         .all(_limit, offset);
  //     } else {
  //       data = db
  //         .prepare(
  //           `SELECT name as messageName, id as messageId, audiopath
  //            FROM messages
  //            ORDER BY name`
  //         )
  //         .all();
  //     }

  //     data.sort((a: any, b: any) => {
  //       const aParsed = parseMessageName(a.messageName);
  //       const bParsed = parseMessageName(b.messageName);

  //       if (aParsed.date < bParsed.date) return -1;
  //       if (aParsed.date > bParsed.date) return 1;

  //       return aParsed.timeOrder - bParsed.timeOrder;
  //     });

  //     for (let i of data) {
  //       // @ts-ignore
  //       if (i.audiopath) {
  //         // @ts-ignore
  //         let { data, ok } = await deliverFile(i.audiopath);
  //         if (ok) {
  //           // @ts-ignore
  //           i.audiourl = data;
  //         }
  //       }
  //     }

  //     set.status = 200;
  //     return {
  //       data,
  //       totalCount,
  //       status: true,
  //     };
  //   } catch (error: any) {
  //     console.log(error);
  //     set.status = 400;
  //   }
  // })
  .get("/getmessagename", async ({ set }) => {
    try {
      let messageData = db
        .prepare("SELECT name, id FROM messages ORDER BY name")
        .all();

      messageData.sort((a: any, b: any) => {
        const aParsed = parseMessageName(a.name);
        const bParsed = parseMessageName(b.name);

        // Compare dates first
        if (aParsed.date < bParsed.date) return -1;
        if (aParsed.date > bParsed.date) return 1;

        return aParsed.timeOrder - bParsed.timeOrder;
      });

      set.status = 200;
      return {
        messageData,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;
      return {
        error,
      };
    }
  })
  .get("/getselectedmessage", async ({ query, set }) => {
    try {
      let { id }: any = query;

      let selectedMessage = db
        .prepare(
          "SELECT name,id,message,audioname,audiopath FROM messages WHERE id = ?"
        )
        .all(id);

      const pTagRegex = /<p>(.*?)<\/p>/g;
      const strongTagRegex = /<strong>(.*?)<\/strong>/g;

      selectedMessage.forEach((message: any) => {
        const pMatches = message.message.match(pTagRegex);
        const strongMatches = message.message.match(strongTagRegex);
        const extractedContent: any[] = [];
        if (pMatches) {
          pMatches.forEach((match: any) => {
            extractedContent.push(match.replace(/<p>|<\/p>/g, ""));
          });
        }
        if (strongMatches) {
          strongMatches.forEach((match: any) => {
            extractedContent.push(match.replace(/<strong>|<\/strong>/g, ""));
          });
        }
        message.message = extractedContent;
      });
      set.status = 200;
      return { selectedMessage, status: true };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })

  .delete("/delete", async ({ query, set }) => {
    try {
      let { messageId }: any = query;

      db.exec("DELETE FROM messages WHERE id = ?", [messageId]);

      set.status = 200;

      return {
        status: 200,
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })
  .put("/updatename", async ({ query, body, set }: any) => {
    try {
      let { messageId }: any = query;
      if (!messageId) {
        set.status = 400;
        return {
          status: 400,
          message: "No message id provided",
        };
      }

      let { name }: any = body;

      db.exec("UPDATE messages SET name = ? WHERE id = ?", [name, messageId]);
      set.status = 200;
      return {
        status: 200,
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })
  .put("/updatemessage", async ({ query, body, set }: any) => {
    try {
      let { messageId }: any = query;
      if (!messageId) {
        set.status = 400;
        return {
          status: 400,
          message: "No message id provided",
        };
      }
      let { message }: any = body;
      db.exec("UPDATE messages SET message = ? WHERE id = ?", [
        message,
        messageId,
      ]);
      set.status = 200;
      return {
        status: 200,
        message: "success",
      };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })
  .get("/getallmessages", async ({ set, query }: any) => {
    try {
      const page: any = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const search = query.search || "";
      let totalCount: any = 0;
      const offset: any = (page - 1) * limit;
      totalCount = db
        .prepare(`SELECT COUNT(*) AS count FROM messages WHERE name LIKE ?`)
        .get("%" + search + "%");
      let allMessages = db
        .prepare(
          `SELECT id,name,audioname,audiopath FROM messages WHERE name LIKE ? ORDER BY name LIMIT ?, ?`
        )
        .all("%" + search + "%", offset, limit);

      for (let i of allMessages) {
        // @ts-ignore
        let { data, ok } = await deliverFile(i.audiopath);

        if (ok) {
          // @ts-ignore
          i.audiourl = data;
        }
      }

      set.status = 200;
      return {
        allMessages,
        totalCount,
        status: 200,
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        status: 400,
        message: error.message || "An error occurred",
      };
    }
  });
