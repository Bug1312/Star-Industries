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

function newItem(ev) {
    ev.preventDefault();

    let name = document.getElementById('edit_item-name').value,
        image_URL = document.getElementById('edit_item-image').value,
        pixelated = document.getElementById('edit_item-pixelized').checked,
        max = document.getElementById('edit_item-max').value,
        cost = {
            fcs: document.getElementById('edit_item-cost_fcs').value,
            diamond: document.getElementById('edit_item-cost_diamond').value
        },
        per_item = {
            fcs: document.getElementById('edit_item-per_fcs').value,
            diamond: document.getElementById('edit_item-per_diamond').value
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
        if (response) alert("Item Created");
        else alert("Invalid Item");
    });
}

function deleteItems(event) {
    event.preventDefault();

    let items = [];

    document.querySelectorAll('#remove_item input[type=checkbox]:checked').forEach(item => {
        items.push(item.id.replace(/^remove-item-generated_/,''));
    });

    if(items.length > 0)
        fetch("/remove-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(items)
        }).then(response => response.text()).then(text => JSON.parse(text)).then(response => {
            if (response) alert("Item(s) Deleted");
            else alert("You do not have permissions!");
        });
}

function reloadPreview() {
    let
        name = document.getElementById('edit_item-name').value,
        image_URL = document.getElementById('edit_item-image').value,
        pixelated = document.getElementById('edit_item-pixelized').checked,
        max = document.getElementById('edit_item-max').value,
        cost = {
            fcs: document.getElementById('edit_item-cost_fcs').value,
            diamond: document.getElementById('edit_item-cost_diamond').value,
        },
        per_item = {
            fcs: document.getElementById('edit_item-per_fcs').value,
            diamond: document.getElementById('edit_item-per_diamond').value,
        },
        previews = document.querySelectorAll('generated[type="item_panel-edit"]')

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
        reloadPreview();

        generateContent('/get-self', '/webpages/shared/generated/nav_staff.html', 'nav_staff');
        generateContent('/get-self', '/webpages/shared/generated/staff_item_tabs.html', 'tabs', true, true);

        generateContent('/get-orders', '/webpages/shared/generated/item_panel-order.html', 'item_panel-orders');

        document.getElementById('edit_item-name').onkeyup = reloadPreview;
        document.getElementById('edit_item-max').onkeyup = reloadPreview;
        document.getElementById('edit_item-pixelized').onkeyup = reloadPreview;
        document.getElementById('edit_item-cost_fcs').onkeyup = reloadPreview;
        document.getElementById('edit_item-cost_diamond').onkeyup = reloadPreview;
        document.getElementById('edit_item-cost_diamond').onkeyup = reloadPreview;
        document.getElementById('edit_item-per_diamond').onkeyup = reloadPreview;

        document.getElementById('edit_item-image').onkeyup = reloadPreview;
        document.getElementById('edit_item-name').onkeyup = reloadPreview;
        document.getElementById('edit_item-max').onkeyup = reloadPreview;
        document.getElementById('edit_item-pixelized').onkeyup = reloadPreview;
        document.getElementById('edit_item-cost_fcs').onkeyup = reloadPreview;
        document.getElementById('edit_item-cost_diamond').onkeyup = reloadPreview;
        document.getElementById('edit_item-cost_diamond').onkeyup = reloadPreview;
        document.getElementById('edit_item-per_diamond').onkeyup = reloadPreview;
    }
})();