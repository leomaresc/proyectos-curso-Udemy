import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
let totalChars = 0

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {totalChars});
});

app.post("/submit", (req, res) => {
  const fName = req.body["fName"];
  const lName = req.body["lName"];
  totalChars = fName.length + lName.length;
  console.log(totalChars);
  res.render("index.ejs", {totalChars, fName, lName});
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
