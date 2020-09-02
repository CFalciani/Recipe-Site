import express, { Request, Response } from "express";
import { brotliDecompressSync } from "zlib";
import { compileFunction } from "vm";
import pg, {QueryResult} from "pg";
import fileUpload from "express-fileupload";
const connection = require("./env.json");
const port:number = 3000;
const hostname:string = "0.0.0.0";
const app = express();

interface LooseObject {
    [key: string]: any
}

app.use(express.json());
app.set('view engine', 'pug')
app.use(express.static("public_html"));
app.use(fileUpload());

const Pool = pg.Pool;
const pool = new Pool(connection);
pool.connect().then(function () {
    console.log("Connected to recipes db!");
});

// Get all recipe names and categories
app.get("/api", function (req:Request, res:Response) {
    pool.query("SELECT json_build_object('titles', json_agg(list.title), 'categories', json_agg(list.category)) FROM LIST").then(function (response:QueryResult) {
        res.status(200);
        res.header("Content-Type", "application/json")
        res.json(response["rows"][0]["json_build_object"]);
    }).catch(function (err) {
        res.sendStatus(500);
        console.log(err);
    });
    console.log("Request All");
});

// Get all recipes with the specified category
app.get("/api/category/:cat", function (req:Request, res:Response) {
    let category:string = req.params["cat"];
    console.log("Request all in category " + category);
    pool.query("SELECT (title, ingredients, directions, category) FROM list WHERE category = $1", [category]).then(function (data:QueryResult) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        } else {
            res.status(200);
            res.header("Content-Type", "application/json");
            res.json(data.rows);
        }
    })
});

// Get recipe with the specified name
app.get("/api/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Request " + recipe);
    pool.query("SELECT (title, ingredients, directions, category) FROM list WHERE title = $1", [recipe]).then(function (data:QueryResult) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        } else {
            res.status(200);
            res.header("Content-Type", "application/json");
            res.json(data.rows[0]);
        }
    })
});

// Update recipe with specified name 
app.put("/api/:recipe", function (req:Request, res:Response) {
    // Should contain a body with a "column" an "new" attribute
    // Optionally can contain a "files.image" attribute
    // column should hold a list of strings which are the db columns to change
    // new is a list of the new values for respective columns
    let recipe:string = req.params["recipe"];
    console.log(req.body)
    let body = JSON.parse(req.body.recipe);
    console.log(body.column, body.new);
    if (! body.hasOwnProperty("column") ||
        ! body.hasOwnProperty("new")) {
            res.sendStatus(400);
            return ;
    }
    let title = recipe; // Default title is the current title
    let queryString = "UPDATE list SET ";
    // Construct query string
    for (let i = 0; i < body.column.length; i++) {
        if (body.column[i] === "title") {
            title = body.new[i]; // If title is changed, update it
        }
        if (i != 0) {
            queryString += ',';
        }
        queryString += `${body.column[i]} = $${i + 1}`
    }
    queryString += ` WHERE title = '${recipe}'`;
    pool.query(queryString, body.new).then(function (data:QueryResult) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        } else {
            res.sendStatus(200);
        }
    });
    // Save image if there is one
    let file:LooseObject = req.files
    if (file) {
        file.image.mv("./public_html/pictures/recipes/" + title + ".jpg");
    }
    console.log("Update " + recipe + ": " + queryString);
});

// Delete recipe with the specified name
app.delete("/api/:recipe" , function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Delete " + recipe);
    pool.query("DELETE FROM list WHERE title = $1", [recipe]).then(function (response:QueryResult) {
        if (response.rowCount >= 1) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    })
});

// Add a recipe
app.post("/api", function (req:Request, res: Response) {
    // Should contain attributes:
    // title, ingredients, directions, category, and an optional image
    let body = JSON.parse(req.body.recipe);
    if (! body.hasOwnProperty("title") ||
        ! body.hasOwnProperty("ingredients") ||
        ! body.hasOwnProperty("directions") ||
        ! body.hasOwnProperty("category")) {
            res.sendStatus(400);
            return;
    }
    let title:string = body.title;
    // Check if the recipe name already exists
    pool.query("SELECT title FROM list WHERE title = $1", [body.title]).then(function (data:QueryResult) {
        if (data.rowCount > 0) {
            // If so, we cannot insert as the title is the primary key
            res.sendStatus(409);
            return;
        } else {
            pool.query("INSERT INTO list(title, ingredients, directions, category) VALUES($1, $2, $3, $4);", [body.title, body.ingredients, body.directions, body.category]);
            console.log("Create Recipe " + body.title);
            // Save image file if it exists
            let file:LooseObject = req.files
            if (file) {
                file.image.mv("./public_html/pictures/recipes/" + title + ".jpg");
            }            
            res.sendStatus(200);
        }
    });

});

// Get the html page for the recipe
app.get("/recipe/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    pool.query("SELECT * FROM list WHERE title = $1", [recipe]).then(function (response:QueryResult) {
        if (response.rowCount == 1) {
            res.status(200);
            res.render('recipes', response.rows[0]);
        } else {
            res.sendStatus(404);
        }
    })
})

// Get the edit paged for the specified recipe
app.get("/edit/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Edit " + recipe);
    pool.query("SELECT * FROM list WHERE title = $1", [recipe]).then(function (data:QueryResult) {
        if (data.rowCount == 0) {
            res.sendStatus(404);
            return;
        }
        res.status(200)
        res.render("edit", data.rows[0]);
    })
});

// Get an array of all ingredients in the conversion db
app.get("/ingredients", function (req:Request, res:Response) {
    console.log("Request for ingredients list");
    pool.query("SELECT ingredient FROM conversion").then(function (response:QueryResult) {
        res.status(200);
        res.header("Content-Type", "application/json")
        res.json({ingredients: response.rows})
    })
})

// Get an array of all conversions in the db
app.get("/conversions", function (req:Request, res:Response) {
    console.log("Request for conversions list");
    pool.query("SELECT * FROM conversion").then(function (response:QueryResult) {
        res.status(200);
        res.header("Content-Type", "application/json")
        let conversions:LooseObject = {}
        for (let row of response.rows) {
            let ingredient:string = row["ingredient"];
            let gpc:number = row["gpc"];
            conversions[ingredient] = gpc
        }
        res.json(conversions)
    })
})

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
