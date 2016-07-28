/* eslint-disable id-match */
import ReactI13nOmniture from '../src/index';
import chai from 'chai';
import spies from 'chai-spies';
import cookie from 'react-cookie';
import OmnitureUtils from '../src/OmnitureUtils';
import User from '@economist/user';
import Config from '../src/config';
mocha.setup({ globals: [ 's_code', 's_objectID', 's_gi', 's_giqf', 's_giq',
's_an', 's_sp', 's_jn', 's_rep', 's_d', 's_fe', 's_fa', 's_ft', 's_c_il',
's_c_in', 's_i_economist' ] });
/* eslint-disable no-unused-vars */
const should = chai.should();
/* eslint-enable no-unused-vars */
chai.use(spies);

const pluginConfig = {
  account: process.env.NODE_ENV === 'production' ? 'economistprod' : 'economistdev',
  initialConfig: {
    visitorNamespace: 'economist',
    trackingServer: 'stats.economist.com',
    trackingServerSecure: 'sstats.economist.com',
    /* eslint-disable id-length */
    dc: '122',
    /* eslint-enable id-length */
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
    prop3: 'web',
  },
  externalScript: Config.externalScript,
  eventHandlers: {
    click(nodeProps) {
      // Just a fake manipulation
      return {
        fakeProps: 'fakeManipulation',
        ...nodeProps,
      };
    },
    pageview(nodeProps) {
      // Just a fake manipulation
      return {
        fakeProps: 'fakeManipulation',
        ...nodeProps,
      };
    },
  },
};
describe('OmniturePlugin is a i13n plugin for Omniture', () => {
  describe('ensureScriptHasLoaded', () => {
    it('calls loadExternalScript if it was passed', () => {
      const loadExternalScript = chai.spy(() => Promise.resolve());
      const plugin = new ReactI13nOmniture({ ...pluginConfig, loadExternalScript });
      plugin.ensureScriptHasLoaded();
      loadExternalScript.should.have.been.called.once();
    });
  });
  describe('it provides events interfaces', () => {
    describe('Omniture utils is a set of utilities', () => {
      describe('it gets information of the user type', () => {
        it('it can read user subscription information if cookie exist', () => {
          const subscriberInformation = 'registered|ent-product-A*2011/02/16|2014/09/30|ent-product-A';
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.userSubscription().should.equal(subscriberInformation.split('*')[0]);
        });
        it('it return anonymous if user subscription cookie is not present', () => {
          cookie.remove('ec_omniture_user_sub');
          OmnitureUtils.userSubscription().should.equal('anonymous');
        });
        it('it return bulk-IP if user is MUL', () => {
          User.setMultiUserLicense();
          OmnitureUtils.userSubscription().should.equal('bulk-IP');
        });
      });
      describe('it get information on the eventually expired subscription', () => {
        it('it return expired subscription values if are present', () => {
          const subscriberInformation = 'registered|ent-product-A*2011/02/16|2014/09/30|ent-product-A';
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          OmnitureUtils.expiredSubscriptionInfo().should.equal('2011/02/16|2014/09/30|ent-product-A');
        });
        it('it return emptry string if no expired subscription is present', () => {
          cookie.remove('ec_omniture_user_sub');
          OmnitureUtils.expiredSubscriptionInfo().should.equal('');
        });
      });
      describe('subscriptionRemaningMonths method', () => {
        it('it return EXPIRED if there is a subscription expired', () => {
          const subscriberInformation = 'registered|ent-product-A*2011/02/16|2011/09/30|ent-product-A';
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths().should.equal('EXPIRED');
        });
        it('it return EXPIRED if there is a recently expired subscription', () => {
          cookie.remove('ec_omniture_user_sub');
          const expiresDate = '2016/03/28';
          const subscriberInformation = `registered|ent-product-A*2011/02/16|${ expiresDate }|ent-product-A`;
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths().should.equal('EXPIRED');
        });
        it('it return Less_than_1_MO if the subscription is due to expire', () => {
          cookie.remove('ec_omniture_user_sub');
          const today = new Date('2016/03/30');
          const expiresDate = '2016/04/05';
          const subscriberInformation = `registered|ent-product-A*2011/02/16|${ expiresDate }|ent-product-A`;
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths(today).should.equal('Less_than_1_MO');
        });
        it('it return 1MO if 1 month is remaining', () => {
          cookie.remove('ec_omniture_user_sub');
          const today = new Date('2016/03/30');
          const expiresDate = '2016/05/05';
          const subscriberInformation = `registered|ent-product-A*2011/02/16|${ expiresDate }|ent-product-A`;
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths(today).should.equal('1MO');
        });
        it('it return 2MO if more than 2 but less than 3 months are remaining', () => {
          cookie.remove('ec_omniture_user_sub');
          const today = new Date('2016/03/30');
          const expiresDate = '2016/06/05';
          const subscriberInformation = `registered|ent-product-A*2011/02/16|${ expiresDate }|ent-product-A`;
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths(today).should.equal('2MO');
        });
        it('it return empty string if no information is available', () => {
          cookie.remove('ec_omniture_user_sub');
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths().should.equal('');
        });
      });
      describe('articlePublishDate', () => {
        it('should format date for omniture', () => {
          // Fri Jul 08 2016 01:00:00 GMT+0100 (WEST)
          const date = new Date(1467936000000);
          OmnitureUtils.articlePublishDate(date).should.equal('2016|07|08');
        });
      });
    });
  });
});
