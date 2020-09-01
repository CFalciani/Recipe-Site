var recipeName = document.getElementById("recipe-title");
var image = document.getElementById("image");
var ingredientsList = document.getElementById("ingredients-list");
var directionsBox = document.getElementById("directions");
var switchButton = document.getElementById("toggle");
var homeButton = document.getElementById("home");
var tbpc = 16;
var tspc = 48;
var imperial = true;
var title = window.title;
var ingredients = window.ingredients;
var directions = window.directions;
function addImperialIngredient(ingredient) {
    var li = document.createElement("li");
    var ingString = "";
    if (ingredient.whole != null) {
        ingString += ingredient.whole + " ";
    }
    if (ingredient.num != null) {
        ingString += ingredient.num + '/' + ingredient.den + " ";
    }
    if (ingredient.unit != "none") {
        var unit = ingredient.unit;
        if (ingredient.whole == 1 && ingredient.num == null) {
            unit = unit.slice(0, -1);
        }
        ingString += unit;
    }
    var name = document.createElement("strong");
    name.textContent = " " + ingredient.name;
    li.textContent = ingString;
    li.append(name);
    ingredientsList.append(li);
}
function imperialIngredients() {
    clearTable();
    for (var _i = 0, ingredients_1 = ingredients; _i < ingredients_1.length; _i++) {
        var ingredient = ingredients_1[_i];
        addImperialIngredient(ingredient);
    }
}
function clearTable() {
    while (ingredientsList === null || ingredientsList === void 0 ? void 0 : ingredientsList.lastChild) {
        ingredientsList.lastChild.remove();
    }
}
recipeName.textContent = title;
image.src = title + ".jpg";
imperialIngredients();
directionsBox.textContent = directions;
if (homeButton != null) {
    homeButton.addEventListener("click", function () { window.location.href = "/"; });
}
if (switchButton != null) {
    switchButton.addEventListener("click", function () {
        if (imperial) {
            fetch("/conversions").then(function (response) {
                return response.json();
            }).then(function (data) {
                clearTable();
                switchButton.textContent = "Switch to Cups";
                imperial = false;
                for (var _i = 0, ingredients_2 = ingredients; _i < ingredients_2.length; _i++) {
                    var ingredient = ingredients_2[_i];
                    if (data.hasOwnProperty(ingredient.name)) {
                        var conversion = data[ingredient.name];
                        var multiplier = void 0;
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
                        var total = 0;
                        if (ingredient.whole != null)
                            total += ingredient.whole * conversion * multiplier;
                        if (ingredient.num != null)
                            total += (ingredient.num / ingredient.den) * conversion * multiplier;
                        var li = document.createElement("li");
                        li.textContent = Math.round(total) + " grams ";
                        var name_1 = document.createElement("strong");
                        name_1.textContent = ingredient.name;
                        li.append(name_1);
                        ingredientsList === null || ingredientsList === void 0 ? void 0 : ingredientsList.append(li);
                        continue;
                    }
                    addImperialIngredient(ingredient);
                }
            });
        }
        else {
            switchButton.textContent = "Switch to Grams";
            imperial = true;
            imperialIngredients();
        }
    });
}
