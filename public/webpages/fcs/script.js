fetch("https://api.flexcrop.net/fcs").then(res => res.json()).then(data => {
    data.forEach(item => {
        let tableRow = document.createElement('TR'),
            tableItem = document.createElement('TD'),
            itemImage = document.createElement('IMG'),
            itemName = document.createElement('P'),
            tableValue = document.createElement('TD');

        itemImage.setAttribute('src', item.image);
        itemImage.setAttribute('alt', item.name);
        if (item.image.includes('/16x/')) itemImage.setAttribute('pixelated', 'true');
        tableItem.appendChild(itemImage);

        itemName.innerHTML = item.name;
        tableItem.appendChild(itemName);

        tableRow.appendChild(tableItem);

        tableValue.innerHTML = item.value;
        tableRow.appendChild(tableValue);

        document.getElementById('table_body').appendChild(tableRow);
    });
})