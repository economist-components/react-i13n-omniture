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
    debugger;
    // Capture campaign query params and assign to s.campaign, prop65 and eVars.
    var campref = 'none'; // The campaign referrer.
    if (document.referrer) {
      campref = document.referrer.match(/:\/\/([^/]+)\//)[1];
    }

    // Handle a possible three campaign params: 'fsrc', 'cid1' and 'cid2'.
    var campArr = {
      'fsrc' : this.getQueryParam('fsrc', ':'),
      'cid1' : this.getQueryParam('cid1', ':'),
      'cid2' : this.getQueryParam('cid2', ':'),
    };

    for (var key in campArr) {
      // Handle old query params which have a delimiter of "|", otherwise split
      // by '/'.
      var delimiter = (campArr[key].indexOf('|') !== -1) ? '|' : '/';
      var campValue = campArr[key].split(delimiter);
      if (campValue.length > 1 && campValue.length < 15) {
        // Each query param can have up to 14 values, and for those values that
        // are missing we need to add "none".
        var missing = 14 - campValue.length;
        for (var j = 0; j < missing ; j++) {
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
    var campaignCookie = s_getCookie('cname') !== false;
    var eVar23Cookie = s_getCookie('s_evar23') !== false;
    debugger;
    if (!this.campaign && !campaignCookie && !eVar23Cookie) {
      var referringDomain = this._referringDomain ? this._referringDomain.toLowerCase() : 'none';
      var channel = this._channel ? this._channel.toLowerCase() : '';
      var campDate = dateNow.getFullYear() + '' + (dateNow.getMonth()+1) + '' + dateNow.getDate() + ' ' + dateNow.getHours() + ':' + dateNow.getMinutes();
      var social = false;

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

  }
};
export default OmnitureUtils;
