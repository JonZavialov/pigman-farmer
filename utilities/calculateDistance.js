function  calculateDistance(botPos, mobPos){
    var distX = Math.abs(Math.abs(botPos.x) - Math.abs(mobPos.x))
    var distZ = Math.abs(Math.abs(botPos.z) - Math.abs(mobPos.z))


    distX = distX * distX
    distZ = distZ * distZ

    var dist = distX + distZ
    dist = Math.sqrt(dist)

    return dist
}

module.exports = calculateDistance