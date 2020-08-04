import express, { Request, Response } from "express";
const port:number = 3000;
const hostname:string = "localhost";

const app = express();

app.use(express.json());
app.use(express.static("public_html"));

app.get("/api", function (req:Request, res:Response) {
    console.log("Request All");
    res.sendStatus(200);
});

app.get("/api/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Request " + recipe);
    res.sendStatus(200);
});

app.put("/api/:recipe", function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Update " + recipe);
    res.sendStatus(200);
});

app.delete("/api/:recipe" , function (req:Request, res:Response) {
    let recipe:string = req.params["recipe"];
    console.log("Delete " + recipe);
    res.sendStatus(200);
});

app.post("/api", function (req:Request, res: Response) {
    console.log("Create Recipe");
    res.sendStatus(200);
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
