import Elysia from "elysia";

export const testController = new Elysia({
    prefix: "/test",
})
// .post("/renamefiles", async ({ set, body }: any) => {
//       try {
//         // Get the list of filenames from the request body
//         const { filenames } = body;
    
//         // Ensure the filenames array is provided
//         if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
//           return (set.status = 400);
//         }
    
//         const results = [];
    
//         // Loop through each filename and remove the hash
//         for (const oldFilename of filenames) {
//           // Assuming the hash is the last part of the filename before the extension
//           const parts = oldFilename.split(".");
//           const extension = parts.pop(); // Extract the extension
//           const hash = parts.pop(); // Extract the hash
//           const newFilename = parts.join(".") + "." + extension; // Rebuild the filename without the hash
    
//           // Rename the object in S3 (copy to new filename and delete the old one)
//           const { ok, message, error } = await renameS3Object(
//             oldFilename,
//             newFilename
//           );
    
//           if (ok) {
//             // Add the success message to the results
//             results.push({ oldFilename, newFilename, message });
//           } else {
//             // Handle the error case
//             results.push({
//               oldFilename,
//               newFilename,
//               error: `Failed to rename ${oldFilename}`,
//             });
//           }
//         }
    
//         // Return the results of the renaming operations
//         return {
//           ok: true,
//           message: "File renaming operation completed",
//           results,
//         };
//       } catch (error) {
//         // Handle server-side errors
//         console.error("Error renaming files:", error);
//       }
//     });
    