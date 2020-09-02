let list:HTMLUListElement|null = <HTMLUListElement|null>document.getElementById("recipe-list")
let selection:HTMLSelectElement|null = <HTMLSelectElement|null>document.getElementById("category");
let search:HTMLInputElement|null = <HTMLInputElement|null>document.getElementById("search");
let categories = ["All", "Cookies", "Cakes", "Muffins", "Other"]; 
let recipes:any;

function clear_list() {
    while (list?.lastChild) {
        list.lastChild.remove();
    }
}

// Sort by category
function populate_category(cat:string) {
    if (! recipes) {
        return;
    }
    clear_list();
    for (let i = 0; i < recipes["titles"].length; i++) {
        // Iterate over each recipe
        // If category is all, cat is set to "" which means all will be accepted
        // Otherwise only accept matching categories
        if (cat == "" || recipes["categories"][i] == cat) {
            // Add to the list
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

            let edit:HTMLElement = document.createElement("strong")
            edit.textContent = "Edit";
            edit.addEventListener("click", function (e) {
                e.stopPropagation();
                window.location.href = "/edit/" + recipe;
            })

            let rm:HTMLElement = document.createElement("strong");
            rm.textContent = "X";
            rm.addEventListener("click", deleteRecipe)
            li.append(img);
            li.append(p);
            li.append(rm);
            li.append(edit);
            li.addEventListener("click", function () {
                window.location.href = "/recipe/" + recipe;
            });
            list?.append(li);
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

            let edit:HTMLElement = document.createElement("strong")
            edit.textContent = "Edit";
            edit.addEventListener("click", function (e:Event) {
                e.stopPropagation();
                window.location.href = "/edit/" + recipe;
            })

            let rm:HTMLElement = document.createElement("strong");
            rm.textContent = "X";
            rm.addEventListener("click", deleteRecipe)
            li.append(img);
            li.append(p);
            li.append(rm);
            li.append(edit)
            li.addEventListener("click", function () {
                window.location.href = "recipe/" + recipe;
            });
            list.append(li);
        }
    }
}

function deleteRecipe(e:Event) {
    e.stopPropagation(); // Do not trigger parent event handler
    let node:HTMLElement|null = <HTMLElement|null>e.target
    let title = node?.parentElement?.getElementsByTagName("p")[0].textContent;
    let rm = window.confirm(`Are you sure you would like to delete ${title}?`);
    if (rm) {
        fetch(`/api/${title}`, {method: "DELETE"}).then(function (response:Response) {
            console.log(response.status)
        })
        location.reload();
    } else {
        return 
    }
}

if (list != null) {
    fetch("/api").then(function (response:Response) {
        return response.json();
    }).then(function (data) {
        recipes = data;
        // Defualt to all
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
