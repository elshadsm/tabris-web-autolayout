var boxOne = new Box({
  id: "boxOne",
  text: "I am box",
  layoutData: {left: 10, top: 10, width: 100, height: 100},
  background: "blue"
});

var boxRightCorner = new Box({
  id: "boxRightCorner",
  text: "I am right corner box",
  font: "italic bold 20px arial,serif",
  layoutData: {right: 10, top: 10, width: 100, height: 100},
  background: "orange"
});
var boxThreeOuter = new Box({
  id: "boxThreeOuter",
  layoutData: {centerX: 0, centerY: 0, width: 200, height: 200},
  background: "red"
});
var boxThree = new Box({
  id: "boxThree",
  img: "http://c.dryicons.com/images/icon_sets/minimalistica_part_2_icons/png/128x128/approve_notes.png",
  layoutData: {centerX: 0, centerY: 0, width: 100, height: 100},
  background: "green"
});

var boxTwo = new Box({
  id: "boxTwo",
  layoutData: {
    left: ["#boxOne", 10], top: ["#boxOne", 10],
    right: ["#boxRightCorner", -10], bottom: ["#boxThreeOuter", -10]
  },
  background: "yellow"
});
var boxFour = new Box({
  id: "boxFour",
  layoutData: {left: ["#boxThreeOuter", 10], top: ["#boxThreeOuter", 10], width: 100, height: 100},
  background: "red"
});
var boxFive = new Box({
  id: "boxFive",
  layoutData: {right: ["#boxThreeOuter", -10], top: ["#boxThreeOuter", 10], width: 100, height: 100},
  background: "#aa8822"
});
var boxSix = new Box({
  id: "boxSix",
  layoutData: {left: 0, bottom: 0, width: "100%", height: 50},
  background: "#11aa55"
});
layoutBoxes([boxOne, boxRightCorner, boxThreeOuter, boxThree, boxTwo, boxFour, boxFive, boxSix]);