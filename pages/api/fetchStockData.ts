// pages/api/fetchStockData.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { symbol } = req.query;
  const apiUrl = `https://www.set.or.th/api/set/stock/${symbol}/related-product/o?lang=th`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "th-TH,th;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie:
          'visid_incap_2046605=Cfs13cqWRSaQBByzvPHG6jveTmYAAAAAQUIPAAAAAACLZGjmN5+9aJvmRZgPDbYt; visid_incap_2771851=joDyrwtHRCOzlZJgxB/ItzzeTmYAAAAAQUIPAAAAAADRNL0RkvxK8LKPr88hr1FC; _gcl_au=1.1.127105080.1716444734; __lt__cid=bfed9357-5257-40b6-b859-07e88d01ba43; _hjSessionUser_3931504=eyJpZCI6IjliMTA1N2FhLWRiMTItNTg4Yy04MGU5LTI4NGQzYmMzNjA5MSIsImNyZWF0ZWQiOjE3MTY0NDQ3MzQ2MTMsImV4aXN0aW5nIjp0cnVlfQ==; SET_COOKIE_POLICY=20231111093657; visid_incap_2685219=Urxihh/jTN290WOfnRc+uBHiTmYAAAAAQUIPAAAAAAAu73X1gA4AQG+0v9zLQwh4; exp_history={"go_expid":"GusVq2U2QG2l2p9tGb5KTQ","msgt":"lightbox_exit_banner","count":1}|{"go_expid":"vZj2v2cjSuCT8gIzugw5hw","msgt":"new_highlight","count":3}|{"go_expid":"5AD93i4KR9-ZVNOhL9Vr2w-V2","msgt":"popup","count":1}; _tt_enable_cookie=1; _ttp=ybepfFwJTWZCI4_bIFzrHife4QP; nlbi_2046605=GuMoNP3btjpQMo1tU9DvIwAAAAD+fmxi7bt4iUVKfuapiPqV; _cbclose=1; _cbclose23453=1; verify=test; bull-popup-hidden=1; myquote-popup-hidden=1; charlot=c1204402-087f-4b51-8d96-e3c7576d1d6b; _gid=GA1.3.2007227292.1719907107; incap_ses_1006_2046605=KiqqZAKT6EAH+/vSwgf2DcHAg2YAAAAA4zpYJygxyQMpG6h7ai59WQ==; landing_url=https://www.set.or.th/th; incap_ses_1006_2771851=AwknRrmVrEF5+/vSwgf2DcLAg2YAAAAAS9djfBJinwSljmsg7j/paA==; _uid23453=041A8881.20; _ctout23453=1; __lt__sid=d60f604e-8ac865b1; _hjSession_3931504=eyJpZCI6IjA0ODVjM2E1LTAyZDktNGNiOS1iMTk2LTlkZTM5MzdmZWYzNSIsImMiOjE3MTk5MTA1OTU2MzMsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0=; api_call_counter=5; _gat_UA-426404-8=1; my-quote=%5B%22TISCO%22%2C%22AOT%22%2C%22SMK%22%2C%222S%22%2C%22SABUY%22%2C%22HYDROGEN%22%2C%22RCL%22%5D; recent-search=%5B%22TISCO%22%2C%22AOT%22%2C%22SMK%22%2C%222S%22%2C%22SABUY%22%2C%22HYDROGEN%22%2C%22RCL%22%2C%22NCL%22%5D; _ga=GA1.1.1011615115.1716444735; visit_time=17; _ga_6WS2P0P25V=GS1.1.1719910596.22.1.1719910818.17.0.0; _ga_ET2H60H2CB=GS1.1.1719910596.22.1.1719910818.17.0.0',
        Referer: `https://www.set.or.th/th/market/product/stock/quote/${symbol}/price`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
