"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var multer_1 = __importDefault(require("multer"));
var pg_1 = __importDefault(require("pg"));
var connection = require("./env.json");
var port = 3000;
var hostname = "0.0.0.0";
var app = express_1["default"]();
var upload = multer_1["default"]({ dest: 'public_html/pictures/recipe/' });
app.use(express_1["default"].json());
app.set('view engine', 'pug');
app.use(express_1["default"].static("public_html"));
var Pool = pg_1["default"].Pool;
var pool = new Pool(connection);
pool.connect().then(function () {
    console.log("Connected to recipes db!");
});
app.get("/api", function (req, res) {
    pool.query("SELECT json_build_object('titles', json_agg(list.title), 'categories', json_agg(list.category)) FROM LIST").then(function (response) {
        res.status(200);
        res.header("Content-Type", "application/json");
        res.json(response["rows"][0]["json_build_object"]);
    })["catch"](function (err) {
        res.sendStatus(500);
        console.log(err);
    });
    console.log("Request All");
});
app.get("/api/category/:cat", function (req, res) {
    var category = req.params["cat"];
    console.log("Request all in category " + category);
    pool.query("SELECT (title, ingredients, directions, category) FROM list WHERE category = $1", [category]).then(function (data) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        }
        else {
            res.status(200);
            res.header("Content-Type", "application/json");
            res.json(data.rows);
        }
    });
});
app.get("/api/:recipe", function (req, res) {
    var recipe = req.params["recipe"];
    console.log("Request " + recipe);
    pool.query("SELECT (title, ingredients, directions, category) FROM list WHERE title = $1", [recipe]).then(function (data) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        }
        else {
            res.status(200);
            res.header("Content-Type", "application/json");
            res.json(data.rows[0]);
        }
    });
});
app.put("/api/:recipe", function (req, res) {
    var recipe = req.params["recipe"];
    var body = req.body;
    console.log(body.column, body["new"]);
    if (!body.hasOwnProperty("column") ||
        !body.hasOwnProperty("new")) {
        res.sendStatus(400);
        return;
    }
    var queryString = "UPDATE list SET ";
    for (var i = 0; i < body.column.length; i++) {
        if (i != 0) {
            queryString += ',';
        }
        queryString += body.column[i] + " = $" + (i + 1);
    }
    queryString += " WHERE title = '" + recipe + "'";
    pool.query(queryString, body["new"]).then(function (data) {
        if (data.rowCount < 1) {
            res.sendStatus(404);
        }
        else {
            res.sendStatus(200);
        }
    });
    console.log("Update " + recipe + ": " + queryString);
});
app["delete"]("/api/:recipe", function (req, res) {
    var recipe = req.params["recipe"];
    console.log("Delete " + recipe);
    pool.query("DELETE FROM list WHERE title = $1", [recipe]).then(function (response) {
        if (response.rowCount >= 1) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(404);
        }
    });
});
app.post("/api", function (req, res) {
    var body = req.body;
    if (!body.hasOwnProperty("title") ||
        !body.hasOwnProperty("ingredients") ||
        !body.hasOwnProperty("directions") ||
        !body.hasOwnProperty("category")) {
        res.sendStatus(400);
        return;
    }
    pool.query("SELECT title FROM list WHERE title = $1", [body.title]).then(function (data) {
        if (data.rowCount > 0) {
            res.sendStatus(409);
            return;
        }
        else {
            pool.query("INSERT INTO list(title, ingredients, directions, category) VALUES($1, $2, $3, $4);", [body.title, body.ingredients, body.directions, body.category]);
            console.log("Create Recipe " + body.title);
            res.sendStatus(200);
        }
    });
});
app.get("/recipe/:recipe", function (req, res) {
    var recipe = req.params["recipe"];
    pool.query("SELECT * FROM list WHERE title = $1", [recipe]).then(function (response) {
        if (response.rowCount == 1) {
            res.status(200);
            res.render('recipes', response.rows[0]);
        }
        else {
            res.sendStatus(404);
        }
    });
});
app.get("/edit/:recipe", function (req, res) {
    var recipe = req.params["recipe"];
    console.log("Edit " + recipe);
    pool.query("SELECT * FROM list WHERE title = $1", [recipe]).then(function (data) {
        if (data.rowCount == 0) {
            res.sendStatus(404);
            return;
        }
        res.status(200);
        res.render("edit", data.rows[0]);
    });
});
app.get("/ingredients", function (req, res) {
    console.log("Request for ingredients list");
    pool.query("SELECT ingredient FROM conversion").then(function (response) {
        res.status(200);
        res.header("Content-Type", "application/json");
        res.json({ ingredients: response.rows });
    });
});
app.get("/conversions", function (req, res) {
    console.log("Request for conversions list");
    pool.query("SELECT * FROM conversion").then(function (response) {
        res.status(200);
        res.header("Content-Type", "application/json");
        var conversions = {};
        for (var _i = 0, _a = response.rows; _i < _a.length; _i++) {
            var row = _a[_i];
            var ingredient = row["ingredient"];
            var gpc = row["gpc"];
            conversions[ingredient] = gpc;
        }
        res.json(conversions);
    });
});
app.listen(port, hostname, function () {
    console.log("Listening at: http://" + hostname + ":" + port);
});
