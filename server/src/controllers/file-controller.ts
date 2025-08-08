import Elysia from "elysia";
import { message as db } from "../lib/db";
import { deleteFile, deliverFile, saveFile } from "../lib/file-s3";
import { allowedFormats } from "../lib/audio-file-format";

export const fileContoller = new Elysia({
  prefix: "/file",
})

  .post("/uploadaudio", async ({ body, set, query }: any) => {
    try {
      const { messageId }: any = query;
      const { audio } = body;

      if (!messageId) {
        set.status = 400;
        return {
          status: 400,
          message: "No message id provided",
        };
      }
      if (!audio) {
        set.status = 400;
        return {
          status: 400,
          message: "No audio provided",
        };
      }

      const fileExtension = audio.name.split(".").pop().toLowerCase();

      if (!allowedFormats.includes(fileExtension)) {
        set.status = 400;
        return {
          status: 400,
          message:
            "Invalid file format. Only mp3, wav, and ogg files are allowed.",
        };
      }

      const blob = new Blob([audio], {
        type: audio.type,
      });

      let { ok, filename } = await saveFile(blob, "messageaudios");
      console.log("filename", filename, ok);
      if (!ok) {
        throw new Error("Failed to save audio");
      }

      db.exec("UPDATE messages SET audiopath = ?, audioname = ? WHERE id = ?", [
        filename,
        audio.name,
        messageId,
      ]);

      set.status = 200;
      return {
        status: 200,
        message: "Audio uploaded successfully",
      };
    } catch (error: any) {
      console.log("error", error);
      set.status = 400;
      return {
        status: 400,
        message: error.message || "An error occurred during the upload process",
      };
    }
  })
  .get("/getaudio", async ({ query, set }: any) => {
    try {
      const { messageId, key }: any = query;

      if (!messageId) {
        set.status = 400;
        return {
          ok: false,
          message: "message id not found",
        };
      }

      const message: any = db
        .prepare("SELECT audiopath, audioname FROM messages WHERE id = ?")
        .all(messageId);

      if (!message) {
        set.status = 400;
        return {
          ok: false,
          message: "message not found",
        };
      }

      if (!message[0].audiopath) {
        set.status = 400;
        return {
          ok: false,
          message: "audio not found",
        };
      }

      let { ok, data } = await deliverFile(key);

      if (!ok) {
        throw new Error("Failed to deliver audio");
      }

      return data;
    } catch (error: any) {
      console.log(error);
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  })
  .delete("/deleteaudio", async ({ query, set }: any) => {
    try {
      const { messageId }: any = query;

      if (!messageId) {
        set.status = 400;
        return {
          ok: false,
          message: "message id not found",
        };
      }

      const message: any = db
        .prepare("SELECT audiopath, audioname FROM messages WHERE id = ?")
        .get(messageId);

      if (!message) {
        set.status = 400;
        return {
          ok: false,
          message: "message not found",
        };
      }

      db.exec(
        "UPDATE messages SET audiopath = NULL,audioname = NULL WHERE id = ?",
        [messageId]
      );

      const { ok, error } = await deleteFile(message.audiopath);

      if (!ok) {
        set.status = 400;
        return {
          ok: false,
          message: "audio could not be deleted from S3",
          error,
        };
      }

      set.status = 200;

      return {
        message: "file Deleted successfully",
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
  });
