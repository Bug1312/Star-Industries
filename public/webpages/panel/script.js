function passChange(ev) {
    ev.preventDefault();

    let oldPassword = document.getElementById("change_pass-old").value,
        newPassword = document.getElementById("change_pass-new").value,
        confirmNew = document.getElementById("change_pass-new_confirm").value;

    if (newPassword === confirmNew)
        fetch("/set-new-pass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                oldPassword,
                newPassword
            })
        }).then(response => response.text()).then(text => JSON.parse(text)).then(response => {
            if (response) alert("Password Changed")
            else alert("Incorrect Password")
        });
    else alert("Passwords don't match");
}

function newItem(ev, edit = false) {
    ev.preventDefault();

    let type = edit ? 'create_item' : 'edit_item',
        name = document.getElementById(`${type}-name`).value,
        image_URL = document.getElementById(`${type}-img`).value,
        pixelated = document.getElementById(`${type}-pixelized`).checked,
        max = document.getElementById(`${type}-max`).value,
        cost = {
            fcs: document.getElementById(`${type}-cost_fcs`).value,
            diamond: document.getElementById(`${type}-cost_diamond`).value
        },
        per_item = {
            fcs: document.getElementById(`${type}-per_fcs`).value,
            diamond: document.getElementById(`${type}-per_diamond`).value
        }

    fetch("/post-item", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            image_URL,
            pixelated,
            max,
            cost,
            per_item
        })
    }).then(response => response.text()).then(text => JSON.parse(text)).then(response => {
        if (response) alert("Item Created")
        else alert("Invalid Item")
    });
}

function reloadPreview(edit = false) {
    let type = edit ? 'create_item' : 'edit_item',
        name = document.getElementById(`${type}-name`).value,
        image_URL = document.getElementById(`${type}-max`).value,
        pixelated = document.getElementById(`${type}-image`).checked,
        max = document.getElementById(`${type}-pixelized`).value,
        cost = {
            fcs: document.getElementById(`${type}-cost_fcs`).value,
            diamond: document.getElementById(`${type}-cost_diamond`).value,
        },
        per_item = {
            fcs: document.getElementById(`${type}-cost_diamond`).value,
            diamond: document.getElementById(`${type}-per_diamond`).value,
        },
        previews = document.querySelectorAll('generated[type="item_panel"]')

    let item = {
        name,
        image_URL,
        pixelated,
        max,
        cost,
        per_item
    };

    fetch("webpages/shared/generated/item_panel-edit.html").then(res => res.text()).then(generatedItem => {

        previews.forEach(preview => {
            preview.outerHTML = replaceValues(item, generatedItem);
        })

        document.querySelectorAll('.item_popup-amount').forEach(element => {
            let parent = element.parentElement,
                elFCS = parent.querySelector(".total-fcs"),
                elDiamonds = parent.querySelector(".total-diamond");
            let amount = Math.ceil(element.value),
                calcFCS = eval(elFCS.getAttribute("calc")),
                calcDiamonds = eval(elDiamonds.getAttribute("calc"));

            elFCS.innerHTML = Math.ceil(calcFCS * amount);
            elDiamonds.innerHTML = Math.ceil(calcDiamonds * amount) + "<img />";
        });
    });
}

function swapTap(tab) {
    document.querySelectorAll('.tabs>a').forEach(el => {
        el.removeAttribute('selected');
        document.getElementById(el.getAttribute('for')).setAttribute('hidden', 'true');
    });
    tab.setAttribute('selected', '');
    document.getElementById(tab.getAttribute('for')).removeAttribute('hidden');
    document.getElementById('tab_name').innerHTML = tab.innerText;
}

(function() {
    /* used to hide oldLoad */
    const oldLoad = window.onload;
    window.onload = function() {
        oldLoad();
        generateContent('/get-items', '/webpages/shared/generated/item_panel-remove.html', 'item_panel-remove');

    }
})();