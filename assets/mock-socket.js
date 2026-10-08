/**
 * GitHub Pages mock Socket.IO — supplies live-looking dummy data for every HSB page.
 */
(function () {
  function jitter(v, pct) {
    var n = Number(v) || 0;
    return Number((n * (1 + (Math.random() * 2 - 1) * (pct || 0.05))).toFixed(2));
  }
  function rand(a, b, d) {
    var x = a + Math.random() * (b - a);
    return d == null ? x : Number(x.toFixed(d));
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dateStr(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() - (offsetDays || 0));
    return pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear();
  }

  var SYMBOLS = ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USOIL', 'NAS100', 'BTCUSD', 'AUDUSD', 'USDCHF'];
  var state = {
    house: { abookF: -6084.14, abookC: -47083.26, ibF: 193323.28, ibC: 14012.98, dirF: 150033.87, dirC: 16962.91 },
    donna: { gNet: 29, gFpl: -1369.67, gCpl: 1594.26, gEq: 708858.9, gCum: 224.59, cNet: 18, cFpl: -820.4, cCpl: 1120.5, cEq: 412550.3, cCum: 300.1, fAmt: 14, fPl: -297.93, fCpl: 755.55, fEq: -23642.69 }
  };

  function genPositions(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var sym = SYMBOLS[i % SYMBOLS.length];
      var amt = rand(-40, 40, 2);
      var fpl = rand(-8000, 12000, 2);
      out.push({
        Symbol: sym, symbol: sym,
        Login: 100000 + i,
        login: 100000 + i,
        Amount: amt, amount: amt,
        Volume: rand(0.1, 8, 2), volume: rand(0.1, 8, 2),
        FloatingPL: fpl, floatingPL: fpl, Profit: fpl, profit: fpl,
        closedPL: rand(-4000, 6000, 2),
        Price: rand(1, 2500, 5),
        close_time: new Date(Date.now() - i * 3600000).toISOString(),
        open_time: new Date(Date.now() - i * 7200000).toISOString(),
        holding_period: pick(['Scalping', 'HFT', 'Intraday', 'Swing']),
        pattern: pick(['Normal', 'Scalping', 'HFT'])
      });
    }
    return out;
  }

  function genMT5() {
    var g = state.house;
    g.abookF = jitter(g.abookF, 0.04); g.abookC = jitter(g.abookC, 0.03);
    g.ibF = jitter(g.ibF, 0.03); g.ibC = jitter(g.ibC, 0.03);
    g.dirF = jitter(g.dirF, 0.03); g.dirC = jitter(g.dirC, 0.03);
    var groups = [
      { name: 'A-Book', floatingPL: g.abookF, closedPL: g.abookC },
      { name: 'All-Book IB', floatingPL: g.ibF, closedPL: g.ibC },
      { name: 'All-Book Direct', floatingPL: g.dirF, closedPL: g.dirC },
      { name: 'All-Book', floatingPL: Number((g.ibF + g.dirF).toFixed(2)), closedPL: Number((g.ibC + g.dirC).toFixed(2)) }
    ];
    var d = state.donna;
    d.gNet = Math.round(jitter(d.gNet, 0.05));
    d.gFpl = jitter(d.gFpl, 0.08);
    d.gCpl = jitter(d.gCpl, 0.04);
    d.gEq = jitter(d.gEq, 0.008);
    d.gCum = jitter(d.gCum, 0.1);
    if (d.cNet == null) { d.cNet = 18; d.cFpl = -820.4; d.cCpl = 1120.5; d.cEq = 412550.3; d.cCum = 300.1; }
    d.cNet = Math.max(1, Math.round(jitter(d.cNet, 0.06)));
    d.cFpl = jitter(d.cFpl, 0.09);
    d.cCpl = jitter(d.cCpl, 0.05);
    d.cEq = jitter(d.cEq, 0.01);
    d.cCum = jitter(d.cCum, 0.12);

    var traffic_light = [];
    SYMBOLS.slice(0, 8).forEach(function (s) {
      traffic_light.push({ symbol: s, traffic_light: pick(['GREEN', 'YELLOW', 'RED']) });
      traffic_light.push({ symbol: s + '.V', traffic_light: pick(['GREEN', 'YELLOW', 'RED']) });
    });

    return {
      metatrader_1f_1t: {
        'Metatrader-1F': { positions: genPositions(10) },
        'Metatrader-1T': { positions: genPositions(8) }
      },
      bbook_hpov: { positions: genPositions(6) },
      trafficlight: {
        traffic_light: traffic_light,
        trafficLight: traffic_light,
        txvx_accounts: [
          { category: 'TX', logins: '1001, 1002, 1003, 1004, 1005', quantity: 5 },
          { category: 'VX', logins: '2001, 2002, 2003, 2004, 2005', quantity: 5 }
        ],
        txvx_exposure: {
          TX: { positions: genPositions(5).map(function (p) { return { symbol: p.Symbol, amount: p.Amount, floatingPL: p.FloatingPL, closedPL: p.closedPL }; }) },
          VX: { positions: genPositions(4).map(function (p) { return { symbol: p.Symbol, amount: p.Amount, floatingPL: p.FloatingPL, closedPL: p.closedPL }; }) }
        }
      },
      house_pl: { groups: groups },
      seg_balance_process: {
        'CurrentBalance[IDR]': Math.round(jitter(1250000000, 0.01)),
        'FloatingPL[IDR]': Math.round(jitter(-45000000, 0.12)),
        'Equity[IDR]': Math.round(jitter(1205000000, 0.01)),
        'InitialMargin[IDR]': Math.round(jitter(320000000, 0.03)),
        'Collateral[IDR]': Math.round(jitter(50000000, 0.02)),
        'ExcessEquity[IDR]': Math.round(jitter(885000000, 0.02)),
        'Ratio[IDR]': (rand(250, 420, 2)) + '%',
        'CurrentBalance[USD]': Number(jitter(82000, 0.01).toFixed(2)),
        'FloatingPL[USD]': Number(jitter(-2800, 0.12).toFixed(2)),
        'Equity[USD]': Number(jitter(79200, 0.01).toFixed(2)),
        'InitialMargin[USD]': Number(jitter(21000, 0.03).toFixed(2)),
        'Collateral[USD]': Number(jitter(3500, 0.02).toFixed(2)),
        'ExcessEquity[USD]': Number(jitter(58200, 0.02).toFixed(2)),
        'Ratio[USD]': (rand(250, 420, 2)) + '%'
      },
      symbols_special: { symbols: [] },
      donna_ea: {
        C: { symbol: 'XAUUSD.EA', net_amount: d.cNet, fpl: d.cFpl, cpl: d.cCpl, equity: d.cEq, cumul_tpl: d.cCum },
        G: { symbol: 'XAUUSD.EA', net_amount: d.gNet, fpl: d.gFpl, cpl: d.gCpl, equity: d.gEq, cumul_tpl: d.gCum }
      },
      timestamp: new Date().toISOString()
    };
  }

  function genDonna() {
    var d = state.donna;
    d.fAmt = Math.round(jitter(d.fAmt, 0.08));
    d.fPl = jitter(d.fPl, 0.1);
    d.fCpl = jitter(d.fCpl, 0.05);
    d.fEq = jitter(d.fEq, 0.04);
    return { finaltoAmount: d.fAmt, finaltoPL: d.fPl, finaltoCPL: d.fCpl, finaltoEquity: d.fEq };
  }

  function genFinalto() {
    return {
      positions: genPositions(8),
      margins: {
        SGMarginRatio: Number(jitter(45, 0.05).toFixed(2)),
        LDMarginRatio: Number(jitter(38, 0.05).toFixed(2)),
        equity: rand(400000, 600000, 2),
        balance: rand(380000, 580000, 2),
        margin: rand(20000, 80000, 2),
        freeMargin: rand(300000, 500000, 2)
      }
    };
  }

  function genXsyphon() {
    return { positions: genPositions(5), margin: { XsyMarginRatio: Number(jitter(42, 0.05).toFixed(2)) } };
  }

  function genPrices() {
    var out = {};
    var bases = {
      XAUUSD: 4149.5, XAGUSD: 60.9, USDJPY: 158.1
    };
    ['XAUUSD', 'XAGUSD', 'USDJPY'].forEach(function (sym) {
      ['SG', 'UK', 'XSY', 'XS', 'V', 'MVIP'].forEach(function (suf) {
        var bid = jitter(bases[sym], 0.001);
        var ask = bid + (sym === 'USDJPY' ? 0.02 : 0.15);
        out[sym + '.' + suf] = { bid: bid, ask: ask, timestamp: Date.now() };
      });
    });
    out['XAUUSD.MVIP'] = out['XAUUSD.MVIP'] || { bid: 4149.6, ask: 4149.9, timestamp: Date.now() };
    out['XAUUSD.V'] = out['XAUUSD.V'] || { bid: 4149.5, ask: 4149.8, timestamp: Date.now() };
    return out;
  }

  function fatRow(i) {
    var bal = rand(20000, 350000, 2);
    var fpl = rand(-8000, 12000, 2);
    return {
      Date: dateStr(i % 20),
      date: dateStr(i % 20),
      BusinessType: pick(['IB', 'Direct', 'Whitelabel']),
      Login: String(100000 + i),
      login: String(100000 + i),
      Name: 'Client ' + (i + 1),
      'IDCRM/Name': 'CRM-' + (1000 + i),
      Group: pick(['HSB\\Standard', 'HSB\\VIP', 'GLR\\Pro', 'HSB\\ECN']),
      group: pick(['HSB\\Standard', 'HSB\\VIP']),
      Symbol: pick(SYMBOLS),
      symbol: pick(SYMBOLS),
      PL: fpl, Profit: fpl, profit: fpl,
      Lot: rand(0.5, 25, 2), Volume: rand(0.5, 25, 2),
      Floating: fpl, FloatingPL: fpl, floatingPL: fpl,
      LifetimePLIX: rand(-20000, 40000, 2),
      LifetimePLMT: rand(-15000, 35000, 2),
      LifetimePL: rand(-25000, 50000, 2),
      FTD: dateStr(30 + i),
      Balance: bal, balance: bal,
      Equity: bal + fpl, equity: bal + fpl,
      Commission: rand(-80, 40, 2),
      Swap: rand(-40, 30, 2),
      Deposit: rand(0, 50000, 2),
      Withdrawal: rand(0, 20000, 2),
      NetDeposit: rand(-10000, 40000, 2),
      // DailyEquityMeta keys
      BalanceFloat: bal, FloatingFloat: fpl, EquityFloat: bal + fpl, NegativeBalanceFloat: Math.max(0, -Math.min(0, bal + fpl)),
      Balance10K: jitter(bal * 0.9, 0.05), Floating10K: jitter(fpl * 0.8, 0.1), Equity10K: jitter(bal * 0.9 + fpl, 0.05), NegativeBalance10K: rand(0, 500, 2),
      Balance12K: jitter(bal * 1.1, 0.05), Floating12K: jitter(fpl * 0.9, 0.1), Equity12K: jitter(bal * 1.1 + fpl, 0.05), NegativeBalance12K: rand(0, 500, 2),
      Balance14K: jitter(bal * 1.2, 0.05), Floating14K: jitter(fpl, 0.1), Equity14K: jitter(bal * 1.2 + fpl, 0.05), NegativeBalance14K: rand(0, 500, 2),
      // misc
      Open: rand(100, 500, 2), High: rand(100, 500, 2), Low: rand(100, 500, 2), Close: rand(100, 500, 2),
      VolumeUSD: rand(1000, 500000, 2),
      Country: pick(['ID', 'SG', 'MY', 'TH']),
      Status: pick(['Active', 'Active', 'Closed']),
      Comment: 'demo'
    };
  }

  function genReportRows(n) {
    n = n || 14;
    var rows = [];
    for (var i = 0; i < n; i++) rows.push(fatRow(i));
    return rows;
  }

  function genRAS(login) {
    var patterns = ['Normal', 'Scalping', 'HFT', 'Swing', 'Intraday'];
    var trendSymbols = ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USOIL'];
    var pattern_overview = {
      patterns: patterns.map(function (pattern) {
        return {
          pattern: pattern,
          symbols: trendSymbols.slice(0, 4).map(function (symbol) {
            return { symbol: symbol, quantity: rand(1, 40, 0), profit: rand(-5000, 8000, 2) };
          })
        };
      })
    };
    var lvSymbols = trendSymbols.map(function (symbol) {
      return {
        symbol: symbol,
        volume_usd: rand(5000, 250000, 2),
        market_share_pct: rand(5, 35, 2),
        profit: rand(-8000, 15000, 2),
        win_rate_pct: rand(35, 72, 2)
      };
    });

    // Long-range close times + cumulative-style profit waves per symbol (Lifetime Profit Trend)
    var positions = [];
    var start = new Date(2025, 0, 5, 10, 0, 0).getTime(); // Jan 2025
    var end = new Date(2026, 8, 30, 18, 0, 0).getTime();   // Sep 2026
    var pid = 800000;
    trendSymbols.forEach(function (sym, si) {
      var cum = 0;
      var points = 28 + (si % 5); // many points per symbol
      for (var i = 0; i < points; i++) {
        var tms = start + Math.floor((end - start) * (i / (points - 1)));
        // wave + noise so line goes up and down
        var wave = Math.sin((i / points) * Math.PI * 4 + si) * (800 + si * 120);
        var step = wave * 0.15 + rand(-450, 550, 2);
        cum = Number((cum + step).toFixed(2));
        var d = new Date(tms);
        var closeStr =
          d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0') + ' ' +
          String(8 + (i % 10)).padStart(2, '0') + ':' +
          String((i * 7) % 60).padStart(2, '0') + ':00';
        var openMs = tms - rand(30, 240, 0) * 60000;
        var od = new Date(openMs);
        var openStr =
          od.getFullYear() + '-' +
          String(od.getMonth() + 1).padStart(2, '0') + '-' +
          String(od.getDate()).padStart(2, '0') + ' ' +
          String(od.getHours()).padStart(2, '0') + ':' +
          String(od.getMinutes()).padStart(2, '0') + ':00';
        var pat = pick(patterns);
        positions.push({
          position_id: pid++,
          close_deal: 900000 + pid,
          symbol: sym,
          close_time: closeStr,
          last_open_time: openStr,
          closeTime: closeStr,
          volume: rand(0.1, 3, 2),
          volume_usd: rand(1000, 50000, 2),
          profit: cum, // cumulative equity-style series for trend chart
          holding_period: pick(['12s', '45s', '2m', '8m', '25m', '1h 12m', '3h', '1d']),
          pattern: pat
        });
      }
    });

    var abusive = positions.filter(function (p) { return p.pattern === 'HFT' || p.pattern === 'Scalping'; }).slice(0, 8);
    // Prefer true trade-level rows for abusive table (non-cumulative-looking random)
    abusive = abusive.map(function (p, idx) {
      return Object.assign({}, p, {
        profit: rand(-1500, 2200, 2),
        position_id: 700000 + idx,
        close_deal: 710000 + idx
      });
    });

    var grandVol = lvSymbols.reduce(function (s, x) { return s + x.volume_usd; }, 0);
    var grandProf = lvSymbols.reduce(function (s, x) { return s + x.profit; }, 0);

    // Status: "Normal" OR "{1-100}% Abusive"
    var status = Math.random() < 0.35
      ? 'Normal'
      : (Math.floor(rand(1, 100, 0)) + '% Abusive');
    var clientType = pick(['Normal', 'Toxic', 'Very Toxic']);

    return {
      login: login || 10001,
      client_overview: {
        login: login || 10001,
        raw_group: 'HSB\\Standard',
        registered: '2024-03-12',
        initial_transaction: '2024-03-15',
        latest_transaction: '2026-09-15',
        status: status,
        ClientType: clientType,
        name: 'Demo Client ' + (login || 10001),
        equity: rand(25000, 120000, 2),
        balance: rand(20000, 110000, 2),
        margin: rand(2000, 15000, 2),
        free_margin: rand(15000, 100000, 2),
        profit: grandProf
      },
      pattern_overview: pattern_overview,
      lifetime_value: {
        total_positions: positions.length,
        grand_total_volume: grandVol,
        grand_total_profit: grandProf,
        symbols: lvSymbols
      },
      raw_deals: { positions: positions },
      positions: positions,
      abusive_trades: {
        total_abusive_trades: abusive.length,
        trades: abusive
      }
    };
  }



  function metricsBlock() {
    return {
      NetProfit: rand(-80000, 150000, 2),
      RealizedPL: rand(-60000, 120000, 2),
      BalanceAdjustment: rand(-5000, 8000, 2),
      AdjustTransferPos: rand(-3000, 4000, 2),
      AdjustTransferPosition: rand(-3000, 4000, 2),
      Commission: rand(-8000, -100, 2),
      Lot: rand(50, 800, 2),
      FloatingPL: rand(-40000, 60000, 2),
      ClientAccountBalance: rand(5000000, 15000000, 2),
      NetDeposit: rand(-100000, 300000, 2),
      Deposit: rand(50000, 400000, 2),
      Withdrawal: rand(20000, 250000, 2),
      NewDepositAmount: rand(10000, 150000, 2),
      NewFundedAccount: rand(5, 40, 0),
      AccountTraded: rand(50, 300, 0)
    };
  }
  function genManagementReportData() {
    function top() {
      var a = [];
      for (var i = 0; i < 10; i++) a.push({ Login: 100000 + i, Volume: rand(5, 200, 2), Amount: rand(-15000, 25000, 2) });
      return a;
    }
    var tracer = [];
    for (var i = 0; i < 6; i++) {
      tracer.push({
        Date: dateStr(i),
        Login: 100010 + i,
        PrevTempRate: pick(['Float', '10.000', '12.000']),
        NewTempRate: pick(['10.000', '12.000', '14.000']),
        PrevTempBusinessType: pick(['Retail', 'VIP']),
        NewTempBusinessType: pick(['VIP', 'Pro', 'Retail'])
      });
    }
    return {
      IsGLR: false,
      Metrics: {
        DailyIB: metricsBlock(), MonthlyIB: metricsBlock(), YearlyIB: metricsBlock(),
        DailyDirect: metricsBlock(), MonthlyDirect: metricsBlock(), YearlyDirect: metricsBlock(),
        DailyGLR: metricsBlock(), MonthlyGLR: metricsBlock(), YearlyGLR: metricsBlock()
      },
      AccountTracer: tracer,
      Top10Volume: { IB: top(), Direct: top() },
      Top10Profit: { IB: top(), Direct: top() },
      Top10Loss: { IB: top(), Direct: top() },
      ClientTrade: ['Float', '10.000', '12.000', '14.000'].map(function (Rate) {
        return {
          Rate: Rate,
          Metrics: {
            DailyIB: metricsBlock(), MonthlyIB: metricsBlock(), YearlyIB: metricsBlock(),
            DailyDirect: metricsBlock(), MonthlyDirect: metricsBlock(), YearlyDirect: metricsBlock(),
            DailyGLR: metricsBlock(), MonthlyGLR: metricsBlock(), YearlyGLR: metricsBlock()
          }
        };
      }),
      BalanceReport: {
        DailyIB: metricsBlock(), MonthlyIB: metricsBlock(), YearlyIB: metricsBlock(),
        DailyDirect: metricsBlock(), MonthlyDirect: metricsBlock(), YearlyDirect: metricsBlock(),
        DailyGLR: metricsBlock(), MonthlyGLR: metricsBlock(), YearlyGLR: metricsBlock()
      }
    };
  }
  function genRevenueReportData() {
    var rates = ['Float', '10.000', '12.000', '14.000'];
    var Table1 = {};
    rates.forEach(function (rate) {
      Table1[rate] = {
        LotIn: rand(20, 200, 2),
        LotOut: rand(15, 180, 2),
        TotalLot: rand(40, 350, 2),
        PL: rand(-30000, 50000, 2),
        Swaps: rand(-5000, 3000, 2),
        Commissions: rand(-4000, -100, 2),
        SwapAdjustment: rand(-1000, 1000, 2),
        TotalClientsPaid: rand(1000, 20000, 2),
        PLRevenue: rand(2000, 40000, 2),
        SwapRevenue: rand(500, 15000, 2),
        SwapAdjustmentRevenue: rand(-500, 2000, 2),
        RawRevenue: rand(5000, 60000, 2),
        RateMultiplier: rate === 'Float' ? 1 : rand(14000, 16000, 0),
        TotalRevenue: rand(10000, 90000, 2)
      };
    });
    return { Table1: Table1, table1: Table1, Table2: null, table2: null };
  }
  function genMonthlyDetailData() {
    var rates = ['Float', '10.000', '12.000', '14.000'];
    var Rows = [];
    ['IB', 'Direct'].forEach(function (g) {
      rates.forEach(function (rate) {
        Rows.push({
          WhitelabelRate: g + '[' + rate + ']',
          whitelabel_rate: g + '[' + rate + ']',
          Commission: rand(-3000, -50, 2),
          commission: rand(-3000, -50, 2),
          Swap: rand(-2000, 1500, 2),
          swap: rand(-2000, 1500, 2),
          Profit: rand(-25000, 40000, 2),
          profit: rand(-25000, 40000, 2),
          Lot: rand(10, 300, 2),
          lot: rand(10, 300, 2)
        });
      });
    });
    return { IsGLR: false, isGLR: false, Rows: Rows, rows: Rows };
  }


  function genRegulatoryTradeData() {
    var cats = [
      { CategoryLot: 'Gold', CategoryUser: 'Retail' },
      { CategoryLot: 'Gold', CategoryUser: 'VIP' },
      { CategoryLot: 'Forex', CategoryUser: 'Retail' },
      { CategoryLot: 'Forex', CategoryUser: 'VIP' },
      { CategoryLot: 'Index', CategoryUser: 'Retail' },
      { CategoryLot: 'Oil', CategoryUser: 'Retail' }
    ];
    var months = ['Jul-2025', 'Aug-2025', 'Sep-2025'];
    var rows = [];
    cats.forEach(function (c) {
      months.forEach(function (m) {
        rows.push({
          CategoryLot: c.CategoryLot,
          CategoryUser: c.CategoryUser,
          Month: m,
          month: m,
          QuantityUser: rand(5, 120, 0),
          TotalLot: rand(10, 500, 2)
        });
      });
    });
    return { rows: rows, data: rows, Records: rows };
  }


  // ── Fixed demo datasets (exact display values) ─────────────────────────────
  function genDailyBiggestProfitRows() {
    return [
      { BusinessType:'IB', Login:56019397, 'IDCRM/Name':'95180632', Group:'7T\\IBNanda\\Yudi\\B4\\Var500\\ND-01 (13)-(12k)', PL:12251.86, Lot:16.31, Floating:-14.00, LifetimePLIX:null, LifetimePLMT:9715.12, LifetimePL:9715.12, FTD:'16/03/2026 03:49:11', Balance:8120.28 },
      { BusinessType:'Direct', Login:54000436, 'IDCRM/Name':'95000818', Group:'Direct\\A4\\MIVIP', PL:3924.82, Lot:59.78, Floating:-12689.00, LifetimePLIX:null, LifetimePLMT:-82496.38, LifetimePL:-82496.38, FTD:'27/05/2026 03:57:02', Balance:16848.76 },
      { BusinessType:'Direct', Login:54000114, 'IDCRM/Name':'95000175', Group:'Direct\\A4\\VIP1', PL:2073.50, Lot:4.90, Floating:-902.85, LifetimePLIX:-110592.09, LifetimePLMT:-48962.91, LifetimePL:-159555.00, FTD:'21/12/2024 03:19:42', Balance:2986.06 },
      { BusinessType:'Direct', Login:56037970, 'IDCRM/Name':'95268148', Group:'Direct\\B2\\VIP1', PL:1742.50, Lot:4.00, Floating:null, LifetimePLIX:null, LifetimePLMT:-561.47, LifetimePL:-561.47, FTD:'08/09/2026 05:07:59', Balance:1500.00 },
      { BusinessType:'Direct', Login:56030542, 'IDCRM/Name':'95236065', Group:'Direct\\A2\\VIP1', PL:1702.00, Lot:10.00, Floating:null, LifetimePLIX:null, LifetimePLMT:-13059.97, LifetimePL:-13059.97, FTD:'26/06/2026 09:19:07', Balance:4938.47 },
      { BusinessType:'Direct', Login:56032318, 'IDCRM/Name':'95244699', Group:'Direct\\A2\\VIP1', PL:1349.55, Lot:5.77, Floating:-1790.45, LifetimePLIX:null, LifetimePLMT:-2612.07, LifetimePL:-2612.07, FTD:'12/07/2026 16:01:22', Balance:2633.77 },
      { BusinessType:'Direct', Login:54000133, 'IDCRM/Name':'95000195', Group:'1F\\Direct\\MIVIP', PL:1331.67, Lot:3.70, Floating:-1513.25, LifetimePLIX:-123920.35, LifetimePLMT:1562.65, LifetimePL:-122357.70, FTD:'21/12/2024 03:20:06', Balance:4486.72 },
      { BusinessType:'Direct', Login:56038712, 'IDCRM/Name':'95244080', Group:'Direct\\F1\\VIP1', PL:1317.50, Lot:1.15, Floating:-277.70, LifetimePLIX:null, LifetimePLMT:-584.72, LifetimePL:-584.72, FTD:'16/09/2026 16:47:31', Balance:2358.87 }
    ];
  }

  function genDailyEquityMetaRows() {
    // Date | Float(B,F,E,NB) | 10K | 12K | 14K
    var raw = [
      ['01/09/2026',12575.01,-2535.00,10040.01,-2893.66,63754.67,-24734.56,39020.11,-3983.71,770550.07,-267583.05,542967.02,-51785.57,1201.88,-508.62,693.26,-198.96],
      ['02/09/2026',12575.01,-1957.00,10618.01,-2893.66,63694.69,-22420.63,41274.06,-3983.71,754290.31,-215561.66,578728.65,-51813.47,1201.88,-508.62,693.26,-198.96],
      ['03/09/2026',203320.52,-848.33,202472.19,-2893.66,62924.50,-19079.14,43845.36,-3984.67,774042.39,-190442.06,623600.33,-51906.33,1201.88,-508.62,693.26,-198.96],
      ['04/09/2026',201061.63,-1867.24,199194.39,-2893.66,60732.20,-19705.25,41026.95,-4070.45,782121.63,-205397.19,616724.44,-52534.45,1201.88,-508.62,693.26,-198.96],
      ['07/09/2026',200329.50,-1970.01,198359.49,-2893.66,60581.06,-19283.29,41297.77,-4069.49,795422.92,-215485.64,619937.28,-52429.33,1201.88,-506.76,695.12,-198.96],
      ['08/09/2026',192411.27,4560.34,196971.61,-2893.66,60409.20,-20184.49,40224.71,-4023.60,799651.66,-248810.46,590841.20,-51746.16,1201.88,-508.62,693.26,-198.96],
      ['09/09/2026',166704.66,-3280.54,163424.12,-2893.66,59969.66,-18477.34,41492.32,-4023.60,796630.44,-226278.85,610351.59,-51730.08,1201.88,-508.62,693.26,-198.96],
      ['10/09/2026',165375.77,2677.73,168053.50,-2893.66,60375.28,-21985.54,38389.74,-4023.60,796023.88,-277268.29,558755.59,-51676.24,1201.88,-508.62,693.26,-198.96],
      ['11/09/2026',165314.52,-2009.82,163304.70,-2893.66,60582.56,-20544.67,40037.89,-4026.96,802251.92,-243547.16,598704.76,-52305.26,1201.88,-508.62,693.26,-198.96],
      ['14/09/2026',183766.62,-3681.22,180085.40,-2893.66,60948.79,-22031.67,38917.12,-4026.96,812319.62,-255871.07,596448.55,-52033.10,1201.88,-508.62,693.26,-198.96],
      ['15/09/2026',172542.76,-4268.72,168274.04,-2893.66,61183.31,-22297.24,38886.07,-4027.33,818084.23,-258985.75,599098.48,-52042.62,1201.88,-508.62,693.26,-198.96],
      ['16/09/2026',165956.46,-5413.77,160542.69,-2893.66,61763.56,-23847.10,37916.46,-4027.33,815610.84,-270067.14,585543.70,-51881.65,1201.88,-508.62,693.26,-198.96],
      ['17/09/2026',171509.78,-1101.95,170407.83,-2893.66,61468.46,-21220.38,40248.08,-4027.33,795509.30,-227447.09,608062.21,-51565.07,1201.88,-508.62,693.26,-198.96],
      ['18/09/2026',153561.32,1692.19,155253.51,-2893.66,61868.66,-20602.65,41266.01,-4027.33,797973.11,-220938.87,617034.24,-51536.23,1201.88,-508.62,693.26,-198.96],
      ['21/09/2026',144307.96,-873.13,143434.83,-2893.66,61864.64,-21404.08,40460.56,-4027.33,785353.30,-231824.75,593528.55,-51685.50,1201.88,-508.92,692.96,-198.96],
      ['22/09/2026',138316.86,216.99,138533.85,-2893.66,61262.17,-20356.65,40905.52,-4027.33,802989.93,-224639.19,618350.74,-51800.07,1201.88,-509.52,692.36,-198.96],
      ['23/09/2026',142972.51,-1468.88,141503.63,-2893.66,61092.86,-22933.15,38159.71,-4027.33,808759.11,-274775.66,573983.45,-51285.99,1201.88,-510.57,691.31,-198.96],
      ['24/09/2026',130645.33,-1089.34,129555.99,-2893.66,61371.69,-23445.10,37926.59,-4027.23,796192.43,-274288.80,561903.63,-51301.73,1201.88,-508.62,693.26,-198.96],
      ['25/09/2026',121446.59,-219.23,121227.36,-2893.66,61147.20,-22546.55,38600.65,-4023.38,781091.73,-265179.79,555911.94,-51327.06,1201.88,-508.62,693.26,-198.96],
      ['28/09/2026',137387.63,1434.99,138822.62,-2893.66,60922.78,-26909.41,34013.37,-4023.38,797662.51,-354995.71,482666.80,-51487.88,2155.25,-1503.81,651.44,-198.96],
      ['29/09/2026',134948.89,-377.67,134571.22,-2893.66,60587.13,-25030.84,35556.29,-4023.64,804734.75,-311866.42,532868.33,-51422.68,2155.25,-1437.45,717.80,-198.96],
      ['30/09/2026',125801.09,-252.64,125548.45,-2893.66,61196.82,-26037.42,35159.40,-4023.38,932830.36,-329825.72,643004.64,-51483.53,2155.25,-1462.42,692.83,-198.96]
    ];
    return raw.map(function (r) {
      return {
        Date: r[0],
        BalanceFloat: r[1], FloatingFloat: r[2], EquityFloat: r[3], NegativeBalanceFloat: r[4],
        Balance10K: r[5], Floating10K: r[6], Equity10K: r[7], NegativeBalance10K: r[8],
        Balance12K: r[9], Floating12K: r[10], Equity12K: r[11], NegativeBalance12K: r[12],
        Balance14K: r[13], Floating14K: r[14], Equity14K: r[15], NegativeBalance14K: r[16]
      };
    });
  }

  function genRegulatoryTradeData() {
    var months = ['July-2026', 'August-2026', 'September-2026'];
    var grid = {
      'Total|New':  [[876,1570.50],[707,1085.25],[580,1576.72]],
      'Total|Old':  [[1255,6222.22],[1316,6348.74],[1284,6334.63]],
      'Mini|New':   [[300,598.09],[211,316.48],[188,696.50]],
      'Mini|Old':   [[369,3822.86],[326,3080.94],[313,3653.61]],
      'Micro|New':  [[843,972.41],[684,768.77],[561,880.22]],
      'Micro|Old':  [[1219,2399.36],[1272,3267.80],[1242,2681.02]]
    };
    var rows = [];
    Object.keys(grid).forEach(function (key) {
      var parts = key.split('|');
      months.forEach(function (m, i) {
        rows.push({
          CategoryLot: parts[0], CategoryUser: parts[1], Month: m, month: m,
          QuantityUser: grid[key][i][0], TotalLot: grid[key][i][1]
        });
      });
    });
    return { rows: rows, data: rows, Records: rows };
  }

  function genRevenueReportData() {
    // Keys expected: 10000, 12000, 14000, Float (display as 10000 etc.)
    var Table1 = {
      '10000': {
        LotIn:343.40, LotOut:347.10, TotalLot:690.50,
        PL:-71686.17, Swaps:-4359.27, Commissions:-16274.10, SwapAdjustment:-183.36, TotalClientsPaid:-92502.90,
        PLRevenue:71686.17, SwapRevenue:4359.27, SwapAdjustmentRevenue:183.36, RawRevenue:76228.80,
        RateMultiplier:10000, TotalRevenue:762288000.00
      },
      '12000': {
        LotIn:127.60, LotOut:126.30, TotalLot:253.90,
        PL:-15429.50, Swaps:-1280.30, Commissions:-6150.50, SwapAdjustment:0, TotalClientsPaid:-22860.30,
        PLRevenue:15429.50, SwapRevenue:1280.30, SwapAdjustmentRevenue:0, RawRevenue:16709.80,
        RateMultiplier:12000, TotalRevenue:200517600.00
      },
      '14000': {
        LotIn:483.50, LotOut:494.70, TotalLot:978.20,
        PL:-121611.64, Swaps:-2862.29, Commissions:-24167.20, SwapAdjustment:0, TotalClientsPaid:-148641.13,
        PLRevenue:121611.64, SwapRevenue:2862.29, SwapAdjustmentRevenue:0, RawRevenue:124473.93,
        RateMultiplier:14000, TotalRevenue:1742635020.00
      },
      'Float': {
        LotIn:10.60, LotOut:10.90, TotalLot:21.50,
        PL:-11692.30, Swaps:-209.15, Commissions:-530.00, SwapAdjustment:0, TotalClientsPaid:-12431.45,
        PLRevenue:11692.30, SwapRevenue:209.15, SwapAdjustmentRevenue:0, RawRevenue:11901.45,
        RateMultiplier:1, TotalRevenue:11901.45
      }
    };
    return {
      Table1: Table1, table1: Table1,
      Table2: {
        TotalRevenueRp: 2705440620.00,
        TotalRevenueUSD: 11901.45,
        TotalLotAllRate: 1944.10
      },
      table2: {
        TotalRevenueRp: 2705440620.00,
        TotalRevenueUSD: 11901.45,
        TotalLotAllRate: 1944.10
      }
    };
  }

  function genOHCLRows() {
    var raw = [
      ['USDCHF','15/09/2026',0.81704,0.81979,0.81658,0.81827],
      ['USDCAD','15/09/2026',1.3899,1.39283,1.38963,1.39167],
      ['USDJPY','15/09/2026',154.32,155.231,154.201,155.077],
      ['EURUSD','15/09/2026',1.15489,1.15512,1.15264,1.154],
      ['NZDJPY','15/09/2026',89.164,89.415,88.943,89.274],
      ['GBPUSD','15/09/2026',1.34988,1.35038,1.34632,1.34695],
      ['NZDUSD','15/09/2026',0.57759,0.57807,0.57494,0.57546],
      ['AUDUSD','15/09/2026',0.71374,0.714,0.7116,0.71285],
      ['AUDJPY','15/09/2026',110.144,110.646,110.064,110.56],
      ['AUDNZD','15/09/2026',1.23493,1.23887,1.23452,1.23786],
      ['EURJPY','15/09/2026',178.239,179.104,178.126,178.978],
      ['EURAUD','15/09/2026',1.61723,1.62067,1.61661,1.61785],
      ['GBPJPY','15/09/2026',208.326,209.215,208.233,208.889],
      ['GBPAUD','15/09/2026',1.89072,1.89436,1.88819,1.88897],
      ['EURGBP','15/09/2026',0.85556,0.85661,0.85518,0.85646],
      ['EURCHF','15/09/2026',0.94362,0.94629,0.9421,0.94455],
      ['GBPCHF','15/09/2026',1.10283,1.10601,1.10026,1.10234],
      ['XAUUSD','15/09/2026',4296.02,4317.37,4261.32,4293.41],
      ['XAGUSD','15/09/2026',63.029,63.914,62.521,63.635],
      ['TECH100','15/09/2026',29193.25,29199,28920,28986.5],
      ['SP500','15/09/2026',7629.75,7632.5,7576.25,7596.5],
      ['DJ30','15/09/2026',52467,52474,51906,52161],
      ['JPN225','15/09/2026',63137,63920,62768,63424],
      ['USOIL','15/09/2026',101.86,106.72,101.22,105.5],
      ['HK50','15/09/2026',25013,25013,24620,24671]
    ];
    return raw.map(function (r) {
      return { Symbol:r[0], symbol:r[0], Currency:r[0], Date:r[1], date:r[1], Open:r[2], High:r[3], Low:r[4], Close:r[5] };
    });
  }

  function genAuditRegulatoryRows() {
    var base = [
      [100000,'08-09-2026',4601.65,19987.10,337128.24],
      [100001,'07-09-2026',46058.08,9666.46,146931.66],
      [100002,'06-09-2026',5122.53,19747.26,218760.38],
      [100003,'05-09-2026',3394.47,5087.65,18038.62],
      [100004,'04-09-2026',33546.55,13215.06,289629.33],
      [100005,'03-09-2026',2942.69,5103.04,263962.37],
      [100006,'02-09-2026',30336.23,8742.14,242886.73],
      [100007,'01-09-2026',45687.20,9985.51,160715.21],
      [100008,'31-08-2026',48923.94,10128.41,36345.75],
      [100009,'30-08-2026',12049.12,17602.89,358986.75],
      [100010,'29-08-2026',37941.03,2474.91,28122.69],
      [100011,'28-08-2026',24116.98,9286.07,157829.00],
      [100012,'27-08-2026',32699.09,7637.13,14297.57],
      [100013,'26-08-2026',42831.05,3220.52,60597.04]
    ];
    // Registration before FTD; lots, last trade, adjustment filled
    function daysBefore(ftd, n) {
      var p = ftd.split('-'); // DD-MM-YYYY
      var d = new Date(Number(p[2]), Number(p[1])-1, Number(p[0]));
      d.setDate(d.getDate() - n);
      var dd = String(d.getDate()).padStart(2,'0');
      var mm = String(d.getMonth()+1).padStart(2,'0');
      return dd + '-' + mm + '-' + d.getFullYear();
    }
    return base.map(function (r, i) {
      var ftd = r[1];
      var closed = Number((12 + i * 3.7).toFixed(2));
      var opened = Number((8 + i * 2.4).toFixed(2));
      return {
        Login: r[0],
        Registration: daysBefore(ftd, 40 + i * 5),
        FTD: ftd,
        Deposit: r[2],
        Withdrawal: r[3],
        Equity: r[4],
        ClosedLot: closed,
        OpenedLot: opened,
        LastTradeDate: daysBefore(ftd, - (3 + (i % 5))), // after FTD-ish; use near FTD
        Adjustment: Number(([-250,120,0,85.5,-40,300,-15,60,0,-120,45,200,-30,75][i]).toFixed(2))
      };
    }).map(function (row, i) {
      // LastTradeDate should be after registration; compute from FTD + few days within month
      var p = row.FTD.split('-');
      var d = new Date(Number(p[2]), Number(p[1])-1, Number(p[0]));
      d.setDate(d.getDate() + (1 + (i % 7)));
      var dd = String(d.getDate()).padStart(2,'0');
      var mm = String(d.getMonth()+1).padStart(2,'0');
      row.LastTradeDate = dd + '-' + mm + '-' + d.getFullYear();
      return row;
    });
  }


  function top10(arr) {
    return arr.map(function (x) { return { Login: x[0], Volume: x[1], Amount: x[2] }; });
  }
  function detailRows(catPairs, viewPrefix) {
    // catPairs: [{Category, Metric, daily, monthly}]
    return catPairs.map(function (r) {
      var o = { Category: r[0], Metric: r[1] };
      o['Daily' + viewPrefix] = r[2];
      o['Monthly' + viewPrefix] = r[3];
      // also set both views so switching works when combined later
      return o;
    });
  }
  function mergeDetails(ibList, directList) {
    var map = {};
    function add(list, which) {
      list.forEach(function (r) {
        var k = r.Category + '|' + r.Metric;
        if (!map[k]) map[k] = { Category: r.Category, Metric: r.Metric };
        if (which === 'IB') {
          map[k].DailyIB = r.DailyIB; map[k].MonthlyIB = r.MonthlyIB;
        } else {
          map[k].DailyDirect = r.DailyDirect; map[k].MonthlyDirect = r.MonthlyDirect;
        }
      });
    }
    add(ibList, 'IB'); add(directList, 'Direct');
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  var TRACER_ROWS = [
    ['2026-01-20',54002844,'12000','12000','Direct','IB'],
    ['2026-01-15',56004726,'12000','12000','Direct','IB'],
    ['2026-01-22',56005528,'12000','12000','Direct','IB'],
    ['2026-01-15',56005871,'12000','12000','Direct','IB'],
    ['2026-01-14',56008855,'12000','12000','Direct','IB'],
    ['2026-01-02',56009212,'12000','12000','Direct','IB'],
    ['2026-01-09',56009591,'12000','10000','Direct','IB'],
    ['2026-01-05',56010074,'12000','12000','Direct','IB'],
    ['2026-01-29',56010076,'12000','12000','Direct','IB'],
    ['2026-01-06',56010212,'12000','12000','Direct','IB'],
    ['2026-01-07',56010212,'12000','10000','IB','IB'],
    ['2026-01-02',56010332,'12000','12000','Direct','IB'],
    ['2026-01-02',56010386,'12000','12000','Direct','IB'],
    ['2026-01-08',56010401,'12000','12000','Direct','IB'],
    ['2026-01-02',56010687,'12000','12000','Direct','IB'],
    ['2026-01-02',56010812,'12000','12000','Direct','IB'],
    ['2026-01-02',56010832,'12000','12000','Direct','IB'],
    ['2026-01-07',56010868,'12000','12000','Direct','IB'],
    ['2026-01-09',56011135,'12000','12000','Direct','IB'],
    ['2026-01-13',56011208,'12000','12000','Direct','IB'],
    ['2026-01-07',56011264,'12000','12000','Direct','IB'],
    ['2026-01-14',56011270,'12000','12000','Direct','IB'],
    ['2026-01-12',56011426,'12000','12000','Direct','IB'],
    ['2026-01-13',56011585,'12000','12000','Direct','IB'],
    ['2026-01-07',56011697,'12000','12000','Direct','IB'],
    ['2026-01-07',56011763,'12000','12000','Direct','IB'],
    ['2026-01-08',56011863,'12000','12000','Direct','IB'],
    ['2026-01-22',56011887,'12000','12000','Direct','IB'],
    ['2026-01-14',56012057,'12000','12000','Direct','IB'],
    ['2026-01-09',56012091,'12000','12000','Direct','IB'],
    ['2026-01-13',56012091,'12000','12000','IB','Direct'],
    ['2026-01-09',56012100,'12000','12000','Direct','IB'],
    ['2026-01-13',56012115,'12000','12000','Direct','IB'],
    ['2026-01-12',56012137,'12000','12000','Direct','IB'],
    ['2026-01-12',56012171,'12000','12000','Direct','IB'],
    ['2026-01-12',56012241,'12000','12000','Direct','IB'],
    ['2026-01-13',56012250,'12000','12000','Direct','IB'],
    ['2026-01-22',56012279,'12000','12000','Direct','IB'],
    ['2026-01-27',56012453,'12000','12000','Direct','IB'],
    ['2026-01-13',56012575,'12000','12000','Direct','IB'],
    ['2026-01-14',56012634,'12000','12000','Direct','IB'],
    ['2026-01-14',56012666,'12000','12000','Direct','IB'],
    ['2026-01-19',56012935,'12000','12000','Direct','IB'],
    ['2026-01-22',56013027,'12000','12000','Direct','IB'],
    ['2026-01-28',56013038,'12000','12000','Direct','IB'],
    ['2026-01-30',56013041,'12000','12000','Direct','IB'],
    ['2026-01-22',56013391,'12000','12000','Direct','IB'],
    ['2026-01-26',56013421,'12000','12000','Direct','IB'],
    ['2026-01-23',56013478,'12000','12000','Direct','IB'],
    ['2026-01-22',56013553,'12000','12000','Direct','IB'],
    ['2026-01-23',56013708,'12000','12000','Direct','IB'],
    ['2026-01-23',56013726,'12000','12000','Direct','IB'],
    ['2026-01-28',56013811,'12000','10000','IB','IB'],
    ['2026-01-26',56013825,'12000','12000','Direct','IB'],
    ['2026-01-29',56013831,'12000','12000','Direct','IB'],
    ['2026-01-28',56013944,'12000','10000','IB','IB'],
    ['2026-01-27',56014029,'12000','12000','Direct','IB'],
    ['2026-01-27',56014157,'12000','12000','Direct','IB'],
    ['2026-01-28',56014216,'12000','14000','IB','IB'],
    ['2026-01-29',56014216,'14000','12000','IB','IB'],
    ['2026-01-28',56014306,'12000','12000','Direct','IB'],
    ['2026-01-29',56014315,'12000','12000','Direct','IB'],
    ['2026-01-29',56014393,'12000','12000','Direct','IB'],
    ['2026-01-29',56014411,'12000','12000','Direct','IB'],
    ['2026-01-29',56014436,'12000','12000','Direct','IB'],
    ['2026-01-30',56014486,'12000','12000','Direct','IB'],
    ['2026-01-30',56014628,'12000','12000','Direct','IB']
  ].map(function (r) {
    return { Date:r[0], Login:r[1], PrevTempRate:r[2], NewTempRate:r[3], PrevTempBusinessType:r[4], NewTempBusinessType:r[5] };
  });

  function genManagementReportData() {
    var Metrics = {
      DailyIB: {
        NetProfit:42791.34, RealizedPL:42367.53, BalanceAdjustment:38.77, AdjustTransferPos:0, AdjustTransferPosition:0,
        Commission:315.35, Lot:231.50, FloatingPL:145879.63,
        ClientAccountBalance:764999.38, NetDeposit:29030.08, Deposit:42028.99, Withdrawal:-12998.91,
        NewDepositAmount:878.00, NewFundedAccount:18, AccountTraded:210
      },
      MonthlyIB: {
        NetProfit:12705.35, RealizedPL:-14816.62, BalanceAdjustment:18132.38, AdjustTransferPos:0, AdjustTransferPosition:0,
        Commission:5194.06, Lot:6250.56, FloatingPL:145879.63,
        ClientAccountBalance:764999.38, NetDeposit:123919.23, Deposit:499181.34, Withdrawal:-375262.11,
        NewDepositAmount:81118.32, NewFundedAccount:473, AccountTraded:801
      },
      YearlyIB: {
        NetProfit:12705.35, RealizedPL:-14816.62, BalanceAdjustment:18132.38, AdjustTransferPos:0, AdjustTransferPosition:0,
        Commission:5194.06, Lot:6250.56, FloatingPL:145879.63,
        ClientAccountBalance:764999.38, NetDeposit:123919.23, Deposit:499181.34, Withdrawal:-375262.11,
        NewDepositAmount:81118.32, NewFundedAccount:1309, AccountTraded:801
      },
      DailyDirect: {
        NetProfit:262305.74, RealizedPL:261947.66, BalanceAdjustment:-561.98, AdjustTransferPos:0, AdjustTransferPosition:0,
        Commission:591.41, Lot:907.88, FloatingPL:20932.34,
        ClientAccountBalance:434496.18, NetDeposit:206793.90, Deposit:244969.66, Withdrawal:-38175.76,
        NewDepositAmount:2560.00, NewFundedAccount:35, AccountTraded:324
      },
      MonthlyDirect: {
        NetProfit:-693511.52, RealizedPL:-756352.87, BalanceAdjustment:33833.93, AdjustTransferPos:0, AdjustTransferPosition:0,
        Commission:9962.27, Lot:13866.37, FloatingPL:20932.34,
        ClientAccountBalance:434496.18, NetDeposit:-1070116.87, Deposit:1746405.04, Withdrawal:-2816521.91,
        NewDepositAmount:70879.13, NewFundedAccount:555, AccountTraded:1063
      },
      YearlyDirect: {
        NetProfit:-693511.52, RealizedPL:-756352.87, BalanceAdjustment:33833.93, AdjustTransferPos:0, AdjustTransferPosition:0,
        Commission:9962.27, Lot:13866.37, FloatingPL:20932.34,
        ClientAccountBalance:434496.18, NetDeposit:-1070116.87, Deposit:1746405.04, Withdrawal:-2816521.91,
        NewDepositAmount:70879.13, NewFundedAccount:6019, AccountTraded:1063
      }
    };
    // BalanceReport uses same metric blocks in render via Metrics
    var Top10Winner = {
      IB: top10([[50100497,10.10,8303.50],[50100534,1.00,2071.00],[56010123,9.10,1625.70],[50100088,7.12,985.73],[50101169,1.60,728.30],[50100669,3.68,641.69],[56014337,1.60,616.90],[50100688,1.52,592.48],[56005163,1.42,532.48],[56012863,6.94,471.21]]),
      Direct: top10([[54001564,0.81,1476.69],[54000137,41.70,1447.97],[54000664,1.50,1093.23],[54002378,11.34,1008.58],[54000076,2.96,954.55],[54000494,5.34,943.50],[54001147,0.95,726.10],[56001102,0.60,561.86],[56011938,3.00,536.00],[56004570,0.04,382.05]])
    };
    var Top10Loser = {
      IB: top10([[56008460,0.41,-10556.02],[56005973,2.23,-9210.20],[56014282,0.34,-7669.90],[50100625,4.32,-5411.16],[56012924,9.40,-3815.37],[56010979,1.22,-2911.60],[50100525,0.36,-2695.35],[56014475,0.43,-2042.13],[56008986,0.08,-1567.06],[50101129,4.02,-1268.60]]),
      Direct: top10([[56000710,17.00,-59690.50],[56000726,249.70,-43808.01],[56001567,25.12,-24813.03],[56001656,25.64,-16181.93],[54002438,111.28,-11890.32],[56007143,1.95,-7161.77],[54000249,29.06,-5919.68],[54000297,13.68,-5465.48],[52000115,2.34,-5444.36],[54000097,6.23,-4577.23]])
    };
    var Top10Volume = {
      IB: top10([[56014535,11.68,253.35],[50100497,10.10,8303.50],[56012924,9.40,-3815.37],[56010123,9.10,1625.70],[56013703,8.82,112.40],[50100088,7.12,985.73],[56012863,6.94,471.21],[56011603,6.54,-1018.22],[56006026,5.80,-762.69],[56005034,5.70,-149.04]]),
      Direct: top10([[56000726,249.70,-43808.01],[54002438,111.28,-11890.32],[54000137,41.70,1447.97],[56002316,33.38,-776.23],[54000249,29.06,-5919.68],[56001656,25.64,-16181.93],[56001567,25.12,-24813.03],[56000710,17.00,-59690.50],[54000953,15.30,-26.56],[54000297,13.68,-5465.48]])
    };
    var Top10Deposit = {
      IB: top10([[56010123,0,10000],[56014282,0,5600],[56012924,0,3820],[50100625,0,2500],[56008170,0,1500],[50101129,0,1270],[56011603,0,1101.66],[50100769,0,1000],[56014535,0,1000],[56002766,0,1000]]),
      Direct: top10([[56000726,0,48666.67],[56000710,0,47800],[56001567,0,24000],[56001656,0,15000],[54002438,0,12000],[54000137,0,8500],[52000115,0,5450],[54000297,0,5400],[56004161,0,5000],[54000660,0,4350]])
    };
    var Top10Withdrawal = {
      IB: top10([[56013703,0,-1500],[56014535,0,-1247],[50100088,0,-1185],[50100167,0,-1050],[56010388,0,-1000],[56014282,0,-942],[56005351,0,-550],[50012115,0,-513],[56014156,0,-411],[50100525,0,-402.34]]),
      Direct: top10([[56002079,0,-8000],[54000137,0,-7500],[56014583,0,-4950],[56010815,0,-4937.77],[56014738,0,-1025],[56009017,0,-1000],[54001630,0,-700],[56013964,0,-564],[56014562,0,-489],[54001710,0,-476]])
    };

    function drow(cat, metric, dib, mib, dd, md) {
      return { Category:cat, Metric:metric, DailyIB:dib, MonthlyIB:mib, DailyDirect:dd, MonthlyDirect:md };
    }
    var DetailedEachSymbol = [
      drow('Forex','NetProfit',884.83,17914.84,-1702.57,9360.25),
      drow('Forex','RealizedPL',827.72,14890.57,-1924.86,5666.68),
      drow('Forex','RealizedInterest',44.71,2311.37,186.59,2169.57),
      drow('Forex','Commission',12.40,712.90,35.70,1524.00),
      drow('Forex','Lot',15.80,638.00,49.90,1619.80),
      drow('Forex','FloatingPL',66950.24,66950.24,4086.33,4086.33),
      drow('Forex','FloatingInterest',3507.41,3507.41,2311.43,2311.43),
      drow('Metal','NetProfit',41768.33,1042.41,265193.04,-744070.13),
      drow('Metal','RealizedPL',41443.95,-4260.84,264511.79,-768995.55),
      drow('Metal','RealizedInterest',24.98,1179.60,141.23,16739.96),
      drow('Metal','Commission',299.40,4123.65,540.02,8185.46),
      drow('Metal','Lot[XAUUSD]',201.93,5229.75,825.08,11501.45),
      drow('Metal','Lot[XAGUSD]',12.57,316.14,14.64,410.52),
      drow('Metal','FloatingPL',71779.48,71779.48,12053.92,12053.92),
      drow('Metal','FloatingInterest',0.45,0.45,167.47,167.47),
      drow('Energy','NetProfit',154.95,804.72,199.93,1968.07),
      drow('Energy','RealizedPL',154.40,791.60,186.50,1801.70),
      drow('Energy','RealizedInterest',0.00,0.81,0.54,31.26),
      drow('Energy','Commission',0.55,12.31,12.89,135.11),
      drow('Energy','Lot',1.00,21.17,14.16,165.80),
      drow('Energy','FloatingPL',146.70,146.70,-49.40,-49.40),
      drow('Energy','FloatingInterest',0.00,0.00,0.03,0.03),
      drow('Index','NetProfit',-55.54,-25189.00,-823.68,5358.13),
      drow('Index','RealizedPL',-58.54,-26237.95,-825.77,5174.60),
      drow('Index','RealizedInterest',0.00,703.75,0.29,103.83),
      drow('Index','Commission',3.00,345.20,1.80,79.70),
      drow('Index','Lot',0.20,45.50,3.10,142.80),
      drow('Index','FloatingPL',3420.00,3420.00,2399.90,2399.90),
      drow('Index','FloatingInterest',75.35,75.35,107.03,107.03),
      drow('US Stock','NetProfit',0,0,1.00,38.23),
      drow('US Stock','RealizedPL',0,0,0.00,-0.30),
      drow('US Stock','RealizedInterest',0,0,0.00,0.53),
      drow('US Stock','Commission',0,0,1.00,38.00),
      drow('US Stock','Lot',0,0,1.00,26.00),
      drow('US Stock','FloatingPL',0,0,-218.80,-218.80),
      drow('US Stock','FloatingInterest',0,0,74.43,74.43)
    ];

    return {
      IsGLR: false,
      Metrics: Metrics,
      AccountTracer: TRACER_ROWS,
      Top10Winner: Top10Winner,
      Top10Loser: Top10Loser,
      Top10Volume: Top10Volume,
      Top10Deposit: Top10Deposit,
      Top10Withdrawal: Top10Withdrawal,
      DetailedEachSymbol: DetailedEachSymbol,
      BalanceReport: Metrics
    };
  }

  function rateMetrics(d) {
    return {
      DailyIB: d.ibD, MonthlyIB: d.ibM, YearlyIB: d.ibY,
      DailyDirect: d.dirD, MonthlyDirect: d.dirM, YearlyDirect: d.dirY
    };
  }
  function genFinanceMonthlyReportData() {
    // Reuse management base and override ClientTrade by rate
    var base = genManagementReportData();
    // Direct balance differs slightly in Finance monthly sample
    base.Metrics.DailyDirect.ClientAccountBalance = 451556.83;
    base.Metrics.MonthlyDirect.ClientAccountBalance = 451556.83;
    base.Metrics.YearlyDirect.ClientAccountBalance = 451556.83;
    base.Metrics.YearlyDirect.NewFundedAccount = 6021;
    base.Metrics.MonthlyDirect.AccountTraded = 1065;
    base.Metrics.YearlyDirect.AccountTraded = 1065;
    base.Metrics.DailyDirect.AccountTraded = 325;

    function blk(np, rp, ba, at, cm, lot, fpl) {
      return { NetProfit:np, RealizedPL:rp, BalanceAdjustment:ba, AdjustTransferPos:0, AdjustTransferPosition:0, Commission:cm, Lot:lot, FloatingPL:fpl };
    }
    base.ClientTrade = [
      {
        Rate: '12K',
        Metrics: {
          DailyIB: blk(16410.35,16075.85,0,0,270.97,154.73,79612.86),
          MonthlyIB: blk(5273.70,-18976.11,17299.66,0,3238.55,3653.11,79612.86),
          YearlyIB: blk(5273.70,-18976.11,17299.66,0,3238.55,3653.11,79612.86),
          DailyDirect: blk(262267.44,261904.36,-561.98,0,596.41,908.08,20932.34),
          MonthlyDirect: blk(-550889.85,-612671.97,33862.93,0,10041.57,13846.92,20932.34),
          YearlyDirect: blk(-550889.85,-612671.97,33862.93,0,10041.57,13846.92,20932.34)
        }
      },
      {
        Rate: '14K',
        Metrics: {
          DailyIB: blk(3219.43,3206.44,0,0,12.99,20.18,0),
          MonthlyIB: blk(-21722.88,-22135.33,250,0,160.71,303.79,0),
          YearlyIB: blk(-21722.88,-22135.33,250,0,160.71,303.79,0),
          DailyDirect: blk(0,0,0,0,0,0,0),
          MonthlyDirect: blk(0,0,0,0,0,0,0),
          YearlyDirect: blk(0,0,0,0,0,0,0)
        }
      },
      {
        Rate: '10K',
        Metrics: {
          DailyIB: blk(23161.56,23085.24,38.77,0,31.39,56.59,63152.77),
          MonthlyIB: blk(34973.03,32117.82,582.72,0,1790.30,2284.66,63152.77),
          YearlyIB: blk(34973.03,32117.82,582.72,0,1790.30,2284.66,63152.77),
          DailyDirect: blk(0,0,0,0,0,0,0),
          MonthlyDirect: blk(5999.29,4808.30,0,0,1175.00,47.00,0),
          YearlyDirect: blk(5999.29,4808.30,0,0,1175.00,47.00,0)
        }
      },
      {
        Rate: 'Float',
        Metrics: {
          DailyIB: blk(0,0,0,0,0,0,3114.00),
          MonthlyIB: blk(-5818.50,-5823.00,0,0,4.50,9.00,3114.00),
          YearlyIB: blk(-5818.50,-5823.00,0,0,4.50,9.00,3114.00),
          DailyDirect: blk(0,0,0,0,0,0,0),
          MonthlyDirect: blk(-142358.37,-143507.60,-29,0,10.70,23.05,0),
          YearlyDirect: blk(-142358.37,-143507.60,-29,0,10.70,23.05,0)
        }
      }
    ];
    // Metal slight differences for Finance Direct monthly
    base.DetailedEachSymbol = base.DetailedEachSymbol.map(function (r) {
      if (r.Category === 'Metal' && r.Metric === 'NetProfit') { r.DailyDirect = 265154.74; r.MonthlyDirect = -737829.54; }
      if (r.Category === 'Metal' && r.Metric === 'RealizedPL') { r.DailyDirect = 264468.49; r.MonthlyDirect = -764030.95; }
      if (r.Category === 'Metal' && r.Metric === 'RealizedInterest') { r.MonthlyDirect = 16755.95; }
      if (r.Category === 'Metal' && r.Metric === 'Commission') { r.DailyDirect = 545.02; r.MonthlyDirect = 9445.46; }
      if (r.Category === 'Metal' && r.Metric === 'Lot[XAUUSD]') { r.DailyDirect = 825.28; r.MonthlyDirect = 11551.85; }
      if (r.Category === 'Energy' && r.Metric === 'NetProfit') { r.MonthlyDirect = 1990.07; }
      if (r.Category === 'Energy' && r.Metric === 'RealizedPL') { r.MonthlyDirect = 1818.70; }
      if (r.Category === 'Energy' && r.Metric === 'Commission') { r.MonthlyDirect = 140.11; }
      if (r.Category === 'Energy' && r.Metric === 'Lot') { r.MonthlyDirect = 166.00; }
      return r;
    });
    return base;
  }

  function createSocket() {
    var handlers = {};
    function fire(ev, data) {
      (handlers[ev] || []).forEach(function (fn) {
        try { fn(data); } catch (e) { console.warn('[mock-socket]', ev, e); }
      });
    }

    var socket = {
      connected: true,
      id: 'mock-' + Math.random().toString(36).slice(2, 8),
      on: function (ev, fn) {
        (handlers[ev] = handlers[ev] || []).push(fn);
        return socket;
      },
      once: function (ev, fn) {
        var w = function (d) { socket.off(ev, w); fn(d); };
        return socket.on(ev, w);
      },
      off: function (ev, fn) {
        if (!handlers[ev]) return socket;
        if (!fn) delete handlers[ev];
        else handlers[ev] = handlers[ev].filter(function (f) { return f !== fn; });
        return socket;
      },
      emit: function (ev, payload) {
        payload = payload || {};
        if (ev === 'run-ras' || ev === 'ras-run' || ev === 'start-ras') {
          setTimeout(function () {
            fire('ras-result', genRAS(payload.login));
          }, 400);
        }
        if (ev === 'run-report' || ev === 'drs-run' || ev === 'start-report' || ev === 'generate-report') {
          var type = payload.reportType || payload.type || 'generic';
          setTimeout(function () {
            var data;
            if (type === 'ManagementReport') {
              data = genManagementReportData();
            } else if (type === 'FinanceMonthlyReport') {
              data = genFinanceMonthlyReportData();
            } else if (type === 'RevenueReport') {
              data = genRevenueReportData();
            } else if (type === 'MonthlyDetailTransaction') {
              data = genMonthlyDetailData();
            } else if (type === 'RegulatoryTrade') {
              data = genRegulatoryTradeData();
            } else if (type === 'DailyBiggestProfit' || type === 'AccountMonitoringList') {
              var rowsDB = genDailyBiggestProfitRows();
              data = { rows: rowsDB, data: rowsDB, Records: rowsDB };
            } else if (type === 'DailyEquityMeta') {
              var rowsDE = genDailyEquityMetaRows();
              data = { rows: rowsDE, data: rowsDE, Records: rowsDE };
            } else if (type === 'OHCL') {
              var rowsOH = genOHCLRows();
              data = { rows: rowsOH, data: rowsOH, Records: rowsOH };
            } else if (type === 'AuditRegulatory') {
              var rowsAR = genAuditRegulatoryRows();
              data = { rows: rowsAR, data: rowsAR, Records: rowsAR };
            } else {
              var rows = genReportRows(14);
              data = { rows: rows, data: rows, Records: rows };
            }
            fire('report-result', {
              ok: true,
              reportType: type,
              data: data,
              rows: data.rows || data.Rows || []
            });
          }, 350);
        }
        return socket;
      },
      disconnect: function () { return socket; },
      connect: function () { return socket; }
    };

    function tick() {
      fire('mt5-update', genMT5());
      fire('donna-update', genDonna());
      fire('finalto-update', genFinalto());
      fire('xsyphon-update', genXsyphon());
      fire('updatePrices', genPrices());
    }

    setTimeout(tick, 150);
    setTimeout(tick, 600);
    setTimeout(tick, 1200);
    setInterval(tick, 2200);

    // Auto-run Start buttons on report / RAS pages (static demo UX)
    function autoStart() {
      try {
        // Prefill common report filters for static demo
        var wl = document.getElementById('whitelabel');
        if (wl && !wl.value) wl.value = 'HSB';
        var dateInput = document.getElementById('date-input');
        if (dateInput && !dateInput.value) {
          // quarter select or month text
          if (dateInput.tagName === 'SELECT') {
            if ([].some.call(dateInput.options, function (o) { return o.value === 'Q1'; })) dateInput.value = 'Q1';
            else if (dateInput.options.length) dateInput.selectedIndex = Math.min(1, dateInput.options.length - 1);
          } else {
            dateInput.value = '15-09-2025';
          }
        }
        var yearInput = document.getElementById('year-input');
        if (yearInput && !yearInput.value) yearInput.value = String(new Date().getFullYear());
        var loginEl = document.getElementById('login') || document.querySelector('input[name="login"]');
        if (loginEl && !loginEl.value) loginEl.value = '10001';

        if (typeof window.runReport === 'function') {
          window.runReport();
          return;
        }
        if (typeof window.runRAS === 'function') {
          window.runRAS();
          return;
        }
        var btn = document.querySelector('button[onclick*="runReport"], button[onclick*="runRAS"]');
        if (btn) btn.click();
      } catch (e) { /* ignore */ }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(autoStart, 500); });
    } else {
      setTimeout(autoStart, 500);
    }

    return socket;
  }


  
  // Mock CandleTL live API used by tlm/dev-mode.html
  var _origFetch = window.fetch;
  window.fetch = function (url, opts) {
    var u = String(url || '');
    if (u.indexOf('candletl/live') !== -1 || u.indexOf('candletl/health') !== -1) {
      if (u.indexOf('health') !== -1) {
        var health = { ok: true, mode: 'demo' };
        return Promise.resolve({ ok: true, json: function () { return Promise.resolve(health); }, text: function () { return Promise.resolve(JSON.stringify(health)); } });
      }
      var now = Date.now();
      var LEVELS = ['Green', 'Yellow', 'Orange', 'Red'];
      var core = ['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USOIL'];
      var symbols = core.map(function (symbol) {
        var spread = symbol.indexOf('XAU') === 0 ? rand(18, 45, 1)
          : symbol.indexOf('XAG') === 0 ? rand(8, 25, 1)
          : symbol.indexOf('JPY') !== -1 ? rand(0.8, 3.5, 2)
          : rand(0.5, 4, 2);
        var level = pick(LEVELS);
        var history = [];
        for (var i = 60; i >= 0; i--) {
          history.push({
            epoch: Math.floor((now - i * 1000) / 1000),
            spread: Number((spread + rand(-3, 3, 2)).toFixed(2)),
            m1_severity: rand(0, 12, 1),
            m5_severity: rand(0, 15, 1),
            daily_severity: rand(0, 10, 1),
            lptl_severity: rand(0, 18, 1)
          });
        }
        return {
          symbol: symbol,
          data_status: 'Live',
          spread_points: spread,
          spread_area_level: level,
          lptl_level: pick(LEVELS),
          effective_level: level,
          live_level: level,
          candle_effective_level: level,
          candle_sources: ['M1', 'M5'],
          sources: ['spread', 'M1', 'M5'],
          lptl_count_above: rand(0, 40, 0),
          lptl_x: 30,
          lptl_y: rand(15, 40, 0),
          lptl_z: rand(5, 20, 0),
          m1_range_pct: rand(0.01, 0.8, 4),
          m5_range_pct: rand(0.05, 1.5, 4),
          daily_pct: rand(-1.2, 1.2, 4),
          lptl_historical_rate_pct: rand(2, 25, 2),
          tick_time: now,
          freshness_seconds: rand(0, 3, 0),
          signal_history: history,
          spread_history: history,
          rolling_spread: history,
          m1_level: pick(LEVELS),
          m5_level: pick(LEVELS),
          daily_level: pick(LEVELS),
          confirmed_lptl: pick(LEVELS)
        };
      });
      var body = {
        status: 'ok',
        generated_at: new Date().toISOString(),
        report_generated_at: new Date().toISOString(),
        total_symbols: symbols.length,
        active_symbols: symbols.length,
        symbols: symbols,
        events: [
          { time: new Date(now - 120000).toLocaleTimeString(), symbol: 'XAUUSD', from: 'Green', to: 'Yellow', sources: ['M1', 'spread'] },
          { time: new Date(now - 60000).toLocaleTimeString(), symbol: 'EURUSD', from: 'Yellow', to: 'Green', sources: ['M5'] }
        ]
      };
      return Promise.resolve({
        ok: true,
        status: 200,
        json: function () { return Promise.resolve(body); },
        text: function () { return Promise.resolve(JSON.stringify(body)); }
      });
    }
    if (_origFetch) return _origFetch.apply(this, arguments);
    return Promise.reject(new Error('fetch not available'));
  };

window.io = function () { return createSocket(); };
})();
