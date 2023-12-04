import express from "express";
import bodyParser from "body-parser";
 
const app = express();
const port = 3000


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.render("home.ejs")
});

app.get("/login", async (req, res) => {

});

app.get("/register", async (req, res) => {

});

app.get("/secrets", async (req, res) => {

});

app.get("/submit", async (req, res) => {
    
});
 
app.listen(port, function() {
    console.log(`Server started on port ${port}.`);
});