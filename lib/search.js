const axios = require("axios");
const Signer = require("tiktok-signature");

// User-Agent used when requested for TT_REQ_PERM_URL
const TT_REQ_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.50";

// This the final URL you make a request to for the API call, it is ALWAYS this, do not mistaken it for the signed URL
const TT_REQ_PERM_URL =
  "https://www.tiktok.com/api/search/general/full/?aid=1988&app_language=en&app_name=tiktok_web&battery_info=0.25&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F110.0.0.0%20Safari%2F537.36%20Edg%2F110.0.1587.50&channel=tiktok_web&cookie_enabled=true&device_id=7167653542189073922&device_platform=web_pc&focus_state=true&from_page=search&history_len=12&is_fullscreen=false&is_page_visible=true&keyword=homeappliances&offset=12&os=windows&priority_region=&referer=&region=PS&root_referer=http%3A%2F%2Flocalhost%3A3000%2F&screen_height=1080&screen_width=1920&search_id=20230224200257EDE043A26953CA4A94B7&tz_name=Asia%2FHebron&webcast_language=en&msToken=WF3cmXH_nuf9UAFdQLC94L64nqzDSQTNat4CImvCcpXErMKCRv4E6f7jvz6IZL2z27DT9JtUtNCszt8NYkrDPnRuHzD3xy2Xt3OUvfoq__VtANwlsLVWOz10CvUtKg_ytVhaRP4=&X-Bogus=DFSzswVLXhkANjigSgHW/PesEufE&_signature=_02B4Z6wo000018DJOwQAAIDCSZyS52FYKzfAyT-AAJPU4b";

async function search(keyword, cursor) {
  const PARAMS = {
    aid: "1988",
    app_language: "en",
    app_name: "tiktok_web",
    battery_info: "0.25",
    browser_language: "en-US",
    browser_name: "Mozilla",
    browser_online: "true",
    browser_platform: "Win32",
    channel: "tiktok_web",
    cookie_enabled: "true",
    device_id: "7167653542189073922",
    device_platform: "web_pc",
    focus_state: "true",
    from_page: "search",
    history_len: "12",
    is_fullscreen: "false",
    is_page_visible: "true",
    keyword,
    offset: cursor,
    os: "windows",
    priority_region: "",
    referer: "",
    region: "US",
    screen_height: "1080",
    screen_width: "1920",
    tz_name: "Europe/London",
    webcast_language: "en",
   
  };

  const signer = new Signer(null, TT_REQ_USER_AGENT);
  await signer.init();

  const qsObject = new URLSearchParams(PARAMS);
  const qs = qsObject.toString();

  const unsignedUrl = `https://www.tiktok.com/api/search/general/full/?${qs}`;
  const signature = await signer.sign(unsignedUrl);
  const navigator = await signer.navigator();
  await signer.close();

  let { "x-tt-params": xTtParams, signed_url, cookies } = signature;

  const { user_agent: userAgent } = navigator;

  let trys = 0;

  let newCookies = "";

  while (trys < 10) {
    const res = await testApiReq({
      userAgent,
      xTtParams,
      url: signed_url,
      cookies: cookies + ";" + newCookies,
    });

    const { data } = res;
    if (data.type != "verify") {
      return data;
    }

    newCookies =
      res.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ") + ";";

    trys++;
  }

  return null;
}

async function testApiReq({
  userAgent,
  xTtParams,
  url = TT_REQ_PERM_URL,
  cookies,
}) {
  const options = {
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9",
      referer: "https://www.tiktok.com",
      "sec-ch-ua": `"Chromium";v="110", "Not A(Brand";v="24", "Microsoft Edge";v="110"`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": `"Windows"`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": userAgent,
      cookie: cookies,
    },
    url,
  };
  return axios.get(url, options);
}

module.exports = { search };
