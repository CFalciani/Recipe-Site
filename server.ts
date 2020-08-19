import express, { Request, Response } from "express";
import { brotliDecompressSync } from "zlib";
import { compileFunction } from "vm";
const pg = require("pg");
const connection = require("./env.json");
const port:number = 3000;
const hostname:string = "localhost";
const app = express();

app.use(express.json());
app.set('view engine', 'pug')
app.use(express.static("public_html"));

const Pool = pg.Pool;
const pool = new Pool(connection);
pool.connect().then(function () {
    console.log("Connected to recipes db!");
});

app.get("/api", function (req:Request, res:Response) {
    pool.query("SELECT json_build_object('titles', json_agg(list.title), 'categories', json_agg(list.category)) FROM LIST").then(function (response) {
        res.status(200);
        res.header("Content-Type", "application/json")
        res.json(response["rows"][0]["json_build_object"]);
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
    let queryString = "UPDATE list SET ";
    for (let i = 0; i < body.column.length; i++) {
        if (i != 0) {
            queryString += ',';
        }
        queryString += `${body.column[i]} = '${body.new[i]}'`;
    }
    queryString += ` WHERE title = '${recipe}'`;
    pool.query(queryString).then(function (data) {
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

//app.post("/file", upload.single)

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

app.get("/recipe/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    pool.query("SELECT * FROM list WHERE title = $1", [recipe]).then(function (response) {
        if (response.rowCount == 1) {
            res.status(200);
            res.render('recipes', response.rows[0]);
        } else {
            res.sendStatus(404);
        }
    })
})

app.get("/edit/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Edit " + recipe);
    pool.query("SELECT * FROM list WHERE title = $1", [recipe]).then(function (data) {
        if (data.rowCount == 0) {
            res.sendStatus(404);
            return;
        }
        res.status(200)
        res.render("edit", data.rows[0]);
    })
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
