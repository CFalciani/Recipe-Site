let list:HTMLUListElement|null = <HTMLUListElement|null>document.getElementById("recipe-list")
let selection:HTMLSelectElement|null = <HTMLSelectElement|null>document.getElementById("category");
let search:HTMLInputElement|null = <HTMLInputElement|null>document.getElementById("search");
let categories = ["All", "Cookies", "Cakes", "Muffins"];
let recipes:any;

function clear_list() {
    while (list?.lastChild) {
        list.lastChild.remove();
    }
}

function populate_category(cat:string) {
    if (! recipes) {
        return;
    }
    clear_list();
    for (let i = 0; i < recipes["titles"].length; i++) {
        if (cat == "" || recipes["categories"][i] == cat) {
            let recipe = recipes["titles"][i];
            let category = recipes["categories"][i];


            let li:HTMLLIElement = document.createElement("li");
            li.classList.add("list-item");

            let img:HTMLImageElement = document.createElement("img");
            img.src = "pictures/" + category + ".jpg";
            img.classList.add("list-img");
            img.style.width = "50px";
            
            let p:HTMLParagraphElement = document.createElement("p");
            p.textContent = recipe;

            li.append(img);
            li.append(p);

            li.addEventListener("click", function () {
                window.location.href = "recipes/" + recipe.replace(/\s+/g, '_') + ".html";
            });
            list.append(li);
        }
    }
}

function populate_search (term:string) {
    if (! recipes) {
        return;
    }
    clear_list();
    let cat = selection?.value;
    for (let i = 0; i < recipes["titles"].length; i++) {
        if ((cat == "" || recipes["categories"][i] == cat) && 
            (term == "" || recipes["titles"][i].toLowerCase().indexOf(term.toLowerCase()) != -1)
            ) {
            let recipe = recipes["titles"][i];
            let category = recipes["categories"][i];


            let li:HTMLLIElement = document.createElement("li");
            li.classList.add("list-item");

            let img:HTMLImageElement = document.createElement("img");
            img.src = "pictures/" + category + ".jpg";
            img.classList.add("list-img");
            img.style.width = "50px";
            
            let p:HTMLParagraphElement = document.createElement("p");
            p.textContent = recipe;

            li.append(img);
            li.append(p);

            li.addEventListener("click", function () {
                window.location.href = "recipes/" + recipe.replace(/\s+/g, '_') + ".html";
            });
            list.append(li);
        }
    }
}

if (list != null) {
    fetch("/api").then(function (response:Response) {
        return response.json();
    }).then(function (data) {
        recipes = data;
        populate_category("");
    });
} else {
    console.log("Error: list element not found");
}

if (selection != null) {
    selection.addEventListener("change", function () {populate_category(selection.value)})
} else {
    console.log("Category selector not found!");
}

if (search != null) {
    search.addEventListener("keyup", function () {populate_search(search.value)});
} else {
    console.log("Search element not found");
}