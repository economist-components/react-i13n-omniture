// Custom function to retrieve cooke value based on cookie name.
function s_getCookie(cookieName) {
  "use strict";
  var name = cookieName + "=";
  var parts = document.cookie.split("; ");
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return false;
}

// Custom function to set cookie.
function s_setCookie(cookieName, cookieVal, path, domain) {
  "use strict";
  var cookie = cookieName + "=" + encodeURIComponent(cookieVal);
  if (path) {
    cookie += ";path=" + path;
  }
  if (domain) {
    cookie += ";domain=" + domain;
  }
  document.cookie = cookie;
}

/**
 * Helper function to truncate the campaign stacking cookie if necessary.
 * @param:
 *   cookie - The name of the cookie.
 */
function truncateCookie(cookie) {
  // Truncate the cookie value if we are going to exceed 100 chars - this is
  // a limitation of siteCatalyst.
  var max_length = 100,
      cookieVal = getCheckTrackingCookie(cookie),
      newVal;

  try {
    if (cookieVal.length > max_length) {
      newVal = cookieVal.replace(/\[\'(.*?)\'\],/, '');
      // Write trimmed value to cookie.
      s_setCookie(cookie, newVal, "/", ".economist.com");
    }
  }
  catch(e) {}
}

/**
 * Helper function to get a tracking cookie decoded.
 */
function getCheckTrackingCookie(cookieName) {
  var cookieStart = document.cookie.indexOf(cookieName + "="),
      cookieLen,
      cookieEnd;

  if (cookieStart !== -1) {
    cookieLen = cookieStart + cookieName.length + 1;
    cookieEnd = document.cookie.indexOf(";", cookieLen);
    if (cookieEnd === -1) {
      cookieEnd = document.cookie.length;
    }
    cookieStart = decodeURIComponent(document.cookie.substring(cookieLen, cookieEnd));
  }
  return cookieStart;
}

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
  userType() {
    // Returns the customer type and the product they have delimited using a pipe.
    // Expected output
    // digital subscriber|ent-product-H,ent-product-A
    return '';
  },
  mulIP() {
    return '';
  },
  articlePublishDate(date) {
    // Returns the date the article was published in this format yyyy|mm|dd
    return (date instanceof Date) ? [ date.getFullYear(), date.getMonth(), ((date.getDay()) < 10 ? `0${date.getDay()}` : date.getDay()) ].join('|') : '';
  },
  subscriptionRemaningMonths() {
    // Returns in months the number of months left till subscription expires.
    // Uses the ec_omniture_user_sub_info cookie
    // const cookie = new Cookie();
    // const loggedin = (cookie.getCookie('ec_omniture_user_sub_info');
    return '';
  },
  subscriptionInfo() {
    // Returns the sub, renewal or reg date with product delimited by pipe in this format
    // yyyy/mm/dd|yyyy/mm/dd|product
    // 2015/10/13|2016/12/10|ent-product-J
    // Uses the ec_omniture_user_sub_info cookie
    return '';
  },
  campaignTracking() {
    this.campaign = this.campaign || this.getQueryParam('fsrc', ':');
    // Capture campaign query params and assign to s.campaign, prop65 and eVars.
    let campref = 'none'; // The campaign referrer.
    if (document.referrer) {
      campref = document.referrer.match(/:\/\/([^/]+)\//)[1];
    }

    // Handle a possible three campaign params: 'fsrc', 'cid1' and 'cid2'.
    let campArr = {
      'fsrc' : this.getQueryParam('fsrc', ':'),
      'cid1' : this.getQueryParam('cid1', ':'),
      'cid2' : this.getQueryParam('cid2', ':'),
    };

    for (let key in campArr) {
      // Handle old query params which have a delimiter of "|", otherwise split
      // by '/'.
      let delimiter = (campArr[key].indexOf('|') !== -1) ? '|' : '/';
      let campValue = campArr[key].split(delimiter);
      if (campValue.length > 1 && campValue.length < 15) {
        // Each query param can have up to 14 values, and for those values that
        // are missing we need to add "none".
        let missing = 14 - campValue.length;
        for (let j = 0; j < missing ; j++) {
          campValue.push("none");
        }
        // Append the referer to the end.
        campValue.push(campref);

        // Assign the query param to s.campaign, prop65 and some eVars. First,
        // convert the values back to a string and replace commas with slashes.
        campValue = campValue.join().replace(/,/gi, "/");
        if (key === 'fsrc' || key === 'cid1') {
          this.campaign = this.prop65 = this.eVar55 = this.eVar56 = this.eVar57 = campValue;
        }

        if (key === 'cid2') {
          this.campaign = this.prop65 = this.eVar58 = this.eVar59 = this.eVar60 = campValue;
        }
      }
    }

    // If campaign info has not been set/sent, send values based on search and
    // referring domain.
    this.channelManager('fsrc' || 'cid1' || 'cid2');
    let campaignCookie = s_getCookie('cname') !== false;
    let eVar23Cookie = s_getCookie('s_evar23') !== false;
    if (!this.campaign && !campaignCookie && !eVar23Cookie) {
      let referringDomain = this._referringDomain ? this._referringDomain.toLowerCase() : 'none';
      let channel = this._channel ? this._channel.toLowerCase() : '';
      let dateNow = new Date();
      let campDate = dateNow.getFullYear() + '' + (dateNow.getMonth()+1) + '' + dateNow.getDate() + ' ' + dateNow.getHours() + ':' + dateNow.getMinutes();
      let social = false;

      if (referringDomain.indexOf('facebook') !== -1 || referringDomain.indexOf("twitter") !== -1 || referringDomain.indexOf("t.co") !== -1) {
        social = true;
      }

      // Set values based on channel or referringDommain.
      if (channel === "natural search") {
        this.eVar55 = this.eVar56 = this.eVar57 = this.campaign = "ea/natural search/" + this._partner.toLowerCase() + "/none/none/none/earned/" + campDate + "/search/none/none/" + this._keywordthis.toLowerCase() + "/none/none/none";
      }
      else if (channel === "direct load") {
        this.eVar23 = "direct/direct/direct/none/none/" + document.location.host + "/none/none/none/none/" + this.prop1 + "/none/none/none/none";
      }
      else if (social) {
        this.eVar55 = this.eVar56 = this.eVar57 = this.campaign = "ea/soc ern/" + referringDomain + "/none/none/none/earned/" + campDate + "/post/none/none/none/none/none/none";
      }
      else {
        // All others, e.g. not social and not natural search and not direct load.
        this.eVar23 = "o/oth/" + referringDomain + "/none/none/none/earned/" + campDate + "/other ref/none/none/none/none/none/none";
      }
    }
  },
  campaignStackingTracking() {
    // Campaign stacking: record cross-visit participation using the plugin
    // s.crossVisitParticipation for attribution purposes.
    // Separate the campaigns based on "paid", "owned" and "earned", or
    // "renewals" and "others".
    let campaignStackValue = '';
    let campaignRenewal = false;
    if (this.campaign) {
      let campaignValue = this.campaign.split('/');
      let attribution = (campaignValue.indexOf('paid') !== -1 || (typeof campaignValue[0] !== 'undefined' && campaignValue[0] === 'd')) ? 'p' : // Paid.
                        (campaignValue.indexOf('owned') !== -1 || (typeof campaignValue[0] !== 'undefined' && (campaignValue[0] === 'e' || campaignValue[0] === 'mgm'))) ? 'o' : // Owned.
                        (campaignValue.indexOf('earned') !== -1) ? 'e' : // Earned.
                        (campaignValue.indexOf('renewal') !== -1 || (typeof campaignValue[0] !== 'undefined' && campaignValue[0] === 'r')) ? 'r' : // Renewal.
                        '';

      if (typeof campaignValue[0] !== 'undefined') {
        campaignStackValue = attribution + '_' + campaignValue[0];
      }
      if (typeof campaignValue[1] !== 'undefined') {
        campaignStackValue += '_' + campaignValue[1];
      }

      switch (attribution) {
        case 'p':
          truncateCookie('s_econcpm');
          this.prop48 = this.eVar48 = this.crossVisitParticipation(campaignStackValue, 's_econcpm', '1000' , '1000', '>', '');
          break;
        case 'o':
        case 'e':
          truncateCookie('s_econcpm1');
          this.prop49 = this.eVar49 = this.crossVisitParticipation(campaignStackValue, 's_econcpm1', '1000' , '1000', '>', '');
          break;
        case 'r':
          // Handle 'renewal' with 'other ref' (non-campaign) below.
          campaignRenewal = true;
          break;
      }
    }
    else {
      // There's no campaign (e.g. 'other').
      campaignStackValue = 'other ref';
    }

    if (campaignStackValue === "other ref" || campaignRenewal === true) {
      truncateCookie('s_econcpm2');
      this.prop50 = this.eVar50 = this.crossVisitParticipation(campaignStackValue, 's_econcpm2', '1000' , '1000', '>', '');
    }

    // Ensure these values are only being sent once per session.
    this.campaign = this.getValOnce(this.campaign, "cname", 0);
    let oncePerSession = ["prop48", "prop49", "prop50", "prop65", "eVar23", "eVar48", "eVar49", "eVar50", "eVar55", "eVar56", "eVar57", "eVar58", "eVar59", "eVar60", "eVar65"];
    oncePerSession.map((a) => {
      if (typeof this[a] !== 'undefined') {
        this[a] = this.getValOnce(this[a], a.toLowerCase().replace('.', '_'), 0);
      }
    });
  }
};
export default OmnitureUtils;
