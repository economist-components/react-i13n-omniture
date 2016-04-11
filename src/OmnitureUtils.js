/* eslint-disable filenames/filenames */
/* global window */
import User from '@economist/user';

const OmnitureUtils = {
  graphShot() {
    return (window.gs_channels) ? window.gs_channels : '';
  },
  deviceDetection() {
    // TBD how we can manage this distinction
    // econofinal or econmobile
    return '';
  },
  estFormatDate() {
    // EST
    const offset = -5.0;
    const clientDate = new Date();
    const hourInMilliseconds = 60000;
    const currentTime = clientDate.getTime() + (clientDate.getTimezoneOffset() * hourInMilliseconds);
    const sixHourInMilliseconds = 3600000;
    const serverDate = new Date(currentTime + (sixHourInMilliseconds * offset));
    return serverDate;
  },
  hourOfTheDay() {
    // Returns the time of the event in EST time to the closest half hour.
    // Expected output examples
    // "11:00AM"
    // "13:30PM"
    const date = this.estFormatDate();
    const hours = date.getHours();
    // Round minutes to 0 or 30.
    const halfAnHour = 30;
    let minutes = (Math.floor(date.getMinutes() / halfAnHour) * halfAnHour);
    minutes = (minutes) < halfAnHour ? `0${ minutes }` : minutes;
    let mid = 'AM';
    const halfDayHours = 12;
    if (hours > halfDayHours) {
      mid = 'pm';
    }
    return `${ hours }:${ minutes }${ mid }`;
  },
  fullDate() {
    // Returns the date, day of week and weektype delimited by a pipe.
    // Expected outupt 27 october 2015|tuesday|weekday
    const date = this.estFormatDate();
    const weekDays = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
    const monthNames = [ 'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december' ];
    const day = weekDays[date.getDay()];
    const month = monthNames[date.getMonth()];
    const firstWorkingDay = 0;
    const lastWorkingDay = 6;
    const weekday = (date.getDay() === firstWorkingDay || date.getDay() === lastWorkingDay) ? 'weekend' : 'weekday';
    return [ `${ date.getDate() } ${ month } ${ date.getFullYear() }`, day, weekday ].join('|');
  },
  userLoggedIn() {
    return (User.isLoggedIn()) ? 'logged_in' : 'not_logged_in';
  },
  articlePublishDate(date) {
    // Returns the date the article was published in this format yyyy|mm|dd
    const doubleDigitLimit = 10;
    return (date instanceof Date) ? [ date.getFullYear(), date.getMonth(),
      ((date.getDay()) < doubleDigitLimit ? `0${ date.getDay() }` : date.getDay()) ].join('|') : '';
  },
  userSubscription() {
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    const userSubCookie = User.getSubscriberCookie();
    if (User.isMultiUserLicense()) {
      return 'bulk-IP';
    } else if (typeof userSubCookie === 'undefined') {
      return 'anonymous';
    }
    const ecOmnitureUserSubInfo = userSubCookie.split('*');
    if (typeof ecOmnitureUserSubInfo === 'undefined') {
      return userSubCookie;
    }
    // Prop13 gets the first bit, which is a | delimited list of entitlements.
    return ecOmnitureUserSubInfo[0];
  },
  subscriptionRemaningMonths(currDate = new Date()) {
    // Returns in months the number of months left till subscription expires.
    // Uses the ecOmnitureUserSubInfo cookie
    // const cookie = new Cookie();
    // const loggedin = (cookie.getCookie('ecOmnitureUserSubInfo');
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    const userSubCookie = User.getSubscriberCookie();
    if (typeof userSubCookie === 'undefined') {
      return '';
    }
    // The ec_omniture_user_sub cookie has info for both prop13 and prop54.
    const ecOmnitureUserSubInfo = userSubCookie.split('*');
    if (typeof ecOmnitureUserSubInfo !== 'undefined') {
      const subsInfo = ecOmnitureUserSubInfo[1].split('|');
      if (subsInfo) {
        // The subscription date.
        let subDate = subsInfo[1];
        if (subDate) {
          // Convert to js date.
          subDate = new Date(subDate);
          if (currDate > subDate) {
            return 'EXPIRED';
          }
          // Get the number of months remaining in the subscription.
          const oneMonthInMilliseconds = 2628000000;
          const expiringTimesInMilliseconds = subDate - currDate;
          const remainingMonth = Math.floor(expiringTimesInMilliseconds / oneMonthInMilliseconds);
          return (remainingMonth > 0) ? `${ remainingMonth }MO` : 'Less_than_1_MO';
        }
      }
    }
    return '';
  },
  expiredSubscriptionInfo() {
    // Returns the sub, renewal or reg date with product delimited by pipe in this format
    // yyyy/mm/dd|yyyy/mm/dd|product
    // 2015/10/13|2016/12/10|ent-product-J
    // Uses the ecOmnitureUserSubInfo cookie
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    const userSubCookie = User.getSubscriberCookie();
    if (userSubCookie) {
      const ecOmnitureUserSubInfo = userSubCookie.split('*');
      return ecOmnitureUserSubInfo[1];
    }
    return '';
  },
};
export default OmnitureUtils;
