import User from '@economist/user';
import cookie from 'react-cookie';

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
    const offset = -5.0
    const clientDate = new Date();
    const utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
    const serverDate = new Date(utc + (3600000*offset));
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
    let minutes = (Math.floor(date.getMinutes()/30) * 30);
    minutes = (minutes) < 30 ? `0${minutes}` : minutes;
    let mid='AM';
    if (hours>12) {
     mid='pm';
    }
    return `${hours}:${minutes}${mid}`;
  },
  fullDate() {
    // Returns the date, day of week and weektype delimited by a pipe.
    // Expected outupt 27 october 2015|tuesday|weekday
    const date = this.estFormatDate();
    const weekDays = [ "sunday" , "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ];
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const day = weekDays[date.getDay()];
    const month = monthNames[date.getMonth()];
    const weekday = (date.getDay() === 0 || date.getDay() === 6 ) ? 'weekend' : 'weekday';
    return [ `${date.getDate()} ${month} ${date.getFullYear()}` , day, weekday ].join('|');
  },
  userLoggedIn(){
    return (User.isLoggedIn()) ? 'logged_in' : 'not_logged_in';
  },
  articlePublishDate(date) {
    // Returns the date the article was published in this format yyyy|mm|dd
    return (date instanceof Date) ? [ date.getFullYear(), date.getMonth(), ((date.getDay()) < 10 ? `0${date.getDay()}` : date.getDay()) ].join('|') : '';
  },
  userSubscription() {
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    var user_sub_cookie = user.getSubscriptionInfo();
    if (user_sub_cookie === false) {
      return 'anonymous';
    } else if(user.isInternal()) {
      return 'bulk-IP';
    } else {
      var ec_omniture_user_sub_info = user_sub_cookie.split('*');
      if (ec_omniture_user_sub_info) {
        // Prop13 gets the first bit, which is a | delimited list of entitlements.
        return ec_omniture_user_sub_info[0];
      } else {
        return user_sub_cookie; // Set up the default value.
      }
    }
  },
  subscriptionRemaningMonths() {
    // Returns in months the number of months left till subscription expires.
    // Uses the ec_omniture_user_sub_info cookie
    // const cookie = new Cookie();
    // const loggedin = (cookie.getCookie('ec_omniture_user_sub_info');
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    let user_sub_cookie = user.getSubscriptionInfo();
    // The ec_omniture_user_sub cookie has info for both prop13 and prop54.
    let ec_omniture_user_sub_info = user_sub_cookie.split('*');
    let subsRemaining = '';
    if (ec_omniture_user_sub_info) {
      let subsInfo = ec_omniture_user_sub_info[1].split('|');
      if (subsInfo) {
        let subDate = subsInfo[1]; // The subscription date.
        if (subDate) {
          subDate = new Date(subDate); // Convert to js date.
          let currDate = new Date();
          if (currDate > subDate) {
            subsRemaining = 'EXPIRED';
          } else {
            // Get the number of months remaining in the subscription.
            let months = subDate.getMonth() - currDate.getMonth() + (12 * (subDate.getFullYear() - currDate.getFullYear()));
            subsRemaining = (months > 0) ? (months + 'MO') : ('Less_than_1_MO');
          }
        }
      }
    }
    return subsRemaining;
  },
  subscriptionInfo() {
    // Returns the sub, renewal or reg date with product delimited by pipe in this format
    // yyyy/mm/dd|yyyy/mm/dd|product
    // 2015/10/13|2016/12/10|ent-product-J
    // Uses the ec_omniture_user_sub_info cookie
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    const user_sub_cookie = user.getSubscriptionInfo();
    const ec_omniture_user_sub_info = user_sub_cookie.split('*');
    if (ec_omniture_user_sub_info) {
      return ec_omniture_user_sub_info[1];
    }
  },
};
export default OmnitureUtils;
