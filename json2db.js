const Database = require("fs-database"),
    crypto = require("crypto"),
    db = new Database();

const items = require(__dirname + "/public/data/items.json");
const employees = require(__dirname + "/public/data/employees.json");

employees.forEach(username => {
    db.set(`user_${username}`, {
        username,
        password: crypto.createHash('sha256').update("password").digest('hex').toUpperCase(),
        perms: ['create']
    })
});

items.forEach(item => {
    db.set(`item_${item.name}`, item);
})