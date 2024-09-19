import bodyParser from "body-parser";
import express from "express";
import dotenv from 'dotenv';
import pg from "pg";

// need dotenv to use env file so personal db info can be hidden
dotenv.config();
const daba = process.env.database;
const pt = process.env.port;
const pw = process.env.password;

const app = express();
const port = 3000;

// connect to pgadmin db
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: daba,
    password: pw,
    port: pt,
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

// create function to find book in tables if it already exists
async function retrieve(revId) {
    try {
        const result = await db.query("SELECT * FROM book JOIN review ON book.id = review.id WHERE book.id = ($1)", [revId]);
        return result.rows; 
    } catch (error) {
        res.status(500).json({ message: "Error updating post" });
    }
}

// get info from tables to display
app.get("/", async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM book JOIN review ON book.id = review.id ORDER BY ${order} DESC`);
        res.render("index.ejs", {
            data: result.rows,
            sort: order
        });
        order = "date";
    } catch(err) {
        console.log(err)
    }
});

// take in order passed in from sort dropdown
app.post("/sort", (req, res) => {
    order = req.body.order;
    res.redirect("/");
});

// get info passed in from book link
// get the id from table if exists, if yes, pass id to retrieve function to pass in info from db
// if book doesn't exist, pass info from book link to review page
app.get("/review", async (req, res) => {
    var titleQ = req.query.title;
    var authorQ = req.query.author;
    var coverIdQ = req.query.coverId;
    console.log(titleQ, authorQ, coverIdQ);

    try {
        const check = await db.query("SELECT id FROM book WHERE title LIKE $1", [`'%${titleQ}%'`]);
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
                max: present
            });
        }
    } catch(err) {
        console.log(err)
    }
});

// get info from review page that was passed in
// pass in present variable in case date is left empty
// commense begin transaction so that both db tables can have info inserted at the same time, one can't happen without the other
// after inserting into book table, get id from that new entry, pass in that id when inserting info into review page
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

// get id from params, retrieve info post, pass in data to review page to edit
app.get("/edit/:id", async (req, res) => {
    var postId = req.params.id;
    const result = await retrieve(postId);
    res.render("review.ejs", {
        update: result,
        max: present
    });
});

// retrieve updated info from edit/review page
// pass in present variable in case date is left empty
// update sql table
app.post("/update", async (req, res) => {
    var edit = req.body;
    if (!edit.date) edit.date = present;
    console.log(edit);
    try {
        await db.query("UPDATE review SET date = $1, rating = $2, review = $3 WHERE id = $4", [edit.date, edit.rating, edit.review, edit.id]);
        res.redirect("/");
    } catch (err) {
        console.log(err)
    }
});

// get review id from params
// start another begin transaction so that the review info is deleted from both tables and not just one
app.get("/delete/:id", async (req, res) => {
    var deli = req.params.id;
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});