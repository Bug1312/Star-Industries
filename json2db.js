const Database = require("fs-database"),
    crypto = require("crypto"),
    db = new Database();

const items = require(__dirname + "/public/data/items.json");
const employees = require(__dirname + "/public/data/employees.json");

if(employees && employees.length)
    employees.forEach(username => {
        db.get(`user_${username}`).then(user => {
            db.set(`user_${username}`, {
                username: (user.perms != undefined) ? user.username : username,
                password: (user.password != undefined)? user.password : crypto.createHash('sha256').update("password").digest('hex').toUpperCase(),
                perms:  (user.perms != undefined) ? user.perms : ['create'],
            })
        })
    });

if(items && items.length)
    items.forEach(item => {
        db.set(`item_${item.name}`, item);
    })