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
      paywallvalidation: this.paywallvalidation.bind(this),
      pageviewOmnitureOnly: this.pageviewOmnitureOnly.bind(this),
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
      /* eslint-disable consistent-return */
      this.script = pOmniture.then(() => {
        /* global window */
        if (typeof window === 'undefined' || !window.s_gi) {
          return false;
        }
        const sOmnitureObject = window.s_gi(this.config.account);
        // If plugins are enabled Omniture has a "doPlugins" callback
        function doPluginsDefault() {
          return true;
        }
        let doPlugins = {};
        if (this.config.initialProps.usePlugins && this.config.doPlugins) {
          doPlugins = this.config.doPlugins;
        } else {
          doPlugins = doPluginsDefault;
        }

        Object.assign(
          this,
          this.config.initialProps.usePlugins ? LoadOmniturePlugins() : {},
          { doPlugins },
        );

        this.trackingObject = Object.assign(
          sOmnitureObject,
          this.config.initialProps.usePlugins ? LoadOmniturePlugins() : {},
          { doPlugins },
          this.config.initialProps
        );
        // Expose Omniture for Maximiser.
        window.s = sOmnitureObject;
      }).catch((scriptError) => {
        /* eslint-disable no-console */
        console.error('An error loading or executing Omniture has occured: ', scriptError);
        /* eslint-enable no-console */
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
  customEvent(payload, customEventCallback, customEventName = 'pageview') {
    return this.ensureScriptHasLoaded().then(() => {
      const newPayload = this.generatePayload(payload, customEventName);
      if (newPayload) {
        this.track(newPayload, customEventCallback);
      }
    }).catch((customEventError) => {
      /* eslint-disable no-console */
      console.error(customEventError.stack);
      /* eslint-enable no-console */
    });
  }

  pageview(payload) {
    return this.customEvent(payload);
  }

  // Some pages could be behind a paywall, we want send the data after the
  // validation of the paywall.
  paywallvalidation(payload) {
    return this.customEvent(payload, () => true, 'paywallvalidation');
  }

  // In some case is necessary call a pageview not listened by others.
  pageviewOmnitureOnly(payload) {
    return this.customEvent(payload, () => true, 'pageviewOmnitureOnly');
  }

  click(payload, clickCallback) {
    return this.ensureScriptHasLoaded().then(() => (
      this.trackLink(this.generatePayload(payload, 'click'), clickCallback)
    ));
  }

  track(additionalTrackingProps, trackCallback) {
    const newTrackingObject = Object.assign(
      this.trackingObject,
      additionalTrackingProps
    );
    // `t` is Omniture's Track function.
    const omnitureTrackingPixel = newTrackingObject.t();
    if (omnitureTrackingPixel && typeof window !== 'undefined' && window.document) {
      window.document.write(omnitureTrackingPixel);
    }
    return Promise.resolve().then(trackCallback);
  }

  trackLink(additionalTrackingProps, tracklinkCallback) {
    return new Promise((resolve) => {
      const newTrackingObject = Object.assign(
        this.trackingObject,
        additionalTrackingProps
      );
      // LinkType and linkName are mandatory.
      if (!newTrackingObject.linkType || !newTrackingObject.linkName) {
        // Prevent errot for old browsers.
        if (typeof console === 'undefined') {
          /* eslint-disable no-native-reassign */
          console = {
            log() {
              return true;
            },
          };
          /* eslint-enable no-native-reassign */
        }
        /* eslint-disable no-console */
        console.log('LinkType and linkName are mandatory and should be provided.');
        /* eslint-enable no-console */
      } else {
        // `tl` is Omniture's TrackLink function.
        newTrackingObject.tl(
          true,
          newTrackingObject.linkType,
          newTrackingObject.linkName,
          newTrackingObject.variableOverrides,
          () => {
            if (tracklinkCallback) {
              tracklinkCallback();
            }
            resolve();
          },
        );
      }
    });
  }
}
