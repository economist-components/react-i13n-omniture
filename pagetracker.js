'use strict';

exports.__esModule = true;
exports['default'] = tracker;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function tracker(Component, config) {
  var tracked = _react2['default'].createClass({
    displayName: 'tracked',

    componentDidMount: function componentDidMount() {
      this.emitPageView();
    },
    emitPageView: function emitPageView() {
      var _this = this;

      var pageInfo = reactI13n.getRootI13nNode()._model;
      ['title', 'template', 'topic', 'publishDate'].map(function (currentValue) {
        var newProp = {};
        if (config[currentValue]) {
          if (typeof config[currentValue] === 'function') {
            newProp = config[currentValue](_this);
          } else if (typeof config[currentValue] === 'string') {
            newProp = config[currentValue];
          }
        } else {
          newProp = _this.props[currentValue];
        }
        pageInfo[currentValue] = newProp;
      });
      reactI13n.execute('pageview', pageInfo);
    },
    render: function render() {
      return _react2['default'].createElement(Component, this.props);
    }
  });
  return tracked;
}

module.exports = exports['default'];