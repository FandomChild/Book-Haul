import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "library",
    password: "Anaklusmos#13",
    port: 5432,
});
db.connect();

var current = new Date();
var year = current.getFullYear();
var month = ('0' + (current.getMonth() + 1)).slice(-2);
var day = ('0' + current.getDate()).slice(-2);
var present = year+'-'+month+'-'+day;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    // try {
    //     const result = await db.query("SELECT * FROM book JOIN review ON book.id = review.id");
    //     console.log(result.rows);
    //     res.render("index.ejs");
    // } catch(err) {
    //     console.log(err)
    // }
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

app.post("/save", async (req, res) => {
    const data = req.body;
    console.log(data)
    
    try {
        db.query("BEGIN");
        await db.query("INSERT INTO book (title, author, coverId) VALUES ($1, $2, $3)", [data.title, data.author, data.coverId]);
        var result = await db.query("SELECT id FROM book WHERE title = $1", [data.title]);
        var id = result.rows[0].id;
        await db.query("INSERT INTO review (id, date, rating, review) VALUES ($1, $2, $3, $4)", [id, data.date, data.rating, data.review]);
        db.query("COMMIT");

        res.redirect("/");
    } catch (err) {
        console.log(err);
        db.query("ROLLBACK");
    }
});

app.get("/sources", (req, res) => {
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});  