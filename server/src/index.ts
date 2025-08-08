import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { bibleController } from "./controllers/bible-controller";
import { ChurchController } from "./controllers/church-controller";
import { codController } from "./controllers/cod-controller";
import { DailymannaController } from "./controllers/dailymanna-controller";
import { downloadController } from "./controllers/download-controller";
import { EngishSpecialBookController } from "./controllers/english-specialbook-controller";
import { EngilshTableController } from "./controllers/english-table-controller";
import { fileContoller } from "./controllers/file-controller";
import { galleryController } from "./controllers/image-controller";
import { messageController } from "./controllers/message-controller";
import { newbooksController } from "./controllers/newbooks-controller";
import { PublishedBooksController } from "./controllers/publishedbooks-controller";
import { searchController } from "./controllers/search-controller";
import { songbookController } from "./controllers/songbook-controller";
import { TamilSpecialBookController } from "./controllers/tamil-specialbook-controller";
import { TamilTableController } from "./controllers/tamil-table-controller";
import { userController } from "./controllers/user-controller";
import { notesController } from "./controllers/notes-controller";
import { testController } from "./controllers/test-controller";

const app = new Elysia({
  prefix: "/api",
});
const PORT = process.env.PORT || 4001;
const date = new Date();

app.onRequest(({ request }) => {
  console.log(request.url + " | " + request.method, " | " + date);
});

// db.exec("DELETE FROM codquestions WHERE title IS NULL");

app.use(cors());

app.use(bibleController);
app.use(messageController);
app.use(codController);
app.use(ChurchController);
app.use(searchController);
app.use(downloadController);
app.use(fileContoller);
app.use(galleryController);
app.use(DailymannaController);
app.use(songbookController);
app.use(newbooksController);
app.use(PublishedBooksController);
app.use(TamilSpecialBookController);
app.use(EngishSpecialBookController);
app.use(TamilTableController);
app.use(EngilshTableController);
app.use(userController)
app.use(notesController)
app.use(testController)

app.listen({ port: PORT }, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
