var backgroundBox = new Box({
  id: "background",
  layoutData: {top: 0, left: 0, bottom: 0, right: 0},
  background: "#ffaaff"
});


var boxOne = new Box({
  id: "boxOne",
  text: "uraaaaa",
  parent: backgroundBox,
  layoutData: {centerX: 0 , centerY: 0, width: 300, height: 300},
  background: "blue"
});

var boxOneRightTop = new Box({
  id: "boxOneRightTop",
  text: "Hello I am moon",
  parent: backgroundBox,
  layoutData: {left: [boxOne, 10] , bottom: [boxOne, -10],  width: 100, height: 100},
  background: "red"
});

var boxOneLeftBottom = new Box({
  id: "boxOneLeftBottom",
  text: "Hello I am star",
  parent: backgroundBox,
  layoutData: {right: [boxOne, -10] , top: [boxOne, 10],  width: 100, height: 100},
  background: "green"
});

var boxOneInsideCenter = new Box({
  id: "boxOneInsideCenter",
  img: "http://nuclearpixel.com/content/icons/2010-02-09_stellar_icons_from_space_from_2005/earth_128.png",
  parent: boxOne,
  layoutData: {centerX: 0 , centerY: 0, width: 100, height: 100},
  background: "white"
});


layoutBoxes( [ backgroundBox, boxOne, boxOneRightTop, boxOneLeftBottom, boxOneInsideCenter] );