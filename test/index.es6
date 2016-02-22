import ReactI13nOmniture from '../index';
import spies from 'chai-spies';
import cookie from 'react-cookie';
import OmnitureUtils from '../OmnitureUtils';
import User from '@economist/user';

chai.use(spies);

const pluginConfig = {
  account: process.env.NODE_ENV === 'production' ? 'economistprod' : 'economistdev',
  initialConfig: {
    visitorNamespace: 'economist',
    trackingServer: 'stats.economist.com',
    trackingServerSecure: 'sstats.economist.com',
    dc: '122',
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
  // Set the URL of the Omniture script you want to use.
  externalScript: '//umbobabo.github.io/react-i13n-omniture/assets/omniture_h254.min.js',
  eventHandlers: {
    click: (nodeProps) => {
      // Just a fake manipulation
      return {
        fakeProps: 'fakeManipulation'
      };
    },
    pageview: (nodeProps) => {
      // Just a fake manipulation
      return {
        fakeProps: 'fakeManipulation'
      };
    },
  },
};
const plugin = new ReactI13nOmniture(pluginConfig);

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
    describe('pageview event interface', () => {
      it('it expose a method with 2 arguments that calls a Omniture track method', ()=> {
        // TODO finish the test implementation
        // var pageviewTrack = chai.spy(plugin, 'track');
        // const func = function(){};
        // const payload = {};
        // plugin.pageview(payload, func);
        // debugger;
        // pageviewTrack.should.have.been.called.with({
        //   fakeProps: 'fakeManipulation'
        // }, func);
      });
    });
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
        it('it return Less_than_1_MO if the subscription is due to expire', () => {
          var now = new Date();
          var month = now.getMonth()+1;
          month = (month < 10) ? `0${month}` : month;
          var tomorrow = now.getDate()+1;
          tomorrow = ((tomorrow) < 10) ? `0${tomorrow}` : tomorrow;
          const expiresDate = `${now.getFullYear()}/${month}/${tomorrow}`;
          const subscriberInformation = `registered|ent-product-A*2011/02/16|${expiresDate}|ent-product-A`;
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths().should.equal('Less_than_1_MO');
        });
        it('it return <numberOfRemaningMonths>MO if more than 1 month is remaining', () => {
          var now = new Date();
          var month = now.getMonth()+3;
          month = (month < 10) ? `0${month}` : month;
          var tomorrow = now.getDate()+1;
          tomorrow = ((tomorrow) < 10) ? `0${tomorrow}` : tomorrow;
          const expiresDate = `${now.getFullYear()}/${month}/${tomorrow}`;
          const subscriberInformation = `registered|ent-product-A*2011/02/16|${expiresDate}|ent-product-A`;
          cookie.save('ec_omniture_user_sub', subscriberInformation);
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths().should.equal('2MO');
        });
        it('it return empty string if no information is available', () => {
          cookie.remove('ec_omniture_user_sub');
          User.setMultiUserLicense(false);
          OmnitureUtils.subscriptionRemaningMonths().should.equal('');
        });
      });
    });
  });
});
