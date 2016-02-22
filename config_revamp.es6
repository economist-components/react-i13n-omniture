/* eslint-disable id-match */
import slugger from 'slugger';
import User from '@economist/user';
import OmnitureUtils from './OmnitureUtils';
function slug(string) {
  return slugger(String(string || ''), { replacement: '_' });
}
const isProductionEnv = (process.env.ENV === 'prod' && process.env.NODE_ENV === 'production');
const OmnitureConfig = {
  account: isProductionEnv ? 'economistcomprod' : 'economistcomdev',
  initialProps: {
    visitorNamespace: 'economist',
    trackingServer: 'stats.economist.com',
    trackingServerSecure: 'sstats.economist.com',
    dc: '122', // eslint-disable-line id-length
    linkTrackVars: [
      'pageName',
      'channel',
      'events',
      'prop1',
      'prop3',
      'prop4',
      'prop5',
      'prop11',
      'prop13',
      'prop14',
      'prop31',
      'prop34',
      'prop40',
      'prop41',
      'prop42',
      'prop46',
      'contextData.subsection',
    ].join(''),
    server: (typeof document === 'undefined') ? '' : document.location.hostname,
    // web or print, They depend by the source of the articles.
    prop3: 'print',
    eVar3: 'print',
    charSet: 'ISO-8859-1',
    /* Conversion Config */
    currencyCode: 'USD',
    /* eslint-disable no-script-url */
    linkInternalFilters: 'javascript:,economist.com,economistsubscriptions.com,brightcove.com,doubleclick.net',
  },
  // Set the URL of the Omniture script you want to use.
  /* eslint-disable arrow-body-style */
  campaignTracking: true,
  campaignStackingTracking: true,
  externalScript: '/assets/omniture_h254.min.js',
  eventHandlers: {
    click: (nodeProps) => {
      // CustType+">"+Linkcontainer+">"+LinkNumber+">"+LinkName
      const linkInfo = [ User.getUserType() ];
      if (nodeProps.component){
        linkInfo.push(slug(nodeProps.component))
      }
      // If it's part of a list, send the one-index value
      if (nodeProps.listIndex){
        linkInfo.push(nodeProps.listIndex)
      }
      if (nodeProps.element){
        linkInfo.push(slug(nodeProps.element))
      }
      const prop45 = linkInfo.join('>');
      // linkType is the type of custom link you want Omniture to track.
      // This can be ‘d’ for file download, ‘o’ for custom link or ‘e’ for exit link.
      return {
        linkType: 'o',
        linkName: nodeProps.element,
        variableOverrides: {
          prop45
        },
      }
    },
    pageview: (nodeProps) => {
      // Specs for this part here https://docs.google.com/spreadsheets/d/1aSNSeDOmv_mZvmhE-aCo8yAvdK7FW3udLiHJ_YhwpKA/edit#gid=1234313404
      let articleSource = {};
      if (nodeProps.articleSource) {
        articleSource = {
          prop3: nodeProps.articleSource,
          eVar3: nodeProps.articleSource,
        };
      }
      // template: 'article' or 'section|home'
      // topic: e.g. 'Politics';
      // Enforce with default values for nodeProps
      nodeProps = {
        product: '',
        topic: '',
        title: '',
        template: '',
        ...nodeProps,
      };
      let pageName = '';
      if (nodeProps.template === 'channel') {
        pageName = `${slug(nodeProps.product)}|home`;
      } else {
        pageName = [
          slug(nodeProps.product)
        ];
        if(nodeProps.topic){
          pageName.push(slug(nodeProps.topic));
        }
        if(nodeProps.title){
          pageName.push(slug(nodeProps.title));
        }
        pageName = pageName.join('|');
      }

      let ArticleTitle = [
        slug(nodeProps.product)
      ];
      if(nodeProps.title){
        ArticleTitle.push(slug(nodeProps.title));
      } else {
        if(nodeProps.topic){
          ArticleTitle.push(slug(nodeProps.topic));
        }
        ArticleTitle.push('home');
      }
      ArticleTitle = ArticleTitle.join('|');

      let userSubscription = '';
      if (OmnitureUtils.userSubscription().indexOf('|') > -1) {
        userSubscription = OmnitureUtils.userSubscription();
      } else {
        userSubscription = `${OmnitureUtils.userSubscription()}|none`;
      }

      const output = {
        channel: slug(nodeProps.channel),
        pageName,
        pageURL: location.href,
        contextData: {
          subsection: (nodeProps.topic) ? slug(nodeProps.topic) : '',
          revampid: 'revamp_ecom|0216',
        },
        prop1: slug(`${nodeProps.channel}_${nodeProps.topic}`),
        prop2: slug(`${nodeProps.channel}_${nodeProps.topic}`),
        prop4: slug(nodeProps.template),
        prop5: ArticleTitle,
        prop6: OmnitureUtils.graphShot(),
        prop8: OmnitureUtils.hourOfTheDay(),
        prop10: OmnitureUtils.fullDate(),
        prop11: OmnitureUtils.userLoggedIn(),
        prop13: userSubscription,
        prop31: OmnitureUtils.articlePublishDate(nodeProps.publishDate),
        prop32: location.href,
        prop34: OmnitureUtils.deviceDetection(),
        prop40: User.getUserId(),
        prop46: User.isMultiUserLicense() ? 'MUL-IP' : '',
        prop53: OmnitureUtils.subscriptionRemaningMonths(),
        prop54: OmnitureUtils.expiredSubscriptionInfo(),
        eVar1: slug(`${nodeProps.channel}_${nodeProps.topic}`),
        eVar4: slug(nodeProps.template),
        eVar5: ArticleTitle,
        eVar6: OmnitureUtils.graphShot(),
        eVar34: OmnitureUtils.deviceDetection(),
        eVar8: OmnitureUtils.hourOfTheDay(),
        eVar10: OmnitureUtils.fullDate(),
        eVar11: OmnitureUtils.userLoggedIn(),
        eVar13: userSubscription,
        eVar31: OmnitureUtils.articlePublishDate(nodeProps.publishDate),
        eVar32: location.href,
        eVar40: User.getUserId(),
        eVar46: User.isMultiUserLicense() ? 'MUL-IP' : '',
        events: 'event2',
        ...articleSource,
      };
      return output;
    },
  },
};
export default OmnitureConfig;
