var ingredients = document.getElementById("ingredients");
var addButton = document.getElementById("add_ingredient");
var submitButton = document.getElementById("submit");
var titleInput = document.getElementById("title");
var directionsInput = document.getElementById("directions");
var errorBox = document.getElementById("error-message");
var categoryInput = document.getElementById("category");
var imageInput = document.getElementById("image");
var possible = [];
var oldRecipe = { title: "", directions: "", ingredients: [{}], category: "" };
var oldTitle = window.oldTitle;
var oldCategory = window.oldCategory;
var oldIngredients = window.oldIngredients;
var oldDirections = window.oldDirections;
var autocomplete = window.autocomplete;
fetch("/ingredients").then(function (response) {
    return response.json();
}).then(function (data) {
    for (var _i = 0, _a = data["ingredients"]; _i < _a.length; _i++) {
        var ingredient = _a[_i];
        possible.push(ingredient["ingredient"]);
    }
});
var Ingredient = /** @class */ (function () {
    function Ingredient(name, whole, num, den, unit) {
        this.whole = null;
        this.num = null;
        this.den = null;
        this.unit = null;
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
    Ingredient.prototype.validate = function () {
        if (!this.name)
            return false;
        if (this.whole != null && isNaN(this.whole))
            return false;
        if (this.num != null && isNaN(this.num))
            return false;
        if (this.den != null && isNaN(this.den))
            return false;
        return true;
    };
    Ingredient.prototype.jsonify = function () {
        return {
            name: this.name,
            whole: this.whole,
            num: this.num,
            den: this.den,
            unit: this.unit
        };
    };
    return Ingredient;
}());
var Recipe = /** @class */ (function () {
    function Recipe(title, ingredients, directions, category) {
        this.validCategories = ["Other", "Cookies", "Cakes", "Muffins"];
        this.title = title;
        this.ingredients = ingredients;
        this.directions = directions;
        this.category = category;
    }
    Recipe.prototype.getIngArray = function () {
        var jsonIngredients = [];
        for (var _i = 0, _a = this.ingredients; _i < _a.length; _i++) {
            var ingredient = _a[_i];
            jsonIngredients.push(ingredient.jsonify());
        }
        return jsonIngredients;
    };
    Recipe.prototype.jsonify = function () {
        var json = {
            title: this.title,
            ingredients: this.getIngArray(),
            directions: this.directions,
            category: this.category
        };
        return json;
    };
    Recipe.prototype.validate = function () {
        if (this.title === "")
            return "Invalid title: title must contain text!";
        for (var _i = 0, _a = this.ingredients; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!item.validate()) {
                return "Invalid ingredient: ingredient " + item.name + " is invalid!\n                        ingredients must have a name, and the three proceeding boxes must be numbers or empty!";
            }
        }
        if (!this.validCategories.includes(this.category))
            return "Invalid Category";
        return true;
    };
    return Recipe;
}());
function getRecipe() {
    errorBox.textContent = ""; // clear error box
    var row;
    var list = [];
    var rows = ingredients.getElementsByTagName("tr"); // Type any bc/we cannot iterate over HTMLCollection
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        row = rows_1[_i];
        var inputs = row.getElementsByTagName("input");
        var name_1 = inputs[0].value;
        var whole = inputs[1].value;
        var num = inputs[2].value;
        var den = inputs[3].value;
        var unit = row.getElementsByTagName("select")[0].value;
        var data = new Ingredient(name_1, whole, num, den, unit);
        list.push(data);
    }
    var recipe = new Recipe(titleInput.value, list, directionsInput.value, categoryInput.value);
    return recipe;
}
function submitAdd() {
    errorBox.textContent = ""; // clear error box
    var row;
    var list = [];
    var rows = ingredients.getElementsByTagName("tr"); // Type any bc/we cannot iterate over HTMLCollection
    for (var _i = 0, rows_2 = rows; _i < rows_2.length; _i++) {
        row = rows_2[_i];
        var inputs = row.getElementsByTagName("input");
        var name_2 = inputs[0].value;
        var whole = inputs[1].value;
        var num = inputs[2].value;
        var den = inputs[3].value;
        var unit = row.getElementsByTagName("select")[0].value;
        var data = new Ingredient(name_2, whole, num, den, unit);
        list.push(data);
    }
    var recipe = new Recipe(titleInput.value, list, directionsInput.value, categoryInput.value);
    var valid = recipe.validate();
    if (valid != true) {
        errorBox.textContent = valid;
    }
    else {
        fetch("/api", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe.jsonify()).replace(/'/g, '"')
        }).then(function (response) {
            if (response.status === 200) {
                return;
            }
            else if (response.status === 409) {
                errorBox.textContent = "That name is alread taken!";
            }
            else {
                errorBox.textContent = "Request Could not be completed... sorry :(";
            }
        });
    }
}
function submitEdit() {
    var recipe = getRecipe();
    var valid = recipe.validate();
    if (valid != true) {
        errorBox.textContent = valid;
    }
    else {
        var columns = [];
        var changes = [];
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
            changes.push(recipe.category);
        }
        if (imageInput.files.length != 0) {
            fetch("/image");
        }
        fetch("/api/" + oldRecipe.title, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "column": columns, "new": changes })
        }).then(function (response) {
            if (response.status === 200) {
                return;
            }
            else if (response.status === 409) {
                errorBox.textContent = "That name is alread taken!";
            }
            else {
                errorBox.textContent = "Request Could not be completed... sorry :(";
            }
        });
    }
}
function removeIngredient(e) {
    e.target.parentElement.remove();
}
function createSelect() {
    var select = document.createElement("select");
    var none = document.createElement("option");
    var cups = document.createElement("option");
    var teaspoons = document.createElement("option");
    var tablespoons = document.createElement("option");
    select.name = "unit";
    select.style.margin = "10px";
    none.value = "none";
    none.textContent = "No Units";
    select.append(none);
    cups.value = "cups";
    cups.textContent = "Cups";
    select.append(cups);
    teaspoons.value = "teaspoons";
    teaspoons.textContent = "Teaspoons";
    select.append(teaspoons);
    tablespoons.value = "tablespoons";
    tablespoons.textContent = "Tablespoons";
    select.append(tablespoons);
    return select;
}
function addRow(ing) {
    if (ing === void 0) { ing = null; }
    var row = document.createElement("tr");
    var name = document.createElement("input");
    var whole = document.createElement("input");
    var num = document.createElement("input");
    var den = document.createElement("input");
    var divider = document.createElement("td");
    var remove = document.createElement("strong");
    var inDiv = document.createElement("td");
    var select = createSelect();
    name.type = "search";
    name.classList.add("name");
    inDiv.classList.add("autocomplete");
    name.placeholder = "Ingredient";
    name.autocomplete = "off";
    name.name = "name";
    inDiv.append(name);
    whole.type = "search";
    whole.classList.add("whole");
    whole.autocomplete = "off";
    whole.name = "whole";
    num.type = "search";
    num.classList.add("fraction");
    num.autocomplete = "off";
    num.name = "num";
    den.type = "search";
    den.classList.add("fraction");
    den.autocomplete = "off";
    den.name = "den";
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
        categoryInput != null &&
        imageInput != null) {
        submitButton.addEventListener("click", submitAdd);
    }
    if (addButton != null && ingredients != null) {
        addButton.addEventListener("click", addRow);
    }
    else {
        console.log("Error: Elements not found");
    }
}
function edit() {
    if (submitButton != null &&
        titleInput != null &&
        directionsInput != null &&
        ingredients != null &&
        errorBox != null &&
        categoryInput != null &&
        imageInput != null) {
        titleInput.value = oldTitle;
        for (var _i = 0, oldIngredients_1 = oldIngredients; _i < oldIngredients_1.length; _i++) {
            var ing = oldIngredients_1[_i];
            addRow(ing);
        }
        directionsInput.value = oldDirections;
        categoryInput.value = oldCategory;
        oldRecipe = getRecipe();
        submitButton.addEventListener("click", submitEdit);
    }
    if (addButton != null && ingredients != null) {
        addButton.addEventListener("click", addRow);
    }
    else {
        console.log("Error: Elements not found");
    }
}
