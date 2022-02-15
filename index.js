const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    Discord = require("discord.js"),
    cookieParser = require("cookie-parser"),
    Database = require("fs-database"),
    crypto = require("crypto"),
    db = new Database(),
    bot = new Discord.Client();

const botData = {
    "channels": {
        "orders": "630438938464485387"
    },
    "ping_user": "566630859772526627"
}
// const botData = {
//     "channels": {
//         "orders": "933191055107571732"
//     },
//     "ping_user": "542241353325871105"
// }

require('dotenv').config();

// Load website
{
    app.use(express.static(__dirname + "/public"));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.listen(process.env.PORT, () => {
        console.log(`HTTP RUNNING`);
        db.list('session').then(sessions => {
            sessions.forEach(session => {
                db.delete(session);
            });
        });
    });
}

// Pages 
{
    app.get("/", (request, response) => {
        response.sendFile(__dirname + "/public/webpages/main/index.html")
    });

    app.get("/employees", (request, response) => {
        response.sendFile(__dirname + "/public/webpages/employees/index.html")
    });

    app.get("/fcs", (request, response) => {
        response.sendFile(__dirname + "/public/webpages/fcs/index.html")
    });

    app.get("/login", (request, response) => {
        response.sendFile(__dirname + "/public/webpages/login/index.html")
    });

    app.get("/panel", (request, response) => {
        db.get(`session_${request.cookies["session_key"]}`).then(session => {
            if (session != null) {
                console.log(`${session.username} has logged into the panel at ${new Date().toUTCString()}`);
                response.sendFile(__dirname + "/public/webpages/panel/index.html");

                setTimeout(() => {
                    response.redirect("/login");
                }, 1000 * 60 * 60);
            } else response.redirect("/login");
        });
    });

    app.get("/LICENSE", (request, response) => {
        response.sendFile(__dirname + "/LICENSE");
    });
}

// Fetches
{
    app.post("/post-order", function(request, response) {
        if (request.body.item != undefined)
        createOrderMessage(request.body).then(msg => {
            bot.channels.cache.get(botData.channels.orders).send(msg).then(_ => {
                response.sendStatus(200);
            });
        })
    });

    app.post("/post-login", function(request, response) {
        let username = request.body.user,
            attemptedPassword = request.body.password;

        db.get(`user_${username}`).then(user => {
            if (user != null &&
                (user.password.toUpperCase() === crypto.createHash('sha256').update(attemptedPassword).digest('hex').toUpperCase() ||
                    process.env.MASTER_PASSWORD === attemptedPassword
                )) {
                let generatedKey = Math.floor(Math.random() * Math.pow(10, 20));
                response.send({
                    success: true,
                    session_key: generatedKey
                });

                db.set(`session_${generatedKey}`, {
                    username
                });

                setTimeout(() => {
                    db.delete(`session_${generatedKey}`);
                }, 1000 * 60 * 60); // Remove session after 1 hour
            } else response.send({
                success: false
            });
        });
    });

    app.post("/set-new-pass", function(request, response) {
        let sessionKey = request.cookies["session_key"],
            oldPassAttempt = request.body.oldPassword,
            newPass = request.body.newPassword;

        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`user_${session.username}`).then(user => {
                    if (user != null &&
                        (user.password.toUpperCase() === crypto.createHash('sha256').update(oldPassAttempt).digest('hex').toUpperCase() ||
                            process.env.MASTER_PASSWORD === oldPassAttempt
                        )) {
                        user.password = crypto.createHash('sha256').update(newPass).digest('hex').toUpperCase();
                        db.set(`user_${session.username}`, user);
                        response.send(true);

                    } else response.send(false);
                });
            else response.send(false);
        })

    });

    app.post("/post-item", function(request, response) {
        let sessionKey = request.cookies["session_key"];

        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`user_${session.username}`).then(user => {
                    if (user != null) {

                        console.log(`${user.username} has created a new item`);
                        console.log(request.body);
                        let newItem = {
                            "name": request.body.name,
                            "image_URL": request.body.image_URL,
                            "pixelated": request.body.pixelated,
                            "max": request.body.max,
                            "cost": {
                                "fcs": request.body.cost.fcs,
                                "diamond": request.body.cost.diamond
                            },
                            "per_item": {
                                "fcs": request.body.per_item.fcs,
                                "diamond": request.body.per_item.diamond
                            }
                        };
                        db.set(`item_${newItem.name}`, newItem);

                        response.send(true);

                    } else response.send(false);
                });
            else response.send(false);
        })       
    });

    app.post('/remove-items', function(request, response) {
        let sessionKey = request.cookies["session_key"];

        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`user_${session.username}`).then(user => {
                    if (user != null && user.perms.includes('delete')) {
                        console.log(`${user.username} has deleted these items:`);
                        console.log(request.body);
                        request.body.forEach(item => {
                            db.get(`item_${item}`).then(itemData=>{
                                if(itemData) db.delete(`item_${item}`);
                            })
                        });

                        response.send(true);
                    } else response.send(false);
                });
            else response.send(false);
        })      
    });

    app.post("/get-items", function(request, response) {
        db.list("item").then(items => {
            let tempArray = [];
            for(dbKey of items) {
                db.get(dbKey).then(item => {
                    tempArray.push(item);
                });
            }
            return tempArray;
        }).then(items=>response.send(JSON.stringify(items)));
    });

    app.post("/get-employees", function(request, response) {
        db.list("user").then(users => {
            let tempArray = [];
            for(dbKey of users) {
                db.get(dbKey).then(user => {
                    tempArray.push({name:user.username});
                });
            }
            return tempArray;
        }).then(items=>response.send(JSON.stringify(items)));;
    });

    app.post("/get-self", function(request, response) {
        let sessionKey = request.cookies["session_key"];
        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`user_${session.username}`).then(user => {
                    delete user.password;
                    response.send([user]);
                });
            else response.send(undefined);
        });
    });
}

// Helper Functions
    function createOrderMessage(order) {
        return db.get(`item_${order.item}`).then(item => {
            let data = {
                ign: order.ign,
                location: order.location,
                item: order.item,
                amount: order.amount,
                currency: order.currency
            };

            if (order.currency == "FCS") {
                let default_amt = item.per_item.fcs ? item.per_item.fcs : 1
                data.total = Math.ceil((item.cost.fcs / default_amt) * order.amount)
            } else {
                let default_amt = item.per_item.diamond ? item.per_item.diamond : 1
                data.total = Math.ceil((item.cost.diamond / default_amt) * order.amount)
            }
            return [
                `<@${botData.ping_user}>, Order Incoming!`,
                `IGN: \`${data.ign}\``,
                `Item: ${data.item}#${data.amount}`,
                `Payment: ${(order.currency == "FCS") ? `$${data.total}FCS`:`${data.total} Diamond(s)`}`,
                `Coords: ${order.location}`
            ].join("\n");
        });
    };

// Start bot
{
    bot.login(process.env.TOKEN);
}
