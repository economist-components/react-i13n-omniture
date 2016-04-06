/* eslint-disable id-match */
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _slugger = require('slugger');

var _slugger2 = _interopRequireDefault(_slugger);

var _economistUser = require('@economist/user');

var _economistUser2 = _interopRequireDefault(_economistUser);

var _OmnitureUtils = require('./OmnitureUtils');

var _OmnitureUtils2 = _interopRequireDefault(_OmnitureUtils);

function slug(string) {
  return _slugger2['default'](String(string || ''), { replacement: '_' });
}

var OmnitureConfig = {
  account: process.env.NODE_ENV === 'production' ? 'economistcomprod' : 'economistcomdev',
  initialProps: {
    visitorNamespace: 'economist',
    trackingServer: 'stats.economist.com',
    trackingServerSecure: 'sstats.economist.com',
    dc: '122', // eslint-disable-line id-length
    linkTrackVars: ['pageName', 'channel', 'events', 'prop1', 'prop3', 'prop4', 'prop5', 'prop11', 'prop13', 'prop14', 'prop31', 'prop34', 'prop40', 'prop41', 'prop42', 'prop46', 'contextData.subsection'].join(''),
    server: typeof document === 'undefined' ? '' : document.location.hostname,
    // web or print, They depend by the source of the articles.
    prop3: 'print',
    eVar3: 'print',
    charSet: 'ISO-8859-1',
    /* Conversion Config */
    currencyCode: 'USD',
    /* eslint-disable no-script-url */
    linkInternalFilters: 'javascript:,economist.com,economistsubscriptions.com,brightcove.com,doubleclick.net',
    usePlugins: true
  },
  // Set the URL of the Omniture script you want to use.
  /* eslint-disable arrow-body-style */
  campaignTracking: true,
  campaignStackingTracking: true,
  externalScript: '/assets/omniture_h254.min.js',
  eventHandlers: {
    click: function click(nodeProps) {
      return {
        // Just a fake manipulation
        linkType: nodeProps.product,
        linkName: nodeProps.element
      };
    },
    pageview: function pageview(nodeProps) {
      // Specs for this part here https://docs.google.com/spreadsheets/d/1aSNSeDOmv_mZvmhE-aCo8yAvdK7FW3udLiHJ_YhwpKA/edit#gid=1234313404
      var articleSource = {};
      if (nodeProps.articleSource) {
        articleSource = {
          prop3: nodeProps.articleSource,
          eVar3: nodeProps.articleSource
        };
      }
      // template: 'article' or 'section|home'
      // topic: e.g. 'Politics';
      // Enforce with default values for nodeProps
      nodeProps = _extends({
        product: '',
        topic: '',
        title: '',
        template: ''
      }, nodeProps);
      var pageName = '';
      if (nodeProps.template === 'channel') {
        pageName = slug(nodeProps.product) + '|home';
      } else {
        pageName = [slug(nodeProps.product)];
        if (nodeProps.topic) {
          pageName.push(slug(nodeProps.topic));
        }
        if (nodeProps.title) {
          pageName.push(slug(nodeProps.title));
        }
        pageName = pageName.join('|');
      }

      var ArticleTitle = [slug(nodeProps.product)];
      if (nodeProps.title) {
        ArticleTitle.push(slug(nodeProps.title));
      } else {
        if (nodeProps.topic) {
          ArticleTitle.push(slug(nodeProps.topic));
        }
        ArticleTitle.push('home');
      }
      ArticleTitle = ArticleTitle.join('|');

      var output = _extends({
        channel: slug(nodeProps.channel),
        pageName: pageName,
        pageURL: location.href,
        contextData: {
          subsection: nodeProps.topic ? slug(nodeProps.topic) : ''
        },
        prop1: slug(nodeProps.channel + '_' + nodeProps.topic),
        prop4: slug(nodeProps.template),
        prop5: ArticleTitle,
        prop6: _OmnitureUtils2['default'].graphShot(),
        prop8: _OmnitureUtils2['default'].hourOfTheDay(),
        prop10: _OmnitureUtils2['default'].fullDate(),
        prop11: _OmnitureUtils2['default'].userLoggedIn(),
        prop13: _OmnitureUtils2['default'].userSubscription(),
        prop31: _OmnitureUtils2['default'].articlePublishDate(nodeProps.publishDate),
        prop32: location.href,
        prop34: _OmnitureUtils2['default'].deviceDetection(),
        prop40: '',
        prop53: _OmnitureUtils2['default'].subscriptionRemaningMonths(),
        prop54: _OmnitureUtils2['default'].expiredSubscriptionInfo(),
        eVar1: slug(nodeProps.channel + '_' + nodeProps.topic),
        eVar4: slug(nodeProps.template),
        eVar5: ArticleTitle,
        eVar6: _OmnitureUtils2['default'].graphShot(),
        eVar34: _OmnitureUtils2['default'].deviceDetection(),
        eVar8: _OmnitureUtils2['default'].hourOfTheDay(),
        eVar10: _OmnitureUtils2['default'].fullDate(),
        eVar11: _OmnitureUtils2['default'].userLoggedIn(),
        eVar13: _OmnitureUtils2['default'].userSubscription(),
        eVar31: _OmnitureUtils2['default'].articlePublishDate(nodeProps.publishDate),
        eVar32: location.href,
        eVar40: '',
        events: 'event2'
      }, articleSource);
      console.info('Omniture payload', output);
      return output;
    }
  }
};
exports['default'] = OmnitureConfig;
module.exports = exports['default'];