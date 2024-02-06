function openForm(parent) {

    document.getElementById("item-img").setAttribute("src", parent.querySelector(".item-image").getAttribute('src'));
    document.getElementById("item-img").setAttribute("pixelated", parent.querySelector(".item-image").getAttribute('pixelated'));

    document.getElementById("item-name").innerHTML = `${parent.querySelector(".item-name").innerHTML} #${parent.querySelector(".item_popup-amount").value}`;

    document.getElementById("total-diamond").innerHTML = parent.querySelector(".total-diamond").innerHTML;

    document.getElementsByTagName('overlay')[0].setAttribute("open", "true");
}

function closeForm() {
    document.getElementsByTagName('overlay')[0].setAttribute("open", "false");
}


function sendOrder(event) {
    event.preventDefault();

    let data = {
        ign: document.getElementById("mcUsername").value,
        location: document.getElementById("location").value,
        item: document.getElementById("item-name").innerText.match(/^.+(?= #)/)[0],
        amount: Number(document.getElementById("item-name").innerText.match(/(?<=#)\d+$/)),
    };

    fetch("/post-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(_ => {
        closeForm();
    });

};
