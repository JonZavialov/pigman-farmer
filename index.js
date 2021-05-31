const mineflayer = require('mineflayer')
const calculateDistance = require('./utilities/calculateDistance')
const sleep = require('./utilities/sleep')
const fs = require('fs')

let rawdata = fs.readFileSync('./config.json');
let config = JSON.parse(rawdata);

const options = {
    host:config.minecraft.serverIP,
    port: config.minecraft.serverPort,
    username: config.minecraft.user,
    password: config.minecraft.pass,
    version: false
}


var bot = mineflayer.createBot(options)
bindEvents(bot)

const discord = require('discord.js')

const discordBot = new discord.Client()
runDiscordBot(discordBot)

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

let counter = 99

bot.on('spawn', async () => {
    setInterval(async () => {
        counter+=1
        if(counter == 100){
            const healthChannel = await discordBot.channels.fetch(config.discord.healthChannel)
            const hungerChannel = await discordBot.channels.fetch(config.discord.hungerChannel)
            hungerChannel.send(bot.food)
            healthChannel.send(bot.health)
            counter = 0
        }
        const food = bot.food
        if(food <= config.discord.food){
            const ateChannel = await discordBot.channels.fetch(config.discord.eatChannel)
            ateChannel.send('ate')
            bot.equip(mcData.itemsByName.golden_carrot.id, 'hand')
            bot.consume(function() {})
            await sleep(1700)
            bot.equip(mcData.itemsByName.netherite_sword.id, 'hand')
        }
        
        const mobFilter = e => e.type === 'mob'
        const mob = bot.nearestEntity(mobFilter)
        if (!mob) return
        
        const botPos = bot.player.entity['position']
        const mobPos = mob.position
        
        const distance = calculateDistance(botPos, mobPos)
        
        if(distance > config.minecraft.distance || mobPos.y >= config.minecraft.portalY) return
        
        bot.lookAt(mobPos, true, () => {
            console.log(mobPos)
            bot.attack(mob)
        })
    }, 625)
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