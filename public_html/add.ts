let ingredients:HTMLElement|null = document.getElementById("ingredients");
let addButton:HTMLElement|null = document.getElementById("add_ingredient");
let submitButton:HTMLElement|null = document.getElementById("submit");
let titleInput:HTMLInputElement|null = <HTMLInputElement|null>document.getElementById("title");
let descriptionInput:HTMLInputElement|null = <HTMLInputElement|null>document.getElementById("directions");
let errorBox:HTMLElement|null = document.getElementById("error-message");

class Ingredient {
    name: string;
    whole: number|null = null;
    num: number|null = null;
    den: number|null = null;
    unit: string|null = null;
    constructor(name: string, 
                whole: string, 
                num: string,
                den: string,
                unit: string,) {
        this.name = name;
        if (whole)
            this.whole = parseInt(whole);
        if (num)
            this.num = parseInt(num);
        if (den)
            this.den = parseInt(den);
        
        if (unit != "No Units") {
            this.unit = unit;
        }
    }
    validate() {
        if (! this.name) 
            return false;
        if (this.whole != null && isNaN(this.whole))
            return false;
        if (this.num != null && isNaN(this.num))
            return false;
        if (this.den != null && isNaN(this.den))
            return false;
        
        return true;
    }
    jsonify() {
        return {
            name: this.name,
            whole: this.whole,
            num: this.num,
            den: this.den,
            unit: this.unit
        }
    }
}

class Recipe {
    title: string;
    ingredients:Array<Ingredient>;
    directions: string;
    json: object;
    constructor (title: string, ingredients: Array<Ingredient>, directions:string) {
        this.title = title;
        this.ingredients = ingredients;
        this.directions = directions;
        let jsonIngredients:Array<object> = [];
        for (let ingredient of ingredients) {
            jsonIngredients.push(ingredient.jsonify());
        }
        this.json = {
            title: this.title,
            ingredients: jsonIngredients,
            directions: this.directions
        };
    }
    validate () {
        if (this.title === "") 
            return "Invalid title: title must contain text!";
        for (let item of this.ingredients) {
            if (! item.validate()) {
                return `Invalid ingredient: ingredient ${item.name} is invalid!
                        ingredients must have a name, and the three proceeding boxes must be numbers or empty!`
            }
        }
        return true;
    }
}

function submit () {
    errorBox.textContent = ""; // clear error box

    let row: any;
    let list: Array<Ingredient> = [];
    let rows:any = ingredients.getElementsByTagName("tr"); // Type any bc/we cannot iterate over HTMLCollection

    for (row of rows) {
        let inputs: HTMLCollection = row.getElementsByTagName("input");
        let name:string = (<HTMLInputElement>inputs[0]).value;
        let whole: string = (<HTMLInputElement>inputs[1]).value;
        let num:string = (<HTMLInputElement>inputs[2]).value;
        let den:string = (<HTMLInputElement>inputs[3]).value;
        let unit:string = row.getElementsByTagName("select")[0].value;
        let data = new Ingredient(name, whole, num, den, unit)
        list.push(data);
    }
    let recipe = new Recipe(titleInput.value, list, descriptionInput.value);
    let valid:boolean|string = recipe.validate();
    if (valid != true) {
        errorBox.textContent = valid; 
    } else {
        console.log(recipe.json);
        console.log(recipe);
    }

}

function removeIngredient (e: any) {
    e.target.parentElement.remove();
}

function createSelect() {
    let select:HTMLSelectElement = document.createElement("select");
    let none:HTMLOptionElement = document.createElement("option");
    let cups:HTMLOptionElement = document.createElement("option");
    let teaspoons:HTMLOptionElement = document.createElement("option");
    let tablespoons:HTMLOptionElement= document.createElement("option");

    select.name = "unit";
    select.style.margin = "10px"

    none.value="none";
    none.textContent = "No Units";
    select.append(none);

    cups.value="cups";
    cups.textContent = "Cups";
    select.append(cups);

    teaspoons.value="teaspoons";
    teaspoons.textContent = "Teaspoons";
    select.append(teaspoons);

    tablespoons.value="tablespoons";
    tablespoons.textContent = "Tablespoons";
    select.append(tablespoons);
    
    return select;
}

function addRow() {

    let row:HTMLTableRowElement = document.createElement("tr");

    let name:HTMLInputElement = document.createElement("input");
    let whole:HTMLInputElement = document.createElement("input");
    let num:HTMLInputElement = document.createElement("input");
    let den:HTMLInputElement = document.createElement("input");
    let divider:HTMLTableDataCellElement = document.createElement("td");
    let remove:HTMLElement = document.createElement("strong");


    name.type = "text";
    name.classList.add("name");
    name.placeholder="Ingredient";
    name.name = "name";

    whole.type = "text";
    whole.classList.add("whole");
    whole.name = "whole";

    num.type = "text";
    num.classList.add("fraction");
    num.name = "num";


    den.type = "text";
    den.classList.add("fraction");
    den.name =  "den";

    divider.textContent = "/";

    remove.textContent = "X";
    remove.style.color = "grey";
    remove.style.cursor = "pointer";
    remove.addEventListener("click", removeIngredient);

    row.append(name);
    row.append(whole);
    row.append(num);
    row.append(divider);
    row.append(den);
    row.append(createSelect());
    row.append(remove);
    ingredients.append(row);
}

if (submitButton != null &&
    titleInput != null &&
    descriptionInput != null &&
    ingredients != null &&
    errorBox != null) {

    submitButton.addEventListener("click", submit);
}

if (addButton != null && ingredients != null) {
    addButton.addEventListener("click", addRow);
} else {
    console.log("Error: Elements not found")
}