const mineflayer = require('mineflayer')
const sleep = require('./utilities/sleep')
const autoEat = require('./actions/autoEat')
const fs = require('fs')
const discord = require('discord.js')
const killAura = require('./actions/killAura')

let rawdata = fs.readFileSync('./config.json');
let config = JSON.parse(rawdata);

const discordBot = new discord.Client()
runDiscordBot(discordBot)

const options = {
    host:config.minecraft.serverIP,
    port: config.minecraft.serverPort,
    username: config.minecraft.user,
    password: config.minecraft.pass,
    version: false,
    physicsEnabled: false
}

var bot = mineflayer.createBot(options)
bindEvents(bot)

let mcData
bot.on('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

function bindEvents(bot) {
    bot.on('end', function() {
        console.log("Bot has ended")
        setTimeout(relog, 30000)
    })
}

function relog() {
    console.log("Attempting to reconnect...")
    bot = mineflayer.createBot(options)
    bindEvents(bot)
}

let counter = 95

bot.on('spawn', async () => {
    while (true){
        counter+=1
        if(counter == 100){
            const healthChannel = await discordBot.channels.fetch(config.discord.healthChannel)
            const hungerChannel = await discordBot.channels.fetch(config.discord.hungerChannel)
            const expChannel = await discordBot.channels.fetch(config.discord.expChannel)
            var expString = bot.experience.level + " " + Math.round((Math.round(100*bot.experience.progress)/100)*100) + "%"
            expChannel.send(expString)
            hungerChannel.send(bot.food)
            healthChannel.send(bot.health)
            counter = 0
        }
        const food = bot.food
        if(food <= config.minecraft.food){
            const ateChannel = await discordBot.channels.fetch(config.discord.eatChannel)
            ateChannel.send('ate')
            await autoEat(bot,mcData)
        }
        else{
            await killAura(bot,config)
            await sleep(625)
        }
    }
})

async function runDiscordBot(discordBot) {
    
    const token = config.discord.token
    await discordBot.login(token)

    const chatBridgeMessageChannel = await discordBot.channels.fetch(config.discord.chatChannel)

    bot.on('message', async message => {
    chatBridgeMessageChannel.send(message.toString())
    })

    discordBot.on("message", msg => {
        if (msg.author.id!= config.discord.botID) {
          bot.chat(msg.content,bot)
        }
      })
}