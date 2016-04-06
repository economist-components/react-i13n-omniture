'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _economistUser = require('@economist/user');

var _economistUser2 = _interopRequireDefault(_economistUser);

var OmnitureUtils = {
  graphShot: function graphShot() {
    return window.gs_channels ? window.gs_channels : '';
  },
  deviceDetection: function deviceDetection() {
    // TBD how we can manage this distinction
    // econofinal or econmobile
    return '';
  },
  estFormatDate: function estFormatDate() {
    // EST
    var offset = -5.0;
    var clientDate = new Date();
    var utc = clientDate.getTime() + clientDate.getTimezoneOffset() * 60000;
    var serverDate = new Date(utc + 3600000 * offset);
    return serverDate;
  },
  hourOfTheDay: function hourOfTheDay() {
    // Returns the time of the event in EST time to the closest half hour.
    // Expected output examples
    // "11:00AM"
    // "13:30PM"
    var date = this.estFormatDate();
    var hours = date.getHours();
    // Round minutes to 0 or 30.
    var minutes = Math.floor(date.getMinutes() / 30) * 30;
    minutes = minutes < 30 ? '0' + minutes : minutes;
    var mid = 'AM';
    if (hours > 12) {
      mid = 'pm';
    }
    return hours + ':' + minutes + mid;
  },
  fullDate: function fullDate() {
    // Returns the date, day of week and weektype delimited by a pipe.
    // Expected outupt 27 october 2015|tuesday|weekday
    var date = this.estFormatDate();
    var weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    var day = weekDays[date.getDay()];
    var month = monthNames[date.getMonth()];
    var weekday = date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : 'weekday';
    return [date.getDate() + ' ' + month + ' ' + date.getFullYear(), day, weekday].join('|');
  },
  userLoggedIn: function userLoggedIn() {
    return _economistUser2['default'].isLoggedIn() ? 'logged_in' : 'not_logged_in';
  },
  articlePublishDate: function articlePublishDate(date) {
    // Returns the date the article was published in this format yyyy|mm|dd
    return date instanceof Date ? [date.getFullYear(), date.getMonth(), date.getDay() < 10 ? '0' + date.getDay() : date.getDay()].join('|') : '';
  },
  userSubscription: function userSubscription() {
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    var user_sub_cookie = _economistUser2['default'].getSubscriberCookie();
    if (_economistUser2['default'].isMultiUserLicense()) {
      return 'bulk-IP';
    } else if (typeof user_sub_cookie === 'undefined') {
      return 'anonymous';
    } else {
      var ec_omniture_user_sub_info = user_sub_cookie.split('*');
      if (ec_omniture_user_sub_info !== undefined) {
        // Prop13 gets the first bit, which is a | delimited list of entitlements.
        return ec_omniture_user_sub_info[0];
      } else {
        return user_sub_cookie; // Set up the default value.
      }
    }
  },
  subscriptionRemaningMonths: function subscriptionRemaningMonths() {
    var currDate = arguments.length <= 0 || arguments[0] === undefined ? new Date() : arguments[0];

    // Returns in months the number of months left till subscription expires.
    // Uses the ec_omniture_user_sub_info cookie
    // const cookie = new Cookie();
    // const loggedin = (cookie.getCookie('ec_omniture_user_sub_info');
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    var user_sub_cookie = _economistUser2['default'].getSubscriberCookie();
    if (typeof user_sub_cookie === 'undefined') {
      return '';
    }
    // The ec_omniture_user_sub cookie has info for both prop13 and prop54.
    var ec_omniture_user_sub_info = user_sub_cookie.split('*');
    if (typeof ec_omniture_user_sub_info !== 'undefined') {
      var subsInfo = ec_omniture_user_sub_info[1].split('|');
      if (subsInfo) {
        var subDate = subsInfo[1]; // The subscription date.
        if (subDate) {
          subDate = new Date(subDate); // Convert to js date.
          if (currDate > subDate) {
            return 'EXPIRED';
          } else {
            // Get the number of months remaining in the subscription.
            var oneMonthInMilliseconds = 2628000000;
            var expiringTimesInMilliseconds = subDate - currDate;
            var remainingMonth = Math.floor(expiringTimesInMilliseconds / oneMonthInMilliseconds);
            return remainingMonth > 0 ? remainingMonth + 'MO' : 'Less_than_1_MO';
          }
        }
      }
    }
  },
  expiredSubscriptionInfo: function expiredSubscriptionInfo() {
    // Returns the sub, renewal or reg date with product delimited by pipe in this format
    // yyyy/mm/dd|yyyy/mm/dd|product
    // 2015/10/13|2016/12/10|ent-product-J
    // Uses the ec_omniture_user_sub_info cookie
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    var user_sub_cookie = _economistUser2['default'].getSubscriberCookie();
    if (user_sub_cookie) {
      var ec_omniture_user_sub_info = user_sub_cookie.split('*');
      return ec_omniture_user_sub_info[1];
    } else {
      return '';
    }
  }
};
exports['default'] = OmnitureUtils;
module.exports = exports['default'];