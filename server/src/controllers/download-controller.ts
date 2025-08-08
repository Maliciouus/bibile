import Elysia from "elysia";
import {
  db,
  songbook,
  message,
  publishedBooks,
  tamilSpecialBook,
} from "../lib/db";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import { unlink } from "fs/promises";
import * as cheerio from "cheerio";

const ensureDirectoryExists = (filePath: string) => {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
export const downloadController = new Elysia({ prefix: "/download" })
  .post("/bibledownload", async ({ set, query }) => {
    try {
      let { title, chapter, format }: any = query;
      if (!format) {
        throw new Error(
          "Please specify the 'format' parameter as 'pdf' or 'txt'."
        );
      }
      format = format.toLowerCase();
      let bibleData = db
        .prepare("SELECT verse FROM bible WHERE title = ? AND Chapter = ?")
        .all(title, chapter);

      if (format === "pdf") {
        let doc = new PDFDocument();
        const pdfFilePath = path.join(
          __dirname,
          "../pdf/bible",
          `${title} - ${chapter}.pdf`
        );

        ensureDirectoryExists(pdfFilePath);

        const pdfGeneration = fs.createWriteStream(pdfFilePath);
        doc.pipe(pdfGeneration);
        doc.font(path.join(__dirname, "../../fonts/nirmalab.ttf"));
        doc.fontSize(12);
        bibleData.forEach((verse: any, index: any) => {
          doc.text(`${index + 1} . ${verse.verse}`, {
            lineGap: 5,
            lineBreak: true,
          });
        });
        doc.end();

        await new Promise((resolve) => pdfGeneration.on("finish", resolve));

        set.headers["Content-Type"] = "application/pdf";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename="${encodeURIComponent(
          `${title}-${chapter}.pdf`
        )}"`;

        set.status = 200;

        const stream = fs.createReadStream(pdfFilePath);

        stream.on("end", async () => {
          await unlink(pdfFilePath);
          console.log(`File deleted: ${pdfFilePath}`);
        });

        return stream;

      } else if (format === "txt") {
        const textFileName = `${title}-${chapter}.txt`;
        const versesText = bibleData
          .map((verse: any, index) => `${index + 1}. ${verse.verse}`)
          .join("\n");
        const textFilePath = path.join(
          __dirname,
          "../text/bible",
          textFileName
        );

        ensureDirectoryExists(textFilePath);

        fs.writeFileSync(textFilePath, versesText);

        const textStream = fs.createReadStream(textFilePath);
        textStream.on("end", async () => {
          await unlink(textFilePath);
          console.log(`File deleted: ${textFilePath}`);
        });

        set.headers["Content-Type"] = "text/plain";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename="${encodeURIComponent(
          textFileName.slice(0, -4)
        )}.txt"`;

        set.status = 200;
        return textStream;
      } else {
        throw new Error(
          "Invalid format specified. Please choose 'pdf' or 'txt'."
        );
      }
    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return { status: false, message: error.message || "An error occurred" };
    }
  })
  .post("/messagedownload", async ({ query, set }) => {
    try {
      let { messageId, format }: any = query;

      if (!format) {
        return {
          status: false,
          message: "Please specify the 'format' parameter as 'pdf' or 'txt'.",
        };
      }
      format = format.toLowerCase();
      let messageData: any = message
        .prepare("SELECT message,name FROM messages WHERE id = ?")
        .all(messageId);

      // messageData.forEach((message: any) => {
      //   const extractedContent = message.message
      //     .replace(/<\/?(p|strong)>/g, "\n")
      //     .trim();
      //   message.message = extractedContent.split(/\n+/);
      // });
      messageData.forEach((message: any) => {
        const $ = cheerio.load(message.message);

        $("h1").each((i, el) => {
          $(el).replaceWith("\n\n" + $(el).text());
        });

        $("p").each((i, el) => {
          $(el).replaceWith("\n" + $(el).text());
        });

        $("*").each((i, el) => {
          $(el).replaceWith($(el).text());
        });

        const extractedContent = $.text().trim();
        message.message = extractedContent.split(/\n+/);
      });
      if (format === "pdf") {
        let doc = new PDFDocument();

        const pdfFilePath = path.join(
          __dirname,
          "../pdf/message",
          `${messageData?.[0]?.name}.pdf`
        );

        ensureDirectoryExists(pdfFilePath);

        const pdfGeneration = fs.createWriteStream(pdfFilePath);
        doc.pipe(pdfGeneration);
        doc.font(path.join(__dirname, "../../fonts/nirmalab.ttf"));
        doc.fontSize(12);

        messageData?.[0]?.message?.forEach((message: any) => {
          doc.text(` ${message}`, {
            lineGap: 5,
            lineBreak: true,
          });
        });
        doc.end();

        await new Promise((resolve) => pdfGeneration.on("finish", resolve));


        set.headers["Content-Type"] = "application/pdf";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename=${encodeURIComponent(
          `${messageData?.[0]?.name}.pdf`
        )}"`;
        const stream = fs.createReadStream(pdfFilePath);

        stream.on("end", async () => {
          await unlink(pdfFilePath);
          console.log(`File deleted: ${pdfFilePath}`);
        });

        return stream;
      } else if (format === "txt") {
        const textFileName = `${messageData?.[0]?.name}.txt`;
        const mesageText = messageData?.[0]?.message
          .map((message: any) => ` ${message}`)
          .join("\n");
        const textFilePath = path.join(
          __dirname,
          "../text/message",
          textFileName
        );

        ensureDirectoryExists(textFilePath);

        fs.writeFileSync(textFilePath, mesageText);

        const textStream = fs.createReadStream(textFilePath);
        textStream.on("end", async () => {
          await unlink(textFilePath);
          console.log(`File deleted: ${textFilePath}`);
        });

        set.headers["Content-Type"] = "text/plain";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename="${encodeURIComponent(
          textFileName.slice(0, -4)
        )}.txt"`;

        set.status = 200;
        return textStream;
      } else {
        throw new Error(
          "Invalid format specified. Please choose 'pdf' or 'txt'."
        );
      }
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        status: 400,
        message: error,
      };
    }
  })
  .post("/songbookdownload", async ({ query, set }) => {
    try {
      let { songbookId, format }: any = query;

      if (!format) {
        return {
          status: false,
          message: "Please specify the 'format' parameter as 'pdf' or 'txt'.",
        };
      }
      format = format.toLowerCase();
      let songbookData: any = songbook
        .prepare("SELECT lyrics,name FROM songbooks WHERE id = ?")
        .all(songbookId);

      songbookData.forEach((songbook: any) => {

        const $ = cheerio.load(songbook.lyrics);

        $("br").replaceWith("\n\n");

        $("p").each((i, el) => {
          const text = $(el).text().trim();
          if (!text) {
            $(el).replaceWith("\n\n");
          } else {
            $(el).replaceWith(`${text}\n\n`);
          }
        });

        // Now get clean text
        const extractedContent = $.text().trim();

        songbook.lyrics = extractedContent.split("\n\n");

      });



      if (format === "pdf") {
        let doc = new PDFDocument();

        const pdfFilePath = path.join(
          __dirname,
          "../pdf/songbook",
          `${songbookData?.[0]?.name}.pdf`
        );

        ensureDirectoryExists(pdfFilePath);

        const pdfGeneration = fs.createWriteStream(pdfFilePath);
        doc.pipe(pdfGeneration);
        doc.font(path.join(__dirname, "../../fonts/nirmalab.ttf"));
        doc.fontSize(12);

        songbookData?.[0]?.lyrics?.forEach((lyrics: any) => {
          doc.text(` ${lyrics}`, {
            lineGap: 5,
            lineBreak: true,
          });
        });
        doc.end();

        await new Promise((resolve) => pdfGeneration.on("finish", resolve));


        set.headers["Content-Type"] = "application/pdf";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename=${encodeURIComponent(
          `${songbookData?.[0]?.name}.pdf`
        )}"`;
        set.status = 200;

        const stream = fs.createReadStream(pdfFilePath);

        stream.on("end", async () => {
          await unlink(pdfFilePath);
          console.log(`File deleted: ${pdfFilePath}`);
        });

        return stream;
      } else if (format === "txt") {
        const textFileName = `${songbookData?.[0]?.name}.txt`;
        const mesageText = songbookData?.[0]?.lyrics
          .map((lyrics: any) => ` ${lyrics}`)
          .join("\n");
        const textFilePath = path.join(
          __dirname,
          "../text/songbook",
          textFileName
        );

        ensureDirectoryExists(textFilePath);

        fs.writeFileSync(textFilePath, mesageText);

        const textStream = fs.createReadStream(textFilePath);
        textStream.on("end", async () => {
          await unlink(textFilePath);
          console.log(`File deleted: ${textFilePath}`);
        });

        set.headers["Content-Type"] = "text/plain";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename="${encodeURIComponent(
          textFileName.slice(0, -4)
        )}.txt"`;

        set.status = 200;
        return textStream;
      } else {
        throw new Error(
          "Invalid format specified. Please choose 'pdf' or 'txt'."
        );
      }
    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return { status: false, message: error.message || "An error occurred" };
    }
  })
  .post("/publishedbookdownload", async ({ query, set }) => {
    try {
      let { bookId, format }: any = query;

      if (!format) {
        return {
          status: false,
          message: "Please specify the 'format' parameter as 'pdf' or 'txt'.",
        };
      }
      format = format.toLowerCase();
      let bookData: any = publishedBooks
        .prepare("SELECT content,booktitle FROM publishedbooks WHERE id = ?")
        .all(bookId);

      // bookData.forEach((book: any) => {
      //   const extractedContent = book.content
      //     .replace(/<\/?(p|strong)>/g, "\n")
      //     .trim();
      //   book.content = extractedContent.split(/\n+/);
      // });
      bookData.forEach((book: any) => {
        const $ = cheerio.load(book.content);

        $("h1").each((i, el) => {
          $(el).replaceWith("\n\n" + $(el).text());
        });

        $("p").each((i, el) => {
          $(el).replaceWith("\n" + $(el).text());
        });

        $("*").each((i, el) => {
          $(el).replaceWith($(el).text());
        });

        const extractedContent = $.text().trim();
        book.content = extractedContent.split(/\n+/);
      });
      if (format === "pdf") {
        let doc = new PDFDocument();

        const pdfFilePath = path.join(
          __dirname,
          "../pdf/publishedbook",
          `${bookData?.[0]?.booktitle}.pdf`
        );

        ensureDirectoryExists(pdfFilePath);

        const pdfGeneration = fs.createWriteStream(pdfFilePath);
        doc.pipe(pdfGeneration);
        doc.font(path.join(__dirname, "../../fonts/nirmalab.ttf"));
        doc.fontSize(12);

        bookData?.[0]?.content?.forEach((content: any) => {
          doc.text(` ${content}`, {
            lineGap: 5,
            lineBreak: true,
          });
        });
        doc.end();

        await new Promise((resolve) => pdfGeneration.on("finish", resolve));


        set.headers["Content-Type"] = "application/pdf";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename=${encodeURIComponent(
          `${bookData?.[0]?.booktitle}.pdf`
        )}"`;
        set.status = 200;
        const stream = fs.createReadStream(pdfFilePath);

        stream.on("end", async () => {
          await unlink(pdfFilePath);
          console.log(`File deleted: ${pdfFilePath}`);
        });

        return stream;
      } else if (format === "txt") {
        const textFileName = `${bookData?.[0]?.booktitle}.txt`;
        const mesageText = bookData?.[0]?.content
          .map((lyrics: any) => ` ${lyrics}`)
          .join("\n");
        const textFilePath = path.join(
          __dirname,
          "../text/publishedbooks",
          textFileName
        );

        ensureDirectoryExists(textFilePath);

        fs.writeFileSync(textFilePath, mesageText);

        const textStream = fs.createReadStream(textFilePath);
        textStream.on("end", async () => {
          await unlink(textFilePath);
          console.log(`File deleted: ${textFilePath}`);
        });

        set.headers["Content-Type"] = "text/plain";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename="${encodeURIComponent(
          textFileName.slice(0, -4)
        )}.txt"`;

        set.status = 200;
        return textStream;
      } else {
        throw new Error(
          "Invalid format specified. Please choose 'pdf' or 'txt'."
        );
      }
    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return { status: false, message: error.message || "An error occurred" };
    }
  })
  .post("/tamilspecialbookdownload", async ({ query, set }) => {
    try {
      let { bookId, format }: any = query;

      if (!format) {
        return {
          status: false,
          message: "Please specify the 'format' parameter as 'pdf' or 'txt'.",
        };
      }
      format = format.toLowerCase();
      let bookData: any = tamilSpecialBook
        .prepare("SELECT content,title FROM tamilSpecialBook WHERE id = ?")
        .all(bookId);

      // bookData.forEach((book: any) => {
      //   const extractedContent = book.content
      //     .replace(/<\/?(p|strong)>/g, "\n")
      //     .trim();
      //   book.content = extractedContent.split(/\n+/);
      // });
      bookData.forEach((book: any) => {
        const $ = cheerio.load(book.content);

        $("h1").each((i, el) => {
          $(el).replaceWith("\n\n" + $(el).text());
        });

        $("p").each((i, el) => {
          $(el).replaceWith("\n" + $(el).text());
        });

        $("*").each((i, el) => {
          $(el).replaceWith($(el).text());
        });

        const extractedContent = $.text().trim();
        book.content = extractedContent.split(/\n+/);
      });
      if (format === "pdf") {
        let doc = new PDFDocument();

        const pdfFilePath = path.join(
          __dirname,
          "../pdf/tamilSPbook",
          `${bookData?.[0]?.title}.pdf`
        );

        ensureDirectoryExists(pdfFilePath);

        const pdfGeneration = fs.createWriteStream(pdfFilePath);
        doc.pipe(pdfGeneration);
        doc.font(path.join(__dirname, "../../fonts/nirmalab.ttf"));
        doc.fontSize(12);

        bookData?.[0]?.content?.forEach((content: any) => {
          doc.text(` ${content}`, {
            lineGap: 5,
            lineBreak: true,
          });
        });
        doc.end();

        await new Promise((resolve) => pdfGeneration.on("finish", resolve));


        set.headers["Content-Type"] = "application/pdf";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename=${encodeURIComponent(
          `${bookData?.[0]?.booktitle}.pdf`
        )}"`;
        set.status = 200;
        const stream = fs.createReadStream(pdfFilePath);

        stream.on("end", async () => {
          await unlink(pdfFilePath);
          console.log(`File deleted: ${pdfFilePath}`);
        });

        return stream;
      } else if (format === "txt") {
        const textFileName = `${bookData?.[0]?.title}.txt`;
        const mesageText = bookData?.[0]?.content
          .map((lyrics: any) => ` ${lyrics}`)
          .join("\n");
        const textFilePath = path.join(
          __dirname,
          "../text/tamilSPbooks",
          textFileName
        );

        ensureDirectoryExists(textFilePath);

        fs.writeFileSync(textFilePath, mesageText);

        const textStream = fs.createReadStream(textFilePath);
        textStream.on("end", async () => {
          await unlink(textFilePath);
          console.log(`File deleted: ${textFilePath}`);
        });

        set.headers["Content-Type"] = "text/plain";
        set.headers[
          "Content-Disposition"
        ] = `attachment; filename="${encodeURIComponent(
          textFileName.slice(0, -4)
        )}.txt"`;

        set.status = 200;
        return textStream;
      } else {
        throw new Error(
          "Invalid format specified. Please choose 'pdf' or 'txt'."
        );
      }
    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return { status: false, message: error.message || "An error occurred" };
    }
  });
