let recipeName:HTMLElement|null = document.getElementById("recipe-title");
let image:HTMLImageElement|null = <HTMLImageElement|null>document.getElementById("image");
let ingredientsList:HTMLUListElement|null = <HTMLUListElement|null>document.getElementById("ingredients-list");
let directionsBox:HTMLElement|null = document.getElementById("directions");

recipeName.textContent = title;
image.src = title + ".jpg";
for (let ingredient of ingredients) {
    let li = document.createElement("li");
    let ingString:string = "";
    if (ingredient.whole != null) {
        ingString += ingredient.whole + " ";
    }
    if (ingredient.num != null) {
        ingString += ingredient.num + '/' + ingredient.den+ " ";
    }
    if (ingredient.unit != "No Unit") {
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
directionsBox.textContent = directions