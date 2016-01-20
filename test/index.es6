import ReactI13nOmniture from '../index';
import spies from 'chai-spies';
import cookie from 'react-cookie';
import OmnitureUtils from '../OmnitureUtils';
import User from '@economist/user';
import RevampConfig from '../config_revamp';

chai.use(spies);

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

describe(`Omniture Re-Vamp configuration is delegated
to manipulate the page information to be send to Omniture`,() => {
  describe('has a pageView method', () => {
    describe('it return different value for different users', () => {
      it('it return a value for logged-in user', () => {
        cookie.save('ec_uid', 1);
        cookie.load('ec_uid')
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
        });
        pageviewOutput.should.have.property('prop11', 'logged_in');
        pageviewOutput.should.have.property('eVar11', 'logged_in');
      });
      it('it return a value for logged-out user', () => {
        cookie.remove('ec_uid');
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
        });
        pageviewOutput.should.have.property('prop11', 'not_logged_in');
        pageviewOutput.should.have.property('eVar11', 'not_logged_in');
      });
      it('it return a value for anonymous', () => {
        cookie.remove('ec_omniture_user_sub');
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
        });
        pageviewOutput.should.have.property('prop11', 'not_logged_in');
        pageviewOutput.should.have.property('eVar11', 'not_logged_in');
        pageviewOutput.should.have.property('prop13', 'anonymous|none');
        pageviewOutput.should.have.property('eVar13', 'anonymous|none');
        pageviewOutput.should.have.property('eVar46', '');
        pageviewOutput.should.have.property('prop46', '');
      });
      it('it return a value for MUL', () => {
        cookie.remove('ec_omniture_user_sub');
        User.setMultiUserLicense(true);
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
        });
        pageviewOutput.should.have.property('prop11', 'not_logged_in');
        pageviewOutput.should.have.property('eVar11', 'not_logged_in');
        pageviewOutput.should.have.property('prop13', 'bulk-IP|none');
        pageviewOutput.should.have.property('eVar13', 'bulk-IP|none');
        pageviewOutput.should.have.property('eVar46', 'MUL-IP');
        pageviewOutput.should.have.property('prop46', 'MUL-IP');
      });
      it('it return a value for registered user', () => {
        cookie.save('ec_omniture_user_sub', 'user_register*2016/01/19');
        User.setMultiUserLicense(false);
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
        });
        pageviewOutput.should.have.property('prop13', 'user_register|none');
        pageviewOutput.should.have.property('eVar13', 'user_register|none');
      });
      it('it return a value for subscriber user', () => {
        cookie.save('ec_omniture_user_sub', 'digital-subscriber*2016/01/19');
        User.setMultiUserLicense(false);
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
        });
        pageviewOutput.should.have.property('prop13', 'digital-subscriber|none');
        pageviewOutput.should.have.property('eVar13', 'digital-subscriber|none');
      });
    });
    describe('it return different value for different pages', () => {
      it('it return a value for blog page list', () => {
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          articleSource: 'web',
          channel: 'Blogs',
          description: `Thoughts and opinions on America’s kinetic
           brand of politics. The blog is named after Alexis de
           Tocqueville’s study of American politics and society`,
          name: 'Democracy in America',
          product: 'Blog',
          slug: 'democracyinamerica',
          template: 'blog_post_listing',
          topic: 'Democracy in America',
          product: 'Blog',
          channel: 'Blogs',
        });
        pageviewOutput.should.have.property('channel', 'blogs');
        pageviewOutput.contextData.should.have.property('revampid', 'revamp_ecom|0216');
        pageviewOutput.contextData.should.have.property('subsection', 'democracy_in_america');
        pageviewOutput.should.have.property('prop1', 'blogs_democracy_in_america');
        pageviewOutput.should.have.property('eVar1', 'blogs_democracy_in_america');
        pageviewOutput.should.have.property('prop3', 'web');
        pageviewOutput.should.have.property('eVar3', 'web');
        pageviewOutput.should.have.property('prop4', 'blog_post_listing');
        pageviewOutput.should.have.property('eVar4', 'blog_post_listing');
        pageviewOutput.should.have.property('prop5', 'blog|democracy_in_america|home');
        pageviewOutput.should.have.property('eVar5', 'blog|democracy_in_america|home');
        pageviewOutput.should.have.property('prop8', OmnitureUtils.hourOfTheDay());
        pageviewOutput.should.have.property('eVar8', OmnitureUtils.hourOfTheDay());
        pageviewOutput.should.have.property('prop10', OmnitureUtils.fullDate());
        pageviewOutput.should.have.property('eVar10', OmnitureUtils.fullDate());
        pageviewOutput.should.have.property('events', 'event2');
        pageviewOutput.should.have.property('events', 'event2');
        pageviewOutput.should.have.property('pageName', 'blog|democracy_in_america');
        pageviewOutput.should.have.property('pageName', 'blog|democracy_in_america');
        pageviewOutput.should.have.property('prop32', location.href);
        pageviewOutput.should.have.property('eVar32', location.href);
      });
      it('it return a value for blog page', () => {
        const pageviewOutput = RevampConfig.eventHandlers.pageview({
          byline: "J.A | WASHINGTON, DC",
          createdISO: "2016-01-15T17:41:55.000Z",
          createdString: "Jan 15th 2016, 17:41",
          flytitle: "The Republican contest",
          id: "21688533",
          image: "http://cdn.static-economist.com/sites/default/files/images/2016/01/blogs/democracy-america/20160116_usp507.jpg",
          rubric: "Lindsey Graham's endorsement is a rare splash of sunlight for Jeb Bush",
          teaser: "FAILING, disappointed, humiliated by six months of well-aimed taunts from Donald Trump, Jeb Bush has had a horrible six months. Once the frontrunner for the Repub...",
          template: "blog_post",
          text: "<p>FAILING, disappointed, humiliated by six months of well-aimed taunts from Donald Trump, Jeb Bush has had a horrible six months. Once the frontrunner for the Republican nomination, he probably, it turns out, never stood a chance of getting it. He is measured, thoughtful, wonkish; Republican voters want rage. He could scarcely be more of the GOP establishment that they decry.</p><p>In the televised Republican debate held on January 14th Mr Bush argued against starting the trade war with China and levying the ban on Muslims that Mr Trump advocates. But the Republican front-runner’s response, lambasting Mr Bush for being “weak”, and the glum, bullied expression this elicited in President George W Bush’s brother, President George H. Bush’s son, were, sadly, more memorable. In a crowded field, Mr Bush is currently polling less than 5%; his main rival for the support of mainstream conservatives, Marco Rubio, is on 12%. Mr Trump has over a third of the Republican vote.</p><p>So the endorsement of Mr Bush by Lindsey Graham, a senator from South Carolina and early drop-out from the Republican contest, on January 15th was a rare splash of sunlight for his campaign. Though Mr Graham failed to gain any traction in the race, he is well-known for his hawkish views on national security, which has increasingly dominated in the Republican contest since the terrorist attack, inspired by Islamic State, carried out in San Bernardino, California, last month. Moreover, South Carolina, where Mr Graham has a strong network of donors and apparatchiks, could be decisive in choosing which mainstream Republican candidate emerges from the, currently-crowded, pack, to challenge Mr Trump. It is the third state to vote, on February 20th, following the Iowa caucus and New Hampshire primary.</p><p>The trouble for Republicans, most of whom disapprove thoroughly of Mr Trump, is that Mr Bush seems extremely unlikely to be that unifying champion of the mainstream. He is too far back in this race. And neither Iowa, where Mr Bush is a no-show, and New Hampshire, where he would have expected to do well but so far isn’t, looks likely to change that. Mr Trump had it right, in a way: Mr Bush is too weakened to be a serious contender.</p><p>It is therefore hard not to see Mr Graham’s endorsement as a wasted opportunity for his party. The veteran senator refrained from passing judgment on any of Mr Bush’s mainstream rivals. However, the implication of his statement that Mr Bush would be “ready on day one” to fill the role of commander-in-chief was that they would not be.<br>The particular problem for Mr Rubio, who has campaigned hard in South Carolina, is not only that he could have done with Mr Graham’s nod; but also an apprehension that he is, though talented and attractive, too green to be president. Mr Graham’s words will enforce that sentiment. All in all, this looks like another bad moment for the GOP.</p>",
          title: "A wasted vote for Jeb Bush",
          topic: "Democracy in America",
          webUrl: "/blogs/democracyinamerica/2016/01/republican-contest",
          product: 'Blog',
          channel: 'Blogs',
        });
        pageviewOutput.should.have.property('prop1', 'blogs_democracy_in_america');
        pageviewOutput.should.have.property('eVar1', 'blogs_democracy_in_america');
        pageviewOutput.should.have.property('prop4', 'blog_post');
        pageviewOutput.should.have.property('eVar4', 'blog_post');
        pageviewOutput.should.have.property('prop5', 'blog|a_wasted_vote_for_jeb_bush');
        pageviewOutput.should.have.property('eVar5', 'blog|a_wasted_vote_for_jeb_bush');
        pageviewOutput.should.have.property('pageName', 'blog|democracy_in_america|a_wasted_vote_for_jeb_bush');
        pageviewOutput.should.have.property('pageName', 'blog|democracy_in_america|a_wasted_vote_for_jeb_bush');
      });
    });
  });
  describe('has a click method', () => {
    it('it return a concatenad description of the link the user clicked', () => {
      cookie.save('ec_omniture_user_sub', 'digital-subscriber*2016/01/19');
      const fullLink = RevampConfig.eventHandlers.click({
        component: 'beta-bar',
        element: 'fallback link',
        listIndex: 2,
        product: 'revamp',
      });
      fullLink.prop45.should.equal('digital-subscriber>beta-bar>2>fallback_link');
      cookie.save('ec_omniture_user_sub', 'digital-subscriber*2016/01/19');
      const partialLink = RevampConfig.eventHandlers.click({
        element: 'fallback link',
        product: 'revamp',
      });
      partialLink.prop45.should.equal('digital-subscriber>fallback_link');
    })
  })
});
