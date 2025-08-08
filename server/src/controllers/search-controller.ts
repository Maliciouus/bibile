import Elysia, { t } from "elysia";
import { db, message } from "../lib/db";

export const searchController = new Elysia({
  prefix: "/search",
})
  .get(
    "/",
    async ({ query, set }) => {
      try {
        let { q, page = 1, limit = 10 } = query;

        page = Number(page);
        limit = Number(limit);

        let messageData: any = [];
        let bibleData: any = [];
        let offset = (page - 1) * limit;

        const messageTotal: any = message
          .prepare(
            "SELECT SUM(word_count) AS grand_total FROM (SELECT (LENGTH(message) - LENGTH(REPLACE(message, ?, ''))) / LENGTH(?) AS word_count FROM messages WHERE message LIKE ?) AS subquery"
          )
          .get(q, q, "%" + q + "%");

        const bibleTotal = db
          .prepare("SELECT COUNT(*) AS count FROM bible WHERE verse LIKE ?")
          .get("%" + q + "%");

        messageData = message
          .prepare(
            "SELECT id, name, (LENGTH(message) - LENGTH(REPLACE(message, ?, ''))) / LENGTH(?) AS word_count FROM messages WHERE message LIKE ? ORDER BY name"
          )
          .all(q, q, "%" + q + "%");

        bibleData = db
          .prepare(
            "SELECT Chapter,title, COUNT(*) AS word_count FROM bible WHERE verse LIKE ? GROUP BY title ORDER BY book "
          )
          .all("%" + q + "%");

        set.status = 200;
        return {
          messageData,
          bibleData,
          pagination: {
            page,
            limit,
            messageTotal,
            bibleTotal,
          },
        };
      } catch (error: any) {
        set.status = 400;
        return { status: 400, message: error.message };
      }
    },
    {
      query: t.Object({
        q: t.String(),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
  .get("/getbookverse", async ({ query, set }) => {
    try {
      let { q, title }: any = query;
      let bibleData = db
        .prepare(
          "SELECT *, COUNT(*) AS word_count, Versecount, Chapter FROM bible WHERE title = ? AND verse LIKE ? GROUP BY verse ORDER BY word_count DESC, Chapter ASC, Versecount ASC"
        )
        .all(title, "%" + q + "%");

      set.status = 200;
      return { data: bibleData, status: true };
    } catch (error) {
      console.log(error);
      return { status: 400, message: error };
    }
  })
  .get("/getbookversemultiple", async ({ query, set }) => {
    try {
      let { q, title }: any = query;

      let titles = title.split(",");

      let data = [];

      for (let i = 0; i < titles.length; i++) {
        let title = titles[i];
        let bibleData = db
          .prepare(
            "SELECT *, COUNT(*) AS word_count, Versecount, Chapter FROM bible WHERE title = ? AND verse LIKE ? GROUP BY verse ORDER BY word_count DESC, Chapter ASC, Versecount ASC"
          )
          .all(title, "%" + q + "%");
        data.push(bibleData);
      }

      set.status = 200;
      return { data, status: true };
    } catch (error) {
      console.log(error);
      return { status: 400, message: error };
    }
  })
  .post("/getselectedbookverse", async ({ query, set }) => {
    try {
      let { chapter, title }: any = query;

      // let selectedData = db
      //   .prepare("SELECT * FROM bible WHERE Chapter = ? AND title = ?")
      //   .all(chapter, title);
      // set.status = 200;

      let selectedData = db
        .prepare(
          "SELECT * FROM bible WHERE title = ? AND Chapter = ? ORDER BY Chapter"
        )
        .all(title, chapter);

      set.status = 200;

      return { selectedData, status: true };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })
  .get("/getmessage", async ({ query, set }) => {
    try {
      let { q, id }: any = query;

      let messageData = message
        .prepare(
          "SELECT id, name, message, (LENGTH(message) - LENGTH(REPLACE(message, ?, ''))) / LENGTH(?) AS word_count FROM messages WHERE message LIKE ? AND id = ? ORDER BY id"
        )
        .all(q, q, "%" + q + "%", id);

      const pTagRegex = /<p>(.*?)<\/p>/g;
      const strongTagRegex = /<strong>(.*?)<\/strong>/g;

      messageData.forEach((message: any) => {
        const pMatches = message.message.match(pTagRegex);
        const strongMatches = message.message.match(strongTagRegex);
        const extractedContent: any[] = [];
        if (pMatches) {
          pMatches.forEach((match: any) => {
            if (match.includes(q) === true) {
              extractedContent.push(match.replace(/<p>|<\/p>/g, ""));
            }
          });
        }
        if (strongMatches) {
          strongMatches.forEach((match: any) => {
            if (match.includes(q) === true) {
              extractedContent.push(match.replace(/<strong>|<\/strong>/g, ""));
            }
          });
        }
        message.message = extractedContent;
      });

      set.status = 200;

      return { messageData, status: true };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })
  .get("/getmessagemultiple", async ({ query, set }) => {
    try {
      let { q, id }: any = query;

      let ids = id.split(",");

      let messageData: any[] = [];

      ids.forEach((singleId: string) => {
        let messages = message
          .prepare(
            "SELECT id, name, message, (LENGTH(message) - LENGTH(REPLACE(message, ?, ''))) / LENGTH(?) AS word_count FROM messages WHERE message LIKE ? AND id = ? ORDER BY id"
          )
          .all(q, q, "%" + q + "%", singleId);

        messageData = [...messageData, ...messages];
      });

      const pTagRegex = /<p>(.*?)<\/p>/g;
      const strongTagRegex = /<strong>(.*?)<\/strong>/g;

      messageData.forEach((message: any) => {
        const pMatches = message.message.match(pTagRegex);
        const strongMatches = message.message.match(strongTagRegex);
        const extractedContent: any[] = [];

        if (pMatches) {
          pMatches.forEach((match: any) => {
            if (match.includes(q)) {
              extractedContent.push(match.replace(/<p>|<\/p>/g, ""));
            }
          });
        }

        if (strongMatches) {
          strongMatches.forEach((match: any) => {
            if (match.includes(q)) {
              extractedContent.push(match.replace(/<strong>|<\/strong>/g, ""));
            }
          });
        }

        message.message = extractedContent;
      });

      set.status = 200;

      return { messageData, status: true };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  })
  .post("/getselectedmessage", async ({ query, set }) => {
    try {
      let { id }: any = query;

      let selectedMessage = message
        .prepare("SELECT * FROM messages WHERE id = ?")
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
  });
