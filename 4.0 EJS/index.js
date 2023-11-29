import express from "express";
import dayMessage from "./dailymessage.js";

const app = express();
const port = 3000;

const now = new Date();
let today = now.getDay();
let message = dayMessage(today);

app.set('view engine', 'ejs')

app.get("/", (req, res) => {
    res.render("index", { message })
});

app.listen(port, () => {
    console.log(`Servidor abierto en puerto ${port}`);
})