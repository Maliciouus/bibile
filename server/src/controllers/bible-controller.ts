import Elysia, { t } from "elysia";
import { db } from "../lib/db";
import { saveFile, deliverFile, deleteFile } from "../lib/file-s3";
import { allowedFormats } from "../lib/audio-file-format";

export const bibleController = new Elysia({
  prefix: "/bible",
})
  .get(
    "/books",
    ({ set, query }) => {
      try {
        let data;
        let { chapter, book } = query;

        console.log(query);

        if (chapter && book) {
          data = db
            .prepare(
              "SELECT VerseCount AS verse, Verse, title FROM bible WHERE Book = ? AND Chapter = ?"
            )
            .all(book, chapter);
        } else {
          data = db.prepare("SELECT * FROM titles").all();
        }

        set.status = 200;

        return {
          data,
          status: true,
        };
      } catch (error: any) {
        console.log(error);
        set.status = 400;

        return {
          message: error.message,
          status: false,
        };
      }
    },
    {
      query: t.Optional(
        t.Object({
          chapter: t.Optional(t.String()),
          book: t.Optional(t.String()),
        })
      ),
    }
  )
  .get(
    "/chapter",
    async ({ query, set }) => {
      let { book, chapter } = query;
      let data: any;
      let currChapter = Number(chapter || 1);

      book = book || "ஆதியாகமம்";

      let index: any = db
        .prepare("SELECT * FROM titles WHERE title = ?")
        .all(book);

      if (index.length < 0) {
        set.status = 400;

        return {
          message: "Book not found",
          status: false,
        };
      }

      data = db
        .prepare(
          "SELECT verse, Versecount as versecount FROM bible WHERE title = ? AND Chapter = ?"
        )
        .all(book, currChapter);

      const audio: any = db
        .prepare(
          "SELECT audiopath FROM bibleaudios WHERE title = ? AND chapter = ?"
        )
        .all(book, currChapter);

      let { data: _data, ok }: any = await deliverFile(audio[0].audiopath);

      let audioUrl = ok ? _data : null;

      set.status = 200;

      return {
        status: true,
        data: {
          id: index[0].id,
          title: index[0].title,
          chapter_count: index[0].chapter_count,
          verses: data,
          audioUrl,
        },
      };
    },
    {
      query: t.Optional(
        t.Object({
          book: t.Optional(t.String()),
          chapter: t.Optional(t.String()),
        })
      ),
    }
  )
  .get("/getaudioslist", async ({ set, query }) => {
    try {
      const { bookName, page, limit } = query;
      let totalCount: any = 0;
      if (!bookName) {
        set.status = 400;
        return {
          message: "Book name not found",
        };
      }

      let _page = Number(page) || 1;
      let _limit = Number(limit) || 10;
      let offset = (_page - 1) * _limit;

      totalCount = db
        .prepare("SELECT COUNT(*) AS count FROM bibleaudios WHERE title = ?")
        .get(bookName);

      const data = db
        .prepare(
          "SELECT * FROM bibleaudios WHERE title = ? ORDER BY chapter LIMIT ? OFFSET ?"
        )
        .all(bookName, _limit, offset);

      for (let i of data) {
        //@ts-ignore
        let { ok, data } = await deliverFile(i.audiopath);

        if (ok) {
          //@ts-ignore
          i.audiourl = data;
        }
      }

      set.status = 200;
      return {
        data,
        totalCount,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .post("/uploadaudio", async ({ set, query, body }) => {
    try {
      const { bookName, chapter } = query;
      const { audio }: any = body;

      if (!bookName || !chapter) {
        set.status = 400;
        return {
          message: "Book name or chapter not found",
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

      let { ok, filename } = await saveFile(
        blob,
        "bibleaudios",
        `${bookName}-${chapter}`
      );

      if (!ok) {
        set.status = 400;
        return {
          message: "Something went wrong",
        };
      }

      db.exec(
        "UPDATE bibleaudios SET audiopath = ?, audioname = ?  WHERE title = ? AND chapter = ?",
        [filename, audio.name, bookName, chapter]
      );

      set.status = 201;
      return {
        message: "Audio uploaded successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .delete("/deleteaudio", async ({ set, query }) => {
    try {
      const { bookName, chapter } = query;

      if (!bookName || !chapter) {
        set.status = 400;
        return {
          message: "Book name or chapter not found",
        };
      }

      const audio: any = db
        .prepare("SELECT * FROM bibleaudios WHERE title = ? AND chapter = ?")
        .get(bookName, chapter);

      if (!audio) {
        set.status = 400;
        return {
          message: "Audio not found",
        };
      }

      db.exec(
        "UPDATE bibleaudios SET audiopath = null, audioname = null  WHERE title = ? AND chapter = ?",
        [bookName, chapter]
      );

      const { ok, error } = await deleteFile(audio.audiopath);

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
      console.log(error);
      return {
        status: 400,
        message: error.message,
      };
    }
  })
  .get("/geteditlist", async ({ set, query }: any) => {
    try {
      const { bookName, page, limit, chapter } = query;
      let totalCount: any = 0;

      if (!bookName) {
        set.status = 400;
        return {
          message: "Book name not found",
        };
      }
      let _page = Number(page) || 1;
      let _limit = Number(limit) || 10;
      let offset = (_page - 1) * _limit;

      let whereClause = "WHERE title = ?";
      let params = [bookName];

      if (chapter) {
        whereClause += " AND Chapter = ?";
        params.push(chapter);
      }

      const countQuery = `SELECT COUNT(*) AS count FROM bible ${whereClause}`;
      totalCount = db.prepare(countQuery).get(...params);

      const dataQuery = `SELECT * FROM bible ${whereClause} ORDER BY chapter LIMIT ? OFFSET ?`;
      params.push(_limit, offset);
      const data = db.prepare(dataQuery).all(...params);

      set.status = 200;
      return {
        data,
        totalCount,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .put("/editverse", async ({ body, set }: any) => {
    try {
      const { Chapter, title, Versecount, verse } = body;

      if (!Chapter || !title || !Versecount || !verse) {
        set.status = 400;
        return {
          message: "Chapter or title or Versecount or verse not found",
        };
      }

      const dataExist = db
        .prepare("SELECT * FROM bible WHERE Chapter = ? AND title = ?")
        .get(Chapter, title);
      if (!dataExist) {
        set.status = 400;
        return {
          message: "Data not found",
        };
      }

      const updateVerse = db.exec(
        "UPDATE bible SET verse = ? WHERE Chapter = ? AND title = ? AND Versecount = ?",
        [verse, Chapter, title, Versecount]
      );
      set.status = 200;
      return {
        message: "Data updated successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  });
