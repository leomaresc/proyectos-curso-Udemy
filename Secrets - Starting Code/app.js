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

var currentUser;
const host = "http://localhost:3000/";
const allowedReferers = [host+"login", host+"secrets", host+"submit"]

app.get("/", async (req, res) => {
    res.render("home.ejs")
});

app.get("/login", async (req, res) => {
    res.render("login.ejs")
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try{
        const checkLogin = await db.query("SELECT id, email, password FROM users WHERE email = $1", [username]);
        if(checkLogin.rowCount === 0){
            console.log("Usuario no existe.")
            res.redirect("/login")
        } else if(JSON.stringify(checkLogin.rows[0].password) != JSON.stringify(password)){
            console.log("Contraseña incorrecta." + "    " + JSON.stringify(checkLogin.rows[0].password) + "   " + JSON.stringify(password))
            res.redirect("/login")
        } else{
            currentUser = checkLogin.rows[0].id;
            console.log("Contraseña correcta")
            res.redirect("/secrets");
        }
    } catch (err){
        console.error(err);
    }

});

app.get("/logout", async (req, res) => {
    currentUser = -1;
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
            db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [newUser, newPassword]);
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
    let secrets = []
    secrets = await db.query("SELECT secret FROM secrets WHERE user_id = $1", [currentUser])
    if(!allowedReferers.includes(req.header('Referrer'))){
        console.log(req.get('Referrer'))
        res.redirect("/login");
    } else{
        res.render("secrets.ejs", {secrets : secrets.rows})
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