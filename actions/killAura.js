const calculateDistance = require('../utilities/calculateDistance')

function killAura(bot,config){
    const mobFilter = e => e.type === 'mob'
        const mob = bot.nearestEntity(mobFilter)
        if (mob){
            const botPos = bot.player.entity['position']
            const mobPos = mob.position
            
            const distance = calculateDistance(botPos, mobPos)
            
            if(!(distance > config.minecraft.distance || mobPos.y >= config.minecraft.portalY)){
                bot.lookAt(mobPos, true, () => {
                    bot.attack(mob)
                })
            }
        }
}

module.exports = killAura