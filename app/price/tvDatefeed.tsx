import * as moment from "moment";

enum Interval {
  in_1_minute = "1",
  in_3_minute = "3",
  in_5_minute = "5",
  in_15_minute = "15",
  in_30_minute = "30",
  in_45_minute = "45",
  in_1_hour = "1H",
  in_2_hour = "2H",
  in_3_hour = "3H",
  in_4_hour = "4H",
  in_daily = "1D",
  in_weekly = "1W",
  in_monthly = "1M",
}

interface DataRow {
  symbol: string;
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  [key: string]: any;
}

class TvDatafeed {
  private static wsHeaders = {
    Origin: "https://data.tradingview.com",
  };
  private static wsTimeout = 5000;
  private token: string;
  private wsDebug = false;
  private subscriptions: { symbol: string; exchange: string }[] = [];
  private updateCallback: ((data: any) => void) | null = null;
  private isReconnecting = false;

  constructor(updateCallback: ((data: any) => void) | null = null) {
    this.token = "unauthorized_user_token";
    this.updateCallback = updateCallback;
  }

  private createConnection(symbol: string, exchange: string) {
    console.debug(`Creating websocket connection for ${exchange}:${symbol}`);
    const session = this.generateSession();
    const chartSession = this.generateChartSession();

    const ws = new WebSocket("wss://data.tradingview.com/socket.io/websocket");

    ws.onopen = () => {
      console.debug(`WebSocket connection opened for ${exchange}:${symbol}`);
      this.sendMessage(ws, "set_auth_token", [this.token]);
      this.sendMessage(ws, "chart_create_session", [chartSession, ""]);
      this.sendMessage(ws, "quote_create_session", [session]);
      this.sendMessage(ws, "quote_set_fields", [
        session,
        "ch",
        "chp",
        "current_session",
        "description",
        "local_description",
        "language",
        "exchange",
        "fractional",
        "is_tradable",
        "lp",
        "lp_time",
        "minmov",
        "minmove2",
        "original_name",
        "pricescale",
        "pro_name",
        "short_name",
        "type",
        "update_mode",
        "volume",
        "currency_code",
        "rchp",
        "rtc",
      ]);

      this.sendMessage(ws, "quote_add_symbols", [
        session,
        `${exchange}:${symbol}`,
        { flags: ["force_permission"] },
      ]);
      this.sendMessage(ws, "quote_fast_symbols", [
        session,
        `${exchange}:${symbol}`,
      ]);
      this.sendMessage(ws, "resolve_symbol", [
        chartSession,
        "symbol_1",
        `={"symbol":"${exchange}:${symbol}","adjustment":"splits","session":"regular"}`,
      ]);
      this.sendMessage(ws, "create_series", [
        chartSession,
        "s1",
        "s1",
        "symbol_1",
        Interval.in_1_minute,
        10,
      ]);
      this.sendMessage(ws, "switch_timezone", [chartSession, "exchange"]);
    };

    ws.onmessage = (event) => {
      this.handleMessage(event.data, symbol);
    };

    ws.onclose = () => {
      console.debug(`WebSocket connection closed for ${exchange}:${symbol}`);
      if (!this.isReconnecting) {
        this.isReconnecting = true;
        setTimeout(() => {
          this.createConnection(symbol, exchange);
          this.isReconnecting = false;
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${exchange}:${symbol}: `, error);
      if (!this.isReconnecting) {
        this.isReconnecting = true;
        setTimeout(() => {
          this.createConnection(symbol, exchange);
          this.isReconnecting = false;
        }, 5000);
      }
    };
  }

  private generateSession(): string {
    const stringLength = 12;
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let randomString = "";
    for (let i = 0; i < stringLength; i++) {
      randomString += letters[Math.floor(Math.random() * letters.length)];
    }
    return "qs_" + randomString;
  }

  private generateChartSession(): string {
    const stringLength = 12;
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let randomString = "";
    for (let i = 0; i < stringLength; i++) {
      randomString += letters[Math.floor(Math.random() * letters.length)];
    }
    return "cs_" + randomString;
  }

  private prependHeader(st: string): string {
    return "~m~" + st.length + "~m~" + st;
  }

  private constructMessage(func: string, paramList: any[]): string {
    return JSON.stringify({ m: func, p: paramList });
  }

  private createMessage(func: string, paramList: any[]): string {
    return this.prependHeader(this.constructMessage(func, paramList));
  }

  private sendMessage(ws: WebSocket, func: string, args: any[]): void {
    const m = this.createMessage(func, args);
    if (this.wsDebug) {
      console.log(m);
    }
    ws.send(m);
  }

  private handleMessage(data: string, symbol: string): void {
    const message = data.toString();
    console.debug("received message: ", message);

    if (message.includes("~m~")) {
      const parts = message.split("~m~").filter(Boolean);
      for (let i = 0; i < parts.length; i += 2) {
        const length = parseInt(parts[i], 10);
        const jsonStr = parts[i + 1].substring(0, length);
        if (jsonStr.includes("~h~")) continue;
        try {
          const json = JSON.parse(jsonStr);
          console.debug("parsed message: ", json);
          this.processJsonMessage(json, symbol);
        } catch (error) {
          console.error("JSON Parse error: ", error);
        }
      }
    }
  }

  private processJsonMessage(json: any, symbol: string): void {
    if (json.m === "qsd") {
      const rawData = json.p[1].v;
      if (rawData) {
        const df = this.createDf(JSON.stringify(rawData), symbol);
        console.log(df);
        if (this.updateCallback) {
          this.updateCallback(df);
        }
      }
    } else if (json.m === "timescale_update" || json.m === "du") {
      const rawData = json.p[1].s1.s;
      const df = rawData.map((bar: any) => ({
        symbol: symbol,
        time: moment.unix(bar.i).format("YYYY-MM-DD HH:mm:ss"),
        open: bar.v[0],
        high: bar.v[1],
        low: bar.v[2],
        close: bar.v[3],
        volume: bar.v[4],
      }));
      console.log("Live data:", df);
      if (this.updateCallback) {
        this.updateCallback(df);
      }
    }
  }

  private createDf(rawData: string, symbol: string): DataRow[] {
    const out = rawData.match(/"s":\[(.+?)\}\]/)?.[1];
    if (!out) {
      console.error("no data, please check the exchange and symbol");
      return [];
    }
    const x = out.split(',{"');
    const data: DataRow[] = [];
    let volumeData = true;

    for (let xi of x) {
      const parts = xi.split(/[\[,:,\]]/);
      const ts = moment
        .unix(parseFloat(parts[4]))
        .format("YYYY-MM-DD HH:mm:ss");

      const row: DataRow = { symbol, time: ts };
      const fields: (keyof DataRow)[] = [
        "open",
        "high",
        "low",
        "close",
        "volume",
      ];
      for (let i = 0; i < fields.length; i++) {
        if (!volumeData && fields[i] === "volume") {
          row[fields[i]] = 0.0;
          continue;
        }
        try {
          row[fields[i]] = parseFloat(parts[i + 5]);
        } catch {
          volumeData = false;
          row[fields[i]] = 0.0;
          console.debug("no volume data");
        }
      }
      data.push(row);
    }
    return data;
  }

  public subscribeSymbols(
    symbols: { symbol: string; exchange: string }[],
    interval: Interval = Interval.in_1_minute,
    nBars: number = 1
  ): void {
    this.subscriptions = symbols;
    for (const { symbol, exchange } of symbols) {
      this.createConnection(symbol, exchange);
    }
  }
}

export default TvDatafeed;
export { Interval };
