function openPopup(parent) {
    document.querySelectorAll(".item_popup").forEach(element => {
        element.setAttribute("closed", "");
    });
    document.querySelectorAll(".item").forEach(element => {
        element.removeAttribute("forcePress", "");
    });
    if (parent != undefined) {
        parent.querySelector(".item_popup").removeAttribute("closed");
        parent.setAttribute("forcePress", "")
    }
}

function closePopup() {
    setTimeout(() => {
        document.querySelectorAll(".item_popup").forEach(element => {
            element.setAttribute("closed", "");
        });

        document.querySelectorAll(".item").forEach(element => {
            element.removeAttribute("forcePress", "");
        });
    }, 10);
}



function updateCosts(element) {
    let parent = element.parentElement,
        elFCS = parent.querySelector(".total-fcs"),
        elDiamonds = parent.querySelector(".total-diamond");
    let amount = Math.ceil(element.value),
        calcFCS = eval(elFCS.getAttribute("calc")),
        calcDiamonds = eval(elDiamonds.getAttribute("calc"));

    elFCS.innerHTML = Math.ceil(calcFCS * amount);
    elDiamonds.innerHTML = Math.ceil(calcDiamonds * amount) + "<img />";
}

function openForm(parent) {

    document.getElementById("item-img").setAttribute("src", parent.querySelector(".item-image").getAttribute('src'));
    document.getElementById("item-img").setAttribute("pixelated", parent.querySelector(".item-image").getAttribute('pixelated'));
    
    document.getElementById("item-name").innerHTML = `${parent.querySelector(".item-name").innerHTML} #${parent.querySelector(".item_popup-amount").value}`;

    document.getElementById("total-fcs").innerHTML = parent.querySelector(".total-fcs").innerHTML;
    document.getElementById("total-diamond").innerHTML = parent.querySelector(".total-diamond").innerHTML;

    document.getElementsByTagName('overlay')[0].setAttribute("open","true");
}

function closeForm() {
    document.getElementsByTagName('overlay')[0].setAttribute("open","false");
}


function sendOrder(event) {
    event.preventDefault();

    let data = {
        ign: document.getElementById("mcUsername").value,
        location: document.getElementById("location").value,
        item: document.getElementById("item-name").innerText.match(/^.+(?= #)/)[0],
        amount: Number(document.getElementById("item-name").innerText.match(/(?<=#)\d+$/)),
        currency: document.getElementById("currencyOption").value
    };

    fetch("/post-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(response => {
        closeForm();
    });

};

function generateContent() {
    fetch(`/data/items.json`).then(res => res.text()).then(text => JSON.parse(text)).then(items => {
        fetch("/generated/item.html").then(res => res.text()).then(generatedItem => {
            items.forEach(item => {
                document.getElementById('items').innerHTML += replaceValues(item, generatedItem);
            });
        });
    });
}

function replaceValues(item, generatedHTML, extraData = {}) {
    return generatedHTML.replaceAll(/%\([^)]*\)/g, match => {
        let key = match.replaceAll(/(^%\(|\)$)/g, ''),
            value = recursiveValue(item, key);

        if (value == undefined) // Default values
            switch (key) {
                default:
                    if (recursiveValue(extraData, key) == undefined) return "";
                    return recursiveValue(extraData, key);
                case "pixelized":
                    return true;
                case "per_item.fcs":
                case "per_item.diamond":
                    return 1;
                case "max":
                    return Infinity;
            };
        return value;
    });
}

function recursiveValue(object, keyString) {
    return new Function('item', `try { return item.${keyString}; } catch(err) { return undefined; }`)(object);
}