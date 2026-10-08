(function (root) {
  'use strict';

  var data = root.CANDLETL_REPLAY;
  if (!data) return;

  var meta = data.meta || {};
  var levels = data.levels || [];
  var sourceNames = data.sources || [];
  var symbolNames = data.symbols || [];
  var symbolData = data.sym || {};
  var nSteps = Math.max(0, Number(meta.n_steps) || 0);
  var stepSeconds = Number(meta.step_s) || 5;
  var decoded = Object.create(null);
  var firstFetchMs = null;

  function decodeRuns(runs) {
    var result = new Array(nSteps);
    var position = 0;
    var list = runs || [];
    for (var i = 0; i < list.length && position < nSteps; i += 1) {
      var value = list[i][0];
      var length = Math.max(0, Number(list[i][1]) || 0);
      for (var j = 0; j < length && position < nSteps; j += 1) {
        result[position] = value;
        position += 1;
      }
    }
    while (position < nSteps) {
      result[position] = null;
      position += 1;
    }
    return result;
  }

  function decodedSymbol(name) {
    if (decoded[name]) return decoded[name];
    var raw = symbolData[name] || {};
    var result = Object.create(null);
    var rle = raw.rle || {};
    var keys = ['ri', 'lp', 'ar', 'h1', 'h5', 'dl', 'ef', 'lv', 'ce', 'sm', 'cm', 'x1', 'x5'];
    for (var i = 0; i < keys.length; i += 1) {
      result[keys[i]] = decodeRuns(rle[keys[i]]);
    }
    decoded[name] = result;
    return result;
  }

  function at(list, index) {
    return list && index >= 0 && index < list.length ? list[index] : null;
  }

  function pct(list, index, divisor) {
    var value = at(list, index);
    return value === null || value === undefined ? null : Number(value) / divisor;
  }

  function level(index) {
    return index === null || index === undefined || Number(index) < 0 ? null : (levels[Number(index)] || null);
  }

  function maskNames(mask) {
    var value = Number(mask) || 0;
    var result = [];
    for (var i = 0; i < sourceNames.length; i += 1) {
      if ((value & Math.pow(2, i)) !== 0) result.push(sourceNames[i]);
    }
    return result;
  }

  function titleCase(value) {
    return String(value || '').toLowerCase().replace(/_/g, ' ').replace(/\b[a-z]/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function jitter(name, step) {
    var hash = 2166136261;
    var input = name + ':' + step;
    for (var i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    return ((hash >>> 0) % 5) / 10;
  }

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function localTime(epochSeconds) {
    var date = new Date(epochSeconds * 1000);
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds());
  }

  // Mirrors LiveCollector._record_signal_history: one row per distinct tick epoch (the newest step of a run of equal
  // epochs wins), at most 720 rows, nothing older than (latest tick epoch - 3600 s). Scanning back from k and stopping at
  // 720 rows reproduces the collector's deque exactly (a plain [k-719, k] window is one row short after a replacement).
  function signalHistory(raw, rle, k, nowEpoch) {
    var lag = raw.lag || [];
    var cutoff = nowEpoch - (Number(at(lag, k)) || 0) - 3600;
    var rows = [];
    var lastEpoch = null;
    for (var j = k; j >= 0 && rows.length < 720; j -= 1) {
      var epoch = nowEpoch - (k - j) * stepSeconds - (Number(at(lag, j)) || 0);
      if (epoch < cutoff) break;
      if (epoch === lastEpoch) continue;
      lastEpoch = epoch;
      rows.push({
        epoch: epoch,
        m1_pct: pct(raw.m1, j, 100000),
        m5_pct: pct(raw.m5, j, 100000),
        daily_pct: pct(raw.dp, j, 100000),
        m1_severity: pct(raw.s1, j, 100),
        m5_severity: pct(raw.s5, j, 100),
        daily_severity: pct(raw.sd, j, 100),
        lptl_severity: Number(at(rle.lp, j))
      });
    }
    return rows.reverse();
  }

  function spreadSeries(raw, k, nowEpoch) {
    var values = raw.ps || [];
    var end = 59 + k * stepSeconds;
    var result = [];
    for (var offset = 59; offset >= 0; offset -= 1) {
      var index = end - offset;
      result.push({ epoch: nowEpoch - offset, spread: at(values, index) });
    }
    return result;
  }

  function symbolSnapshot(name, k, nowEpoch) {
    var raw = symbolData[name] || {};
    var rle = decodedSymbol(name);
    var lag = Number(at(raw.lag, k)) || 0;
    var tickEpoch = nowEpoch - lag;
    var rowIndex = Number(at(rle.ri, k));
    var modelRow = rowIndex >= 0 && raw.lptl_rows ? raw.lptl_rows[rowIndex] : null;
    var x1 = Number(at(rle.x1, k));
    var x5 = Number(at(rle.x5, k));
    var tickEpochRelative = k * stepSeconds - lag;
    var effective = level(at(rle.ef, k));
    var currentSeverities = [pct(raw.s1, k, 100), pct(raw.s5, k, 100), pct(raw.sd, k, 100)];
    var leaderNames = ['M1', 'M5', 'Daily'];
    var leaderIndex = 0;
    for (var i = 1; i < currentSeverities.length; i += 1) {
      var candidate = currentSeverities[i] === null ? -Infinity : currentSeverities[i];
      var leader = currentSeverities[leaderIndex] === null ? -Infinity : currentSeverities[leaderIndex];
      if (candidate > leader) leaderIndex = i;
    }
    return {
      symbol: name,
      bid: 0,
      ask: 0,
      mid: 0,
      tick_time: new Date(tickEpoch * 1000).toISOString(),
      freshness_seconds: Number((lag + jitter(name, k)).toFixed(1)),
      data_status: 'LIVE',
      spread_points: at(raw.sp, k),
      point_mult: Number(raw.pm) || 0,
      daily_pct: pct(raw.dp, k, 100000),
      daily_level: level(at(rle.dl, k)),
      m1_range_pct: pct(raw.m1c, k, 100000),
      m1_level: level(at(rle.h1, k)),
      live_m1_range_pct: pct(raw.m1, k, 100000),
      m5_range_pct: pct(raw.m5c, k, 100000),
      m5_level: level(at(rle.h5, k)),
      live_m5_range_pct: pct(raw.m5, k, 100000),
      lptl_level: level(at(rle.lp, k)),
      spread_area_level: level(at(rle.ar, k)),
      lptl_x: modelRow ? modelRow.x : 0,
      lptl_y: modelRow ? modelRow.y : 0,
      lptl_z: modelRow ? modelRow.z : 0,
      lptl_historical_rate_pct: modelRow ? modelRow.rate : null,
      lptl_count_above: at(raw.lc, k),
      lptl_thresholds: raw.lptl_thr || [],
      live_level: level(at(rle.lv, k)),
      effective_level: effective,
      effective_level_label: titleCase(effective),
      sources: maskNames(at(rle.sm, k)),
      candle_sources: maskNames(at(rle.cm, k)),
      hold: {
        m1_expires_epoch: x1 >= 0 ? tickEpoch + (x1 - tickEpochRelative) : null,
        m5_expires_epoch: x5 >= 0 ? tickEpoch + (x5 - tickEpochRelative) : null,
        m1_seconds_remaining: x1 >= 0 ? Math.max(0, x1 - tickEpochRelative) : 0,
        m5_seconds_remaining: x5 >= 0 ? Math.max(0, x5 - tickEpochRelative) : 0,
        deescalation_seconds_remaining: 0,
        suppressed_downgrade_to: null
      },
      candle_effective_level: level(at(rle.ce, k)),
      live_leader: leaderNames[leaderIndex],
      live_leader_severity: currentSeverities[leaderIndex],
      signal_history: signalHistory(raw, rle, k, nowEpoch),
      spread_series: spreadSeries(raw, k, nowEpoch),
      error: null
    };
  }

  function snapshot(step, nowMs) {
    if (!nSteps) throw new Error('CandleTL replay has no steps');
    var k = Math.max(0, Math.min(nSteps - 1, Math.floor(Number(step) || 0)));
    var timeMs = Number(nowMs);
    if (!isFinite(timeMs)) timeMs = Date.now();
    var nowEpoch = Math.floor(timeMs / 1000);
    var symbols = symbolNames.map(function (name) { return symbolSnapshot(name, k, nowEpoch); });
    var replayEvents = (data.events || []).filter(function (event) {
      return Number(event[0]) <= k;
    }).slice().sort(function (a, b) {
      // newest first; within one poll the collector processes symbols in order and appendleft()s, so the higher symbol index comes first
      return (Number(b[0]) - Number(a[0])) || (Number(b[1]) - Number(a[1]));
    }).slice(0, 50).map(function (event) {
      return {
        time: localTime(nowEpoch - (k - Number(event[0])) * stepSeconds),
        symbol: symbolNames[Number(event[1])] || '',
        from: level(event[2]),
        to: level(event[3]),
        sources: maskNames(event[4])
      };
    });
    return {
      status: 'demo',
      generated_at: new Date(timeMs).toISOString(),
      report_generated_at: meta.report_generated_at || null,
      total_symbols: symbols.length,
      active_symbols: symbols.filter(function (item) {
        return item.data_status === 'LIVE' && item.effective_level !== 'BASIC';
      }).length,
      symbols: symbols,
      events: replayEvents,
      error: null
    };
  }

  function fetchSnapshot() {
    var now = Date.now();
    if (firstFetchMs === null) firstFetchMs = now;
    var playFrom = Math.max(0, Math.min(nSteps - 1, Number(meta.play_from_step) || 0));
    var loopLength = Math.max(1, nSteps - playFrom);
    var k = playFrom + (Math.floor((now - firstFetchMs) / (stepSeconds * 1000)) % loopLength);
    var body = snapshot(k, now);
    return Promise.resolve({
      ok: true,
      status: 200,
      json: function () { return Promise.resolve(body); },
      text: function () { return Promise.resolve(JSON.stringify(body)); }
    });
  }

  root.CandleTLReplay = { snapshot: snapshot, fetchSnapshot: fetchSnapshot, meta: meta };
})(typeof window !== 'undefined' ? window : globalThis);
