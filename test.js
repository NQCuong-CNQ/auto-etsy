var robot = require("robotjs")

// Speed up the mouse.
robot.setMouseDelay(1)

var screenSize = robot.getScreenSize()
var height = screenSize.height - 40
var width = screenSize.width

main()
async function main() {
    await moveTheMouse()
}

async function moveTheMouse() {
    var x = Math.random() * width
    var y = Math.random() * height
    robot.moveMouseSmooth(x, y)
    await moveTheMouse()
}