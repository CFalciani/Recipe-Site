import express, { Request, Response } from "express";
import { brotliDecompressSync } from "zlib";
import { compileFunction } from "vm";
const pg = require("pg");
const connection = require("./env.json");
const port:number = 3000;
const hostname:string = "localhost";

const app = express();

app.use(express.json());
app.use(express.static("public_html"));

const Pool = pg.Pool;
const pool = new Pool(connection);
pool.connect().then(function () {
    console.log("Connected to recipes db!");
});

app.get("/api", function (req:Request, res:Response) {
    pool.query("SELECT (title, ingredients, directions) FROM LIST").then(function (response) {
        res.status(200);
        res.header("Content-Type", "application/json")
        res.json({rows: response.rows});
    }).catch(function (err) {
        res.sendStatus(500);
        console.log(err);
    });
    console.log("Request All");
});

app.get("/api/category/:cat", function (req:Request, res:Response) {
    let category:string = req.params["cat"];
    console.log("Request all in category " + category);
    pool.query("SELECT (title, ingredients, directions, category) FROM list WHERE category = $1", [category]).then(function (data) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        } else {
            res.status(200);
            res.header("Content-Type", "application/json");
            res.json(data.rows);
        }
    })
});

app.get("/api/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Request " + recipe);
    pool.query("SELECT (title, ingredients, directions, category) FROM list WHERE title = $1", [recipe]).then(function (data) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        } else {
            res.status(200);
            res.header("Content-Type", "application/json");
            res.json(data.rows[0]);
        }
    })
});

app.put("/api/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    let body = req.body;
    console.log(body.column, body.new);
    if (! body.hasOwnProperty("column") ||
        ! body.hasOwnProperty("new")) {
            res.sendStatus(400);
            return ;
    }
    pool.query(`UPDATE list SET ${body.column} = '${body.new}' WHERE title = '${recipe}'`).then(function (data) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        } else {
            res.sendStatus(200);
        }
    })
    console.log("Update " + recipe);
});

app.delete("/api/:recipe" , function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Delete " + recipe);
    pool.query("DELETE FROM list WHERE title = $1", [recipe]).then(function (response) {
        if (response.rowCount >= 1) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    })
});

app.post("/api", function (req:Request, res: Response) {
    let body = req.body;
    if (! body.hasOwnProperty("title") ||
        ! body.hasOwnProperty("ingredients") ||
        ! body.hasOwnProperty("directions") ||
        ! body.hasOwnProperty("category")) {
            res.sendStatus(400);
            return;
    }
    pool.query("SELECT title FROM list WHERE title = $1", [body.title]).then(function (data) {
        if (data.rowCount > 0) {
            res.sendStatus(409);
            return;
        } else {
            pool.query("INSERT INTO list(title, ingredients, directions, category) VALUES($1, $2, $3, $4);", [body.title, body.ingredients, body.directions, body.category]);
            console.log("Create Recipe " + body.title);
            res.sendStatus(200);
        }
    });

});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
