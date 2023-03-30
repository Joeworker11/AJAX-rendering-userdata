function request(url, method = "GET", callBackFunction){

    const xhr = new XMLHttpRequest();
    //ahányszor módosítva lesz ez a readystate annyiszor lesz módosítva az esemény
    xhr.onreadystatechange = function() {
        //ha a readystate 4. tehát finished és a státusz 200, azaz OK akkor visszahívjuk a callbackf-el a responseText-et
        if(this.readyState == 4 && this.status == 200)
            callBackFunction(this.responseText);
    }
    //.onload (amikor bevan  töltve, aminek source vagy href-je annak lesz onload eseménye) vagy .onreadystatechange (az utóbbi mindig meghívódik)
    //http protocollon megkeresztül megnyitjuk az utat
    xhr.open(method, url); //metódust vár, plusz az url hogy merrefele nyisson
    xhr.send();
}

function createElement(tagName, cssName, content) {
    const element = document.createElement(tagName);
   
    element.className = cssName; 
    if(content){
        element.innerHTML = content;
    }
    return element;
}


function renderGrid(data, headers, renderTo, titleText) {
    const grid = createElement("div", "basic-grid");
 
    let row, cell;
    
    const order = {
        asc: "▲", 
        desc: "▼" 
    }
    
    document.querySelector(renderTo).innerHTML = "";
    
    if(titleText){
        let title = createElement("div", "basic-grid-title", titleText);
        grid.appendChild(title);

    }


    row = createElement("div", "grid-row grid-head");
    grid.appendChild(row);

    headers.forEach( head => {
        cell = createElement("div", "grid-cell", head.text);
        cell.style.width = head.width ? head.width : "100%"; 

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
                        return 1; 
                    if(element == nextElement)
                        return 0; 

                    return -1; 
                } );

                renderGrid(sortData, headers, renderTo, titleText);

            } 

        } 

        row.appendChild(cell);
    } ); 

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

document.getElementById("load").onclick = function(){
    request("https://jsonplaceholder.typicode.com/users", "GET", function(res){
        const USERS = JSON.parse(res);
        //json.parse jsonné alakítja a stringet
        console.log(USERS);
        renderGrid(
            USERS,
             [
                {key: "id", text: "ID", width: "20%", sortable: true},
                {key: "username", text: "Felhasználónév", sortable: true},
                {key: "name", text: "Teljes név", sortable: true},
                {key: "website", text: "Weboldal", sortable: true},
                {key: "phone", text: "Telefonszám", sortable: true},
                
               
                {key: "email", text: "Email", sortable: true},
                
             ],
             "#grid-container",
             "Felhasználók listája"
        );
    })

}