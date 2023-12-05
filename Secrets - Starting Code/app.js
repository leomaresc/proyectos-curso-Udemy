import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
 
const app = express();
const port = 3000
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "123456",
    port: "5432"
});

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.render("home.ejs")
});

app.get("/login", async (req, res) => {
    res.render("login.ejs")
});

app.post("/login", async (req, res) => {
    
});

app.get("/register", async (req, res) => {
    res.render("register.ejs")
});

app.post("/register", async (req, res) => {
    const newUser = req.body.username;
    const newPassword = req.body.password
    try{
        db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [newUser, newPassword]);
        console.log("cuenta creada con exito");
        res.redirect("/");
    } catch(err) {
        console.error(err)
        res.redirect("/register");
    }
});

app.get("/secrets", async (req, res) => {
    res.render("secrets.ejs")
});

app.get("/submit", async (req, res) => {
    
});
 
app.listen(port, function() {
    console.log(`Server started on port ${port}.`);
});