const sleep = require('../utilities/sleep')

async function autoEat(bot,mcData){
    bot.equip(mcData.itemsByName.golden_carrot.id, 'hand')
    bot.consume(function() {})
    await sleep(1700)
    bot.equip(mcData.itemsByName.netherite_sword.id, 'hand')
}

module.exports = autoEat