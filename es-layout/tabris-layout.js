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
      this._relation = [];
      this._constraintsAdded = [];
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
    }
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
    if (top instanceof Array) {
      this._top = createValue("_top", cassowary.plus(top[0]._bottom.value, this.topValueResizeSize(this, top[1]).value));
      this._relation.top = true;
    } else {
      this._top = createValue("_top", top || -1);
    }
  },
  leftValue: function (left) {
    if (left instanceof Array) {
      this._left = createValue("_left", cassowary.plus(left[0]._right.value, this.leftValueResizeSize(this, left[1]).value));
      this._relation.left = true;
    } else {
      this._left = createValue("_left", left || -1);
    }
  },
  widthValue: function (width) {
    if (width instanceof Array) {
      this._width = createValue("_width", cassowary.plus(width[0].width.value, width[1]));
    } else {
      this._width = createValue("_width", width || 0);
    }
  },
  heightValue: function (height) {
    if (height instanceof Array) {
      this._height = createValue("_height", cassowary.plus(height[0].height.value, height[1]));
    } else {
      this._height = createValue("_height", height || 0);
    }
  },
  bottomValue: function (bottom) {
    if (bottom instanceof Array) {
      this._bottom = createValue("_bottom", cassowary.plus(bottom[0]._top.value, this.topValueResizeSize(this, bottom[1]).value));
      this._relation.bottom = true;
    } else {
      this._bottom = createValue("_bottom", bottom || 0);
    }
  },
  rightValue: function (right) {
    if (right instanceof Array) {
      this._right = createValue("_right", cassowary.plus(right[0]._left.value, this.leftValueResizeSize(this, right[1]).value));
      this._relation.right = true;
    } else {
      this._right = createValue("_right", right || 0);
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

  constraints: function () {
    this._callResize = true;
    this.centerXConstraints();
    this.centerYConstraints();
    this.topConstraints();
    this.leftConstraints();
    this.widthConstraints();
    this.heightConstraints();
    this.resizeConstraints();
    this.bottomConstraints();
    this.rightConstraints();
  },
  centerXConstraints: function () {
    if (this.centerX || this.centerX == 0) {
      this.resizeConstraints();
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
      this.resizeConstraints();
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
      this._constraintsAdded.width = true;
    }
  },
  heightConstraints: function () {
    if (this._height.value == 0 && this._bottom.value > 0 && this._top.value > -1) {
      var heightConstraint = new cassowary.Equation(this._height,
        cassowary.minus(this._bottom.value, this._top.value), cassowary.Strength.required, 1);
      addConstraint(heightConstraint);
      this._constraintsAdded.height = true;

    }
  },
  resizeConstraints: function () {
    if (this._callResize) {
      this.resizeSize(this);
      this._callResize = false;
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
    if (data.text) {
      element.innerHTML = element.innerHTML + data.text;
    } else if (data.img) {
      var img = document.createElement("img");
      img.src = data.img;
      element.appendChild(img);
    }
  },
  resizeSize: function (object) {
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;
    var differenceHeight;
    var differenceWidth;
    if (object._width.value > 0) {
      if (this._constraintsAdded.width) {
        solver.addEditVar(object._width, c.Strength.medium, 501).beginEdit();
        solver.suggestValue(object._width, c.times(object._width.value,
          c.divide(currentWidth, screenWidthVariable.value)));
        solver.resolve();
        solver.endEdit();
      } else {
        addConstraint(new cassowary.Equation(object._width, c.times(object._width.value,
          c.divide(currentWidth, screenWidthVariable.value))));
      }
    }
    if (!this._relation.left && object._left.value > 0) {
      addConstraint(new cassowary.Equation(object._left, c.times(object._left.value,
        c.divide(currentWidth, screenWidthVariable.value))));
    }

    if ((screenHeightVariable.value > currentHeight && screenWidthVariable.value > currentWidth)) {
      differenceHeight = screenHeightVariable.value - currentHeight;
      differenceWidth = screenWidthVariable.value - currentWidth;
      var difference = 0;
      if (differenceHeight > differenceWidth) {
        difference = differenceWidth;
      } else {
        difference = differenceHeight;
      }
      if (object._height.value > 0) {
        if (this._constraintsAdded.height) {
          solver.addEditVar(object._height, c.Strength.medium, 1).beginEdit();
          solver.suggestValue(object._height, c.times(object._height.value,
            c.divide(c.minus(screenHeightVariable.value, difference), screenHeightVariable.value)));
          solver.resolve();
          solver.endEdit();
        } else {
          addConstraint(new cassowary.Equation(object._height, c.times(object._height.value,
            c.divide(c.minus(screenHeightVariable.value, difference), screenHeightVariable.value))));
        }
      }
      if (!this._relation.top && object._top.value > 0) {
        addConstraint(new cassowary.Equation(object._top, c.times(object._top.value,
          c.divide(c.minus(screenHeightVariable.value, difference), screenHeightVariable.value))));
      }

    } else if (screenWidthVariable.value < currentHeight && screenWidthVariable.value < currentWidth) {
      differenceHeight = currentHeight - screenHeightVariable.value;
      differenceWidth = currentWidth - screenWidthVariable.value;
      if (differenceHeight > differenceWidth) {
        difference = differenceWidth;
      } else {
        difference = differenceHeight;
      }
      if (object._height.value > 0) {
        if (this._constraintsAdded.height) {
          solver.addEditVar(object._height, c.Strength.medium, 1).beginEdit();
          solver.suggestValue(object._height, c.times(object._height.value,
            c.divide(c.plus(screenHeightVariable.value, difference), screenHeightVariable.value)));
          solver.resolve();
          solver.endEdit();
        } else {
          addConstraint(new cassowary.Equation(object._height, c.times(object._height.value,
            c.divide(c.plus(screenHeightVariable.value, difference), screenHeightVariable.value))));

        }
      }
      if (!this._relation.top && object._top.value > 0) {
        addConstraint(new cassowary.Equation(object._top, c.times(object._top.value,
          c.divide(c.plus(screenHeightVariable.value, difference), screenHeightVariable.value))));
      }
    }

  },
  leftValueResizeSize: function (object, value) {
    var currentWidth = window.innerWidth;
    return new cassowary.Variable({
      value: c.times(value,
        c.divide(currentWidth, screenWidthVariable.value))
    });
  },
  topValueResizeSize: function (object, value) {
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
function layoutBoxes(array) {
  array.forEach(function (box, idx) {
    box.layout();
    _boxes.push(box);
  });
}
function addConstraint(constraint) {
  solver.addConstraint(constraint);
  _constraints.push(constraint);
  solver.solve();
}