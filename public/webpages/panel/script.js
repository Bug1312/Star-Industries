function passChange(ev) {
    ev.preventDefault();

    let oldPassword = document.getElementById("form_pass-old_pass").value,
    newPassword = document.getElementById("form_pass-new_pass").value,
    confirmNew = document.getElementById("form_pass-new_pass_confirm").value;

    if(newPassword === confirmNew)
        fetch("/set-new-pass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ oldPassword, newPassword })
        }).then(response => response.text()).then(text => JSON.parse(text)).then(response => {
            if (response) alert("Password Changed")
            else alert("Incorrect Password")
        });
    else alert("Passwords don't match");
}

function newItem(ev) {
    ev.preventDefault();

    let name = document.getElementById("form_item-name").value,
        image_URL = document.getElementById("form_item-img").value,
        pixelated = document.getElementById("form_item-pixelized").checked,
        max = document.getElementById("form_item-max").value,
        cost = {
            fcs:document.getElementById("form_item-fcs_cost").value,
            diamond:document.getElementById("form_item-diamond_cost").value
        },
        per_item = {
            fcs:document.getElementById("form_item-fcs_per").value,
            diamond:document.getElementById("form_item-diamond_per").value
        }

    fetch("/post-item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name, image_URL, pixelated, max, cost, per_item
            })
        }).then(response => response.text()).then(text => JSON.parse(text)).then(response => {
            if (response) alert("Item Created")
            else alert("Invalid Item")
        });
}

function updatePreview(){
    let name = document.getElementById("form_item-name").value,
    image_URL = document.getElementById("form_item-img").value,
    pixelated = document.getElementById("form_item-pixelized").checked,
    max = document.getElementById("form_item-max").value,
    cost = {
        fcs:document.getElementById("form_item-fcs_cost").value,
        diamond:document.getElementById("form_item-diamond_cost").value
    },
    per_item = {
        fcs:document.getElementById("form_item-fcs_per").value,
        diamond:document.getElementById("form_item-diamond_per").value
    };

    let item = {name,image_URL,pixelated,max,cost,per_item};

    fetch("/generated/item.html").then(res => res.text()).then(generatedItem => {
        document.getElementById('preview').innerHTML = replaceValues(item, generatedItem);

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
