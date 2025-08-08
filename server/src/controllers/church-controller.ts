import Elysia, { t } from "elysia";
import { church as db } from "../lib/db";

export const ChurchController = new Elysia({
  prefix: "/church",
})

  .post(
    "/create",
    async ({ set, body }) => {
      try {
        const { pastorname, churchname, mobile, district, address, city }: any =
          body;

        db.exec(
          "CREATE TABLE IF NOT EXISTS churches (id INTEGER PRIMARY KEY AUTOINCREMENT, pastorname TEXT, churchname TEXT, mobile INT, district TEXT, address TEXT, city TEXT)"
        );

        const stmt = db.prepare(
          "INSERT INTO churches (pastorname, churchname, mobile, district, address, city) VALUES (?, ?, ?, ?, ?, ?)"
        );
        const result = stmt.run(
          pastorname,
          churchname,
          mobile,
          district,
          address,
          city
        );

        set.status = 200;
        return {
          message: "Church added successfully",
          status: 200,
        };
      } catch (error: any) {
        console.log(error);
        set.status = 400;
        return {
          status: 400,
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        pastorname: t.String(),
        churchname: t.String(),
        mobile: t.Number(),
        district: t.String(),
        address: t.String(),
        city: t.String(),
      }),
    }
  )
  // .get("/allchurches", async ({ query, set }: any) => {
  //   try {
  //     const { page, limit, search } = query;
  //     let totalCount: any = 0;
  //     let allChurches;
  //     if (search) {
  //       totalCount = db
  //         .prepare(
  //           "SELECT COUNT(*) AS count  FROM churches WHERE churchname LIKE ?"
  //         )
  //         .get(`%${search}%`);
  //     } else {
  //       totalCount = db.prepare("SELECT COUNT(*) AS count FROM churches").get();
  //     }

  //     if (page && limit) {
  //       let _page = Number(page) || 1;
  //       let _limit = Number(limit) || 10;
  //       const offset = (_page - 1) * _limit;

  //       if (search) {
  //         allChurches = db
  //           .prepare(
  //             "SELECT * FROM churches WHERE churchname LIKE ? LIMIT ? OFFSET ?"
  //           )
  //           .all(`%${search}%`, _limit, offset);
  //       } else {
  //         allChurches = db
  //           .prepare("SELECT * FROM churches LIMIT ? OFFSET ?")
  //           .all(_limit, offset);
  //       }
  //     } else {
  //       if (search) {
  //         allChurches = db
  //           .prepare("SELECT * FROM churches WHERE churchname LIKE ?")
  //           .all(`%${search}%`);
  //       } else {
  //         allChurches = db.prepare("SELECT * FROM churches").all();
  //       }
  //     }

  //     set.status = 200;

  //     return {
  //       status: 200,
  //       allChurches,
  //       totalCount,
  //     };
  //   } catch (error: any) {
  //     console.log(error);
  //     return {
  //       status: 400,
  //       message: error,
  //     };
  //   }
  // })
  .get("/allchurches", async ({ query, set }: any) => {
    try {
      const { page, limit, search } = query;
      let totalCount: any = 0;
      let allChurches;
      const searchFields = ["churchname", "mobile", "pastorname", "district"];

      let whereClause = "";
      let searchParams: string[] = [];

      if (search) {
        whereClause = `WHERE ${searchFields.map(f => `${f} LIKE ?`).join(" OR ")}`;
        searchParams = searchFields.map(() => `%${search}%`);
      }

      if (search) {
        totalCount = db
          .prepare(`SELECT COUNT(*) AS count FROM churches ${whereClause}`)
          .get(...searchParams);
      } else {
        totalCount = db.prepare("SELECT COUNT(*) AS count FROM churches").get();
      }

      if (page && limit) {
        let _page = Number(page) || 1;
        let _limit = Number(limit) || 10;
        const offset = (_page - 1) * _limit;

        if (search) {
          allChurches = db
            .prepare(`SELECT * FROM churches ${whereClause} LIMIT ? OFFSET ?`)
            .all(...searchParams, _limit, offset);
        } else {
          allChurches = db
            .prepare("SELECT * FROM churches LIMIT ? OFFSET ?")
            .all(_limit, offset);
        }
      } else {
        if (search) {
          allChurches = db
            .prepare(`SELECT * FROM churches ${whereClause}`)
            .all(...searchParams);
        } else {
          allChurches = db.prepare("SELECT * FROM churches").all();
        }
      }

      set.status = 200;

      return {
        status: 200,
        allChurches,
        totalCount,
      };
    } catch (error: any) {
      console.log(error);
      return {
        status: 400,
        message: error.message || "Something went wrong",
      };
    }
  })
  .delete("/deletechurch", async ({ set, query }) => {
    try {
      const { churchid }: any = query;

      db.exec("DELETE FROM churches WHERE id = ?", [churchid]);
      set.status = 200;

      return {
        status: 200,
        message: "success",
      };
    } catch (error: any) {
      console.log(error);
      return {
        status: 400,
        message: error,
      };
    }
  });
