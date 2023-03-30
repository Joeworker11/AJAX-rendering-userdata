function createElement(tagName, cssName, content) {
    const element = document.createElement(tagName);
    //element.classList.add(cssName);  //ez már létezőhöz adja hozzá a CSS stílust
    //element.setAttribute("class", cssName); //ez felülírja az eredetit 
    element.className = cssName; //ez a 3 sor mind ugyanaz //ez is felülírja az eredetit,ezzel 1-nél több css classt is hozzá lehet adni
    if(content){
        element.innerHTML = content;
    }
    return element;
}

/*
a createelement segítségével hozzunk létre egy div-et amely a 
basic-grid css osztállyal bír, és a tartalma egy tetszőleges szöveg 
az így létrehozott elemet a grid containerbe 

*/

//bármilyen adatstruktúrából (USERs pl objectként), bármilyen Json képes lesz táblázat formájában megjeleníteni
// headers vagy options - -> string tömb, ami a users azon kulcsait ami a táblázat oszlapaiként akarunk látni
// azt a szelektort megadni, amibe bele kell renderelni (grid-container)
//grid létrehozásának első lépése
function renderGrid(data, headers, renderTo, titleText) {
    const grid = createElement("div", "basic-grid");

    //szöveg létrehozása címként

    
    let row, cell;
    
    const order = {
        asc: "▲", //növekvő  - mikor melyik jelet generálja majd bele Alt + 30
        desc: "▼" //csökkenő Alt + 31
    }
    
    document.querySelector(renderTo).innerHTML = "";
    
    if(titleText){
        let title = createElement("div", "basic-grid-title", titleText);
        grid.appendChild(title);

    }

    /*
        Készítsük el a táblázatunk(grid) fejlécét
        - létrehozunk egy sor elemet(row)
        - végig iterálunk a fejlécen
            - létrehozzuk a fejléc oszlopait
            - majd ezeket hozzáadjuk a fejlécsorhoz
    */

    row = createElement("div", "grid-row grid-head");
    grid.appendChild(row);

    headers.forEach( head => {
        cell = createElement("div", "grid-cell", head.text);
        cell.style.width = head.width ? head.width : "100%"; //cellaszélesség beprogramozása

        if(head.sortable){
            
            const sortableElement = head.order ? 
                createElement("span", "grid-sort" + head.order, order[head.order]) :
                createElement("span", "grid-sort", "♦");  
                
            cell.appendChild(sortableElement);

            sortableElement.onclick = function(){

                let order = this.classList.contains("asc") ? "desc" : "asc";

                headers.forEach(h => h.order = undefined);

                head.order = order;

                
                const sortData = data.sort( (el, nextEl) => {
                    let element, nextElement;
                    

                    if(order == "asc"){
                        element = el[head.key];
                        nextElement = nextEl[head.key];

                    }else {
                        element = nextEl[head.key];
                        nextElement = el[head.key];
                    }




                    if(element > nextElement) 
                        return 1; //egyes ha pozitív tehát ha nagyobb 1. el - 2. el = pozitív szám
                    if(element == nextElement)
                        return 0; // ha egyenlőek

                    return -1; // ha negatív számot kapunk, mert 1. el - 2el  = negatív tehát az első el kisebb mint a második
                } );

                renderGrid(sortData, headers, renderTo, titleText);


            } //end sort click

        } // end head.sortable


        row.appendChild(cell);
    } ); //end headers.foreach


    //külső ciklus áltlaában a sorok száma, belső a celláké
    for(const d of data){
        row = createElement("div", "grid-row");
        grid.appendChild(row);

        row.onclick = function(){

            let addOrRemove = this.classList.contains("selected-row") ? "remove" : "add";
            grid.querySelectorAll(".selected-row").forEach(r => r.classList.remove("selected-row"));
            this.classList[addOrRemove]("selected-row"); //ez tárolja, hogy remove vagy add
        }

        for(const head of headers){
            cell = createElement("div", "grid-cell",
                head.render ? head.render(d) : d[head.key]
            );
            cell.style.width = head.width ? head.width : "100%";
            row.appendChild(cell);
        }
    }

    document.querySelector(renderTo).appendChild(grid);


}

renderGrid(
    USERS,
     [
        {key: "id", text: "ID", width: "20%", sortable: true},
        {key: "username", text: "Felhasználónév", sortable: true},
        {key: "lastName", text: "Családnév", sortable: true},
        {key: "firstName", text: "Keresztnév"},
        {key: "email", text: "Email"},
        {key: "birthdate", text: "Születlési év", sortable: true},
        {
            key: "status",
            text: "Státusz",
            width: "50%",
            sortable: true,
            render: function(dataRow){
                    let style = dataRow.status == "admin" ? "color: red" : "";
                    return `<span style="${style}">${dataRow.status}<span>`; //csak az adminokat pirossal adja vissza


            }},
     ],
     "#grid-container",
     "Felhasználók listája"
);

