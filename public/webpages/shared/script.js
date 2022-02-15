window.onload = () => {
    importContents(); 

    generateContent('/get-items'    ,               '/webpages/shared/generated/item_main.html', 'items_main'      );
    generateContent('/get-employees',               '/webpages/shared/generated/employee.html',  'employees'       );
    generateContent('https://api.flexcrop.net/fcs', '/webpages/shared/generated/item_fcs.html',  'items_fcs', false);
};

async function importContents() {
    while(document.getElementsByTagName('imported').length > 0) {
        let element = document.getElementsByTagName('imported')[0],
            type = element.getAttribute('type');

        await fetch(`/webpages/shared/imported/${type}.html`).then(res => res.text()).then(importedHTML => {
            element.outerHTML = importedHTML;
        });
    }
}

function generateContent(fetchURL, htmlURL, type, post = true) {
    if(document.querySelectorAll(`[type=${type}][generated]`).length > 0)
        fetch(fetchURL, { method: post? 'POST':'GET' }).then(res => res.text()).then(text => JSON.parse(text)).then(contents => {
            if(contents != undefined)
                fetch(htmlURL).then(res => res.text()).then(generatedHTML => {
                    let replaced = document.querySelectorAll(`[type=${type}][generated]`);

                    for(element of replaced) {
                        for(data of contents) { element.innerHTML += replaceValues(data, generatedHTML) };
                    };

                });
        })
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
    }).replaceAll(/\$\([^)]*\)/g, match => {
        let fullKey = match.replaceAll(/(^\$\(|\)$)/g, ''),
            lastDot = fullKey.lastIndexOf('.'),
            arrName = fullKey.substr(0,lastDot),
            key = fullKey.substr(lastDot + 1);

        return recursiveValue(item, arrName).includes(key);
    });
}

function recursiveValue(object, keyString) {
    return new Function('item', `try { return item.${keyString}; } catch(err) { return undefined; }`)(object);
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