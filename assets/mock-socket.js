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
    donna: { gNet: 29, gFpl: -1369.67, gCpl: 1594.26, gEq: 708858.9, gCum: 224.59, fAmt: 14, fPl: -297.93, fCpl: 755.55, fEq: -23642.69 }
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
        C: { symbol: '—', net_amount: 0, fpl: 0, cpl: 0, equity: 0, cumul_tpl: 0 },
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
    var pattern_overview = {
      patterns: patterns.map(function (pattern) {
        return {
          pattern: pattern,
          symbols: SYMBOLS.slice(0, 4).map(function (symbol) {
            return { symbol: symbol, quantity: rand(1, 40, 0), profit: rand(-5000, 8000, 2) };
          })
        };
      })
    };
    var lvSymbols = SYMBOLS.slice(0, 6).map(function (symbol) {
      return {
        symbol: symbol,
        volume_usd: rand(5000, 250000, 2),
        market_share_pct: rand(5, 35, 2),
        profit: rand(-8000, 15000, 2),
        win_rate_pct: rand(35, 72, 2)
      };
    });
    var positions = [];
    for (var i = 0; i < 18; i++) {
      var day = 10 + (i % 15);
      var openH = 9 + (i % 6);
      var closeH = openH + 1 + (i % 4);
      var pat = pick(patterns);
      positions.push({
        position_id: 800000 + i * 17,
        close_deal: 900000 + i * 11,
        symbol: pick(SYMBOLS),
        close_time: '2025-09-' + String(day).padStart(2, '0') + ' ' + String(closeH).padStart(2, '0') + ':' + String((i * 7) % 60).padStart(2, '0') + ':00',
        last_open_time: '2025-09-' + String(day).padStart(2, '0') + ' ' + String(openH).padStart(2, '0') + ':' + String((i * 3) % 60).padStart(2, '0') + ':00',
        closeTime: '2025-09-' + String(day).padStart(2, '0') + ' ' + String(closeH).padStart(2, '0') + ':' + String((i * 7) % 60).padStart(2, '0') + ':00',
        volume: rand(0.1, 3, 2),
        volume_usd: rand(1000, 50000, 2),
        profit: rand(-1500, 2200, 2),
        holding_period: pick(['12s', '45s', '2m', '8m', '25m', '1h 12m', '3h']),
        pattern: pat
      });
    }
    var abusive = positions.filter(function (p) { return p.pattern === 'HFT' || p.pattern === 'Scalping'; }).slice(0, 8);
    var grandVol = lvSymbols.reduce(function (s, x) { return s + x.volume_usd; }, 0);
    var grandProf = lvSymbols.reduce(function (s, x) { return s + x.profit; }, 0);
    return {
      login: login || 10001,
      client_overview: {
        login: login || 10001,
        raw_group: 'HSB\\Standard',
        registered: '2024-03-12',
        initial_transaction: '2024-03-15',
        latest_transaction: '2025-09-15',
        status: pick(['Normal', 'Normal', 'Abusive', 'Normal']),
        ClientType: pick(['Normal', 'Normal', 'Watchlist']),
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
            if (type === 'ManagementReport' || type === 'FinanceMonthlyReport') {
              data = genManagementReportData();
            } else if (type === 'RevenueReport') {
              data = genRevenueReportData();
            } else if (type === 'MonthlyDetailTransaction') {
              data = genMonthlyDetailData();
            } else if (type === 'RegulatoryTrade') {
              data = genRegulatoryTradeData();
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
