
/** Plugin: getQueryParam 2.3 **/
s.getQueryParam = new Function("p", "d", "u", ""
  + "var s=this,v='',i,t;d=d?d:'';u=u?u:(s.pageURL?s.pageURL:s.wd.locati"
  + "on);if(u=='f')u=s.gtfs().location;while(p){i=p.indexOf(',');i=i<0?p"
  + ".length:i;t=s.p_gpv(p.substring(0,i),u+'');if(t){t=t.indexOf('#')>-"
  + "1?t.substring(0,t.indexOf('#')):t;}if(t)v+=v?d+t:t;p=p.substring(i="
  + "=p.length?i:i+1)}return v");
s.p_gpv = new Function("k", "u", ""
  + "var s=this,v='',i=u.indexOf('?'),q;if(k&&i>-1){q=u.substring(i+1);v"
  + "=s.pt(q,'&','p_gvf',k)}return v");
s.p_gvf = new Function("t", "k", ""
  + "if(t){var s=this,i=t.indexOf('='),p=i<0?t:t.substring(0,i),v=i<0?'T"
  + "rue':t.substring(i+1);if(p.toLowerCase()==k.toLowerCase())return s."
  + "epa(v)}return ''");
  
const OmniturePlugin = {
}
