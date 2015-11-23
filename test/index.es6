import ReactI13nOmniture from '../index';
import spies from 'chai-spies';
import chaiDatetime from 'chai-datetime';
import OmnitureUtils from '../OmnitureUtils';

chai.use(spies);
chai.use(chaiDatetime);

const plugin = new ReactI13nOmniture({
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
});

describe('OmniturePlugin is a i13n plugin for Omniture', () => {
  it('it is a class and produce instances', () => {
    ReactI13nOmniture.name.should.equal('OminturePlugin');
    plugin.should.be.an.instanceof(ReactI13nOmniture);
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
  });
});

describe('OmnitureUtils is a set of utilities for reacti13nOmniturePlugin', () => {
  describe('it provides a set of utilities', () => {
    it('estFormatDate', () => {
      OmnitureUtils.estFormatDate(new Date('2015/3/26 11:00')).should.equalDate(new Date('Thu Mar 26 2015 06:00:00 GMT+0000 (GMT)'));
      OmnitureUtils.estFormatDate(new Date('2015/3/26 00:00')).should.equalDate(new Date('Wed Mar 25 2015 19:00:00 GMT+0000 (GMT)'));
    });
    it('hourOfTheDay', () => {
      OmnitureUtils.hourOfTheDay(new Date('2015/3/26 11:15')).should.equal('6:00AM');
      OmnitureUtils.hourOfTheDay(new Date('2015/3/26 11:35')).should.equal('6:30AM');
      OmnitureUtils.hourOfTheDay(new Date('2015/3/26 18:35')).should.equal('13:30PM');
      OmnitureUtils.hourOfTheDay(new Date('2015/3/26 00:00')).should.equal('19:00PM');
      OmnitureUtils.hourOfTheDay(new Date('2015/3/26 01:20')).should.equal('20:00PM');
    });
    it('fullDate', () => {
      OmnitureUtils.fullDate(new Date('2015/3/26 01:20')).should.equal('25 march 2015|wednesday|weekday');
      OmnitureUtils.fullDate(new Date('2015/3/30 01:20')).should.equal('29 march 2015|sunday|weekend');
    });
    it('articlePublishDate', () => {
      OmnitureUtils.articlePublishDate(new Date('2015/3/26')).should.equal('2015|03|26');
      OmnitureUtils.articlePublishDate(new Date('2015/3/6')).should.equal('2015|03|06');
      OmnitureUtils.articlePublishDate(new Date('2015/11/6')).should.equal('2015|11|06');
    });
  });
});
