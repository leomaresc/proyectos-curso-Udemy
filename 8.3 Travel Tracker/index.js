import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "123456",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var errorMessage = "";

app.get("/", async (req, res) => {
  let countries = [];
  const result = await db.query("SELECT country_code FROM visited_countries");
  result.rows.forEach(element => {
    countries.push(element.country_code)
  })
  console.log(countries);
  res.render("index.ejs", { countries : countries, total: countries.length, error: errorMessage } )
})

app.post("/add", async (req, res) =>{
  const newCountry = req.body.country;
  let comparisonCheck;
  const result = await db.query("SELECT country_code, country_name FROM countries WHERE country_name = $1", [newCountry]);
  const comparison = await db.query('SELECT country_code FROM visited_countries');
  let comparison2 = [];
  comparison.rows.forEach(element => {
    comparison2.push(element.country_code);
  })

  if(result.rows[0]){
    comparison.rows.forEach(element => {
      if(element.country_code === result.rows[0].country_code){
        comparisonCheck = true;
      } else{
        comparisonCheck = false;
      }
    })
  }

  if(result.rowCount != 0){
    if(comparisonCheck == true){
      errorMessage = "Country already submitted";
    } else{
      db.query('INSERT INTO visited_countries (country_code) VALUES ($1)', [result.rows[0].country_code]);
    }
  }
  else{
    errorMessage = "Country not found";
  }

  res.redirect("/")
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});