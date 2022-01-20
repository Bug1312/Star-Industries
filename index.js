const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    Discord = require("discord.js"),
    bot = new Discord.Client();

const botData = require(__dirname + "/public/data/bot.json"),
    itemData = require(__dirname + "/public/data/items.json");

require('dotenv').config();

// Load website
{
    app.use(express.static(__dirname + "/public"));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.listen(process.env.PORT, () => {
        console.log(`HTTP RUNNING`);
    });
}

// Pages 
{
    app.get("/", (request, response) => {
        response.sendFile(__dirname + "/public/webpage/index.html")
    });

    app.get("/LICENSE", (request, response) => {
        response.sendFile(__dirname + "/LICENSE");
    });
}

// Fetches
{
    app.post("/post-order", function(request, response) {
        if (request.body.item != undefined)
            bot.channels.cache.get(botData.channels.orders).send(createOrderMessage(request.body)).then(m => {
                response.sendStatus(200);
            });
    });
}

// Helper Functions
{

    function createOrderMessage(order) {
        let item = itemData.find(i => i.name == order.item),
        data = {
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
    };
}

// Start bot
{
    bot.login(process.env.TOKEN);
}