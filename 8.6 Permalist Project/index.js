import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "123456"
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM task");
  result.rows.forEach(element => {
    items.push(element);
  })
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  items = [];
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO task (todo) VALUES ($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const newData = req.body.updatedItemTitle;
  const updateID = req.body.updatedItemId;
  console.log(updateID)
  await db.query("UPDATE task SET todo = $1 WHERE id = $2", [newData, updateID]);
  res.redirect("/")
});

app.post("/delete", async (req, res) => {
   const deleted = req.body.deleteItemId;
   await db.query("DELETE FROM task WHERE id = $1", [deleted]);
   res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
