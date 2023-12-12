import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from 'passport';
import LocalStrategy from 'passport-local'
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
// Conexión con la base datos.

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger('dev'))

app.use(session({
  secret: "987f4bd6d4315c20b2ec70a46ae846d19d0ce563450c02c5b1bc71d5d580060b",
  saveUninitialized: false,
  resave: false,
}));
// Se especifíca como se van a crear nuevas sesiones en la aplicación.
// la propiedad 'secret' debería generarse de manera aleatoria. En este caso hay un valor fijo.

app.use(passport.initialize())
// Esto hace que se inicio passport en cada llamada de ruta.

app.use(passport.session())
// Permite que passport use express-session

var authUser = async (user, password, done) => {
    const checkLogin = await db.query(
        "SELECT id, email, password FROM users WHERE email = $1", 
        [user]);
        if(checkLogin.rows[0] === undefined){
            console.log("Usuario no existe.");
            return done (null, false)
        } else{
            const userId = checkLogin.rows[0].id;
            const userEmail = checkLogin.rows[0].email;
            const userPassword = checkLogin.rows[0].password;
            bcrypt.compare(password, userPassword, function(err, result) {
                if(result === false){
                    console.log("Contraseña incorrecta.")
                    return done (null, false)
                } else {
                    let authenticated_user = { id: userId, name: userEmail }
                    console.log("Contraseña correcta");
                    return done (null, authenticated_user);
                }
                if(err){
                    console.log(err);
                }
            })
    }
}
// Toda la función encagargada de autenticar a los usuarios cuando intenten iniciar sesión.

passport.use(new LocalStrategy (authUser))
// authUser es una función que se definirá después y contendrá los pasos para autenticar el usuario y devolverá el usuario autenticado.

passport.serializeUser( (userObj, done) => {
    done(null, userObj)
})
// Serialización de usuario.

passport.deserializeUser((userObj, done) => {
    done (null, userObj )
})
// Deserialización de usario.

var checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/login")
  }
// Función para autenticar.


const saltRounds = parseInt(process.env.SALT_ROUNDS);
const host = process.env.HOST;
const allowedReferers = [host+"login", host+"secrets", host+"submit"]

app.get("/", async (req, res) => {
    if(!req.session.passport){
        res.render("home.ejs")
        console.log("Bienvenido. No hay sesión iniciada.")
    }
    else{
        res.redirect("/secrets")
    }
});

app.get("/login", async (req, res) => {
    if(!req.session.passport){
        res.render("login.ejs")
    } else {
        res.redirect("/secrets")
    }
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/secrets",
    failureRedirect: "/login",
}));

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

app.get("/secrets", checkAuthenticated, async (req, res) => {
    const currentUserId = JSON.stringify(req.user.id)
    let secrets = []
    secrets = await db.query("SELECT secret FROM secrets WHERE user_id = $1", [parseInt(currentUserId)])
    console.log(secrets)
    res.render("secrets.ejs", {secrets : secrets.rows})

});

app.get("/submit", async (req, res) => {
    if(!allowedReferers.includes(req.header('Referrer'))){
        res.redirect("/secrets")
    } else {
        res.render("submit.ejs")
    }
});

app.post("/submit", async (req, res) =>{
    const currentUserId = JSON.stringify(req.user.id)
    const newSecret = req.body.secret;
    await db.query("INSERT INTO secrets (secret, user_id) VALUES ($1, $2)", [newSecret, currentUserId]);
    res.redirect("/secrets");
});
 
app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});