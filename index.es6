import promisescript from 'promisescript';
import LoadOmniturePlugins from './OmniturePlugins';

export default class OmniturePlugin {

  constructor(config) {
    this.config = config;
  }

  get name() {
    return 'react-i13n-omniture';
  }

  get eventHandlers() {
    return {
      click: this.click.bind(this),
      pageview: this.pageview.bind(this),
    };
  }

  ensureScriptHasLoaded() {
    if (!this.script) {
      const pOmniture = typeof this.config.loadExternalScript === 'function' ?
        this.config.loadExternalScript() :
        promisescript({
          url: this.config.externalScript,
          type: 'script',
        });
      this.script = pOmniture.then(() => {
        if (typeof window === 'undefined' || !window.s_gi) {
          return false;
        }
        const props = {};
        for (let i = 1; i < 50; ++i) {
          props['prop' + i] = '';
        }
        let s = window.s_gi(this.config.account);
        // If plugins are enabled Omniture has a "doPlugins" callback
        const doPluginsDefault = function(){};
        const doPlugins = this.config.initialProps.usePlugins && this.config.doPlugins ? this.config.doPlugins : doPluginsDefault;

        Object.assign(
          this,
          this.config.initialProps.usePlugins ? LoadOmniturePlugins() : {},
          { doPlugins },
        );

        this.trackingObject = Object.assign(
          s,
          this.config.initialProps.usePlugins ? LoadOmniturePlugins() : {},
          { doPlugins },
          this.config.initialProps
        );
      }).catch(function(e) {
        console.error('An error loading or executing Omniture has occured: ', e);
      });
    }
    return this.script;
  }

  generatePayload(payload, eventName) {
    const eventHandler = this.config.eventHandlers[eventName];
    let props = {};

    if (payload && payload.i13nNode && payload.i13nNode.getMergedModel) {
      props = Object.assign(payload, payload.i13nNode.getMergedModel());
    }
    if (eventHandler) {
      return eventHandler(props, {}, this.trackingObject);
    }
    return props;
  }

  /* eslint-disable no-unused-vars */
  pageview(payload, callback) {
    return this.ensureScriptHasLoaded().then(() => (
      this.track(this.generatePayload(payload, 'pageview'), callback)
    ));
  }

  click(payload, callback) {
    return this.ensureScriptHasLoaded().then(() => (
      this.trackLink(this.generatePayload(payload, 'click'), callback)
    ));
  }

  track(additionalTrackingProps, callback) {
    const newTrackingObject = Object.assign(
      this.trackingObject,
      additionalTrackingProps
    );
    // `t` is Omniture's Track function.
    const omnitureTrackingPixel = newTrackingObject.t();
    if (omnitureTrackingPixel && typeof window !== 'undefined' && window.document) {
      window.document.write(omnitureTrackingPixel);
    }
    return Promise.resolve().then(callback);
  }

  trackLink(additionalTrackingProps, callback) {
    return new Promise((resolve) => {
      const newTrackingObject = Object.assign(
        this.trackingObject,
        additionalTrackingProps
      );
      // LinkType and linkName are mandatory.
      if(!newTrackingObject.linkType || !newTrackingObject.linkName){
        // Prevent errot for old browsers.
        if(typeof console === "undefined") {
          console = {
              log: function() { },
          };
        }
        console.log('LinkType and linkName are mandatory and should be provided.');
      } else {
        // `tl` is Omniture's TrackLink function.
        newTrackingObject.tl(
          true,
          newTrackingObject.linkType,
          newTrackingObject.linkName,
          newTrackingObject.variableOverrides,
          () => {
            if (callback) {
              callback();
            }
            resolve();
          },
        );
      }
    });
  }

};
