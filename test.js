var robot = require("robotjs")
 
// Speed up the mouse.
robot.setMouseDelay(1)
 
var screenSize = robot.getScreenSize()
var height = screenSize.height - 40
var width = screenSize.width

var x = Math.random() * width
var y = Math.random() * height
for (var x = 0; x < width; x++)
{
    y = height
    robot.moveMouseSmooth(x, y)
}