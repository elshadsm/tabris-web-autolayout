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
    //if (top instanceof Array) {
    //  this._top = createValue("_top", cassowary.plus(top[0]._bottom.value, this.verticalResize(this, top[1]).value));
    //} else {
    //  this._top = createValue("_top", top ? this.verticalResize(this, top).value : -1);
    //}
  },
  leftValue: function (left) {
    if (left) {
      this._left = this.acceptValue("_left", left);
    } else {
      this._left = createValue("_left", -1);
    }
    //if (left instanceof Array) {
    //  this._left = createValue("_left", cassowary.plus(left[0]._right.value, this.horizontalResize(this, left[1]).value));
    //} else {
    //  this._left = createValue("_left", left ? this.horizontalResize(this, left).value : -1);
    //}
  },
  widthValue: function (width) {
    if (width) {
      this._width = this.acceptValue("_width", width);
    } else {
      this._width = createValue("_width", 0);
    }

    //if (width instanceof Array) {
    //  this._width = createValue("_width", cassowary.plus(width[0].width.value, this.horizontalResize(this, width[1]).value));
    //} else {
    //  this._width = createValue("_width", width ? this.horizontalResize(this, width).value : 0);
    //}
  },
  heightValue: function (height) {
    if (height) {
      this._height = this.acceptValue("_height", height);
    } else {
      this._height = createValue("_height", 0);
    }
    //if (height instanceof Array) {
    //  this._height = createValue("_height", cassowary.plus(height[0].height.value, this.verticalResize(this, height[1]).value));
    //} else {
    //  this._height = createValue("_height", height ? this.verticalResize(this, height).value : 0);
    //}
  },
  bottomValue: function (bottom) {
    if (bottom || bottom === 0) {
      this._bottom = this.acceptValue("_bottom", bottom);
    } else {
      this._bottom = createValue("_bottom", 0);
    }
    //if (bottom instanceof Array) {
    //  this._bottom = createValue("_bottom", cassowary.plus(bottom[0]._top.value, this.verticalResize(this, bottom[1]).value));
    //} else {
    //  this._bottom = createValue("_bottom", bottom == 0 ? window.innerHeight : bottom ? window.innerHeight - this.verticalResize(this, bottom).value : 0);
    //}
  },
  rightValue: function (right) {
    if (right || right === 0) {
      this._right = this.acceptValue("_right", right);
    } else {
      this._right = createValue("_right", 0);
    }
    //if (right instanceof Array) {
    //  this._right = createValue("_right", cassowary.plus(right[0]._left.value, this.horizontalResize(this, right[1]).value));
    //} else {
    //  this._right = createValue("_right", right == 0 ? window.innerWidth : right ? window.innerWidth - this.horizontalResize(this, right).value : 0);
    //}
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
    var valueFirst = variable[0];
    var valueSecond = variable[1];
    var percentage;
    var percentagePixels;
    var boxId;
    var box;

    if (variable instanceof Array) {
      if (typeof valueFirst === 'string' || valueFirst instanceof String) {
        valueFirst = valueFirst.trim();
        if (valueFirst.indexOf("%") > -1) {
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
        } else if (valueFirst.indexOf("#") > -1) {

          boxId = valueFirst.substring(valueFirst.indexOf("#") + 1);
          box = getBoxById(boxId);

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
        } else {
          return createValue(type, cassowary.plus(parseInt(valueFirst), this.resizeSingleValue(type, valueSecond).value));
        }
      } else {
        return createValue(type, cassowary.plus(valueFirst, this.resizeSingleValue(type, valueSecond).value));

      }
      //  //this._width = createValue("_width", cassowary.plus(width[0].width.value, this.horizontalResize(this, width[1]).value));
    } else {
      var value = variable;
      if (typeof value === 'string' || value instanceof String) {
        value = value.trim();
        if (value.indexOf("%") > -1) {
          percentage = value.substring(0, value.indexOf("%"));
          if (type === '_top' || type === '_bottom' || type === '_height') {
            percentagePixels = percentage * screenHeightVariable.value / 100;
            percentagePixels = this.verticalResize(this, percentagePixels).value;
          } else {
            percentagePixels = percentage * screenWidthVariable.value / 100;
            percentagePixels = this.horizontalResize(this, percentagePixels).value;
          }
          return createValue(type, percentagePixels);

        } else if (value.indexOf("#") > -1) {

          boxId = value.substring(value.indexOf("#") + 1);
          box = getBoxById(boxId);

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
        } else {
          value = parseInt(value);
          return this.resizeValue(type, value);
        }
      } else {
        return this.resizeValue(type, value);
      }
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
    var _child_element = document.createElement('div');
    _child_element.className = 'child-box';
    var self = this;
    child.child.forEach(function (childObject, idx) {
      _child_element.appendChild(self.childLayout(childObject));
    });
    _child_element.style.background = child.background;
    _child_element.style.position = "absolute";
    _child_element.style.top = child.top + "px";
    _child_element.style.left = child.left + "px";
    this.boxContent(_child_element, child.data);
    this.computeSize(_child_element, child);
    return _child_element;
  },
  computeSize: function (element, object) {
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
    var differenceHeight;
    var differenceWidth;
    if ((screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth)) {
      differenceHeight = screenHeightVariable.value - currentHeight;
      differenceWidth = screenWidthVariable.value - currentWidth;
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
    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      differenceHeight = currentHeight - screenHeightVariable.value;
      differenceWidth = currentWidth - screenWidthVariable.value;
      if (differenceHeight > differenceWidth) {
        difference = differenceWidth;
      } else {
        difference = differenceHeight;
      }
      return new cassowary.Variable({
        value: c.times(value,
          c.divide(c.plus(screenWidthVariable.value, difference), screenWidthVariable.value))
      });

    }
    return new cassowary.Variable({value: value});
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
    var differenceHeight;
    var differenceWidth;
    if ((screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth)) {
      differenceHeight = screenHeightVariable.value - currentHeight;
      differenceWidth = screenWidthVariable.value - currentWidth;
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
    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      differenceHeight = currentHeight - screenHeightVariable.value;
      differenceWidth = currentWidth - screenWidthVariable.value;
      if (differenceHeight > differenceWidth) {
        difference = differenceWidth;
      } else {
        difference = differenceHeight;
      }
      return new cassowary.Variable({
        value: c.times(value,
          c.divide(c.plus(screenHeightVariable.value, difference), screenHeightVariable.value))
      });

    }
    return new cassowary.Variable({value: value});
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
    var differenceHeight;
    var differenceWidth;
    if ((screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth)) {
      differenceHeight = screenHeightVariable.value - currentHeight;
      differenceWidth = screenWidthVariable.value - currentWidth;
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
    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      differenceHeight = currentHeight - screenHeightVariable.value;
      differenceWidth = currentWidth - screenWidthVariable.value;
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
    }
    return new cassowary.Variable({value: value});
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