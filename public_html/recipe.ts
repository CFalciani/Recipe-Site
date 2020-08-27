let recipeName:HTMLElement|null = document.getElementById("recipe-title");
let image:HTMLImageElement|null = <HTMLImageElement|null>document.getElementById("image");
let ingredientsList:HTMLUListElement|null = <HTMLUListElement|null>document.getElementById("ingredients-list");
let directionsBox:HTMLElement|null = document.getElementById("directions");
let switchButton:HTMLElement|null = document.getElementById("toggle");
let tbpc:number = 16;
let tspc:number = 48;
let imperial:boolean = true;

interface Window {
    title:string;
    ingredients:Array<object>;
    directions:string;
}
interface ingredient {
    name:string;
    whole:number|null;
    num:number|null;
    den:number|null;
    unit:string;
}
let title:string = window.title;
let ingredients:Array<ingredient> = <Array<ingredient>>window.ingredients;
let directions:string = window.directions;

function addImperialIngredient(ingredient) {
    let li = document.createElement("li");
    let ingString:string = "";
    if (ingredient.whole != null) {
        ingString += ingredient.whole + " ";
    }
    if (ingredient.num != null) {
        ingString += ingredient.num + '/' + ingredient.den+ " ";
    }
    if (ingredient.unit != "none") {
        let unit:string = ingredient.unit;
        if (ingredient.whole == 1 && ingredient.num == null) {
            unit = unit.slice(0,-1);
        }
        ingString += unit;
    }
    let name:HTMLElement = document.createElement("strong");
    name.textContent = " " + ingredient.name;
    li.textContent = ingString;
    li.append(name);
    ingredientsList.append(li);
}

function imperialIngredients() {
    clearTable();
    for (let ingredient of ingredients) {
        addImperialIngredient(ingredient)
    }
}

function clearTable() {
    while (ingredientsList?.lastChild) {
        ingredientsList.lastChild.remove()
    }
}

recipeName.textContent = title;
image.src = title + ".jpg";
imperialIngredients();
directionsBox.textContent = directions

if (switchButton != null) {
    switchButton.addEventListener("click", function () {
        if (imperial) {
            fetch("/conversions").then(function (response:Response) {
                return response.json();
            }).then(function (data) {
                clearTable();
                switchButton.textContent = "Switch to Cups";
                imperial = false;
                for (let ingredient of ingredients) {
                    if (data.hasOwnProperty(ingredient.name)) {
                        let conversion = data[ingredient.name]
                        let multiplier:number;
                        if (ingredient.unit === "cups")
                            multiplier = 1;
                        else if (ingredient.unit === "teaspoons")
                            multiplier = 1 / tspc;
                        else if (ingredient.unit === "tablespoons")
                            multiplier = 1 / tbpc;
                        else {
                            addImperialIngredient(ingredient);
                            continue;
                        }
                        let total:number = 0;
                        if (ingredient.whole != null)
                            total += ingredient.whole * conversion * multiplier;
                        if (ingredient.num != null)
                            total += (ingredient.num / ingredient.den) * conversion * multiplier;
                        let li = document.createElement("li");
                        li.textContent = `${Math.round(total)} grams `;
                        let name = document.createElement("strong");
                        name.textContent = ingredient.name;
                        li.append(name);
                        ingredientsList?.append(li);
                        continue
                    }
                    addImperialIngredient(ingredient);                          
                }
            })
        } else {
            switchButton.textContent = "Switch to Grams";
            imperial = true;
            imperialIngredients();
        }
    })
}