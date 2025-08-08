import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: process.env.REGION || "ap-south-1",

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "secret",
  },
});

const bucketName = process.env.BUCKET_NAME || "lastvoicemessage-bible";

export const saveFile = async (
  blob: Blob | undefined,
  parentFolder: string,
  keyString = ""
) => {
  try {
    if (!blob) {
      return { ok: false, filename: "" };
    }

    let hash =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    let currentDateString = new Date().toISOString().split("T")[0];

    let filename =
      "uploads/" + parentFolder + "/" + currentDateString + "/" + blob.name;
    // @ts-ignore
    const stream = Readable.from(blob.stream());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        ContentLength: blob.size,
        Key: filename,
        Body: stream,
      })
    );
    return { ok: true, filename };
  } catch (error) {
    console.error(error);

    return { ok: false, filename: "" };
  }
};

//HASHED
// export const saveFile = async (
//   blob: Blob | undefined,
//   parentFolder: string,
//   keyString = ""
// ) => {
//   try {
//     if (!blob) {
//       return { ok: false, filename: "" };
//     }

//     let hash =
//       Math.random().toString(36).substring(2, 15) +
//       Math.random().toString(36).substring(2, 15);

//     let currentDateString = new Date().toISOString().split("T")[0];

//     let filename =
//       "uploads/" +
//       parentFolder +
//       "/" +
//       currentDateString +
//       "/" +
//       blob.name +
//       "." +
//       hash +
//       `${keyString ? `-${keyString}` : ""}`;
//     // @ts-ignore
//     const stream = Readable.from(blob.stream());

//     await s3Client.send(
//       new PutObjectCommand({
//         Bucket: bucketName,
//         ContentLength: blob.size,
//         Key: filename,
//         Body: stream,
//       })
//     );
//     return { ok: true, filename };
//   } catch (error) {
//     console.error(error);

//     return { ok: false, filename: "" };
//   }
// };
export const deleteFile = async (filename: any) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filename,
      })
    );

    return { ok: true };
  } catch (error: any) {
    console.error(error);

    return { ok: false, error };
  }
};

export const deliverFile = async (filename: any) => {
  try {
    let url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: filename,
      }),
      {
        expiresIn: 3600, // 1 hour
      }
    );

    if (!url) {
      return {
        ok: false,
        data: [],
      };
    }

    return {
      data: url,
      ok: true,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      data: [],
    };
  }
};

// Function to rename an S3 object by copying to a new key and deleting the old key
export const renameS3Object = async (oldKey: string, newKey: string) => {
  try {
    // Step 1: Copy the object to the new key
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`, // The full path to the source object
        Key: newKey, // New key (without the hash)
      })
    );

    // Step 2: Delete the old object (with the hash)
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: oldKey, // Old key (with the hash)
      })
    );

    return { ok: true, message: `Renamed ${oldKey} to ${newKey}` };
  } catch (error) {
    console.error("Error renaming S3 object:", error);
    return { ok: false, error };
  }
};
