/**
 * Created by Elshad Seyidmammadov on 11.04.2016.
 */
var solver, _constraints;
_constraints = [];
var cassowary = c;
var innerWidthVar = new cassowary.Variable({
  value: window.innerWidth
});
var innerHeightVar = new cassowary.Variable({
  value: window.innerHeight
});
solver = new cassowary.SimplexSolver();
solver.autoSolve = false;
var Box = cassowary.inherit({
  initialize: function (properties) {
    if (properties) {
      this._id = properties.id || "box" + new Date().getTime();
      if (properties.layoutData) {
        this.prepareLayoutValues(properties.layoutData);
      } else {
        this.defaultValues();
      }
      this._background = properties.background || "red";
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
      this._top = createValue("_top", cassowary.plus(top[0]._bottom.value, top[1]));
    } else {
      this._top = createValue("_top", top || 0);
    }
  },
  leftValue: function (left) {
    if (left instanceof Array) {
      this._left = createValue("_left", cassowary.plus(left[0]._right.value, left[1]));
    } else {
      this._left = createValue("_left", left || 0);
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
      this._bottom = createValue("_bottom", cassowary.plus(bottom[0]._top.value, bottom[1]));
    } else {
      this._bottom = createValue("_bottom", bottom || 0);
    }
  },
  rightValue: function (right) {
    if (right instanceof Array) {
      this._right = createValue("_right", cassowary.plus(right[0]._left.value, right[1]));
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
    this.centerXConstraints();
    this.centerYConstraints();
    this.widthConstraints();
    this.heightConstraints();
    this.bottomConstraints();
    this.rightConstraints();
  },
  centerXConstraints: function () {
    if (this.centerX || this.centerX == 0) {
      var centerXConstraintLeft = new cassowary.Equation(this._left,
        cassowary.minus(cassowary.divide(innerWidthVar.value, 2),
        cassowary.minus(cassowary.divide(this._width.value, 2),
        this.centerX, cassowary.Strength.required, 1)),
        cassowary.Strength.required, 1);
      addConstraint(centerXConstraintLeft);
    }
  },
  centerYConstraints: function () {
    if (this.centerY || this.centerY == 0) {
      var centerYConstraintTop = new cassowary.Equation(this._top,
        cassowary.minus(cassowary.divide(innerHeightVar.value, 2),
        cassowary.minus(cassowary.divide(this._height.value, 2),
        this.centerY, cassowary.Strength.required, 1)),
        cassowary.Strength.required, 1);
      addConstraint(centerYConstraintTop);
    }
  },
  widthConstraints: function () {
    if (this._width.value == 0) {
      var widthConstraint = new cassowary.Equation(this._width,
        cassowary.minus(this._right.value, this._left.value), cassowary.Strength.required, 1);
      addConstraint(widthConstraint);
    }
  },
  heightConstraints: function () {
    if (this._height.value == 0) {
      var heightConstraint = new cassowary.Equation(this._height,
        cassowary.minus(this._bottom.value, this._top.value), cassowary.Strength.required, 1);
      addConstraint(heightConstraint);
    }
  },
  bottomConstraints: function () {
    if (this._bottom.value == 0) {
      var bottomConstraint = new cassowary.Equation(this._bottom,
        cassowary.plus(this._top.value, this._height.value), cassowary.Strength.required, 1);
      addConstraint(bottomConstraint);
    }
  },
  rightConstraints: function () {
    if (this._right.value == 0) {
      var rightConstraint = new cassowary.Equation(this._right,
        cassowary.plus(this._left.value, this._width.value), cassowary.Strength.required, 1);
      addConstraint(rightConstraint);
    }
  },
  get id() {
    return this._id;
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
    this._element = document.createElement('div');
    this._element.className = 'box';
    this._element.style.width = this.width + "px";
    this._element.style.height = this.height + "px";
    this._element.style.background = this.background;
    this._element.style.position = "fixed";
    this._element.style.top = this.top + "px";
    this._element.style.left = this.left + "px";
    this._element.style.textAlign = "center";
    this._element.style.color = "white";
    this._element.innerHTML = this.id;
    document.body.appendChild(this._element);
  }
});
var createValue = function (n, val) {
  return new cassowary.Variable({
    name: n,
    value: val
  });
};
// window.addEventListener("resize", function (event) {
// document.body.innerHTML = "";
// innerHeightVar.value = window.innerHeight;
// innerWidthVar.value = window.innerWidth;
// boxThree.prepareLayoutValues(boxThree.layoutData);
// boxThree.layout();
// });
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