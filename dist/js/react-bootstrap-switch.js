/* ========================================================================
 * react-bootstrap-switch - v3.5.0
 * https://github.com/Julusian/react-bootstrap-switch
 * ========================================================================
 * Copyright 2012-2015 Julian Waller
 *
 * Released under the MIT license
 * ========================================================================
 */

(function() {
  var React, findDOMNode;

  React = require('react');

  findDOMNode = require('react-dom').findDOMNode;

  module.exports = React.createClass({
    defaults: {
      state: true,
      size: null,
      animate: true,
      disabled: false,
      readonly: false,
      indeterminate: false,
      inverse: false,
      onColor: "primary",
      offColor: "default",
      onText: "ON",
      offText: "OFF",
      labelText: " ",
      handleWidth: "auto",
      labelWidth: "auto",
      baseClass: "bootstrap-switch",
      wrapperClass: "wrapper"
    },
    getInitialState: function() {
      return {
        state: this._prop('state'),
        handleWidth: this._prop('handleWidth'),
        labelWidth: this._prop('labelWidth'),
        offset: null,
        skipAnimation: true,
        dragStart: false,
        focus: false,
        disabled: this._prop('disabled'),
        readonly: this._prop('readonly'),
        indeterminate: this._prop('indeterminate')
      };
    },
    componentWillReceiveProps: function(nextProps) {
      this.disabled(!!nextProps.disabled);
      return this.value(nextProps.state, nextProps);
    },
    _prop: function(key) {
      if (typeof this.props[key] === 'undefined') {
        return this.defaults[key];
      } else {
        return this.props[key];
      }
    },
    value: function(val, nextProps) {
      var disabled, readonly;
      if (nextProps == null) {
        nextProps = {};
      }
      disabled = typeof nextProps.disabled === "undefined" ? this.state.disabled : nextProps.disabled;
      readonly = typeof nextProps.readonly === "undefined" ? this.state.readonly : nextProps.readonly;
      if (typeof val === "undefined") {
        return this.state.state;
      }
      if (disabled || readonly) {
        return this;
      }
      if (this.state.state === val) {
        return this;
      }
      this._changeState(!!val);
      return this;
    },
    valueState: function(val) {
      return this.value(val);
    },
    toggleState: function() {
      return this.toggleValue();
    },
    toggleValue: function() {
      if (this.state.disabled || this.state.readonly) {
        return this;
      }
      if (this.state.indeterminate) {
        return this._changeState(true);
      } else {
        return this._changeState(!this.state.state);
      }
    },
    disabled: function(value) {
      if (typeof value === "undefined") {
        return this.state.disabled;
      }
      value = !!value;
      if (value === this.state.disabled) {
        return this;
      }
      return this.toggleDisabled();
    },
    toggleDisabled: function() {
      this.setState({
        disabled: !this.state.disabled
      });
      return this;
    },
    readonly: function(value) {
      if (typeof value === "undefined") {
        return this.state.readonly;
      }
      value = !!value;
      if (value === this.state.readonly) {
        return this;
      }
      return this.toggleReadonly();
    },
    toggleReadonly: function() {
      this.setState({
        readonly: !this.state.readonly
      });
      return this;
    },
    handleWidth: function(value) {
      if (typeof value === "undefined") {
        return this.state.handleWidth;
      }
      this.setState({
        handleWidth: value
      }, (function(_this) {
        return function() {
          _this._width();
          return _this._containerPosition();
        };
      })(this));
      return this;
    },
    labelWidth: function(value) {
      if (typeof value === "undefined") {
        return this.state.labelWidth;
      }
      this.setState({
        labelWidth: value
      }, (function(_this) {
        return function() {
          _this._width();
          return _this._containerPosition();
        };
      })(this));
      return this;
    },
    _fireStateChange: function() {
      if (typeof this.props.onChange === "undefined") {
        return;
      }
      if (this.props.onChange.length >= 2) {
        return this.props.onChange(this, this.state.state);
      }
      return this.props.onChange(this.state.state);
    },
    _changeState: function(state) {
      return this.setState({
        indeterminate: false,
        state: state
      }, (function(_this) {
        return function() {
          _this._containerPosition();
          return _this._fireStateChange();
        };
      })(this));
    },
    _handleToggle: function(event, value) {
      event.preventDefault();
      event.stopPropagation();
      if (this.state.disabled || this.state.readonly) {
        return;
      }
      this._changeState(value);
      return this._handleElementFocus;
    },
    _handleOnClick: function(event) {
      return this._handleToggle(event, false);
    },
    _handleOffClick: function(event) {
      return this._handleToggle(event, true);
    },
    componentDidMount: function() {
      var init, initInterval, wrapperVisible;
      init = (function(_this) {
        return function() {
          return _this._width(function() {
            return _this._containerPosition(null);
          });
        };
      })(this);
      wrapperVisible = (function(_this) {
        return function() {
          var elem;
          elem = findDOMNode(_this._wrapper);
          return elem.offsetWidth > 0 && elem.offsetHeight > 0;
        };
      })(this);
      if (wrapperVisible()) {
        return init();
      } else {
        return initInterval = window.setInterval(function() {
          if (wrapperVisible()) {
            init();
            return window.clearInterval(initInterval);
          }
        }, 50);
      }
    },
    _width: function(callback) {
      var offWidth, onWidth, width;
      onWidth = findDOMNode(this._on).offsetWidth;
      offWidth = findDOMNode(this._off).offsetWidth;
      width = Math.max(onWidth, offWidth);
      return this.setState({
        handleWidth: width,
        labelWidth: width
      }, callback);
    },
    _containerPosition: function(state) {
      var skipAnimation, values;
      if (state == null) {
        state = this.state.state;
      }
      values = [0, "-" + this.state.handleWidth + "px"];
      skipAnimation = this.state.offset === null;
      if (this.state.indeterminate) {
        return this.setState({
          skipAnimation: skipAnimation,
          offset: "-" + (this.state.handleWidth / 2) + "px"
        });
      } else if (state) {
        return this.setState({
          skipAnimation: skipAnimation,
          offset: this._prop('inverse') ? values[1] : values[0]
        });
      } else {
        return this.setState({
          skipAnimation: skipAnimation,
          offset: this._prop('inverse') ? values[0] : values[1]
        });
      }
    },
    _handleElementChange: (function(_this) {
      return function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return _this._changeState(!_this.state.state);
      };
    })(this),
    _handleElementFocus: (function(_this) {
      return function(e) {
        if (e) {
          e.preventDefault();
        }
        return _this.setState({
          focus: true
        });
      };
    })(this),
    _handleElementBlur: (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.setState({
          focus: false
        });
      };
    })(this),
    _handleElementKeyDown: (function(_this) {
      return function(e) {
        if (!e.which || _this.state.disabled || _this.state.readonly) {
          return;
        }
        switch (e.which) {
          case 37:
            e.preventDefault();
            e.stopImmediatePropagation();
            return _this._changeState(false);
          case 39:
            e.preventDefault();
            e.stopImmediatePropagation();
            return _this._changeState(true);
        }
      };
    })(this),
    _handleLabelClick: function(e) {
      return e.stopPropagation();
    },
    _handleLabelMouseDown: function(e) {
      if (this.state.dragStart || this.state.disabled || this.state.readonly) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        indeterminate: false,
        dragStart: (e.pageX || e.nativeEvent.touches[0].pageX) - parseInt(this.state.offset, 10)
      });
      return this._handleElementFocus;
    },
    _handleLabelTouchStart: function(e) {
      return this._handleLabelMouseDown(e);
    },
    _handleLabelMouseMove: function(e) {
      var difference;
      if (this.state.dragStart == null) {
        return;
      }
      e.preventDefault();
      difference = (e.pageX || e.nativeEvent.touches[0].pageX) - this.state.dragStart;
      if (difference < -this.state.handleWidth || difference > 0) {
        return;
      }
      return this.setState({
        skipAnimation: false,
        offset: difference + "px",
        dragged: true
      });
    },
    _handleLabelTouchMove: function(e) {
      return this._handleLabelMouseMove(e);
    },
    _handleLabelMouseUp: function(e) {
      var difference, state;
      if (!this.state.dragStart) {
        return;
      }
      e.preventDefault();
      state = !this.state.state;
      if (this.state.dragged) {
        difference = parseInt(this.state.offset);
        state = difference > -(this.state.handleWidth / 2);
        state = this._prop('inverse') ? !state : state;
      }
      return this.setState({
        dragStart: false,
        dragged: false,
        state: state
      }, (function(_this) {
        return function() {
          _this._containerPosition();
          return _this._fireStateChange();
        };
      })(this));
    },
    _handleLabelTouchEnd: function(e) {
      return this._handleLabelMouseUp(e);
    },
    _handleLabelMouseLeave: function(e) {
      return this._handleLabelMouseUp(e);
    },
    render: function() {
      var containerWidth, label, offElm, onElm, wrapperClass, wrapperWidth;
      wrapperClass = (function(_this) {
        return function() {
          var classes;
          classes = ["" + (_this._prop('baseClass'))].concat(_this._prop('wrapperClass'));
          classes.push(_this.state.state ? (_this._prop('baseClass')) + "-on" : (_this._prop('baseClass')) + "-off");
          if (_this._prop('size') != null) {
            classes.push((_this._prop('baseClass')) + "-" + (_this._prop('size')));
          }
          if (_this.state.disabled) {
            classes.push((_this._prop('baseClass')) + "-disabled");
          }
          if (_this.state.readonly) {
            classes.push((_this._prop('baseClass')) + "-readonly");
          }
          if (_this.state.indeterminate) {
            classes.push((_this._prop('baseClass')) + "-indeterminate");
          }
          if (_this._prop('inverse')) {
            classes.push((_this._prop('baseClass')) + "-inverse");
          }
          if (_this._prop('id')) {
            classes.push((_this._prop('baseClass')) + "-id-" + (_this._prop('id')));
          }
          if (_this._prop('animate') && !_this.state.dragStart && !_this.state.skipAnimation) {
            classes.push((_this._prop('baseClass')) + "-animate");
          }
          if (_this.state.focus) {
            classes.push((_this._prop('baseClass')) + "-focused");
          }
          return classes.join(" ");
        };
      })(this)();
      onElm = React.createElement("span", {
        "ref": ((function(_this) {
          return function(c) {
            return _this._on = c;
          };
        })(this)),
        "style": {
          width: this.state.handleWidth
        },
        "onClick": this._handleOnClick,
        "className": (this._prop('baseClass')) + "-handle-on " + (this._prop('baseClass')) + "-" + (this._prop('onColor'))
      }, this._prop('onText'));
      label = React.createElement("span", {
        "className": (this._prop('baseClass')) + "-label",
        "style": {
          width: this.state.labelWidth
        },
        "ref": ((function(_this) {
          return function(c) {
            return _this._label = c;
          };
        })(this)),
        "onClick": this._handleLabelClick,
        "onMouseDown": this._handleLabelMouseDown,
        "onTouchStart": this._handleLabelTouchStart,
        "onMouseMove": this._handleLabelMouseMove,
        "onTouchMove": this._handleLabelTouchMove,
        "onMouseUp": this._handleLabelMouseUp,
        "onMouseLeave": this._handleLabelMouseLeave,
        "onTouchEnd": this._handleLabelTouchEnd
      }, this._prop('labelText'));
      offElm = React.createElement("span", {
        "ref": ((function(_this) {
          return function(c) {
            return _this._off = c;
          };
        })(this)),
        "style": {
          width: this.state.handleWidth
        },
        "onClick": this._handleOffClick,
        "className": (this._prop('baseClass')) + "-handle-off " + (this._prop('baseClass')) + "-" + (this._prop('offColor'))
      }, this._prop('offText'));
      containerWidth = this.state.labelWidth + this.state.handleWidth * 2;
      wrapperWidth = this.state.labelWidth + this.state.handleWidth;
      if (containerWidth === wrapperWidth) {
        containerWidth = wrapperWidth = "auto";
      }
      return React.createElement("div", {
        "className": wrapperClass,
        "ref": ((function(_this) {
          return function(c) {
            return _this._wrapper = c;
          };
        })(this)),
        "style": {
          width: wrapperWidth
        }
      }, React.createElement("div", {
        "className": (this._prop('baseClass')) + "-container",
        "ref": ((function(_this) {
          return function(c) {
            return _this._container = c;
          };
        })(this)),
        "style": {
          width: containerWidth,
          marginLeft: this.state.offset
        }
      }, (this._prop('inverse') ? offElm : onElm), label, (this._prop('inverse') ? onElm : offElm), React.createElement("input", {
        "type": 'checkbox',
        "onChange": this._handleElementChange,
        "onFocus": this._handleElementFocus,
        "onBlur": this._handleElementBlur,
        "onKeyDown": this._handleElementKeyDown
      })));
    }
  });

}).call(this);
