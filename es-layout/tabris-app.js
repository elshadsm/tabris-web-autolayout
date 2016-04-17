/**
 * Created by Elshad Seyidmammadov on 12.04.2016.
 */
var boxOne = new Box({
  id: "firstBox",
  text: "Hello I am blue",
  layoutData: {left: 10, top: 10, width: 100, height: 100},
  background: "blue"
});

var boxRightCorner = new Box({
  id: "rightCornerBox",
  text: "and  I am blue",
  layoutData: {left: screen.width - 110, top: 10, width: 100, height: 100},
  background: "orange"
});
var boxThree = new Box({
  id: "thirdBox",
  text: "green",
  layoutData: {centerX: 0, centerY: 0, width: 100, height: 100},
  background: "green"
});
var boxThreeOuter = new Box({
  id: "thirdOuterBox",
  layoutData: {centerX: 0, centerY: 0, width: 200, height: 200},
  background: "red"
});
var boxTwo = new Box({
  id: "secondBox",
  layoutData: {
    left: [boxOne, 10], top: [boxOne, 10],
    right: [boxRightCorner, -10], bottom: [boxThreeOuter, -10]
  },
  background: "yellow"
});
var boxFour = new Box({
  id: "fourBox",
  layoutData: {left: [boxThreeOuter, 10], top: [boxThreeOuter, 10], width: 100, height: 100},
  background: "red"
});
var boxFive = new Box({
  id: "boxFive",
  layoutData: {left: [boxThreeOuter, -310], top: [boxThreeOuter, 10], width: 100, height: 100},
  background: "#aa8822"
});
var boxSix = new Box({
  layoutData: {left: 0, top: window.innerHeight - 50, width: screen.width, height: 50},
  background: "#11aa55"
});
layoutBoxes([boxOne, boxRightCorner, boxThreeOuter, boxThree, boxTwo, boxFour, boxFive, boxSix]);