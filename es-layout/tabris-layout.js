/**
 * Created by Elshad Seyidmammadov on 11.04.2016.
 */
var solver, _constraints, _boxes;
_constraints = [];
_boxes = [];
var cassowary = c;

var screenWidthVariable = new cassowary.Variable({
  value: screen.width
});
var screenHeightVariable = new cassowary.Variable({
  value: screen.height - (screen.height - window.outerHeight) - (window.outerHeight - window.innerHeight)
});
var innerWidthVariable = new cassowary.Variable({
  value: window.innerWidth
});
var innerHeightVariable = new cassowary.Variable({
  value: window.innerHeight
});
solver = new cassowary.SimplexSolver();
solver.autoSolve = false;
var Box = cassowary.inherit({
  initialize: function (properties) {
    if (properties) {
      this._id = properties.id || "box" + new Date().getTime();
      this._child = [];
      if (properties.parent) {
        properties.parent._child.push(this);
        this._parent = properties.parent;
        this._isChild = true;
      } else {
        this._parent = null;
        this._isChild = false;
      }
      if (properties.layoutData) {
        this.prepareLayoutValues(properties.layoutData);
      } else {
        this.defaultValues();
      }
      this._background = properties.background || "red";
      this._data = [];
      if (properties.img) {
        this._data.img = properties.img;
      }
      if (properties.text) {
        this._data.text = properties.text;
      }
      if (properties.font) {
        this._data.font = properties.font;
      }
    }
    _boxes.push(this);

  },
  defaultValues: function () {
    this._layoutData = null;
    this._top = createValue("_top", 0);
    this._left = createValue("_left", 0);
    this._width = createValue("_width", 0);
    this._height = createValue("_height", 0);
    this._bottom = createValue("_bottom", 0);
    this._right = createValue("_right", 0);
    this._centerX = null;
    this._centerY = null;
  },
  prepareLayoutValues: function (layoutData) {
    this._layoutData = layoutData;
    this.topValue(layoutData.top);
    this.leftValue(layoutData.left);
    this.widthValue(layoutData.width);
    this.heightValue(layoutData.height);
    this.bottomValue(layoutData.bottom);
    this.rightValue(layoutData.right);
    this.centerXValue(layoutData.centerX);
    this.centerYValue(layoutData.centerY);
    this.constraints();
  },
  topValue: function (top) {
    if (top) {
      this._top = this.acceptValue("_top", top);
    } else {
      this._top = createValue("_top", -1);
    }
  },
  leftValue: function (left) {
    if (left) {
      this._left = this.acceptValue("_left", left);
    } else {
      this._left = createValue("_left", -1);
    }
  },
  widthValue: function (width) {
    if (width) {
      this._width = this.acceptValue("_width", width);
    } else {
      this._width = createValue("_width", 0);
    }
  },
  heightValue: function (height) {
    if (height) {
      this._height = this.acceptValue("_height", height);
    } else {
      this._height = createValue("_height", 0);
    }
  },
  bottomValue: function (bottom) {
    if (bottom || bottom === 0) {
      this._bottom = this.acceptValue("_bottom", bottom);
    } else {
      this._bottom = createValue("_bottom", 0);
    }
  },
  rightValue: function (right) {
    if (right || right === 0) {
      this._right = this.acceptValue("_right", right);
    } else {
      this._right = createValue("_right", 0);
    }
  },
  centerXValue: function (centerX) {
    if (centerX) {
      this._centerX = centerX;
    } else if (centerX == 0) {
      this._centerX = 0;
    } else {
      this._centerX = null;
    }
  },
  centerYValue: function (centerY) {
    if (centerY) {
      this._centerY = centerY;
    } else if (centerY == 0) {
      this._centerY = 0;
    } else {
      this._centerY = null;
    }
  },

  acceptValue: function (type, variable) {
    var result = [];
    if (typeof variable === 'string' || variable instanceof String) {
      variable = variable.trim();
      result = variable.split(" ");
    }
    if (result.length > 1) {
      variable = result;
    }
    if (variable instanceof Array) {
      var valueFirst = variable[0];
      var valueSecond = variable[1];
      return this.acceptArrayValue(type, valueFirst, valueSecond);
    } else {
      return this.acceptSingleValue(type, variable);
    }
  },
  acceptSingleValue: function (type, value) {
    if (typeof value === 'string' || value instanceof String) {
      value = value.trim();
      if (value.indexOf("%") > -1) {
        return this.acceptPercentageSingleValue(type, value);
      } else if (value.indexOf("#") > -1) {
        return this.acceptReferenceSingleValue(type, value);
      } else {
        value = parseInt(value);
        return this.resizeValue(type, value);
      }
    } else {
      return this.resizeValue(type, value);
    }
  },
  acceptPercentageSingleValue: function (type, value) {
    var percentage = value.substring(0, value.indexOf("%"));
    if (type === '_top' || type === '_bottom' || type === '_height') {
      var percentagePixels = percentage * screenHeightVariable.value / 100;
      percentagePixels = this.verticalResize(this, percentagePixels).value;
    } else {
      percentagePixels = percentage * screenWidthVariable.value / 100;
      percentagePixels = this.horizontalResize(this, percentagePixels).value;
    }
    return createValue(type, percentagePixels);
  },
  acceptReferenceSingleValue: function (type, value) {
    var boxId = value.substring(value.indexOf("#") + 1);
    var box = getBoxById(boxId);
    if (box != null) {
      if (type === '_top') {
        return createValue(type, box._bottom.value);
      } else if (type === '_bottom') {
        return createValue(type, box._top.value);
      } else if (type === '_height') {
        return createValue(type, box._height.value);
      } else if (type === '_left') {
        return createValue(type, box._right.value);
      } else if (type === '_right') {
        return createValue(type, box._left.value);
      } else if (type === '_width') {
        return createValue(type, box._width.value);
      }
    } else {
      return createValue(type, 0);
    }
  },
  acceptArrayValue: function (type, valueFirst, valueSecond) {
    if (typeof valueFirst === 'string' || valueFirst instanceof String) {
      valueFirst = valueFirst.trim();
      valueSecond = parseInt(valueSecond);
      if (valueFirst.indexOf("%") > -1) {
        return this.acceptPercentageArrayValue(type, valueFirst, valueSecond);
      } else if (valueFirst.indexOf("#") > -1) {
        return this.acceptReferenceArrayValue(type, valueFirst, valueSecond);
      } else {
        return createValue(type, cassowary.plus(parseInt(valueFirst), this.resizeSingleValue(type, valueSecond).value));
      }
    } else {
      return createValue(type, cassowary.plus(valueFirst, this.resizeSingleValue(type, valueSecond).value));
    }
  },
  acceptPercentageArrayValue: function (type, valueFirst, valueSecond) {
    var percentage;
    var percentagePixels;
    percentage = valueFirst.substring(0, valueFirst.indexOf("%"));
    if (type === '_top' || type === '_bottom' || type === '_height') {
      percentagePixels = percentage * screenHeightVariable.value / 100;
      percentagePixels = this.verticalResize(this, percentagePixels).value;
      return createValue(type, cassowary.plus(percentagePixels, this.verticalResize(this, valueSecond).value));
    } else {
      percentagePixels = percentage * screenWidthVariable.value / 100;
      percentagePixels = this.horizontalResize(this, percentagePixels).value;
      return createValue(type, cassowary.plus(percentagePixels, this.horizontalResize(this, valueSecond).value));
    }
  },
  acceptReferenceArrayValue: function (type, valueFirst, valueSecond) {
    var boxId = valueFirst.substring(valueFirst.indexOf("#") + 1);
    var box = getBoxById(boxId);
    if (box != null) {
      if (type === '_top') {
        return createValue(type, cassowary.plus(box._bottom.value, this.verticalResizeFixed(this, valueSecond).value));
      } else if (type === '_bottom') {
        return createValue(type, cassowary.plus(box._top.value, this.verticalResizeFixed(this, valueSecond).value));

      } else if (type === '_height') {
        return createValue(type, cassowary.plus(box._height.value, this.verticalResizeFixed(this, valueSecond).value));

      } else if (type === '_left') {
        return createValue(type, cassowary.plus(box._right.value, this.horizontalResizeFixed(this, valueSecond).value));

      } else if (type === '_right') {
        return createValue(type, cassowary.plus(box._left.value, this.horizontalResizeFixed(this, valueSecond).value));

      } else if (type === '_width') {
        return createValue(type, cassowary.plus(box._width.value, this.horizontalResizeFixed(this, valueSecond).value));
      }
    } else {
      return createValue(type, cassowary.plus(0, this.resizeSingleValue(type, valueSecond).value));
    }
  },
  resizeValue: function (type, value) {
    if (type === '_top') {
      return createValue(type, this.verticalResize(this, value).value);
    } else if (type === '_bottom') {
      return createValue(type, value == 0 ? window.innerHeight : value ? window.innerHeight -
      this.verticalResize(type, value).value : 0);
    } else if (type === '_height' || type === '_width') {
      return createValue(type, this.commonResize(this, value).value);
    } else if (type === '_right') {
      return createValue(type, value == 0 ? window.innerWidth : value ? window.innerWidth -
      this.horizontalResize(type, value).value : 0);
    } else {
      return createValue(type, this.horizontalResize(this, value).value);
    }
  },
  resizeSingleValue: function (type, value) {
    if (type === '_top' || type === '_bottom') {
      return this.verticalResize(this, value);
    } else if (type === '_height' || type === '_width') {
      return this.commonResize(this, value);
    } else {
      return this.horizontalResize(this, value);
    }
  },
  constraints: function () {
    this.centerXConstraints();
    this.centerYConstraints();
    this.topConstraints();
    this.leftConstraints();
    this.widthConstraints();
    this.heightConstraints();
    this.bottomConstraints();
    this.rightConstraints();
  },
  centerXConstraints: function () {
    if (this.centerX || this.centerX == 0) {
      if (this.parent) {
        if (this.parent.width > 0) {
          addConstraint(new cassowary.Equation(this._left, cassowary.minus(cassowary.divide(this.parent.width, 2),
            cassowary.minus(cassowary.divide(this._width.value, 2),
              this.centerX, cassowary.Strength.required, 1), cassowary.Strength.required, 1)));
        }
      } else {
        addConstraint(new cassowary.Equation(this._left,
          cassowary.minus(cassowary.divide(innerWidthVariable.value, 2),
            cassowary.minus(cassowary.divide(this._width.value, 2),
              this.centerX, cassowary.Strength.required, 1)),
          cassowary.Strength.required, 1));
      }
    }
  },
  centerYConstraints: function () {
    if (this.centerY || this.centerY == 0) {
      if (this.parent) {
        if (this.parent.height > 0) {
          addConstraint(new cassowary.Equation(this._top, cassowary.minus(cassowary.divide(this.parent.height, 2),
            cassowary.minus(cassowary.divide(this._height.value, 2),
              this.centerY, cassowary.Strength.required, 1), cassowary.Strength.required, 1)));
        }
      } else {
        addConstraint(new cassowary.Equation(this._top,
          cassowary.minus(cassowary.divide(innerHeightVariable.value, 2),
            cassowary.minus(cassowary.divide(this._height.value, 2),
              this.centerY, cassowary.Strength.required, 1)),
          cassowary.Strength.required, 1));
      }
    }
  },
  topConstraints: function () {
    if (this._top.value == -1) {
      if (this._bottom.value > 0 && this._height.value > 0) {
        addConstraint(new cassowary.Equation(this._top,
          cassowary.minus(this._bottom.value, this._height.value)));
      } else {
        addConstraint(new cassowary.Equation(this._top, 0, cassowary.Strength.required, 1));
      }
    }
  },
  leftConstraints: function () {
    if (this._left.value == -1) {
      if (this._right.value > 0 && this._width.value > 0) {
        addConstraint(new cassowary.Equation(this._left,
          cassowary.minus(this._right.value, this._width.value)));
      } else {
        addConstraint(new cassowary.Equation(this._left, 0, cassowary.Strength.required, 1));
      }
    }
  },
  widthConstraints: function () {
    if (this._width.value == 0 && this._right.value > 0 && this._left.value > -1) {
      var widthConstraint = new cassowary.Equation(this._width,
        cassowary.minus(this._right.value, this._left.value));
      addConstraint(widthConstraint);
    }
  },
  heightConstraints: function () {
    if (this._height.value == 0 && this._bottom.value > 0 && this._top.value > -1) {
      var heightConstraint = new cassowary.Equation(this._height,
        cassowary.minus(this._bottom.value, this._top.value), cassowary.Strength.required, 1);
      addConstraint(heightConstraint);
    }
  },
  bottomConstraints: function () {
    if (this._bottom.value == 0 && this._top.value > -1 && this._height.value > 0) {
      var bottomConstraint = new cassowary.Equation(this._bottom,
        cassowary.plus(this._top.value, this._height.value));
      addConstraint(bottomConstraint);
    }
  },
  rightConstraints: function () {
    if (this._right.value == 0 && this._left.value > -1 && this._width.value > 0) {
      var rightConstraint = new cassowary.Equation(this._right,
        cassowary.plus(this._left.value, this._width.value));
      addConstraint(rightConstraint);
    }
  },
  layout: function () {
    if (!this.isChild) {
      this._element = document.createElement('div');
      this._element.className = 'box';
      var self = this;
      this.child.forEach(function (childObject, idx) {
        self._element.appendChild(self.childLayout(childObject));
      });
      this._element.style.background = this.background;
      this._element.style.position = "absolute";
      this._element.style.top = this.top + "px";
      this._element.style.left = this.left + "px";
      this.boxContent(this._element, this.data);
      this.computeSize(this._element, this);
      document.body.appendChild(this._element);
    }
  },
  childLayout: function (child) {
    var child_element = document.createElement('div');
    child_element.className = 'child-box';
    var self = this;
    child.child.forEach(function (childObject, idx) {
      child_element.appendChild(self.childLayout(childObject));
    });
    child_element.style.background = child.background;
    child_element.style.position = "absolute";
    child_element.style.top = child.top + "px";
    child_element.style.left = child.left + "px";
    this.boxContent(child_element, child.data);
    this.computeSize(child_element, child);
    return child_element;
  },
  computeSize: function (element, object) {
    this.computeWidthSize(element, object);
    this.computeHeightSize(element, object);
  },
  computeHeightSize: function (element, object) {
    if (object.height > 0) {
      element.style.height = object.height + "px";
      element.style.overflowY = "hidden";
    } else {
      var maxHeight = this.childMaxSizeHeight(object);
      if (maxHeight > 0 && maxHeight > object.height) {
        object._height.value = maxHeight;
        element.style.height = object.height + "px";
      } else {
        element.style.height = "auto";
      }
    }
  },
  computeWidthSize: function (element, object) {
    if (object.width > 0) {
      element.style.width = object.width + "px";
      element.style.overflowX = "hidden";
      element.style.wordWrap = "break-word";
    } else {
      var maxRight = this.childMaxSizeWidth(object);
      if (maxRight > 0 && maxRight > object.width) {
        object._width.value = maxRight;
        element.style.width = object.width + "px";
      } else {
        element.style.width = "auto";
      }
    }
  },
  childMaxSizeWidth: function (element) {
    var maxRight = -1;
    element.child.forEach(function (childObject, idx) {
      if (maxRight < childObject.right) {
        maxRight = childObject.right;
      }
    });
    return maxRight;
  },
  childMaxSizeHeight: function (element) {
    var maxBottom = -1;
    element.child.forEach(function (childObject, idx) {
      if (maxBottom < childObject.bottom) {
        maxBottom = childObject.bottom;
      }
    });
    return maxBottom;
  },
  boxContent: function (element, data) {
    element.style.textAlign = "center";
    element.style.color = "black";
    if (data.font) {
      element.style.font = data.font;
    }
    if (data.text) {
      element.innerHTML = element.innerHTML + data.text;
    } else if (data.img) {
      var img = document.createElement("img");
      img.src = data.img;
      element.appendChild(img);
    }
  },
  horizontalResizeFixed: function (object, value) {
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;
    if ((screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth)) {
      return this.horizontalDecreaseResizeFixed(value, currentHeight, currentWidth);
    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      return this.horizontalIncreaseResizeFixed(value, currentHeight, currentWidth);
    }
    return new cassowary.Variable({value: value});
  },
  horizontalDecreaseResizeFixed: function (value, currentHeight, currentWidth) {
    var differenceHeight = screenHeightVariable.value - currentHeight;
    var differenceWidth = screenWidthVariable.value - currentWidth;
    var difference = 0;
    if (differenceHeight > differenceWidth) {
      difference = differenceWidth;
    } else {
      difference = differenceHeight;
    }
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(c.minus(screenWidthVariable.value, difference), screenWidthVariable.value))
    });
  },
  horizontalIncreaseResizeFixed: function (value, currentHeight, currentWidth) {
    var differenceHeight = currentHeight - screenHeightVariable.value;
    var differenceWidth = currentWidth - screenWidthVariable.value;
    var difference = 0;
    if (differenceHeight > differenceWidth) {
      difference = differenceWidth;
    } else {
      difference = differenceHeight;
    }
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(c.plus(screenWidthVariable.value, difference), screenWidthVariable.value))
    });
  },
  horizontalResize: function (object, value) {
    var currentWidth = window.innerWidth;
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(currentWidth, screenWidthVariable.value))
    });
  },
  verticalResizeFixed: function (object, value) {
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;
    if (( screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth )) {
      return this.verticalDecreaseResizeFixed(value, currentHeight, currentWidth);
    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      return this.verticalIncreaseResizeFixed(value, currentHeight, currentWidth);
    }
    return new cassowary.Variable({value: value});
  },
  verticalDecreaseResizeFixed: function (value, currentHeight, currentWidth) {
    var differenceHeight = screenHeightVariable.value - currentHeight;
    var differenceWidth = screenWidthVariable.value - currentWidth;
    var difference = 0;
    if (differenceHeight > differenceWidth) {
      difference = differenceWidth;
    } else {
      difference = differenceHeight;
    }
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(c.minus(screenHeightVariable.value, difference), screenHeightVariable.value))
    });
  },
  verticalIncreaseResizeFixed: function (value, currentHeight, currentWidth) {
    var differenceHeight = currentHeight - screenHeightVariable.value;
    var differenceWidth = currentWidth - screenWidthVariable.value;
    var difference = 0;
    if (differenceHeight > differenceWidth) {
      difference = differenceWidth;
    } else {
      difference = differenceHeight;
    }
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(c.plus(screenHeightVariable.value, difference), screenHeightVariable.value))
    });
  },
  verticalResize: function (object, value) {
    var currentHeight = window.innerHeight;
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(currentHeight, screenHeightVariable.value))
    });
  },
  commonResize: function (object, value) {
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;
    if ((screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth)) {
      return this.commonDecreaseResize(value, currentHeight, currentHeight);
    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      return this.commonIncreaseResize(value, currentHeight, currentHeight);
    }
    return new cassowary.Variable({value: value});
  },
  commonDecreaseResize: function (value, currentHeight, currentWidth) {
    var differenceHeight = screenHeightVariable.value - currentHeight;
    var differenceWidth = screenWidthVariable.value - currentWidth;
    if (differenceHeight > differenceWidth) {
      return new cassowary.Variable({
        value: c.times(value,
          c.divide(c.minus(screenWidthVariable.value, differenceWidth), screenWidthVariable.value))
      });
    } else {
      return new cassowary.Variable({
        value: c.times(value,
          c.divide(c.minus(screenHeightVariable.value, differenceHeight), screenHeightVariable.value))
      });
    }
  },
  commonIncreaseResize: function (value, currentHeight, currentWidth) {
    var differenceHeight = currentHeight - screenHeightVariable.value;
    var differenceWidth = currentWidth - screenWidthVariable.value;
    if (differenceHeight > differenceWidth) {
      return new cassowary.Variable({
        value: c.times(value,
          c.divide(c.plus(screenWidthVariable.value, differenceWidth), screenWidthVariable.value))
      });
    } else {
      return new cassowary.Variable({
        value: c.times(value,
          c.divide(c.plus(screenHeightVariable.value, differenceHeight), screenHeightVariable.value))
      });
    }
  },
  get id() {
    return this._id;
  },
  get parent() {
    return this._parent;
  },
  get child() {
    return this._child;
  },
  get isChild() {
    return this._isChild;
  },
  get layoutData() {
    return this._layoutData;
  },
  get top() {
    return this._top.value;
  },
  get left() {
    return this._left.value;
  },
  get right() {
    return this._right.value;
  },
  get bottom() {
    return this._bottom.value;
  },
  get width() {
    return this._width.value;
  },
  get height() {
    return this._height.value;
  },
  get centerX() {
    return this._centerX;
  },
  get centerY() {
    return this._centerY;
  },
  get background() {
    return this._background;
  },
  get data() {
    return this._data;
  },
  toString: function () {
    return "Box: { id: " + this.id +
      ", top: " + this.top +
      ", right: " + this.right +
      ", bottom: " + this.bottom +
      ", left: " + this.left +
      ", width: " + this.width +
      ", height: " + this.height + "" +
      ", centerX: " + this.centerX + "" +
      ", centerY: " + this.centerY + " " +
      ", background: " + this.background + "}\n";
  }
});
var createValue = function (n, val) {
  return new cassowary.Variable({
    name: n,
    value: val
  });
};
window.addEventListener("resize", function (event) {
  document.body.innerHTML = "";
  innerHeightVariable.value = window.innerHeight;
  innerWidthVariable.value = window.innerWidth;
  _boxes.forEach(function (box, idx) {
    box.prepareLayoutValues(box.layoutData);
  });
  _boxes.forEach(function (box, idx) {
    box.layout();
  });
});
var getBoxById = function (id) {
  var result = null;
  _boxes.forEach(function (box, idx) {
    if (box.id === id) {
      result = box;
      return true;
    }
  });
  return result;
};
function layoutBoxes(array) {
  array.forEach(function (box, idx) {
    box.layout();
  });
}
function addConstraint(constraint) {
  solver.addConstraint(constraint);
  _constraints.push(constraint);
  solver.solve();
}