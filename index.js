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
var order = 'date';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function retrieve(revId) {
    try {
        const result = await db.query("SELECT * FROM book JOIN review ON book.id = review.id WHERE book.id = ($1)", [revId]);
        return result.rows;
    } catch (error) {
        res.status(500).json({ message: "Error updating post" });
    }
}

app.get("/", async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM book JOIN review ON book.id = review.id ORDER BY ${order} DESC`);
        res.render("index.ejs", {
            data: result.rows
        });
    } catch(err) {
        console.log(err)
    }
});

app.post("/sort", (req, res) => {
    order = req.body.order;
    res.redirect("/");
});

app.get("/search", (req, res) => {
    res.render("search.ejs");
});

app.get("/review", async (req, res) => {
    var titleQ = req.query.title;
    var authorQ = req.query.author;
    var coverIdQ = req.query.coverId;
    console.log(titleQ, authorQ, coverIdQ);

    try {
        const check = await db.query(`SELECT id FROM book WHERE title LIKE '%${titleQ}'`);
        if (check.rows[0]) {
            var bk = check.rows[0].id;
            const result = await retrieve(bk);
            res.render("review.ejs", {
                update: result,
                max: present
            });
        } else {
            res.render("review.ejs", {
                title: titleQ,
                author: authorQ,
                coverId: coverIdQ,
                max: present,
            });
        }
    } catch(err) {
        console.log(err)
    }
});

app.post("/save", async (req, res) => {
    const data = req.body;
    console.log(data)
    if (!data.date) data.date = present;
    try {
        await db.query("BEGIN");
        await db.query("INSERT INTO book (title, author, coverId) VALUES ($1, $2, $3)", [data.title, data.author, data.coverId]);
        var result = await db.query("SELECT id FROM book WHERE title = $1", [data.title]);
        var id = result.rows[0].id;
        await db.query("INSERT INTO review (id, date, rating, review) VALUES ($1, $2, $3, $4)", [id, data.date, data.rating, data.review]);
        db.query("COMMIT");

        res.redirect("/");
    } catch (err) {
        await db.query("ROLLBACK");
        console.log(err);
    }
});

app.get("/edit/:id", async (req, res) => {
    var postId = req.params.id
    const result = await retrieve(postId);
    res.render("review.ejs", {
        update: result,
        max: present
    });
});

app.post("/update", async (req, res) => {
    var edit = req.body;
    if (!edit.date) edit.date = present;
    console.log(edit)
    try {
        await db.query("UPDATE review SET date = $1, rating = $2, review = $3 WHERE id = $4", [edit.date, edit.rating, edit.review, edit.id]);
        res.redirect("/")
    } catch (err) {
        console.log(err)
    }
});

app.get("/delete/:id", async (req, res) => {
    var deli = req.params.id;
    console.log("this is a test" + deli)
    try {
        await db.query("BEGIN");
        await db.query("DELETE FROM review WHERE id = $1", [deli]);
        await db.query("DELETE FROM book WHERE id = $1", [deli]);
        db.query("COMMIT");
        res.redirect("/")
    } catch (err) {
        await db.query("ROLLBACK");
        console.log(err);
    }
    
});

app.get("/sources", (req, res) => {
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});