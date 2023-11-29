import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "AndreaLeo*21",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  let countries = [];
  let totalCountries = 0;
  const result = await db.query("SELECT country_code FROM visited_countries")
  result.rows.forEach(element => {
    countries.push(element.country_code)
  })
  console.log(countries)
  res.render("index.ejs", { countries : countries, total: countries.length } )
})

app.post("/add", async (req, res) =>{
  const newCoutry = req.body.country;
  db.query(`INSERT INTO visited_countries VALUES (country_code)`)
  res.redirect("/")
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});