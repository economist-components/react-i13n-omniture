/* eslint-disable id-match, id-length */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactI13n = require('react-i13n');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _demoapp = require('./demoapp');

var _demoapp2 = _interopRequireDefault(_demoapp);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var TrackedApp = _reactI13n.setupI13n(_demoapp2['default'], {
  rootModelData: {
    product: 'The World If'
  },
  isViewportEnabled: true
}, [new _index2['default'](_config2['default'])]);
exports['default'] = _react2['default'].createElement(TrackedApp, null);
module.exports = exports['default'];