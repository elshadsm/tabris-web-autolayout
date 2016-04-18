/**
 * Created by Elshad Seyidmammadov on 12.04.2016.
 */

var boxText = new Box({
  id: "textBox_Elshad_Seyidmammadov",
  layoutData: {left: 0, top: 0},
  background: "orange"
});

var boxSix = new Box({
  id: "sixBox",
  layoutData: {left: 0, top: 200, width: "100%", height: 400},
  background: "#119955"
});

var boxSeven = new Box({
  id: "sevenBox",
  parent: boxSix,
  layoutData: {top: 20, left: 500, width: 300, height: 300},
  background: "#000000"
});

var boxSevenInner = new Box({
  id: "boxSevenInner",
  parent: boxSeven,
  text: "Hello I am red box",
  layoutData: {top: 20, left: 10, width: 150, height: 150},
  background: "red"
});


var boxSevenInnerTop = new Box({
  id: "boxSevenInnerTop",
  parent: boxSeven,
  text: "green",
  layoutData: {left: ["#boxSevenInner", 0], top: 20, width: 50, height: 50},
  background: "green"
});

var boxSevenInnerBottom = new Box({
  id: "sevenInnerBoxBottom",
  parent: boxSeven,
  layoutData: {left: ["#boxSevenInner", 0], top: ["#boxSevenInnerTop", 0], width: 50, height: 50},
  background: "blue"
});

layoutBoxes( [ boxText, boxSix, boxSeven, boxSevenInner, boxSevenInnerTop ] );
