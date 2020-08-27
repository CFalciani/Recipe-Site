let ingredients:HTMLElement|null = document.getElementById("ingredients");
let addButton:HTMLElement|null = document.getElementById("add_ingredient");
let submitButton:HTMLElement|null = document.getElementById("submit");
let titleInput:HTMLInputElement|null = <HTMLInputElement|null>document.getElementById("title");
let directionsInput:HTMLInputElement|null = <HTMLInputElement|null>document.getElementById("directions");
let errorBox:HTMLElement|null = document.getElementById("error-message");
let categoryInput:HTMLSelectElement|null = <HTMLSelectElement|null>document.getElementById("category");
let possible:Array<string> = [];
interface Window {
    oldTitle:string;
    oldCategory:string;
    oldIngredients:Array<object>;
    oldDirections:string;
    autocomplete:Function;
}
interface recipe {
    title:string;
    directions:string;
    ingredients:Array<object>;
    category:string;
}
let oldRecipe:recipe;
let oldTitle = window.oldTitle;
let oldCategory = window.oldCategory;
let oldIngredients = window.oldIngredients;
let oldDirections = window.oldDirections;
let autocomplete = window.autocomplete;


fetch("/ingredients").then(function (response:Response) {
    return response.json();
}).then(function (data) {
    for (let ingredient of data["ingredients"]) {
        possible.push(ingredient["ingredient"])
    } 
})

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
    validCategories:Array<string> = ["Other", "Cookies", "Cakes", "Muffins"];
    title: string;
    ingredients:Array<Ingredient>;
    directions: string;
    category:string;
    constructor (title: string, ingredients: Array<Ingredient>, directions:string, category:string) {
        this.title = title;
        this.ingredients = ingredients;
        this.directions = directions;
        this.category = category;
    }
    getIngArray() {
        let jsonIngredients:Array<object> = [];
        for (let ingredient of this.ingredients) {
            jsonIngredients.push(ingredient.jsonify());
        }
        return jsonIngredients;
    }
    jsonify() {
        let json:object = {
            title: this.title,
            ingredients: this.getIngArray(),
            directions: this.directions,
            category: this.category
        };
        return json;
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
        if (! this.validCategories.includes(this.category))
            return "Invalid Category";
        
        return true;
    }
}

function getRecipe() {
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
    let recipe = new Recipe(titleInput.value, list, directionsInput.value, categoryInput.value);
    return recipe;
}

function submitAdd() {
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
    let recipe = new Recipe(titleInput.value, list, directionsInput.value, categoryInput.value);
    let valid:boolean|string = recipe.validate();
    if (valid != true) {
        errorBox.textContent = valid; 
    } else {
        fetch("/api", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe.jsonify()).replace(/'/g, '"')
          }).then(function (response:Response) {
                if (response.status === 200) {
                    return;
                } else if (response.status === 409) {
                    errorBox.textContent="That name is alread taken!";
                } else {
                    errorBox.textContent="Request Could not be completed... sorry :(";
                }
          });
    }

}

function submitEdit() {
    let recipe:Recipe = getRecipe();
    let valid:boolean|string = recipe.validate();
    if (valid != true) {
        errorBox.textContent = valid; 
    } else {
        let columns:Array<string> = [];
        let changes:Array<string|object> = [];
        if (recipe.title != oldRecipe.title) {
            columns.push("title");
            changes.push(recipe.title);
        }
        if (recipe.ingredients != oldRecipe.ingredients) {
            columns.push("ingredients");
            changes.push(recipe.getIngArray());
        }
        if (recipe.directions != oldRecipe.directions) {
            columns.push("directions");
            changes.push(recipe.directions);
        }
        if (recipe.category != oldRecipe.category) {
            columns.push("category");
            changes.push(recipe.category)
        }
        fetch(`/api/${oldRecipe.title}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({"column": columns, "new": changes})
          }).then(function (response:Response) {
                if (response.status === 200) {
                    return;
                } else if (response.status === 409) {
                    errorBox.textContent="That name is alread taken!";
                } else {
                    errorBox.textContent="Request Could not be completed... sorry :(";
                }
          });
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

function addRow(ing = null) {

    let row:HTMLTableRowElement = document.createElement("tr");

    let name:HTMLInputElement = document.createElement("input");
    let whole:HTMLInputElement = document.createElement("input");
    let num:HTMLInputElement = document.createElement("input");
    let den:HTMLInputElement = document.createElement("input");
    let divider:HTMLTableDataCellElement = document.createElement("td");
    let remove:HTMLElement = document.createElement("strong");
    let inDiv:HTMLElement = document.createElement("td");
    let select:HTMLSelectElement = createSelect();

    name.type = "text";
    name.classList.add("name");
    inDiv.classList.add("autocomplete");
    name.placeholder="Ingredient";
    name.autocomplete="off";
    name.name = "name";
    inDiv.append(name);

    whole.type = "text";
    whole.classList.add("whole");
    whole.autocomplete="off";
    whole.name = "whole";

    num.type = "text";
    num.classList.add("fraction");
    num.autocomplete="off";
    num.name = "num";


    den.type = "text";
    den.classList.add("fraction");
    den.autocomplete="off";
    den.name =  "den";

    divider.textContent = "/";

    remove.textContent = "X";
    remove.style.color = "grey";
    remove.style.cursor = "pointer";
    remove.addEventListener("click", removeIngredient);
    if (ing != null) {
        if (ing.name) 
            name.value = ing.name;
        if (ing.whole) 
            whole.value = ing.whole;
        if (ing.num) 
            num.value = ing.num;
        if (ing.den) 
            den.value = ing.den;
        select.value = ing.unit;
    }
    row.append(inDiv);
    row.append(whole);
    row.append(num);
    row.append(divider);
    row.append(den);
    row.append(select);
    row.append(remove);
    ingredients.append(row);
    autocomplete(name, possible);
}

function add() {
    if (submitButton != null &&
        titleInput != null &&
        directionsInput != null &&
        ingredients != null &&
        errorBox != null &&
        categoryInput != null) {

        submitButton.addEventListener("click", submitAdd);
    }

    if (addButton != null && ingredients != null) {
        addButton.addEventListener("click", addRow);
    } else {
        console.log("Error: Elements not found")
    }
}

function edit() {
    if (submitButton != null &&
        titleInput != null &&
        directionsInput != null &&
        ingredients != null &&
        errorBox != null &&
        categoryInput != null) {

        titleInput.value = oldTitle;
        for (let ing of oldIngredients) {
            addRow(ing);
        }
        directionsInput.value = oldDirections;
        categoryInput.value = oldCategory;
        let oldRecipe = getRecipe();
        submitButton.addEventListener("click", submitEdit);
    }

    if (addButton != null && ingredients != null) {
        addButton.addEventListener("click", addRow);
    } else {
        console.log("Error: Elements not found")
    }
}