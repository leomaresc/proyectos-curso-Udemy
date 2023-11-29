import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
let password = "";

function checkPassword(req, res, next){
    console.log(req.body)
    password = req.body["password"];
    next();
};

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(checkPassword);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/check", (req, res) => {
    if(password === "ILoveProgramming"){
        res.sendFile(__dirname + "/public/secret.html");
        password = "";
    }
    else{
        console.log("Tu ere' loco e'");
        password = "";
    }
});

app.listen(port, () => {
    console.log(`Servidor abierto en puerto ${port}`);
})