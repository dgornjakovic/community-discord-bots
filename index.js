require("dotenv").config()
const Discord = require("discord.js")


const replaceString = require('replace-string');
const https = require('https');
const redis = require("redis");
let redisClient = null;

var fs = require('fs');

const clientTokenHolders = new Discord.Client();
clientTokenHolders.login(process.env.BOT_TOKEN_HOLDERS_COUNT);


const clientNecDao = new Discord.Client();
clientNecDao.login(process.env.BOT_TOKEN_NEC_DAO);

const puppeteer = require('puppeteer');

let holdersCount = 853;
setInterval(function () {
    try {
        https.get('https://api.bloxy.info/token/token_stat?token=0xcc80c051057b774cd75067dc48f8987c4eb97a5e&key=ACCVnTqQ9YRKK&format=structure', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    holdersCount = result[0].holders_count;
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000);


setInterval(function () {

    clientTokenHolders.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("779508126843535381").setNickname("NEC holders=" + holdersCount);
            //value.members.cache.get("779508126843535381").user.setActivity("marketcap=$" + getNumberLabel(btcMarketCap), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });


    clientNecDao.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("779720047769813013").setNickname("NEC DAO MEMBERS=" + daoHolders);
            value.members.cache.get("779720047769813013").user.setActivity("DAO locked=$" + getNumberLabel(DAObalance), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });

}, 45 * 1000);


var daoHolders = 130;

async function getDaoHolders() {
    try {
        console.log("Fetching Dao Holders");
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://alchemy.daostack.io/dao/0xe56b4d8d42b1c9ea7dda8a6950e3699755943de7/members/", {waitUntil: 'networkidle2'});
        await delay(15000);
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await delay(5000);
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await delay(5000);
        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('.A9766RuJrZ1KGQeSF-LoT');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })

        daoHolders = prices.length;
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from barnbridge.");
        console.log(e);
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

setInterval(getDaoHolders, 60 * 1000)


let DAObalance = 11000000;
setInterval(function () {
    try {
        https.get('https://api.bloxy.info/address/balance?address=0xDa490e9acc7f7418293CFeA1FF2085c60d573626&chain=eth&key=ACCVnTqQ9YRKK&format=structure', (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                    let result = JSON.parse(data);
                    DAObalance = result[0].balance;
                } catch (e) {
                    console.log(e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (e) {
        console.log(e);
    }
}, 60 * 1000);


function getNumberLabel(labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

        ? Math.round(Math.abs(Number(labelValue)) / 1.0e+9) + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(labelValue)) >= 1.0e+6

            ? Math.round(Math.abs(Number(labelValue)) / 1.0e+6) + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(labelValue)) >= 1.0e+3

                ? Math.round(Math.abs(Number(labelValue)) / 1.0e+3) + "K"

                : Math.abs(Number(labelValue));

}


// move the gas bot here
