import Elysia from "elysia";
import { gallery as db } from "../lib/db";
import { unlink } from "node:fs/promises";
import { deleteFile, deliverFile, saveFile } from "../lib/file-s3";

export const galleryController = new Elysia({
  prefix: "/gallery",
})

  .post("/createtitle", async ({ set, body }: any) => {
    try {
      const { title } = body;

      db.exec(
        "CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)"
      );
      db.exec("INSERT INTO gallery (title) VALUES (?)", [title]);
      set.status = 200;
      return {
        message: "success",
        status: 200,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
        status: 400,
      };
    }
  })

  .get("/imagetitles", async ({ set }: any) => {
    try {
      const data = db.prepare("SELECT * FROM gallery").all();
      set.status = 200;
      return {
        data,
        ok: true,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  })

  .delete("/deletetitle", async ({ set, query }: any) => {
    try {
      const { id } = query;
      db.exec("DELETE FROM gallery WHERE id = ?", [id]);
      set.status = 200;
      return {
        message: "success",
        status: 200,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
        status: 400,
      };
    }
  })
  .post("/uploadimage", async ({ body, set, query }: any) => {
    try {
      const { titleId } = query;
      let { images, title, description }: any = body;

      if (!titleId) {
        throw new Error("Title ID not found");
      }

      db.exec(
        "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, imagepath TEXT, imagename TEXT,title TEXT,description TEXT, titleId INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
      );

      let _title = db
        .prepare("SELECT * FROM gallery WHERE id = ?")
        .all(titleId);

      if (_title.length < 0) {
        throw new Error("Title not found");
      }

      if (!Array.isArray(images)) {
        images = [images];
      }

      for (let i = 0; i < images.length; i++) {
        const allowedFormats = [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
          ".svg",
          ".gif",
        ];
        const fileExtension = images[i].name.split(".").pop();
        if (!allowedFormats.includes("." + fileExtension)) {
          throw new Error("Invalid file format");
        }
      }

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const blob = new Blob([image], {
          type: image.type,
        });
        let { ok, filename } = await saveFile(blob, "gallery");
        if (!ok) {
          throw new Error("Failed to save image");
        }
        db.exec(
          "INSERT INTO images (imagepath, imagename, title, description, titleId) VALUES (?, ?, ?, ?, ?)",
          [filename, image.name, title, description, titleId]
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      set.status = 200;
      return {
        message: "Images uploaded successfully",
        status: 200,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: error.message,
        status: 400,
      };
    }
  })
  // .post("/uploadimage", async ({ body, set }: any) => {
  //   try {
  //     let { images, title, description }: any = body;

  //     db.exec(
  //       "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY  AUTOINCREMENT , imagepath TEXT, imagename TEXT,title TEXT,description TEXT, imagetitle INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
  //     );

  //     if (!Array.isArray(images)) {
  //       images = [images];
  //     }

  //     for (let i = 0; i < images.length; i++) {
  //       const allowedFormats = [".jpg", ".jpeg", ".png"];
  //       const fileExtension = images[i].name.split(".").pop();
  //       if (!allowedFormats.includes("." + fileExtension)) {
  //         throw new Error("Invalid file format");
  //       }
  //     }

  //     for (let i = 0; i < images.length; i++) {
  //       const image = images[i];

  //       const blob = new Blob([image], {
  //         type: image.type,
  //       });
  //       let { ok, filename } = await saveFile(blob, "gallery");
  //       if (!ok) {
  //         throw new Error("Failed to save image");
  //       }

  //       db.exec(
  //         "INSERT INTO gallery (imagepath, imagename,title,description) VALUES (?, ?, ?, ?)",
  //         [
  //           filename,
  //           image.name,
  //           title ? title : null,
  //           description ? description : null,
  //         ]
  //       );

  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }

  //     set.status = 200;
  //     return {
  //       message: "Images uploaded successfully",
  //     };
  //   } catch (error: any) {
  //     console.log(error);
  //     set.status = 400;
  //     return {
  //       message: error.message,
  //     };
  //   }
  // })
  .post("/description", async ({ set, body, query }: any) => {
    try {
      const { imageId } = query;

      if (!imageId) {
        throw new Error("imageId is required");
      }

      const { title, description }: any = body;

      const data = db
        .prepare("UPDATE images SET title = ?, description = ? WHERE id = ?")
        .run(title, description, imageId);

      set.status = 200;

      return {
        message: "Description updated successfully",
        ok: true,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  })

  .get("/getimages", async ({ set, query }: any) => {
    try {
      const { titleId, page, limit }: any = query;

      if (!titleId) {
        set.status = 400;
        return {
          ok: false,
          message: "Title ID not found",
        };
      }

      const _page = Number(page) || 1;
      const _limit = Number(limit) || 10;
      const offset = (_page - 1) * _limit;

      const totalCount: any = db
        .prepare("SELECT COUNT(*) AS total FROM images WHERE titleId = ?")
        .get(titleId);

      const data = db
        .prepare(
          "SELECT * FROM images WHERE titleId = ? ORDER BY id LIMIT ? OFFSET ?"
        )
        .all(titleId, _limit, offset);

      for (let i of data) {
        //@ts-ignore
        let { ok, data } = await deliverFile(i.imagepath);
        if (ok) {
          // @ts-ignore
          i.imageurl = data;
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
      return {
        status: 400,
        message: error.message,
      };
    }
  })

  .get("/views3", async ({ set, query }) => {
    try {
      let { ok, data } = await deliverFile(query.key);

      if (!ok) {
        set.status = 400;
        return {
          ok: false,
          message: "file not found",
        };
      }

      return data;
    } catch (error) {
      console.log(error);
      set.status = 400;
      return {
        ok: false,
        message: "file not found",
      };
    }
  })
  .delete("/deleteimage", async ({ query, set }) => {
    try {
      const { imageId } = query;
      if (!imageId) {
        set.status = 400;
        return {
          ok: false,
          message: "image id not found",
        };
      }

      const image: any = db
        .prepare("SELECT imagepath, imagename FROM images WHERE id = ?")
        .get(imageId);

      if (!image) {
        set.status = 400;
        return {
          ok: false,
          message: "image not found",
        };
      }

      const { ok, error } = await deleteFile(image.imagepath);

      if (!ok) {
        set.status = 400;
        return {
          ok: false,
          message: "image could not be deleted from S3",
          error,
        };
      }

      db.exec("DELETE FROM images WHERE id = ?", [imageId]);

      set.status = 200;
      return {
        message: "image deleted successfully",
        ok: true,
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
  .post("/downloadimage", async ({ query, set }: any) => {
    try {
      const { imageId }: any = query;

      if (!imageId) {
        set.status = 400;
        return {
          ok: false,
          message: "Image ID not found",
        };
      }

      const image: any = db
        .prepare("SELECT imagepath, imagename FROM images WHERE id = ?")
        .get(imageId);

      if (!image) {
        set.status = 404;
        return {
          ok: false,
          message: "Image not found",
        };
      }

      let { ok, data } = await deliverFile(image.imagepath);

      if (!ok) {
        set.status = 500;
        return {
          ok: false,
          message: "Internal Server Error",
        };
      }
      console.log(data);
      return data;
    } catch (error: any) {
      console.log(error);
      set.status = 500;
      return {
        ok: false,
        message: "Internal Server Error",
      };
    }
  })

  // pdf file crud

  // .post("/uploadpdf", async ({ body, set }: any) => {
  //   try {
  //     let { files }: any = body;

  //     db.exec(
  //       "CREATE TABLE IF NOT EXISTS pdfs (id INTEGER PRIMARY KEY  AUTOINCREMENT , pdfpath TEXT, pdfname TEXT)"
  //     );

  //     if (!Array.isArray(files)) {
  //       files = [files];
  //     }

  //     for (let i = 0; i < files.length; i++) {
  //       const allowedFormats = [".pdf"];
  //       const fileExtension = files[i].name.split(".").pop();
  //       if (!allowedFormats.includes("." + fileExtension)) {
  //         throw new Error("Invalid file format");
  //       }
  //     }

  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];

  //       const blob = new Blob([file], {
  //         type: file.type,
  //       });

  //       let { ok, filename } = await saveFile(blob, "pdfs");
  //       if (!ok) {
  //         throw new Error("Failed to save PDF");
  //       }

  //       db.exec("INSERT INTO pdfs(pdfpath, pdfname) VALUES(?,?)", [
  //         filename,
  //         file.name,
  //       ]);

  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }

  //     set.status = 200;
  //     return {
  //       message: "PDF uploaded successfully",
  //     };
  //   } catch (error: any) {
  //     console.log(error);
  //     set.status = 400;
  //     return {
  //       message: error.message,
  //     };
  //   }
  // })
  .post("/uploadpdf", async ({ body, set }: any) => {
    try {
      let { files }: any = body;

      db.exec(
        "CREATE TABLE IF NOT EXISTS pdfs (id INTEGER PRIMARY KEY  AUTOINCREMENT , pdfpath TEXT, pdfname TEXT)"
      );

      if (!Array.isArray(files)) {
        files = [files];
      }

      for (let i = 0; i < files.length; i++) {
        const allowedFormats = [".pdf"];
        const fileExtension = files[i].name.split(".").pop();
        if (!allowedFormats.includes("." + fileExtension)) {
          throw new Error("Invalid file format");
        }
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = "pdfs/" + file.name;

        const blob = new Blob([file], {
          type: file.type,
        });

        await Bun.write(filename, blob);

        db.exec("INSERT INTO pdfs(pdfpath, pdfname) VALUES(?,?)", [
          filename,
          file.name,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      set.status = 200;
      return {
        message: "PDF uploaded successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        message: error.message,
      };
    }
  })
  .get("/getpdfs", async ({ set }: any) => {
    try {
      const data = db.prepare("SELECT * FROM pdfs").all();
      set.status = 200;
      return {
        data,
        ok: true,
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
  .get("/viewpdf", async ({ query, set }: any) => {
    try {
      const { pdfId }: any = query;

      if (!pdfId) {
        set.status = 400;
        return {
          ok: false,
          message: "PDF ID not found",
        };
      }

      const pdf: any = db
        .prepare("SELECT pdfpath, pdfname FROM pdfs WHERE id = ?")
        .get(pdfId);
      if (!pdf) {
        set.status = 404;
        return {
          ok: false,
          message: "PDF not found",
        };
      }
      console.log(pdf);

      const file = Bun.file(pdf.pdfpath);

      let blob = await file.arrayBuffer();
      let pdffile = new Uint8Array(blob);

      console.log(pdffile);

      return pdffile;
    } catch (error: any) {
      console.log(error);

      return {
        ok: false,
        message: "Internal Server Error",
      };
    }
  })
  .delete("/deletepdf", async ({ set, query }) => {
    try {
      const { pdfId } = query;

      if (!pdfId) {
        set.status = 400;
        return {
          ok: false,
          message: "PDF ID not found",
        };
      }

      const pdf: any = db
        .prepare("SELECT pdfpath, pdfname FROM pdfs WHERE id = ?")
        .get(pdfId);
      if (!pdf) {
        set.status = 404;
        return {
          ok: false,
          message: "PDF not found",
        };
      }
      await unlink(pdf.pdfpath);
      db.exec("DELETE FROM pdfs WHERE id = ?", [pdfId]);
      set.status = 200;
      return {
        ok: true,
        message: "PDF deleted successfully",
      };
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  });
