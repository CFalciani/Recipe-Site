var ingredients = document.getElementById("ingredients");
var addButton = document.getElementById("add_ingredient");
var submitButton = document.getElementById("submit");
var titleInput = document.getElementById("title");
var directionsInput = document.getElementById("directions");
var errorBox = document.getElementById("error-message");
var categoryInput = document.getElementById("category");
var imageInput = document.getElementById("image");
var homeButton = document.getElementById("home");
// All possible ingredients
var possible = [];
var oldRecipe = { title: "", directions: "", ingredients: [{}], category: "" };
var oldTitle = window.oldTitle;
var oldCategory = window.oldCategory;
var oldIngredients = window.oldIngredients;
var oldDirections = window.oldDirections;
var autocomplete = window.autocomplete;
// Get a list of all possible ingredients to recommend
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
        // Must have a name,
        // whole num and den must be numbers
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
        // Title must exist
        // each ingredient must be valid
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
    // Parses form and returns an ingredient object
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
    var _a;
    // Submit function when adding a recipe
    errorBox.textContent = ""; // clear error box
    var recipe = getRecipe();
    var valid = recipe.validate();
    if (valid != true) {
        // Show error message if there is one 
        errorBox.textContent = valid;
    }
    else {
        var form = new FormData();
        form.append("recipe", JSON.stringify(recipe.jsonify()));
        if (((_a = imageInput === null || imageInput === void 0 ? void 0 : imageInput.files) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            form.append("image", imageInput === null || imageInput === void 0 ? void 0 : imageInput.files[0]);
        }
        // add FormData for the recipe and the image if there is one
        fetch("/api", {
            method: 'POST',
            body: form
        }).then(function (response) {
            if (response.status === 200) {
                window.location.href = "/";
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
    var _a;
    // Submit function when editing
    var recipe = getRecipe();
    var valid = recipe.validate();
    if (valid != true) {
        // show error if not valid
        errorBox.textContent = valid;
    }
    else {
        // Find what the user has changed
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
        var form = new FormData();
        form.append("recipe", JSON.stringify({ "column": columns, "new": changes }));
        if (((_a = imageInput.files) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            form.append("image", imageInput.files[0]);
        }
        // Attach recipe and option image to a FormData object
        fetch("/api/" + oldRecipe.title, {
            method: 'PUT',
            body: form
        }).then(function (response) {
            if (response.status === 200) {
                window.location.href = "/";
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
    // Create the select box for a unit
    var select = document.createElement("select");
    var none = document.createElement("option");
    var cups = document.createElement("option");
    var teaspoons = document.createElement("option");
    var tablespoons = document.createElement("option");
    select.name = "unit";
    select.style.margin = "10px";
    none.value = "none";
    none.textContent = "No Units";
    none.setAttribute("selected", '');
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
    // Add a row to the screen for another ingredient
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
    autocomplete(name, possible); // Assign autocomplete to run on the name enter
}
function add() {
    // Call this if on the add page
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
if (homeButton != null) {
    homeButton.addEventListener("click", function () { window.location.href = "/"; });
}
function edit() {
    // Call this if on the edit page
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
