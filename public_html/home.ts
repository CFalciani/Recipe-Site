let list:HTMLUListElement|null = <HTMLUListElement|null>document.getElementById("recipe-list")

if (list != null) {
    fetch("/api").then(function (response:Response) {
        return response.json();
    }).then(function (data) {
        for (let i = 0; i < data["titles"].length; i++) {
            let recipe = data["titles"][i];
            let category = data["categories"][i];


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
    });
} else {
    console.log("Error: list element not found");
}