var list = document.getElementById("recipe-list");
var selection = document.getElementById("category");
var search = document.getElementById("search");
var categories = ["All", "Cookies", "Cakes", "Muffins"];
var recipes;
function clear_list() {
    while (list === null || list === void 0 ? void 0 : list.lastChild) {
        list.lastChild.remove();
    }
}
function populate_category(cat) {
    if (!recipes) {
        return;
    }
    clear_list();
    var _loop_1 = function (i) {
        if (cat == "" || recipes["categories"][i] == cat) {
            var recipe_1 = recipes["titles"][i];
            var category = recipes["categories"][i];
            var li = document.createElement("li");
            li.classList.add("list-item");
            var img = document.createElement("img");
            img.src = "pictures/" + category + ".jpg";
            img.classList.add("list-img");
            img.style.width = "50px";
            var p = document.createElement("p");
            p.textContent = recipe_1;
            var edit = document.createElement("strong");
            edit.textContent = "Edit";
            edit.addEventListener("click", function (e) {
                e.stopPropagation();
                window.location.href = "/edit/" + recipe_1;
            });
            var rm = document.createElement("strong");
            rm.textContent = "X";
            rm.addEventListener("click", deleteRecipe);
            li.append(img);
            li.append(p);
            li.append(rm);
            li.append(edit);
            li.addEventListener("click", function () {
                window.location.href = "/recipe/" + recipe_1;
            });
            list === null || list === void 0 ? void 0 : list.append(li);
        }
    };
    for (var i = 0; i < recipes["titles"].length; i++) {
        _loop_1(i);
    }
}
function populate_search(term) {
    if (!recipes) {
        return;
    }
    clear_list();
    var cat = selection === null || selection === void 0 ? void 0 : selection.value;
    var _loop_2 = function (i) {
        if ((cat == "" || recipes["categories"][i] == cat) &&
            (term == "" || recipes["titles"][i].toLowerCase().indexOf(term.toLowerCase()) != -1)) {
            var recipe_2 = recipes["titles"][i];
            var category = recipes["categories"][i];
            var li = document.createElement("li");
            li.classList.add("list-item");
            var img = document.createElement("img");
            img.src = "pictures/" + category + ".jpg";
            img.classList.add("list-img");
            img.style.width = "50px";
            var p = document.createElement("p");
            p.textContent = recipe_2;
            var edit = document.createElement("strong");
            edit.textContent = "Edit";
            edit.addEventListener("click", function (e) {
                e.stopPropagation();
                window.location.href = "/edit/" + recipe_2;
            });
            var rm = document.createElement("strong");
            rm.textContent = "X";
            rm.addEventListener("click", deleteRecipe);
            li.append(img);
            li.append(p);
            li.append(rm);
            li.append(edit);
            li.addEventListener("click", function () {
                window.location.href = "recipes/" + recipe_2.replace(/\s+/g, '_') + ".html";
            });
            list.append(li);
        }
    };
    for (var i = 0; i < recipes["titles"].length; i++) {
        _loop_2(i);
    }
}
function deleteRecipe(e) {
    var _a;
    e.stopPropagation();
    var node = e.target;
    var title = (_a = node === null || node === void 0 ? void 0 : node.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("p")[0].textContent;
    var rm = window.confirm("Are you sure you would like to delete " + title + "?");
    if (rm) {
        fetch("/api/" + title, { method: "DELETE" }).then(function (response) {
            console.log(response.status);
        });
    }
    else {
        return;
    }
}
if (list != null) {
    fetch("/api").then(function (response) {
        return response.json();
    }).then(function (data) {
        recipes = data;
        populate_category("");
    });
}
else {
    console.log("Error: list element not found");
}
if (selection != null) {
    selection.addEventListener("change", function () { populate_category(selection.value); });
}
else {
    console.log("Category selector not found!");
}
if (search != null) {
    search.addEventListener("keyup", function () { populate_search(search.value); });
}
else {
    console.log("Search element not found");
}
