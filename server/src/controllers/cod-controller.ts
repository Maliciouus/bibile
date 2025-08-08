import Elysia, { t } from "elysia";
import mammoth from "mammoth";
import { unlink } from "node:fs/promises";
import { cod as db } from "../lib/db";

export const codController = new Elysia({
  prefix: "/cod",
})
  .post(
    "/create",
    async ({ set, body }) => {
      try {
        const { title, hassubheadings } = body;

        let _has = hassubheadings === true ? 1 : 0;

        db.exec(
          "CREATE TABLE IF NOT EXISTS codtitles (id INTEGER PRIMARY KEY  AUTOINCREMENT, title TEXT, hassubheadings INT)"
        );

        let count = db.prepare("SELECT * from codtitles").all();

        db.exec(
          "INSERT INTO codtitles (title, hassubheadings) VALUES ( ?, ?)",
          [title, _has]
        );

        set.status = 200;

        return {
          message: "success",
          status: 200,
        };
      } catch (error) {
        console.log(error);
        set.status = 400;

        return {
          status: 400,
          message: error,
        };
      }
    },
    {
      body: t.Object({
        title: t.String(),
        hassubheadings: t.Any(),
      }),
    }
  )
  .get("/headings", async ({ set }) => {
    try {
      db.exec(
        "CREATE TABLE IF NOT EXISTS codtitles (id INTEGER PRIMARY KEY, title TEXT, hassubheadings INT)"
      );
      let data = db.prepare("SELECT * FROM codtitles").all();

      set.status = 200;

      return {
        data,
        status: true,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;

      return {
        status: 400,
        message: error,
      };
    }
  })
  .delete("/deleteheadings", async ({ set, query }) => {
    try {
      let { headingId }: any = query;
      db.exec("DELETE FROM codtitles WHERE id = ?", [headingId]);
      db.exec("DELETE FROM codquestions WHERE topicid = ?", [headingId]);
      set.status = 200;
      return {
        ok: true,
        message: "Topic deleted successfully",
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
  .post("/addquestion/:topic", async ({ set, body, params, query }) => {
    try {
      let { files }: any = body;
      let { topic } = params;
      let { subtopicQuestion, subtopicId } = query;

      db.exec(
        "CREATE TABLE IF NOT EXISTS codquestions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, topicid INTEGER, isSubtopicQuestion INTEGER, subtopicid INTEGER)"
      );

      let _topic = db
        .prepare("SELECT * FROM codtitles WHERE id = ?")
        .all(topic);

      if (_topic.length < 0) {
        set.status = 400;

        return {
          message: "Topic not found",
          status: false,
        };
      }

      if (!Array.isArray(files)) {
        files = [files];
      }

      for (let i = 0; i < files.length; i++) {
        const allowedFormats = [".docx"];
        const fileExtension = files[i].name.split(".").pop();

        if (!allowedFormats.includes("." + fileExtension)) {
          throw new Error("Invalid file format");
        }
        let blob = new Blob([files[i]]);

        let filename = "tmp/" + i + ".docx";

        await Bun.write(filename, blob);
        const result = await mammoth.convertToHtml({
          path: filename,
        });

        db.exec(
          "INSERT INTO codquestions (title, content, topicid, isSubtopicQuestion, subtopicid) VALUES ( ?, ?, ?, ?, ?)",
          [
            files[i].name.split(".docx")[0] + " ?",
            result.value,
            topic,
            subtopicQuestion == "true" ? 1 : 0,
            //@ts-ignore
            subtopicId,
          ]
        );

        await unlink(filename);
      }

      set.status = 200;

      return {
        status: 200,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
    }
  })
  // .get("/questions/:topic", async ({ set, params, query }) => {
  //   try {

  //     const { page, limit, search } = query;
  //     let totalCount: any = 0;

  //     let _page = Number(page) || 1;
  //     let _limit = Number(limit) || 10;
  //     let offset = (_page - 1) * _limit;
  //     db.exec(
  //       "CREATE TABLE IF NOT EXISTS codtitles (id INTEGER PRIMARY KEY, title TEXT, hassubheadings INT)"
  //     );
  //     let { topic } = params;

  //     totalCount = db.prepare(
  //       "SELECT COUNT(*) AS total FROM codquestions WHERE topicid = ?"
  //     )
  //       .get(topic);

  //     let data = db
  //       .prepare(
  //         "SELECT * FROM codquestions WHERE topicid = ? ORDER BY CAST(SUBSTR(title, 3, INSTR(SUBSTR(title, 3), '.') - 1) AS ORDERED) LIMIT ? OFFSET ?"
  //       )
  //       .all(topic, _limit, offset);

  //     set.status = 200;

  //     return {
  //       data,
  //       // totalCount,
  //       status: true,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     set.status = 400;

  //     return {
  //       status: 400,
  //       message: error,
  //     };
  //   }
  // })
  .get("/questions/:topic", async ({ set, params, query }) => {
    try {
      const { page, limit, search }: any = query;
      let _page = Number(page) || 1;
      let _limit = Number(limit) || 10;
      let offset = (_page - 1) * _limit;

      let { topic } = params;

      let searchCondition: any = search ? "AND title LIKE ?" : "";
      let searchValue: any = search ? `%${search}%` : undefined;

      let data = db
        .prepare(
          `SELECT * FROM codquestions 
           WHERE topicid = ? ${searchCondition} 
           ORDER BY CAST(SUBSTR(title, 3, INSTR(SUBSTR(title, 3), '.') - 1) AS ORDERED) 
           LIMIT ? OFFSET ?`
        )
        //@ts-ignore
        .all(search ? [topic, searchValue, _limit, offset] : [topic, _limit, offset]);

      set.status = 200;

      return {
        data,
        status: true,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;

      return {
        status: 400,
        message: error,
      };
    }
  })
  .get("/questions-admin/:topic", async ({ set, params, }) => {
    try {
      db.exec(
        "CREATE TABLE IF NOT EXISTS codtitles (id INTEGER PRIMARY KEY, title TEXT, hassubheadings INT)"
      );
      let { topic } = params;
      let data = db
        .prepare(
          "SELECT * FROM codquestions WHERE topicid = ? ORDER BY CAST(SUBSTR(title, 3, INSTR(SUBSTR(title, 3), '.') - 1) AS ORDERED) "
        )
        .all(topic);

      set.status = 200;

      return {
        data,
        status: true,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;

      return {
        status: 400,
        message: error,
      };
    }
  })
  .delete("/deletequestion", async ({ set, query }) => {
    try {
      let { questionId, topicId }: any = query;

      db.exec("DELETE FROM codquestions WHERE id = ? AND topicid = ?", [
        questionId,
        topicId,
      ]);
      set.status = 200;
      return {
        ok: true,
        message: "Question deleted successfully",
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
  .get("/answer", async ({ set, query }) => {
    try {
      let { topicid, id, subTopicId }: any = query;
      db.exec(
        "CREATE TABLE IF NOT EXISTS codquestions (id INTEGER PRIMARY KEY, title TEXT, content TEXT, topicid INTEGER, isSubtopicQuestion INTEGER, subtopicid INTEGER)"
      );
      let data = db
        .prepare(
          "SELECT * FROM codquestions WHERE topicid = ? AND id = ? AND subtopicid = ?  "
        )
        .all(topicid, id, subTopicId);
      set.status = 200;
      return {
        data,
        status: true,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;

      return {
        status: 400,
        message: error,
      };
    }
  })
  .put("/updateanswer", async ({ set, query, body }) => {
    try {
      let { id, topicId }: any = query;

      if (!id || !topicId) {
        set.status = 400;
        return {
          status: 400,
          message: "Invalid request",
        };
      }

      let { content }: any = body;
      db.exec(
        "UPDATE codquestions SET content = ? WHERE id = ? AND topicid = ?",
        [content, id, topicId]
      );
      set.status = 200;
      return {
        status: 200,
        message: "Answer updated successfully",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        status: 400,
        message: error.message,
      };
    }
  })
  .post(
    "/createSubtopic",
    async ({ set, body }) => {
      try {
        let { subtopic, topic } = body;

        db.exec(
          "CREATE TABLE IF NOT EXISTS codsubtopics (id INTEGER PRIMARY KEY AUTOINCREMENT, subtopicid TEXT, topicid TEXT)"
        );

        let data = db
          .prepare("SELECT * FROM codsubtopics WHERE subtopicid = ?")
          .all(subtopic);

        if (data.length > 0) {
          set.status = 400;
          return {
            status: 400,
            message: "Subtopic already exists",
          };
        }

        db.exec("INSERT INTO codsubtopics VALUES (?, ?, ?)", [
          null,
          subtopic,
          topic,
        ]);

        set.status = 200;

        return {
          status: 200,
        };
      } catch (error: any) {
        console.log(error);
        set.status = 400;
      }
    },
    {
      body: t.Object({
        subtopic: t.String(),
        topic: t.String(),
      }),
    }
  )
  .delete("/deletesubtopic", async ({ set, query }) => {
    try {
      const { id, topicId }: any = query;

      db.exec("DELETE FROM codsubtopics WHERE id = ? AND topicid = ?", [
        id,
        topicId,
      ]);

      set.status = 200;
      return {
        ok: true,
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        status: 400,
        message: error,
      };
    }
  })
  .get("/getSubtopics/:topic", async ({ set, params, query }) => {
    try {
      let { topic } = params;
      const { search }: any = query

      let data;
      if (search) {
        data = db
          .prepare("SELECT * FROM codsubtopics WHERE topicid = ? AND subtopicid LIKE ? ")
          .all(topic, `%${search}%`);
      } else {
        data = db
          .prepare("SELECT * FROM codsubtopics WHERE topicid = ? ")
          .all(topic);
      }

      set.status = 200;

      return {
        data,
        status: true,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;

      return {
        status: 400,
        message: error,
      };
    }
  })
  .get("/getSubtopicQuestions/:subtopic/:topic", async ({ set, params, query }) => {
    try {
      let { subtopic, topic } = params;
      const { search }: any = query;

      let data;
      if (search) {
        data = db
          .prepare(
            "SELECT * FROM codquestions WHERE subtopicid = ? AND isSubtopicQuestion = 1 AND topicid = ? AND title LIKE ? ORDER BY CAST(SUBSTR(title, 3, INSTR(SUBSTR(title, 3), '.') - 1) AS ORDERED)"
          )
          .all(subtopic, topic, `%${search}%`);
      } else {
        data = db
          .prepare(
            "SELECT * FROM codquestions WHERE subtopicid = ? AND isSubtopicQuestion = 1 AND topicid = ? ORDER BY CAST(SUBSTR(title, 3, INSTR(SUBSTR(title, 3), '.') - 1) AS ORDERED)"
          )
          .all(subtopic, topic);
      }

      set.status = 200;

      return {
        data,
        status: true,
      };
    } catch (error) {
      console.log(error);
      set.status = 400;

      return {
        status: 400,
        message: error,
      };
    }
  });
