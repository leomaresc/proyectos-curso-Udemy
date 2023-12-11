import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from 'passport';
import session from 'express-session';
import logger from 'morgan';
 
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
app.use(logger('dev'))
app.use(session({
  secret: "987f4bd6d4315c20b2ec70a46ae846d19d0ce563450c02c5b1bc71d5d580060b",
  saveUninitialized: false,
  resave: false,
}));

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const host = process.env.HOST;
const allowedReferers = [host+"login", host+"secrets", host+"submit"]

app.get("/", async (req, res) => {
    if(!req.session.username){
        res.render("home.ejs")
        console.log("Bienvenido. No hay sesión iniciada.")
    }
    else{
        res.redirect("/secrets")
    }
});

app.get("/login", async (req, res) => {
    if(!req.session.username){
        res.render("login.ejs")
    } else{
        res.redirect("/secrets")
    }
    
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try{
        const checkLogin = await db.query("SELECT id, email, password FROM users WHERE email = $1", [username]);
        if(checkLogin.rows[0] === undefined){
            console.log("El usuario no existe");
            res.redirect("/login");
        } else{
            bcrypt.compare(password, checkLogin.rows[0].password, function(err, result) {
                if(result === false){
                    console.log("Contraseña incorrecta.")
                    res.redirect("/login")
                } else {
                    console.log("Contraseña correcta");
                    req.session.username = req.body.username;
                    req.session.user_id = checkLogin.rows[0].id;
                    res.redirect("/secrets");
                }
                if(err){
                    console.log(err);
                }
            });
        }
    } catch (err){
        console.error(err);
        res.redirect("/login")
    }

});

app.get("/logout", async (req, res) => {
    req.session.destroy();
    console.log("Adios!");
    res.redirect("/");
});

app.get("/register", async (req, res) => {
    res.render("register.ejs")
});

app.post("/register", async (req, res) => {
    const newUser = req.body.username;
    const newPassword = req.body.password
    try{
        const lookCoincidence = await db.query("SELECT email FROM users WHERE email = $1", [newUser]);
        if(lookCoincidence.rowCount === 0){
            bcrypt.hash(newPassword, saltRounds, function(err, hash) {
                db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [newUser, hash]);
            });
            console.log("Cuenta creada con exito");
            res.redirect("/");
        } else if(JSON.stringify(lookCoincidence.rows[0].email) === JSON.stringify(newUser)){
            console.log("Ese usuario ya existe.");
            res.redirect("/register");
        }
    } catch(err) {
        console.error(err);
    }

});

app.get("/secrets", async (req, res) => {
    if(!req.session.username){
        console.log("No hay usuario logueado.")
        res.redirect("/login")
    } else {
    let secrets = []
    secrets = await db.query("SELECT secret FROM secrets WHERE user_id = $1", [req.session.user_id])
    if(!req.session.username){
        console.log(req.get('Referrer'))
        res.redirect("/login");
    } else{
        console.log("Bienvenido " + req.session.username)
        res.render("secrets.ejs", {secrets : secrets.rows})
    }
}
});

app.get("/submit", async (req, res) => {
    if(!allowedReferers.includes(req.header('Referrer'))){
        res.redirect("/secrets")
    } else {
        res.render("submit.ejs")
    }
});

app.post("/submit", async (req, res) =>{
    const newSecret = req.body.secret;
    await db.query("INSERT INTO secrets (secret, user_id) VALUES ($1, $2)", [newSecret, currentUser]);
    res.redirect("/secrets");
});
 
app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});