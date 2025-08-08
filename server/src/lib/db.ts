import { Database } from "bun:sqlite";
// import { titles } from "../../data/titles";

export const db = new Database("data/bible-new.sqlite", { create: true });
export const gallery = new Database("data/gallery.sqlite", { create: true });
export const dailymanna = new Database("data/dailymanna.sqlite", {
  create: true,
});
export const songbook = new Database("data/songbook.sqlite", { create: true });
export const cod = new Database("data/cod.sqlite", { create: true });
export const message = new Database("data/messages.sqlite", { create: true });
export const church = new Database("data/church.sqlite", { create: true });
export const newbooks = new Database("data/newbooks.sqlite", { create: true });
export const publishedBooks = new Database("data/publishedBooks.sqlite", {
  create: true,
});
export const tamilSpecialBook = new Database("data/tamilSpecialBook.sqlite", {
  create: true,
});
export const englishSpecialBook = new Database(
  "data/englishSpecialBook.sqlite",
  {
    create: true,
  }
);
export const englishTable = new Database("data/englishTable.sqlite", {
  create: true,
});
export const userTable = new Database("data/userTable.sqlite", {
  create: true,
});
export const NotesTable = new Database("data/notesTable.sqlite", {
  create: true,
});

// // let data: any = db
// //     .prepare(
// //       "SELECT Book AS book, COUNT(DISTINCT Chapter) AS chapter_count FROM bible WHERE Book = ? GROUP BY Book"
// //     )
// //     .all(i);

// db.exec(
//   "CREATE TABLE IF NOT EXISTS titles (id INTEGER PRIMARY KEY, title TEXT, chapter_count INTEGER)"
// );

// for (let i = 0; i < titles.length; i++) {
//   let count: any = db
//     .prepare(
//       "SELECT Book AS book, COUNT(DISTINCT Chapter) AS chapter_count FROM bible WHERE Book = ? GROUP BY Book"
//     )
//     .all(i);

//   console.log(count);

//   db.exec("INSERT INTO titles VALUES (?, ?, ?)", [
//     i + 1,
//     titles[i],
//     count[0].chapter_count,
//   ]);
// }
// console.log("Db loaded ");

//   // Generate text file
//   const textFileName = `${title}-${chapter}.txt`;
//   const versesText = bibleData
//     .map((verse, index) => `${index + 1}. ${verse.verse}`)
//     .join("\n");
//   fs.writeFileSync(`../../texts/${textFileName}`, versesText);
