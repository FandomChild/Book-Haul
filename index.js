import axios from "axios";
import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;
var current = new Date();
var year = current.getFullYear();
var month = ('0' + (current.getMonth() + 1)).slice(-2);
var day = ('0' + current.getDate()).slice(-2);
var present = year+'-'+month+'-'+day;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/search", (req, res) => {
    res.render("search.ejs");
});

app.get("/review", (req, res) => {
    var titleQ = req.query.title;
    var authorQ = req.query.author;
    var coverIdQ = req.query.coverId;
    console.log(titleQ, authorQ, coverIdQ);
    res.render("review.ejs", {
        title: titleQ,
        author: authorQ,
        coverId: coverIdQ,
        max: present,
    });
});

app.post("/save", (req, res) => {
    const data = req.body;
    console.log(data.author)
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});  