'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _promisescript = require('promisescript');

var _promisescript2 = _interopRequireDefault(_promisescript);

var _OmniturePlugins = require('./OmniturePlugins');

var _OmniturePlugins2 = _interopRequireDefault(_OmniturePlugins);

var OmniturePlugin = (function () {
  function OmniturePlugin(config) {
    _classCallCheck(this, OmniturePlugin);

    this.config = config;
  }

  OmniturePlugin.prototype.ensureScriptHasLoaded = function ensureScriptHasLoaded() {
    var _this = this;

    if (!this.script) {
      var pOmniture = typeof this.config.loadExternalScript === 'function' ? this.config.loadExternalScript() : _promisescript2['default']({
        url: this.config.externalScript,
        type: 'script'
      });
      this.script = pOmniture.then(function () {
        if (typeof window === 'undefined' || !window.s_gi) {
          return false;
        }
        var props = {};
        for (var i = 1; i < 50; ++i) {
          props['prop' + i] = '';
        }
        var s = window.s_gi(_this.config.account);
        // If plugins are enabled Omniture has a "doPlugins" callback
        var doPluginsDefault = function doPluginsDefault() {};
        var doPlugins = _this.config.initialProps.usePlugins && _this.config.doPlugins ? _this.config.doPlugins : doPluginsDefault;

        Object.assign(_this, _this.config.initialProps.usePlugins ? _OmniturePlugins2['default']() : {}, { doPlugins: doPlugins });

        _this.trackingObject = Object.assign(s, _this.config.initialProps.usePlugins ? _OmniturePlugins2['default']() : {}, { doPlugins: doPlugins }, _this.config.initialProps);
      })['catch'](function (e) {
        console.error('An error loading or executing Omniture has occured: ', e);
      });
    }
    return this.script;
  };

  OmniturePlugin.prototype.generatePayload = function generatePayload(payload, eventName) {
    var eventHandler = this.config.eventHandlers[eventName];
    var props = {};

    if (payload && payload.i13nNode && payload.i13nNode.getMergedModel) {
      props = Object.assign(payload, payload.i13nNode.getMergedModel());
    }
    if (eventHandler) {
      return eventHandler(props, {}, this.trackingObject);
    }
    return props;
  };

  /* eslint-disable no-unused-vars */

  OmniturePlugin.prototype.pageview = function pageview(payload, callback) {
    var _this2 = this;

    return this.ensureScriptHasLoaded().then(function () {
      return _this2.track(_this2.generatePayload(payload, 'pageview'), callback);
    });
  };

  OmniturePlugin.prototype.click = function click(payload, callback) {
    var _this3 = this;

    return this.ensureScriptHasLoaded().then(function () {
      return _this3.trackLink(_this3.generatePayload(payload, 'click'), callback);
    });
  };

  OmniturePlugin.prototype.track = function track(additionalTrackingProps, callback) {
    var newTrackingObject = Object.assign(this.trackingObject, additionalTrackingProps);
    // `t` is Omniture's Track function.
    var omnitureTrackingPixel = newTrackingObject.t();
    if (omnitureTrackingPixel && typeof window !== 'undefined' && window.document) {
      window.document.write(omnitureTrackingPixel);
    }
    return Promise.resolve().then(callback);
  };

  OmniturePlugin.prototype.trackLink = function trackLink(additionalTrackingProps, callback) {
    var _this4 = this;

    return new Promise(function (resolve) {
      var newTrackingObject = Object.assign(_this4.trackingObject, additionalTrackingProps);
      // LinkType and linkName are mandatory.
      if (!newTrackingObject.linkType || !newTrackingObject.linkName) {
        // Prevent errot for old browsers.
        if (typeof console === "undefined") {
          console = {
            log: function log() {}
          };
        }
        console.log('LinkType and linkName are mandatory and should be provided.');
      } else {
        // `tl` is Omniture's TrackLink function.
        newTrackingObject.tl(true, newTrackingObject.linkType, newTrackingObject.linkName, newTrackingObject.variableOverrides, function () {
          if (callback) {
            callback();
          }
          resolve();
        });
      }
    });
  };

  _createClass(OmniturePlugin, [{
    key: 'name',
    get: function get() {
      return 'react-i13n-omniture';
    }
  }, {
    key: 'eventHandlers',
    get: function get() {
      return {
        click: this.click.bind(this),
        pageview: this.pageview.bind(this)
      };
    }
  }]);

  return OmniturePlugin;
})();

exports['default'] = OmniturePlugin;
;
module.exports = exports['default'];