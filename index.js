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
        "orders": "1194836356933877821"
    },
    "ping_user": "363483005949444097"
}

require('dotenv').config();

// Load website
{
    app.use(express.static(__dirname + "/public"));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    try {
        const httpsCertOptions = {
            key: fs.readFileSync(`${process.env.CERT_FOLDER}/private.key.pem`),
            cert: fs.readFileSync(`${process.env.CERT_FOLDER}/domain.cert.pem`),
        }
        https.createServer(httpsCertOptions, app).listen(process.env.PORT, function() {
            console.log(`HTTPS RUNNING`);
        });
    } catch (err) {
        console.warn("Error running https; Running http");
        app.listen(process.env.PORT, function() {
            console.log(`HTTP RUNNING`);
        });
    }
}

// Pages 
{
    app.get("/", (request, response) => {
        response.sendFile(__dirname + "/public/webpages/main/index.html")
    });

    app.get("/employees", (request, response) => {
        response.sendFile(__dirname + "/public/webpages/employees/index.html")
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
        if (request.body.item != undefined) {
            let generatedKey = Math.floor(Math.random() * Math.pow(10, 20));
            db.set(`order_${generatedKey}`, request.body).then(_ => {
                createOrderMessage(request.body).then(msg => {
                    bot.channels.cache.get(botData.channels.orders).send(msg).then(_ => {
                        response.sendStatus(200);
                    }).catch(err => {
                        db.delete(`order_${generatedKey}`);
                        response.sendStatus(200);
                    });
                });
            });
        };
    });

    app.post("/get-orders", function(request, response) {
        let sessionKey = request.cookies["session_key"];

        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`user_${session.username}`).then(user => {
                    db.list("order_").then(orders => {
                        let tempArray = [];
                        for (dbKey of orders) {
                            let key = dbKey.replace('order_', '')
                            tempArray.push(
                                db.get(dbKey).then(order => {
                                    return calculateCost(order).then(total => {
                                        order.uuid = key;
                                        order.total = total;
                                        order.fetcher = user.username;
                                        return order
                                    })
                                })
                            )
                        }

                        Promise.all(tempArray).then(result => {
                            response.send(JSON.stringify(result))
                        });
                    });
                });
            else response.send(undefined);
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

                        console.log(`${user.username} has created a new item :`);
                        console.log(request.body);
                        let newItem = {
                            "name": request.body.name,
                            "image_URL": request.body.image_URL,
                            "pixelated": request.body.pixelated,
                            "max": request.body.max,
                            "cost": {
                                "diamond": request.body.cost.diamond
                            },
                            "per_item": {
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
                            db.get(`item_${item}`).then(itemData => {
                                if (itemData) db.delete(`item_${item}`);
                            })
                        });

                        response.send(true);
                    } else response.send(false);
                });
            else response.send(false);
        })
    });

    app.post("/get-items", function(request, response) {
        db.list("item_").then(items => {
            let tempArray = [];
            for (dbKey of items) {
                db.get(dbKey).then(item => {
                    tempArray.push(item);
                });
            }
            return tempArray;
        }).then(items => response.send(JSON.stringify(items)));
    });

    app.post("/get-employees", function(request, response) {
        db.list("user_").then(users => {
            let tempArray = [];
            for (dbKey of users) {
                db.get(dbKey).then(user => {
                    tempArray.push({
                        name: user.username
                    });
                });
            }
            return tempArray;
        }).then(items => response.send(JSON.stringify(items)));;
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

    app.post("/reserve-order", function(request, response) {
        let sessionKey = request.cookies["session_key"];
        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`order_${request.body.uuid}`).then(order => {
                    if (order != null) {
                        if (order.reserver == session.username) delete order.reserver;
                        else order.reserver = session.username;

                        db.set(`order_${request.body.uuid}`, order).then(_ => {
                            response.send(true);
                        });
                    }
                });
        });
    });

    app.post("/complete-order", function(request, response) {
        let sessionKey = request.cookies["session_key"];
        db.get(`session_${sessionKey}`).then(session => {
            if (session != null)
                db.get(`order_${request.body.uuid}`).then(order => {
                    db.delete(`order_${request.body.uuid}`).then(_ => {
                        console.log(`${session.username} completed this order:`);
                        console.log(order);
                        response.send(true);
                    });
                });
        });
    });
}

// Helper Functions
function createOrderMessage(order) {
    return calculateCost(order).then(total => {
        return [
            `<@${botData.ping_user}>, Order Incoming!`,
            `IGN: \`${order.ign}\``,
            `Item: ${order.item}#${order.amount}`,
            `Payment: ${total} Diamond(s)`,
            `Coords: ${order.location}`
        ].join("\n");
    });
};

function calculateCost(orderData) {
    return db.get(`item_${orderData.item}`).then(item => {
        let default_amt = item.per_item.diamond ? item.per_item.diamond : 1
        return Math.ceil((item.cost.diamond / default_amt) * orderData.amount)
    })
}

// Start bot
{
    bot.login(process.env.TOKEN);
}