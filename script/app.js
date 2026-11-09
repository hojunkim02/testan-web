"use strict";

const fx = (v, d) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  const t = Math.abs(v).toFixed(d).replace(/^0(?=\.)/, "");
  return (v < 0 && Number(t) !== 0 ? "−" : "") + t;
};
const f3 = (v) => fx(v, 3);
const fnum = (v, d) => (Number.isInteger(v) ? String(v) : v.toFixed(d));

const CIRC = "①②③④⑤⑥⑦⑧⑨";

const circ = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 9 ? CIRC[n - 1] : String(v).trim() || "-";
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
};

const $ = (id) => document.getElementById(id);
const esc = (t) =>
  String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const ID_HEADER = /^(id|학번|번호|수험번호|학생|학생번호|이름|성명|name|student|no\.?)$/i;
const META_KEY = /^(key|정답|답)$/i;
const META_OPT = /^(options?|답지\s*수|답지수|선택지\s*수)$/i;
const META_INC = /^(include|분석\s*포함(\s*여부)?|포함)$/i;
const CIRCLED = "①②③④⑤⑥⑦⑧⑨";

const normCell = (v) => {
  let s = String(v ?? "").trim();
  if (!s) return " ";
  const ci = CIRCLED.indexOf(s);
  if (s.length === 1 && ci >= 0) return String(ci + 1);
  if (/^\d+(\.0+)?$/.test(s)) return String(parseInt(s, 10));
  return s;
};

const looksLikeResponse = (s) => {
  const t = String(s ?? "").trim();
  return t === "" || /^[0-9*]$/.test(t) || (t.length === 1 && CIRCLED.includes(t)) || /^\d\.0+$/.test(t);
};

const parseCsv = (text, delim = ",") => {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

const decodeText = (bytes) => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^﻿/, "");
  } catch (e) {
    return new TextDecoder("euc-kr").decode(bytes);
  }
};

const tableToSource = (rawRows, idColsArg) => {
  let rows = rawRows
    .map((r) => (Array.isArray(r) ? r : [r]).map((c) => String(c ?? "").trim()))
    .filter((r) => r.some((c) => c !== ""));
  if (!rows.length) throw new Error("파일에 자료가 없습니다.");

  const meta = {};
  rows = rows.filter((r) => {
    const h = r[0];
    if (META_KEY.test(h)) return (meta.key = r), false;
    if (META_OPT.test(h)) return (meta.opt = r), false;
    if (META_INC.test(h)) return (meta.inc = r), false;
    return true;
  });

  let header = null;
  if (rows.length) {
    const r0 = rows[0];
    const rest = r0.slice(1).filter((c) => c !== "");
    const wordy = rest.filter((c) => /[A-Za-z가-힣]/.test(c)).length;
    if (ID_HEADER.test(r0[0]) || (rest.length && wordy >= rest.length / 2)) header = rows.shift();
  }
  if (!rows.length) throw new Error("학생 응답 행이 없습니다.");

  const ncols = Math.max(...rows.map((r) => r.length), header ? header.length : 0);
  const sample = rows.slice(0, 200);
  const isInfoCol = (c) =>
    sample.filter((r) => !looksLikeResponse(r[c])).length > sample.length / 2;

  let auto = 0;
  while (auto < ncols && isInfoCol(auto)) auto++;

  const last = ncols - 1;
  const lastIsString =
    ncols >= 2 &&
    sample.filter((r) => /^[0-9 *]{3,}$/.test(r[last] ?? "")).length > sample.length * 0.8;
  if (lastIsString) auto = last;
  let idCols = idColsArg ?? Math.max(1, auto);
  idCols = Math.min(Math.max(1, idCols), Math.max(1, ncols - 1));

  const respCols = ncols - idCols;
  const isStringCol =
    respCols === 1 &&
    sample.filter((r) => /^[0-9 *]{2,}$/.test(r[idCols] ?? "")).length > sample.length / 2;

  const splitResp = (r) =>
    isStringCol
      ? String(r[idCols] ?? "").split("").map(normCell)
      : r.slice(idCols).map(normCell);

  const ids = rows.map((r, i) => r.slice(0, idCols).filter((c) => c !== "").join(" ") || String(i + 1));
  const resp = rows.map(splitResp);
  let nItems = Math.max(...resp.map((a) => a.length));

  while (nItems > 0 && resp.every((a) => (a[nItems - 1] ?? " ") === " ")) nItems--;
  if (!nItems) throw new Error("응답 열을 찾지 못했습니다. ID 열 수를 확인하세요.");
  resp.forEach((a) => {
    a.length = nItems;
    for (let j = 0; j < nItems; j++) if (a[j] === undefined) a[j] = " ";
  });

  const metaVals = (r) => (r ? splitResp(r).slice(0, nItems) : null);
  return {
    ids,
    resp,
    nItems,
    prefill: {
      key: metaVals(meta.key),
      numOptions: metaVals(meta.opt)?.map((v) => parseInt(v, 10) || 0) ?? null,
      scored: meta.inc ? splitResp(meta.inc).slice(0, nItems).map((v) => !/^n$/i.test(v)) : null,
    },
    info: {
      idCols,
      idLabel: header ? header.slice(0, idCols).join(" ") : "ID",
      hasHeader: !!header,
      stringMode: isStringCol,
      ncols,
    },
  };
};

const fixedToSource = (lines, idWidth) => {
  const L = lines.filter((l) => l.trim() !== "");
  if (!L.length) throw new Error("파일에 자료가 없습니다.");
  const w = Math.max(0, idWidth);
  const ids = L.map((l, i) => l.slice(0, w).trim() || String(i + 1));
  const resp = L.map((l) => l.slice(w).replace(/\s+$/, "").split("").map(normCell));
  const nItems = Math.max(...resp.map((a) => a.length));
  if (!nItems) throw new Error("응답이 없습니다. ID 자릿수를 확인하세요.");
  resp.forEach((a) => {
    for (let j = 0; j < nItems; j++) if (a[j] === undefined) a[j] = " ";
  });
  return {
    ids,
    resp,
    nItems,
    prefill: { key: null, numOptions: null, scored: null },
    info: { idWidth: w, idLabel: "ID", fixed: true },
  };
};

const testanToSource = (bytes) => {
  const lines = [];
  let s = 0;
  for (let i = 0; i <= bytes.length; i++) {
    if (i === bytes.length || bytes[i] === 10) {
      let e = i;
      if (e > s && bytes[e - 1] === 13) e--;
      lines.push(bytes.subarray(s, e));
      s = i + 1;
    }
  }
  const ascii = (b) => String.fromCharCode(...b);
  const ctl = ascii(lines[0]);
  const n = parseInt(ctl.slice(0, 3), 10);
  const w = parseInt(ctl.slice(8, 10), 10) || 0;
  const cells = (b) => ascii(b).padEnd(n, " ").slice(0, n).split("");
  const key = cells(lines[1]);
  const opt = cells(lines[2]).map((c) => parseInt(c, 10) || 0);
  const inc = cells(lines[3]).map((c) => !/n/i.test(c));
  const ids = [];
  const resp = [];
  lines.slice(4).forEach((b) => {
    if (!b.length || ascii(b).trim() === "") return;
    ids.push(decodeText(b.subarray(0, w)).trim() || String(ids.length + 1));
    resp.push(ascii(b.subarray(w)).padEnd(n, " ").slice(0, n).split("").map(normCell));
  });
  return {
    ids,
    resp,
    nItems: n,
    prefill: { key: key.map(normCell), numOptions: opt, scored: inc },
    info: { idWidth: w, idLabel: "ID", testan: true },
  };
};

const isTestanDat = (text) => {
  const L = text.split(/\r?\n/);
  return (
    L.length >= 5 &&
    /^\s*\d{1,3}\s+\d{1,2}\s*$/.test(L[0]) &&
    /^[yYnN ]+$/.test(L[3].replace(/\s+$/, "") || "x")
  );
};

const readSource = (bytes, filename, XLSX) => {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  if (["xlsx", "xls", "xlsm", "xlsb", "ods"].includes(ext)) {
    if (!XLSX) throw new Error("Excel 읽기 모듈을 불러오지 못했습니다.");
    const wb = XLSX.read(bytes, { type: "array" });
    for (const name of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: "" });
      const filled = rows.filter((r) => r.some((c) => String(c).trim() !== ""));
      if (!filled.length) continue;

      const single = filled.filter((r) => r.filter((c) => String(c).trim() !== "").length === 1).length;
      if (single > filled.length * 0.8)
        return {
          kind: "fixed",
          lines: filled.map((r) => String(r.find((c) => String(c).trim() !== "")).replace(/\s+$/, "")),
          sheetName: name,
        };
      return { kind: "table", rows, sheetName: name };
    }
    throw new Error("Excel 파일에 내용이 있는 시트가 없습니다.");
  }
  const text = decodeText(bytes).replace(/\r\n?/g, "\n");
  if (isTestanDat(text)) return { kind: "testan", bytes };
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const share = (re) => lines.filter((l) => re.test(l)).length / (lines.length || 1);
  if (share(/\t/) > 0.5) return { kind: "table", rows: lines.map((l) => l.split("\t")) };
  if (share(/,/) > 0.5) return { kind: "table", rows: parseCsv(text, ",") };
  if (share(/;/) > 0.5) return { kind: "table", rows: parseCsv(text, ";") };
  if (share(/\S\s+\S/) > 0.5) return { kind: "table", rows: lines.map((l) => l.trim().split(/\s+/)) };
  return { kind: "fixed", lines };
};

const buildSource = (raw, opt = {}) => {
  if (raw.kind === "testan") return testanToSource(raw.bytes);
  if (raw.kind === "fixed") return fixedToSource(raw.lines, opt.idWidth ?? guessIdWidth(raw.lines));
  return tableToSource(raw.rows, opt.idCols);
};

const guessIdWidth = (lines) => {
  const pos = lines.map((l) => l.search(/\s/)).filter((p) => p > 0);
  if (pos.length === lines.length && new Set(pos).size === 1) return pos[0];
  if (lines.length >= 10) {
    const maxW = Math.min(20, Math.min(...lines.map((l) => l.length)) - 1);
    for (let w = 1; w <= maxW; w++) if (new Set(lines.map((l) => l.slice(0, w))).size === lines.length) return w;
  }
  return 4;
};

if (typeof module !== "undefined")
  module.exports = { readSource, buildSource, tableToSource, fixedToSource, testanToSource, decodeText, parseCsv, normCell };

const {
  pearson,
  pointBiserial,
  correctedDiscrimination,
  itemDifficulty,
  guessingRate,
  correctedDifficulty,
  discriminationIndex,
  optionAttractiveness,
  itemVariance,
  populationSd,
  sampleVariance,
  cronbachAlpha,
  alphaIfDeleted,
  skewness,
  kurtosis,
  sem,
  meanOf,
} =
  typeof module !== "undefined"
    ? require("./formulas.js")
    : {
        pearson,
        pointBiserial,
        correctedDiscrimination,
        itemDifficulty,
        guessingRate,
        correctedDifficulty,
        discriminationIndex,
        optionAttractiveness,
        itemVariance,
        populationSd,
        sampleVariance,
        cronbachAlpha,
        alphaIfDeleted,
        skewness,
        kurtosis,
        sem,
        meanOf,
      };

const analyze = (data) => {
  const { nItems, key, weights, scored, students, numOptions } = data;
  const N = students.length;
  if (!N) throw new Error("분석할 학생 데이터가 없습니다.");

  let k = 0;
  let maxScore = 0;
  for (let j = 0; j < nItems; j++) {
    if (scored[j]) {
      k++;
      maxScore += weights[j];
    }
  }

  const isValid = (r, j) => {
    if (!r || r === " ") return false;
    const Q = numOptions[j] || 0;
    if (!Q) return true;
    const v = Number(r);
    return Number.isInteger(v) && v >= 1 && v <= Q;
  };

  const labelOf = (r, j) => (isValid(r, j) ? String(Number(r)) : "기타");

  const R = new Uint32Array(nItems);
  const V = new Uint32Array(nItems);
  const sX = new Float64Array(nItems);
  const sX2 = new Float64Array(nItems);
  const opts = Array.from({ length: nItems }, (_, j) => {
    const m = new Map();
    for (let o = 1; o <= (numOptions[j] || 0); o++)
      m.set(String(o), { option: String(o), count: 0, sumY: 0, upper: 0, lower: 0 });
    m.set("기타", { option: "기타", count: 0, sumY: 0, upper: 0, lower: 0 });
    return m;
  });
  let sY = 0;
  let sY2 = 0;
  let minS = Infinity;
  let maxS = -Infinity;

  for (const s of students) {
    let Y = 0;
    let nCorrect = 0;
    s.correct = new Uint8Array(nItems);
    s.label = new Array(nItems);
    for (let j = 0; j < nItems; j++) {
      const r = s.resp[j];
      const lab = labelOf(r, j);
      s.label[j] = lab;
      const hit = scored[j] && lab !== "기타" && lab === String(Number(key[j]));
      if (hit) {
        Y += weights[j];
        nCorrect++;
        s.correct[j] = 1;
      }
      if (scored[j]) {
        if (hit) R[j]++;
        if (lab !== "기타") V[j]++;
        const x = hit ? weights[j] : 0;
        sX[j] += x;
        sX2[j] += x * x;
      }
      let a = opts[j].get(lab);
      if (!a) {
        a = { option: lab, count: 0, sumY: 0, upper: 0, lower: 0 };
        opts[j].set(lab, a);
      }
      a.count++;
    }
    s.raw = Y;
    s.max = maxScore;
    s.percent = maxScore ? (Y / maxScore) * 100 : 0;
    s.correctCount = nCorrect;
    sY += Y;
    sY2 += Y * Y;
    if (Y < minS) minS = Y;
    if (Y > maxS) maxS = Y;
  }

  const sorted = [...students].sort((a, b) => b.raw - a.raw);
  sorted.forEach((s, i) => {
    s.rank = i > 0 && s.raw === sorted[i - 1].raw ? sorted[i - 1].rank : i + 1;
  });

  const T = N * 0.27;
  const freqMap = new Map();
  students.forEach((s) => freqMap.set(s.raw, (freqMap.get(s.raw) ?? 0) + 1));
  const pickGroup = (scoresInOrder) => {
    let cum = 0;
    let edge = scoresInOrder[0];
    for (const sc of scoresInOrder) {
      const f = freqMap.get(sc);
      if (cum + f / 2 < T) {
        cum += f;
        edge = sc;
      } else break;
    }
    return edge;
  };
  const distinct = [...freqMap.keys()].sort((a, b) => b - a);
  const upperCut = pickGroup(distinct);
  const lowerCut = pickGroup([...distinct].reverse());

  const sXY = new Float64Array(nItems);
  const cU = new Uint32Array(nItems);
  const cL = new Uint32Array(nItems);
  const meanY = sY / N;
  let nU = 0, nL = 0;
  let minU = Infinity, maxU = -Infinity, minL = Infinity, maxL = -Infinity;
  let m3 = 0, m4 = 0;

  for (const s of students) {
    const d = s.raw - meanY;
    m3 += d * d * d;
    m4 += d * d * d * d;
    const u = s.raw >= upperCut;
    const l = s.raw <= lowerCut;
    if (u) {
      nU++;
      minU = Math.min(minU, s.raw);
      maxU = Math.max(maxU, s.raw);
    }
    if (l) {
      nL++;
      minL = Math.min(minL, s.raw);
      maxL = Math.max(maxL, s.raw);
    }
    for (let j = 0; j < nItems; j++) {
      const o = opts[j].get(s.label[j]);
      o.sumY += s.raw;
      if (u) {
        o.upper++;
        cU[j] += s.correct[j];
      }
      if (l) {
        o.lower++;
        cL[j] += s.correct[j];
      }
      if (s.correct[j]) sXY[j] += weights[j] * s.raw;
    }
  }

  const sd = populationSd(sY2, meanY, N);
  const sX2sample = sampleVariance(sY, sY2, N);
  const scale = N / (N - 1 || 1);

  const items = new Array(nItems);
  let sumSi2 = 0;
  for (let j = 0; j < nItems; j++) {
    const P = itemDifficulty(R[j], N);
    const Q = numOptions[j] || 0;
    const keyLab = key[j] && key[j] !== " " ? String(Number(key[j])) : "";
    const W = V[j] - R[j];
    const guessing = scored[j] ? guessingRate(W, Q, N) : 0;
    const it = {
      index: j + 1,
      key: key[j],
      scored: scored[j],
      numOptions: Q,
      correct: R[j],
      wrong: W,
      other: N - V[j],
      difficulty: P,
      guessing,
      correctedDifficulty: correctedDifficulty(P, guessing),
      pointBiserial: pointBiserial(sX[j], sX2[j], sXY[j], sY, sY2, N),
      correctedDiscrimination: correctedDiscrimination(
        sX[j],
        sX2[j],
        sXY[j],
        sY,
        sY2,
        N,
      ),
      pUpper: nU ? cU[j] / nU : 0,
      pLower: nL ? cL[j] / nL : 0,
      discrimination: discriminationIndex(
        nU ? cU[j] / nU : 0,
        nL ? cL[j] / nL : 0,
      ),
      attractiveness: optionAttractiveness(P, Q),
      options: [...opts[j].values()]
        .sort((a, b) =>
          a.option === "기타" ? 1 : b.option === "기타" ? -1 : Number(a.option) - Number(b.option),
        )
        .map((o) => ({
          option: o.option,
          isKey: o.option === keyLab,
          count: o.count,
          propAll: o.count / N,
          propUpper: nU ? o.upper / nU : 0,
          propLower: nL ? o.lower / nL : 0,
          pbis: pearson(o.count, o.count, o.sumY, sY, sY2, N),
        })),
    };
    it.options.forEach((o) => {

      o.attractive = it.scored && o.option !== "기타" && !o.isKey && o.propAll > it.attractiveness + 1e-9;
    });
    if (scored[j]) {
      it.s_i2 = itemVariance(sX[j], sX2[j], N);
      sumSi2 += it.s_i2;
    }
    items[j] = it;
  }

  const alpha = cronbachAlpha(k, sumSi2, scale, sX2sample);

  for (const it of items) {
    if (k < 3 || !it.scored) {
      it.alphaIfDeleted = 0;
      delete it.s_i2;
      continue;
    }
    const j = it.index - 1;
    const sYx = sY - sX[j];
    const sY2x = sY2 - 2 * sXY[j] + sX2[j];
    it.alphaIfDeleted = alphaIfDeleted(k, it.s_i2, sumSi2, sYx, sY2x, N);
    it.alphaUp = it.alphaIfDeleted > alpha + 1e-12;
    delete it.s_i2;
  }

  const median = sorted[N >> 1].raw;

  const freq = new Map();
  students.forEach((s) => freq.set(s.raw, (freq.get(s.raw) ?? 0) + 1));
  const lo = Math.max(0, minS - 1);
  const hi = Math.min(maxScore, maxS + 1);
  const distribution = [];
  let cum = 0;
  for (let x = lo; x <= hi; x++) {
    const f = freq.get(x) ?? 0;
    cum += f;
    distribution.push({ score: x, n: f, pct: (f / N) * 100, cumN: cum, cumPct: (cum / N) * 100 });
  }

  return {
    students,
    items,
    distribution,
    upper: { n: nU, min: nU ? minU : 0, max: nU ? maxU : 0 },
    lower: { n: nL, min: nL ? minL : 0, max: nL ? maxL : 0 },
    stats: {
      n: N,
      nItems,
      nScored: k,
      maxScore,
      mean: meanY,
      sd,
      variance: sd * sd,
      min: minS,
      high: maxS,
      median,
      skewness: skewness(m3, N, sd),
      kurtosis: kurtosis(m4, N, sd),
      reliability: alpha,
      sem: sem(sd, alpha),
      meanDifficulty: meanOf(items, k, (it) => it.difficulty),
      meanGuessing: meanOf(items, k, (it) => it.guessing),
      meanCorrectedDifficulty: meanOf(items, k, (it) => it.correctedDifficulty),
      meanPointBiserial: meanOf(items, k, (it) => it.pointBiserial),
      meanCorrectedDiscrimination: meanOf(items, k, (it) => it.correctedDiscrimination),
      meanDiscrimination: meanOf(items, k, (it) => it.discrimination),
    },
  };
};

if (typeof module !== "undefined") module.exports = { analyze };

if (typeof module !== "undefined")
  module.exports = { readSource, buildSource, tableToSource, fixedToSource, testanToSource, decodeText, parseCsv, normCell, analyze };

if (typeof document !== "undefined") {
  const hasFullPrefill = () => !!S.src.prefill.key && S.src.prefill.key.some((k) => k !== " ");

  const guessOptions = () => {
    let m = 0;
    S.src.resp.forEach((a) =>
      a.forEach((r) => {
        const v = Number(r);
        if (Number.isInteger(v) && v > m && v <= 9) m = v;
      }),
    );
    return Math.min(9, Math.max(2, m || 4));
  };

  const initSetup = () => {
    const n = S.src.nItems;
    const p = S.src.prefill;
    const g = guessOptions();
    S.key = Array.from({ length: n }, (_, j) => (p.key?.[j] && /^[1-9]$/.test(p.key[j]) ? p.key[j] : ""));
    S.opt = Array.from({ length: n }, (_, j) => (p.numOptions?.[j] >= 2 ? p.numOptions[j] : g));
    S.inc = Array.from({ length: n }, (_, j) => (p.scored ? p.scored[j] !== false : true));
    $("bulkOpt").value = String(g);
  };

  const validate = () => {
    const n = S.src.nItems;
    const noKey = [], badKey = [], badOpt = [], outOfRange = [];
    for (let j = 0; j < n; j++) {
      if (!S.inc[j]) continue;
      const Q = S.opt[j];
      if (!(Q >= 2 && Q <= 9)) badOpt.push(j + 1);
      if (!S.key[j]) noKey.push(j + 1);
      else if (Number(S.key[j]) > Q) badKey.push(j + 1);
      if (S.src.resp.some((a) => /^\d+$/.test(a[j]) && (Number(a[j]) > Q || Number(a[j]) < 1))) outOfRange.push(j + 1);
    }
    const list = (a) => a.slice(0, 12).join(", ") + (a.length > 12 ? ` 외 ${a.length - 12}개` : "");
    const errors = [];
    const notes = [];
    if (noKey.length) errors.push(`정답이 비어 있는 문항: ${list(noKey)}`);
    if (badKey.length) errors.push(`정답이 답지 수보다 큰 문항: ${list(badKey)}`);
    if (badOpt.length) errors.push(`답지 수가 2~9가 아닌 문항: ${list(badOpt)}`);
    if (!S.inc.some(Boolean)) errors.push("분석에 포함된 문항이 없습니다.");
    if (outOfRange.length) notes.push(`답지 수를 벗어난 응답이 있는 문항: ${list(outOfRange)} (‘기타’로 집계됩니다)`);
    return { errors, notes };
  };

  const renderSetup = () => {
    const src = S.src;
    const info = src.info;
    const where = S.sheetName ? ` · 시트 ‘${esc(S.sheetName)}’` : "";
    $("srcSummary").innerHTML =
      `<b>${esc(S.fileName)}</b>${where} · 피험자 <b>${src.ids.length}</b>명 · 문항 <b>${src.nItems}</b>개` +
      (info.testan ? " · TestAn 응답자료 형식" : "");

    const row = $("idRow");
    if (S.raw.kind === "table") {
      row.innerHTML =
        `<label>학번·이름 등 앞쪽 열 수 <input type="number" id="idCols" min="1" max="${Math.max(1, info.ncols - 1)}" value="${info.idCols}" /></label>` +
        `<span class="summary">현재 ID: ${esc(src.ids[0])}${src.ids.length > 1 ? ", " + esc(src.ids[1]) : ""} …${info.stringMode ? " · 응답이 한 칸에 이어 적힌 형식" : ""}</span>`;
      $("idCols").addEventListener("change", (e) => reload({ idCols: Number(e.target.value) || 1 }));
    } else if (S.raw.kind === "fixed") {
      row.innerHTML =
        `<label>1번 문항 앞까지의 칸 수(ID 자릿수) <input type="number" id="idWidth" min="0" max="40" value="${info.idWidth}" /></label>` +
        `<span class="summary">ID와 응답이 붙어 있는 형식입니다. 첫 학생 → ID ‘${esc(src.ids[0])}’ · 1~10번 응답 ‘${esc(src.resp[0].slice(0, 10).join(""))}’. 맞게 나뉘었는지 아래 미리보기로 확인하세요.</span>`;
      $("idWidth").addEventListener("change", (e) => reload({ idWidth: Number(e.target.value) || 0 }));
    } else row.innerHTML = "";
    if (S.raw.kind === "fixed") document.querySelector("details.preview").open = true;

    const n = src.nItems;
    const idx = Array.from({ length: n }, (_, j) => j);
    $("setupTable").innerHTML =
      `<tr><th class="rowhead">문항</th>${idx.map((j) => `<th>${j + 1}</th>`).join("")}</tr>` +
      `<tr><th class="rowhead">정답</th>${idx
        .map((j) => `<td><input class="cell key" data-j="${j}" id="key${j}" inputmode="numeric" maxlength="1" value="${S.key[j]}" aria-label="${j + 1}번 정답" /></td>`)
        .join("")}</tr>` +
      `<tr><th class="rowhead">답지 수</th>${idx
        .map((j) => `<td><input class="cell opt" data-j="${j}" id="opt${j}" inputmode="numeric" maxlength="1" value="${S.opt[j]}" aria-label="${j + 1}번 답지 수" /></td>`)
        .join("")}</tr>` +
      `<tr><th class="rowhead">분석 포함</th>${idx
        .map((j) => `<td><input type="checkbox" class="inc" data-j="${j}" id="inc${j}" ${S.inc[j] ? "checked" : ""} aria-label="${j + 1}번 분석 포함" /></td>`)
        .join("")}</tr>`;
    refreshSetupState();

    const show = Math.min(15, src.ids.length);
    $("previewTable").innerHTML =
      `<tr><th>${esc(idLabel())}</th>${idx.map((j) => `<th>${j + 1}</th>`).join("")}</tr>` +
      src.ids
        .slice(0, show)
        .map((id, i) => `<tr><td class="left">${esc(id)}</td>${src.resp[i].map((r) => `<td>${r === " " ? "" : esc(r)}</td>`).join("")}</tr>`)
        .join("") +
      (src.ids.length > show ? `<tr><td colspan="${n + 1}" class="left muted">… 외 ${src.ids.length - show}명</td></tr>` : "");
  };

  const refreshSetupState = () => {
    for (let j = 0; j < S.src.nItems; j++) {
      const k = $("key" + j);
      const o = $("opt" + j);
      const bad = S.inc[j] && (!S.key[j] || Number(S.key[j]) > S.opt[j]);
      k.classList.toggle("invalid", bad);
      o.classList.toggle("invalid", S.inc[j] && !(S.opt[j] >= 2 && S.opt[j] <= 9));
      k.closest("td").classList.toggle("excluded", !S.inc[j]);
      o.closest("td").classList.toggle("excluded", !S.inc[j]);
    }
    const { errors, notes } = validate();
    const filled = S.key.filter((k, j) => k && S.inc[j]).length;
    const k = S.inc.filter(Boolean).length;
    $("setupMsg").innerHTML =
      `<p>정답 입력 ${filled}/${k}문항 (분석 포함 ${k}개, 제외 ${S.src.nItems - k}개)</p>` +
      errors.map((e) => `<p class="err">${esc(e)}</p>`).join("") +
      notes.map((e) => `<p class="note">${esc(e)}</p>`).join("");
    $("runBtn").disabled = errors.length > 0;
  };

  const setupChanged = () => {
    if (S.result) {
      clearResult();
      setStatus("설정을 바꿨습니다. [분석 실행]을 다시 누르면 결과가 갱신됩니다.");
    }
    refreshSetupState();
  };

  const setupTable = $("setupTable");
  setupTable.addEventListener("input", (e) => {
    const t = e.target;
    const j = Number(t.dataset.j);
    if (t.classList.contains("key") || t.classList.contains("opt")) {
      const v = (t.value.match(/[1-9]/g) || []).pop() || "";
      t.value = v;
      if (t.classList.contains("key")) S.key[j] = v;
      else S.opt[j] = v ? Number(v) : 0;
      if (v) $((t.classList.contains("key") ? "key" : "opt") + (j + 1))?.focus();
      setupChanged();
    }
  });
  setupTable.addEventListener("change", (e) => {
    const t = e.target;
    if (t.classList.contains("inc")) {
      S.inc[Number(t.dataset.j)] = t.checked;
      setupChanged();
    }
  });
  setupTable.addEventListener("focusin", (e) => e.target.select?.());
  setupTable.addEventListener("keydown", (e) => {
    const t = e.target;
    if (!t.dataset.j) return;
    const j = Number(t.dataset.j);
    const kind = t.classList.contains("key") ? "key" : t.classList.contains("opt") ? "opt" : "inc";
    const go = (id) => {
      const el = $(id);
      if (el) {
        e.preventDefault();
        el.focus();
      }
    };
    if (e.key === "ArrowRight") go(kind + (j + 1));
    else if (e.key === "ArrowLeft") go(kind + (j - 1));
    else if (e.key === "ArrowDown") go((kind === "key" ? "opt" : "inc") + j);
    else if (e.key === "ArrowUp") go((kind === "inc" ? "opt" : "key") + j);
    else if (e.key === "Backspace" && t.value === "" && kind !== "inc") go(kind + (j - 1));
  });

  setupTable.addEventListener("paste", (e) => {
    const t = e.target;
    if (!t.classList.contains("key") && !t.classList.contains("opt")) return;
    const vals = splitKeyText(e.clipboardData.getData("text"));
    if (vals.length <= 1) return;
    e.preventDefault();
    const j0 = Number(t.dataset.j);
    const arr = t.classList.contains("key") ? S.key : S.opt;
    vals.forEach((v, i) => {
      if (j0 + i < S.src.nItems) arr[j0 + i] = t.classList.contains("key") ? v : Number(v) || 0;
    });
    renderSetup();
    setupChanged();
  });

  const splitKeyText = (text) => {
    const t = String(text).trim();
    const tokens = /[\s,;]/.test(t) ? t.split(/[\s,;]+/) : t.split("");
    return tokens.map((c) => normCell(c)).map((c) => (/^[1-9]$/.test(c) ? c : ""));
  };

  $("applyKey").addEventListener("click", () => {
    const vals = splitKeyText($("bulkKey").value);
    if (!vals.length || !vals.some(Boolean)) {
      setStatus("정답을 입력하세요. 예: 4313341213…", "error");
      return;
    }
    const n = S.src.nItems;
    for (let j = 0; j < n; j++) S.key[j] = vals[j] ?? S.key[j];
    renderSetup();
    setupChanged();
    setStatus(
      vals.length === n
        ? `정답 ${n}개를 적용했습니다.`
        : `입력한 정답은 ${vals.length}개이고 문항은 ${n}개입니다. 앞에서부터 ${Math.min(vals.length, n)}개를 적용했습니다.`,
      vals.length === n ? "ok" : "error",
    );
  });

  $("bulkKey").addEventListener("keydown", (e) => e.key === "Enter" && $("applyKey").click());

  $("applyOpt").addEventListener("click", () => {
    const vals = splitKeyText($("bulkOpt").value).map(Number);
    if (!vals.length || vals.some((q) => !(q >= 2 && q <= 9))) {
      setStatus("답지 수는 2~9 사이 숫자로 입력하세요. 예: 4 또는 4444455552…", "error");
      return;
    }
    const n = S.src.nItems;
    if (vals.length === 1) S.opt = S.opt.map(() => vals[0]);
    else for (let j = 0; j < Math.min(n, vals.length); j++) S.opt[j] = vals[j];
    renderSetup();
    setupChanged();
    setStatus(
      vals.length === 1
        ? `모든 문항의 답지 수를 ${vals[0]}개로 적용했습니다.`
        : vals.length === n
          ? `문항별 답지 수 ${n}개를 적용했습니다.`
          : `입력한 답지 수는 ${vals.length}개이고 문항은 ${n}개입니다. 앞에서부터 ${Math.min(vals.length, n)}개를 적용했습니다.`,
      vals.length === 1 || vals.length === n ? "ok" : "error",
    );
  });

  $("bulkOpt").addEventListener("keydown", (e) => e.key === "Enter" && $("applyOpt").click());

  $("incAll").addEventListener("click", () => {
    S.inc = S.inc.map(() => true);
    renderSetup();
    setupChanged();
  });

  $("incNone").addEventListener("click", () => {
    S.inc = S.inc.map(() => false);
    renderSetup();
    setupChanged();
  });

  const chartPng = async (dist) => {
    const c = document.createElement("canvas");
    drawScoreChart(
      c,
      dist,
      { bar: "#2F5D8A", axis: "#555555", text: "#222222", grid: "#E3E3E3" },
      { width: 640, height: 320, dpr: 2.5, background: "#FFFFFF", title: "검사점수의 분포" },
    );
    const blob = await new Promise((res) => c.toBlob(res, "image/png"));
    return new Uint8Array(await blob.arrayBuffer());
  };

  const drawScoreChart = (canvas, dist, pal, opt = {}) => {
    const W = opt.width;
    const H = opt.height;
    const dpr = opt.dpr || 1;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (opt.background) {
      ctx.fillStyle = opt.background;
      ctx.fillRect(0, 0, W, H);
    }
    const font = opt.font || "'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif";
    const padL = 52, padR = 16, padT = 34, padB = 46;
    const pw = W - padL - padR;
    const ph = H - padT - padB;
    const maxPct = Math.max(1, ...dist.map((d) => d.pct));

    const step = [1, 2, 5, 10, 20, 25, 50].find((s) => maxPct / s <= 6) || 50;
    const top = Math.ceil(maxPct / step) * step;
    const y = (v) => padT + ph * (1 - v / top);

    ctx.font = `600 14px ${font}`;
    ctx.fillStyle = pal.text;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opt.title || "검사점수의 분포", padL, 20);

    ctx.font = `11px ${font}`;
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let v = 0; v <= top + 1e-9; v += step) {
      const yy = Math.round(y(v)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, yy);
      ctx.lineTo(W - padR, yy);
      ctx.stroke();
      ctx.fillStyle = pal.axis;
      ctx.fillText(String(v), padL - 8, yy);
    }

    const cw = pw / Math.max(1, dist.length);
    const bw = Math.max(2, Math.min(cw * 0.72, 28));
    const every = Math.ceil(dist.length / Math.max(1, Math.floor(pw / 26)));
    const hits = [];
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    dist.forEach((d, i) => {
      const cx = padL + cw * (i + 0.5);
      const yy = y(d.pct);
      ctx.fillStyle = pal.bar;
      if (d.pct > 0) ctx.fillRect(cx - bw / 2, yy, bw, padT + ph - yy);
      if (i % every === 0 || i === dist.length - 1) {
        ctx.fillStyle = pal.axis;
        ctx.fillText(String(d.score), cx, padT + ph + 6);
      }
      hits.push({ x0: padL + cw * i, x1: padL + cw * (i + 1), d });
    });
    ctx.strokeStyle = pal.axis;
    ctx.beginPath();
    ctx.moveTo(padL, padT + ph + 0.5);
    ctx.lineTo(W - padR, padT + ph + 0.5);
    ctx.stroke();

    ctx.fillStyle = pal.axis;
    ctx.font = `600 11px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("점수", padL + pw / 2, H - 6);
    ctx.save();
    ctx.translate(14, padT + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("백분율 (%)", 0, 0);
    ctx.restore();
    return hits;
  };

  if (typeof module !== "undefined") module.exports = { drawScoreChart };

  const renderScores = () => {
    const r = S.result;
    const st = r.stats;
    const stat = (label, value, sub = "") =>
      `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="stat-sub">${sub}</span>` : ""}</div>`;
    $("statGrid").innerHTML =
      stat("피험자 수", `${st.n}명`, `만점 ${st.maxScore}점`) +
      stat("평균", st.mean.toFixed(3), `표준편차 ${st.sd.toFixed(3)}`) +
      stat("분산", st.variance.toFixed(3), `중앙값 ${st.median}`) +
      stat("최저 / 최고", `${st.min} / ${st.high}`, `범위 ${st.high - st.min}`) +
      stat("왜도 / 첨도", `${st.skewness.toFixed(3)} / ${st.kurtosis.toFixed(3)}`) +
      stat("신뢰도 α", f3(st.reliability), `측정오차 ${st.sem.toFixed(3)}`) +
      stat("상위 27%", `${r.upper.n}명`, `최저점수 ${r.upper.min}`) +
      stat("하위 27%", `${r.lower.n}명`, `최고점수 ${r.lower.max}`);

    $("distTable").innerHTML =
      "<tr><th>점수</th><th>피험자 수</th><th>백분율(%)</th><th>누가 피험자 수</th><th>누가 백분율(%)</th></tr>" +
      r.distribution
        .map((d) => `<tr><td>${d.score}</td><td>${d.n}</td><td>${d.pct.toFixed(2)}</td><td>${d.cumN}</td><td>${d.cumPct.toFixed(2)}</td></tr>`)
        .join("");
    renderScoreTable();
    renderChart();
  };

  const renderScoreTable = () => {
    const r = S.result;
    const list = $("scoreSort").value === "rank" ? [...r.students].sort((a, b) => a.rank - b.rank) : r.students;
    $("scoreTable").innerHTML =
      `<tr><th>${esc(idLabel())}</th><th>점수</th><th>석차</th></tr>` +
      list.map((s) => `<tr><td class="left">${esc(s.id)}</td><td>${s.raw}</td><td>${s.rank}</td></tr>`).join("");
  };
  $("scoreSort").addEventListener("change", renderScoreTable);

  let chartHits = [];
  const renderChart = () => {
    if (!S.result || $("tab-score").hidden) return;
    const cv = $("chart");
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    const w = Math.max(300, cv.parentElement.clientWidth - 2);
    chartHits = drawScoreChart(
      cv,
      S.result.distribution,
      { bar: v("--accent"), axis: v("--text-secondary"), text: v("--text"), grid: v("--stroke") },
      { width: w, height: w < 560 ? 260 : 320, dpr: window.devicePixelRatio || 1, font: "system-ui, 'Malgun Gothic', sans-serif" },
    );
    cv.style.width = w + "px";
    cv.style.height = (w < 560 ? 260 : 320) + "px";
  };
  window.addEventListener("resize", () => S.result && renderChart());

  const tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.hidden = true;
  document.body.appendChild(tip);
  $("chart").addEventListener("mousemove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const h = chartHits.find((hh) => x >= hh.x0 && x < hh.x1);
    if (!h) {
      tip.hidden = true;
      return;
    }
    tip.textContent = `${h.d.score}점 · ${h.d.n}명 · ${h.d.pct.toFixed(2)}% (누가 ${h.d.cumPct.toFixed(2)}%)`;
    tip.hidden = false;
    tip.style.left = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8) + "px";
    tip.style.top = e.clientY - 34 + "px";
  });
  $("chart").addEventListener("mouseleave", () => (tip.hidden = true));

  const ITEM_METRIC_COLS = [
    { h: "난이도", tip: "P = R / N", get: (it) => f3(it.difficulty), mean: (s) => f3(s.meanDifficulty) },
    { h: "추측도", tip: "오답자 수 ÷ (답지 수 − 1) ÷ N", get: (it) => f3(it.guessing), mean: (s) => f3(s.meanGuessing) },
    { h: "교정난이도", tip: "난이도 − 추측도", get: (it) => f3(it.correctedDifficulty), mean: (s) => f3(s.meanCorrectedDifficulty) },
    { h: "변별도(r)", tip: "문항 점수와 총점의 상관계수", get: (it) => f3(it.pointBiserial), mean: (s) => f3(s.meanPointBiserial) },
    { h: "수정변별도", tip: "문항 점수와 해당 문항을 뺀 총점의 상관계수", get: (it) => f3(it.correctedDiscrimination), mean: (s) => f3(s.meanCorrectedDiscrimination) },
    { h: "상하위 정답률 차", tip: "상위 27% 정답률 − 하위 27% 정답률", get: (it) => f3(it.discrimination), mean: (s) => f3(s.meanDiscrimination) },
    { h: "제외 시 α", tip: "해당 문항을 뺀 나머지 문항의 Cronbach α", get: (it) => f3(it.alphaIfDeleted), mean: (s) => f3(s.reliability) },
  ];
  const OPTION_COLS = ["매력도 기준", "답지", "전체", "상위", "하위", "상관계수"];
  const R_COL = 3;

  const visibleOptions = (it) => it.options.filter((o) => o.option !== "기타" || o.count > 0);

  const sortItems = (items, mode) => {
    const by = {
      diffAsc: (a, b) => a.difficulty - b.difficulty,
      diffDesc: (a, b) => b.difficulty - a.difficulty,
      rDesc: (a, b) => b.pointBiserial - a.pointBiserial,
      rcDesc: (a, b) => b.correctedDiscrimination - a.correctedDiscrimination,
      dDesc: (a, b) => b.discrimination - a.discrimination,
      alphaDesc: (a, b) => b.alphaIfDeleted - a.alphaIfDeleted,
    }[mode];
    const arr = [...items];
    if (by) arr.sort((a, b) => (a.scored === b.scored ? by(a, b) : a.scored ? -1 : 1));
    return arr;
  };

  $("itemSort").addEventListener("change", () => S.result && renderItems());

  const renderItems = () => {
    const r = S.result;
    const st = r.stats;
    const M = ITEM_METRIC_COLS;
    let html =
      "<thead>" +
      `<tr class="group"><th colspan="2"></th><th colspan="${M.length}">문항 지표</th><th colspan="6">답지 분석</th></tr>` +
      `<tr><th>문항</th><th>정답</th>${M.map((m) => `<th title="${esc(m.tip)}">${m.h}</th>`).join("")}` +
      `<th title="오답지 매력도 기준 = (1 − 난이도) ÷ (답지 수 − 1). 오답지의 전체 응답비율과 비교해 매력도를 판단">매력도 기준</th>` +
      `<th>답지</th><th title="전체 피험자 중 그 답지를 고른 비율">전체</th><th title="상위 27% 집단에서 그 답지를 고른 비율">상위</th>` +
      `<th title="하위 27% 집단에서 그 답지를 고른 비율">하위</th><th title="답지 선택 여부(1, 0)와 총점의 상관계수">상관계수</th></tr>` +
      "</thead>" +
      `<tbody class="total"><tr><td colspan="2">전체</td>${M.map((m) => `<td>${m.mean(st)}</td>`).join("")}<td colspan="6"></td></tr></tbody>`;
    sortItems(r.items, $("itemSort").value).forEach((it) => {
      const opts = visibleOptions(it);
      const n = opts.length;
      html += `<tbody class="item${it.scored ? "" : " unscored"}">`;
      opts.forEach((o, k) => {
        html += "<tr>";
        if (k === 0) {
          html += `<td rowspan="${n}" class="qno">${it.index}</td><td rowspan="${n}">${circ(it.key)}</td>`;
          if (it.scored)
            html +=
              M.map(
                (m, i) =>
                  `<td rowspan="${n}"${
                    i === M.length - 1 && it.alphaUp
                      ? ' class="alpha-up" title="이 문항을 빼면 검사 α가 높아집니다"'
                      : i === R_COL && it.pointBiserial < 0
                        ? ' class="neg" title="변별도(r)가 음수입니다"'
                        : ""
                  }>${m.get(it)}</td>`,
              ).join("") + `<td rowspan="${n}" class="attr">${f3(it.attractiveness)}</td>`;
          else html += `<td rowspan="${n}" colspan="${M.length + 1}" class="muted">분석 제외 문항</td>`;
        }
        html +=
          `<td class="opt${o.isKey ? " key-opt" : ""}">${circ(o.option)}${o.isKey ? " *" : ""}</td>` +
          `<td>${f3(o.propAll)}</td><td>${f3(o.propUpper)}</td><td>${f3(o.propLower)}</td><td>${f3(o.pbis)}</td></tr>`;
      });
      html += "</tbody>";
    });
    $("itemTable").innerHTML = html;
  };

  const buildDocx = async (result, meta, parts) => {
    const D = docx;
    const FONT = "맑은 고딕";
    const st = result.stats;
    const border = { style: D.BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
    const borders = { top: border, bottom: border, left: border, right: border };
    const HEAD = "E8EEF4";
    const TOTAL = "F3F6F9";

    const run = (text, o = {}) =>
      new D.TextRun({ text: String(text), font: FONT, size: o.size ?? 18, bold: o.bold, color: o.color });
    const para = (text, o = {}) =>
      new D.Paragraph({
        alignment: o.align ?? D.AlignmentType.LEFT,
        spacing: { before: o.before ?? 0, after: o.after ?? 80 },
        children: Array.isArray(text) ? text : [run(text, o)],
      });
    const heading = (text, level = 1) =>
      new D.Paragraph({
        spacing: { before: level === 1 ? 280 : 200, after: 120 },
        children: [run(text, { bold: true, size: level === 1 ? 26 : 22 })],
      });
    const cell = (text, o = {}) =>
      new D.TableCell({
        borders,
        rowSpan: o.rowSpan,
        columnSpan: o.span,
        verticalAlign: D.VerticalAlign.CENTER,
        shading: o.shade ? { type: D.ShadingType.CLEAR, color: "auto", fill: o.shade } : undefined,
        margins: { top: 30, bottom: 30, left: 60, right: 60 },
        children: [
          new D.Paragraph({
            alignment: o.align ?? D.AlignmentType.CENTER,
            children: [run(text, { bold: o.bold, size: o.size ?? 17, color: o.color })],
          }),
        ],
      });
    const table = (rows, widths) =>
      new D.Table({
        width: { size: 100, type: D.WidthType.PERCENTAGE },
        columnWidths: widths,
        rows,
      });
    const headRow = (labels, size) =>
      new D.TableRow({
        tableHeader: true,
        children: labels.map((l) => cell(l, { bold: true, shade: HEAD, size })),
      });
    const caption = (text) =>
      para(text, { align: D.AlignmentType.CENTER, size: 17, before: 60, after: 200 });

    let chap = 0;
    const intro = [
      new D.Paragraph({
        alignment: D.AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [run("문항분석 결과 보고서", { bold: true, size: 32 })],
      }),
      para(
        `자료: ${meta.fileName} · 피험자 ${st.n}명 · 문항 ${st.nItems}개(분석 포함 ${st.nScored}개) · 분석일 ${todayStr()}`,
        { align: D.AlignmentType.CENTER, size: 17, after: 240, color: "555555" },
      ),
    ];
    const sections = [];

    if (parts.scores) {
      chap++;
      const c = [];
      c.push(heading(`${chap}. 검사점수 분석`));
      c.push(heading(`${chap}.1 기술통계`, 2));
      const pairs = [
        ["피험자 수", `${st.n}명`, "만점", `${st.maxScore}점`],
        ["평균", fnum(st.mean, 3), "표준편차", fnum(st.sd, 3)],
        ["분산", fnum(st.variance, 3), "중앙값", fnum(st.median, 1)],
        ["최저점수", String(st.min), "최고점수", String(st.high)],
        ["왜도", fnum(st.skewness, 3), "첨도", fnum(st.kurtosis, 3)],
        ["신뢰도(Cronbach α)", f3(st.reliability), "측정오차", fnum(st.sem, 3)],
        ["상위 27% 집단", `${result.upper.n}명 (최저 ${result.upper.min}점)`, "하위 27% 집단", `${result.lower.n}명 (최고 ${result.lower.max}점)`],
      ];
      c.push(
        table(
          pairs.map(
            (p) =>
              new D.TableRow({
                children: p.map((t, i) => cell(t, { shade: i % 2 === 0 ? HEAD : undefined, bold: i % 2 === 0 })),
              }),
          ),
          [2200, 2300, 2200, 2300],
        ),
      );
      c.push(heading(`${chap}.2 점수 분포`, 2));
      const png = await chartPng(result.distribution);
      c.push(
        new D.Paragraph({
          alignment: D.AlignmentType.CENTER,
          children: [new D.ImageRun({ type: "png", data: png, transformation: { width: 576, height: 288 } })],
        }),
      );
      c.push(caption("[그림 1] 검사점수의 분포"));
      c.push(
        table(
          [
            headRow(["점수", "피험자 수", "백분율(%)", "누가 피험자 수", "누가 백분율(%)"]),
            ...result.distribution.map(
              (d) =>
                new D.TableRow({
                  children: [d.score, d.n, d.pct.toFixed(2), d.cumN, d.cumPct.toFixed(2)].map((t) => cell(t)),
                }),
            ),
          ],
          [1500, 1800, 1900, 1900, 1900],
        ),
      );
      c.push(caption("<표 1> 검사점수의 백분율"));
      c.push(heading(`${chap}.3 피험자별 점수`, 2));
      c.push(
        table(
          [
            headRow([meta.idLabel || "ID", "점수", "석차"]),
            ...result.students.map((s) => new D.TableRow({ children: [s.id, s.raw, s.rank].map((t) => cell(t)) })),
          ],
          [4200, 2400, 2400],
        ),
      );
      sections.push({ children: [...intro, ...c] });
    }

    if (parts.items) {
      chap++;
      const c = [];
      c.push(heading(`${chap}. 문항분석`));
      c.push(
        para(
          `검사 전체의 신뢰도(Cronbach α)는 ${f3(st.reliability)}, 측정오차는 ${fnum(st.sem, 3)}이다. ` +
            "‘제외 시 α’가 굵은 글씨인 문항은 그 문항을 빼면 검사 전체의 신뢰도가 높아지는 문항이고, 빨간 글씨의 변별도(r)는 음수이다. " +
            "답지별 응답비율은 전체·상위 27%·하위 27% 집단에서 각 답지를 고른 피험자 비율이며, ‘*’는 정답, ‘기타’는 무응답과 답지 범위 밖의 응답이다(기타 응답자가 없는 문항은 생략). " +
            "매력도 기준은 오답지 매력도 판단 기준값 (1 − 난이도) ÷ (답지 수 − 1)이다.",
          { size: 17, after: 160 },
        ),
      );
      const SZ = 15;
      const labels = ["문항", "정답", ...ITEM_METRIC_COLS.map((m) => m.h), ...OPTION_COLS];
      const rows = [headRow(labels, SZ)];
      rows.push(
        new D.TableRow({
          children: [
            cell("전체", { bold: true, shade: TOTAL, size: SZ, span: 2 }),
            ...ITEM_METRIC_COLS.map((m) => cell(m.mean(st), { bold: true, shade: TOTAL, size: SZ })),
            cell("", { shade: TOTAL, size: SZ, span: OPTION_COLS.length }),
          ],
        }),
      );
      sortItems(result.items, meta.itemSort).forEach((it) => {
        const opts = visibleOptions(it);
        const span = opts.length;
        opts.forEach((o, k) => {
          const cells = [];
          if (k === 0) {
            cells.push(cell(it.index, { rowSpan: span, size: SZ, bold: true }));
            cells.push(cell(circ(it.key), { rowSpan: span, size: SZ }));
            ITEM_METRIC_COLS.forEach((m, mi) => {
              const isAlpha = mi === ITEM_METRIC_COLS.length - 1;
              cells.push(
                cell(it.scored ? m.get(it) : mi === 0 ? "분석 제외" : "", {
                  rowSpan: span,
                  size: SZ,
                  bold: (isAlpha && it.alphaUp) || (mi === R_COL && it.scored && it.pointBiserial < 0),
                  color: !it.scored
                    ? "888888"
                    : isAlpha && it.alphaUp
                      ? "1F4E79"
                      : mi === R_COL && it.pointBiserial < 0
                        ? "C00000"
                        : undefined,
                }),
              );
            });
            cells.push(cell(it.scored ? f3(it.attractiveness) : "", { rowSpan: span, size: SZ }));
          }
          cells.push(cell(circ(o.option) + (o.isKey ? " *" : ""), { size: SZ, bold: o.isKey }));
          [o.propAll, o.propUpper, o.propLower].forEach((v) => cells.push(cell(f3(v), { size: SZ })));
          cells.push(cell(f3(o.pbis), { size: SZ }));
          rows.push(new D.TableRow({ cantSplit: true, children: cells }));
        });
      });
      c.push(table(rows, [560, 520, 820, 820, 900, 860, 900, 980, 860, 900, 640, 720, 720, 720, 900]));
      c.push(caption("<표 2> 문항 및 답지 분석 결과"));
      c.push(heading("지표 정의", 2));
      [
        "난이도 P = 정답자 수 R ÷ 전체 피험자 수 N",
        "추측도 = 오답자 수 ÷ (답지 수 − 1) ÷ N (오답자: 정답이 아닌 답지를 고른 피험자, 무응답·기타 제외)",
        "교정난이도 = 난이도 − 추측도",
        "변별도(r) = 문항 점수(0, 1)와 총점의 상관계수",
        "수정변별도 = 문항 점수와 ‘총점 − 해당 문항 점수’의 상관계수",
        "상하위 정답률 차 = 상위 27% 집단 정답률 − 하위 27% 집단 정답률",
        `상·하위 27% 집단: 같은 점수는 같은 집단에 넣으며, 점수 경계 가운데 전체의 27%에 가장 가까운 곳에서 자른다(TestAn 규칙). 이 자료에서는 상위 ${result.upper.n}명(최저 ${result.upper.min}점), 하위 ${result.lower.n}명(최고 ${result.lower.max}점)이다.`,
        "제외 시 α = 해당 문항을 뺀 나머지 문항으로 계산한 Cronbach α",
        "오답지 매력도 기준 = (1 − P) ÷ (답지 수 − 1)",
      ].forEach((t) => c.push(para("• " + t, { size: 17, after: 40 })));
      const landscape = {
        page: {
          size: { orientation: D.PageOrientation.LANDSCAPE },
          margin: { top: 1000, bottom: 1000, left: 900, right: 900 },
        },
      };
      sections.push({ properties: landscape, children: parts.scores ? c : [...intro, ...c] });
    }

    const doc = new D.Document({
      creator: "TestAn Web 실습판",
      title: "문항분석 결과 보고서",
      styles: { default: { document: { run: { font: FONT, size: 20 } } } },
      sections: sections.map((s) => ({
        properties: s.properties ?? { page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } } },
        children: s.children,
      })),
    });
    return D.Packer.toBlob(doc);
  };

  const buildXlsx = (result, idLabel = "ID") => {
    const st = result.stats;
    const r3 = (v) => Math.round(v * 1000) / 1000;
    const wb = XLSX.utils.book_new();
    const add = (name, aoa, widths) => {
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = widths.map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, name);
    };
    add(
      "피험자 점수",
      [[idLabel, "점수", "석차"], ...result.students.map((s) => [s.id, s.raw, s.rank])],
      [20, 8, 8],
    );
    add(
      "점수 분포",
      [
        ["점수", "피험자 수", "백분율(%)", "누가 피험자 수", "누가 백분율(%)"],
        ...result.distribution.map((d) => [d.score, d.n, r3(d.pct), d.cumN, r3(d.cumPct)]),
        [],
        ["피험자 수", st.n], ["평균", r3(st.mean)], ["표준편차", r3(st.sd)], ["분산", r3(st.variance)],
        ["최저점수", st.min], ["최고점수", st.high], ["중앙값", st.median],
        ["왜도", r3(st.skewness)], ["첨도", r3(st.kurtosis)],
        ["Cronbach α", r3(st.reliability)], ["측정오차", r3(st.sem)],
      ],
      [12, 10, 11, 14, 14],
    );
    add(
      "문항 분석",
      [
        ["문항", "정답", "분석 포함", "답지 수", "난이도", "추측도", "교정난이도", "변별도(r)", "수정변별도", "상하위 정답률 차", "제외 시 α", "제외 시 α 증가", "오답지 매력도 기준"],
        ["전체", "", "", "", r3(st.meanDifficulty), r3(st.meanGuessing), r3(st.meanCorrectedDifficulty), r3(st.meanPointBiserial), r3(st.meanCorrectedDiscrimination), r3(st.meanDiscrimination), r3(st.reliability), ""],
        ...result.items.map((it) => [
          it.index, it.key === " " ? "" : circ(it.key), it.scored ? "y" : "n", it.numOptions,
          r3(it.difficulty), r3(it.guessing), r3(it.correctedDifficulty), r3(it.pointBiserial),
          r3(it.correctedDiscrimination), r3(it.discrimination), r3(it.alphaIfDeleted), it.alphaUp ? "증가" : "", r3(it.attractiveness),
        ]),
      ],
      [6, 6, 9, 8, 8, 8, 10, 10, 10, 15, 10, 13, 16],
    );
    add(
      "답지 분석",
      [
        ["문항", "답지", "정답", "응답자 수", "전체", "상위 27%", "하위 27%", "답지-총점 상관"],
        ...result.items.flatMap((it) =>
          visibleOptions(it).map((o) => [it.index, circ(o.option), o.isKey ? "*" : "", o.count, r3(o.propAll), r3(o.propUpper), r3(o.propLower), r3(o.pbis)]),
        ),
      ],
      [6, 6, 6, 10, 8, 10, 10, 14],
    );
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  };

  const EMBEDDED_SAMPLE = "id,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,q21,q22,q23,q24,q25,q26,q27,q28,q29,q30,q31,q32,q33,q34,q35,q36,q37,q38,q39,q40,q41,q42,q43,q44,q45,q46,q47,q48,q49,q50,q51,q52,q53,q54,q55,q56,q57,q58,q59,q60,q61,q62,q63,q64,q65,q66,q67,q68,q69,q70\nKEY,4,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,4,2,3,3,3,2,2,3,1,1,3,2,2,3,2,1,1,1,1,2,1,1,1,2,1,1,3,1,3,3,4,3,3,2,2,1,3,4,3,2,4,1,3\nOPTIONS,4,4,2,4,4,4,2,5,4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4\nINCLUDE,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y\n0001,2,3,1,3,3,4,2,2,2,3,1,2,3,1,4,4,4,2,4,3,3,4,4,1,1,1,3,2,1,3,3,3,2,2,2,1,3,3,4,2,3,2,1,1,1,3,1,1,1,1,1,1,1,,2,3,1,4,3,3,2,2,3,3,4,3,2,4,2,3\n0002,2,3,2,3,3,4,2,2,2,3,2,2,3,1,2,3,4,2,2,3,3,2,4,1,1,2,1,4,1,1,3,2,2,2,3,1,1,3,3,3,3,2,2,4,1,1,2,1,2,2,2,1,2,4,4,3,1,4,3,3,2,2,2,3,2,4,1,4,3,2\n0003,4,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,3,3,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,2,3,3,2,3,2,1,4,3,3,4,4,1,1,1,1,2,4,2,3,1,4,3,3,2,2,4,3,4,3,1,1,2,4\n0004,4,3,2,3,3,4,2,2,1,3,1,2,3,1,4,4,4,1,1,3,3,4,4,1,1,1,1,4,1,3,2,4,2,2,3,1,4,2,3,2,3,1,1,4,1,4,2,3,2,1,1,1,2,4,2,3,1,4,3,3,2,2,3,3,4,3,1,1,3,3\n0005,1,3,2,3,3,4,1,2,1,3,1,2,3,1,1,3,3,2,4,1,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,3,2,2,3,2,1,1,2,1,2,1,2,2,1,1,2,3,2,3,1,4,3,3,2,2,4,1,2,3,1,1,3,3\n0006,1,3,2,3,2,4,1,2,2,3,1,2,3,1,4,3,4,2,1,4,3,4,4,1,1,1,3,2,1,1,4,3,2,2,3,1,1,4,2,2,3,3,1,1,4,2,,1,2,1,1,1,2,4,2,3,1,4,3,2,2,2,2,3,4,3,1,1,3,3\n0007,2,3,1,3,4,4,2,3,1,3,1,2,3,1,4,3,4,2,1,4,3,4,4,1,1,1,3,3,1,1,4,2,2,2,3,1,4,2,2,2,3,4,2,1,4,1,3,3,2,1,1,1,2,3,2,3,1,4,3,3,2,2,3,3,4,3,3,4,3,3\n0008,4,3,2,3,4,4,1,2,1,3,1,2,3,1,1,3,4,1,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,4,2,2,3,2,3,1,1,4,1,3,2,1,1,1,1,1,1,4,2,3,1,4,3,3,2,2,3,3,4,3,1,1,2,3\n0009,2,3,1,3,3,4,2,2,1,3,1,2,3,1,2,4,4,1,2,1,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,2,2,3,2,1,1,2,3,2,1,1,2,1,1,2,3,2,3,1,4,3,3,2,2,2,3,4,3,1,4,1,3\n0010,2,3,2,3,3,4,1,2,1,3,1,2,3,1,1,2,4,1,2,4,3,4,4,1,1,1,1,4,1,3,2,3,3,2,3,1,1,2,4,3,3,4,1,4,2,4,2,1,2,1,1,2,2,3,3,3,1,2,3,2,2,1,2,3,,3,1,1,4,3\n0011,1,3,1,3,3,4,2,2,1,3,1,3,3,1,2,4,4,2,4,3,3,4,4,1,1,1,1,4,1,3,4,3,2,2,3,1,1,2,3,2,3,2,3,4,4,1,2,3,1,1,1,1,1,3,3,3,1,4,3,3,2,2,2,3,4,3,3,4,2,3\n0012,4,3,1,3,3,4,2,3,1,,1,2,3,1,2,3,4,1,2,3,3,4,4,1,1,1,1,3,1,4,4,3,2,2,3,1,2,4,4,2,4,2,1,4,3,3,4,4,1,2,1,1,2,4,2,3,1,3,3,3,4,1,4,3,2,3,1,4,4,2\n0013,2,3,2,3,3,3,2,2,2,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,1,3,1,4,4,3,2,2,3,1,3,2,2,2,1,2,2,1,1,3,2,1,1,1,1,1,2,4,3,2,1,4,3,3,2,2,3,2,2,3,3,4,4,3\n0014,2,3,2,3,3,4,2,1,1,3,2,3,3,1,2,3,4,2,1,4,3,3,4,1,1,1,1,4,1,2,4,2,4,2,3,1,2,4,4,2,3,1,2,1,2,3,2,3,1,1,1,1,2,3,3,3,1,4,3,3,2,2,2,3,4,3,1,4,2,3\n0015,4,3,1,3,4,4,1,2,2,3,1,2,3,1,1,4,4,1,1,3,3,4,4,1,1,1,3,4,1,3,3,2,2,2,3,1,2,2,3,2,3,3,2,1,1,3,4,4,1,1,2,1,2,4,2,3,1,4,3,3,2,2,2,3,4,3,1,3,1,1\n0016,2,3,1,3,3,4,1,3,1,3,1,2,3,1,4,3,4,3,2,3,3,4,4,1,1,1,1,3,1,2,2,3,2,2,3,1,1,3,2,2,3,2,1,1,1,3,4,3,1,1,2,1,2,4,2,3,1,4,3,1,2,2,2,3,4,3,1,4,4,4\n0017,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,1,2,3,2,3,3,2,1,1,3,2,,1,1,2,1,2,,2,3,1,4,3,2,2,2,2,3,4,3,1,4,2,3\n0018,2,3,1,3,3,4,2,2,1,3,1,2,3,1,1,3,4,4,2,3,3,4,4,1,1,1,1,3,1,3,3,3,2,2,3,1,3,4,4,2,3,4,2,1,2,2,3,1,1,1,2,1,2,4,3,3,1,4,2,3,2,2,2,3,4,3,3,4,2,4\n0019,4,3,2,3,2,4,2,2,2,3,1,2,3,1,4,3,3,4,1,3,3,4,4,1,1,1,3,2,1,1,2,3,2,2,3,1,1,4,4,2,3,2,1,4,1,3,2,3,1,1,1,1,2,3,2,3,1,1,3,3,2,2,2,3,2,3,1,1,2,4\n0020,4,3,2,3,2,4,2,2,2,3,1,2,3,1,4,3,3,4,1,3,3,4,4,1,1,1,3,2,1,1,2,3,2,2,3,1,1,4,1,2,3,2,1,4,3,3,2,3,1,1,1,1,2,3,2,3,1,1,3,3,2,2,2,3,2,3,1,1,2,4\n0021,1,3,2,3,2,4,2,2,2,3,1,2,1,1,2,3,2,2,4,3,3,4,4,1,1,1,3,3,1,2,4,3,2,2,3,1,1,3,3,3,3,2,1,1,2,3,1,3,2,1,2,1,2,3,2,3,3,4,2,3,2,2,2,3,2,3,1,4,2,4\n0022,2,3,2,3,3,4,2,3,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,2,2,3,2,3,2,1,1,4,3,2,3,1,1,1,1,2,3,3,2,1,2,3,3,2,2,2,2,2,3,1,2,3,3\n0023,1,3,2,3,3,4,2,2,1,2,1,2,3,1,4,3,4,1,2,1,3,4,4,1,1,2,3,4,1,3,4,2,2,2,3,1,1,3,1,3,3,3,1,4,1,3,1,1,1,1,1,1,2,3,3,3,1,4,3,1,2,2,2,3,2,3,1,4,3,3\n0024,1,3,2,3,3,4,2,1,1,2,1,2,3,1,2,3,4,1,2,1,3,4,4,1,1,2,3,4,1,3,4,2,2,2,3,1,1,3,1,2,3,3,1,4,1,3,2,1,1,1,1,1,2,3,3,3,1,4,3,1,2,2,2,3,2,3,1,4,3,3\n0025,2,3,2,3,3,4,2,2,2,3,1,2,3,1,4,3,4,2,4,3,3,2,4,1,1,1,3,1,3,3,4,3,2,2,3,1,1,3,2,2,3,4,1,1,2,3,1,1,1,1,1,1,2,,2,3,1,4,2,3,2,2,2,3,4,3,1,2,1,3\n0026,2,3,2,3,1,4,2,3,2,3,1,2,3,1,4,3,4,2,4,3,3,4,4,1,1,1,3,1,1,3,4,3,2,2,3,1,2,2,2,2,3,2,1,1,2,3,1,1,1,1,1,1,2,,4,3,1,4,2,3,2,2,4,3,4,3,3,4,1,3\n0027,4,3,2,3,4,4,2,2,1,3,1,3,3,1,4,4,4,2,1,4,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,4,4,2,3,2,2,1,1,3,2,1,1,1,2,1,2,4,2,3,3,4,3,3,2,2,4,3,4,3,1,4,3,3\n0028,3,3,1,3,3,4,2,2,2,3,1,2,3,1,1,3,4,4,2,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,1,1,2,2,2,3,2,2,4,1,3,2,4,1,1,1,1,2,3,2,3,1,4,3,2,2,2,4,3,4,3,3,4,3,3\n0029,1,4,2,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,2,1,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,1,2,3,3,3,2,3,1,2,4,2,1,1,1,2,1,2,3,3,3,1,3,3,3,2,2,4,3,2,3,2,4,2,3\n0030,2,3,1,3,3,4,2,1,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,1,4,1,3,4,3,2,2,3,1,1,2,3,2,3,3,1,1,4,3,2,1,1,1,2,1,2,3,4,1,1,4,3,3,2,2,2,1,4,3,3,1,1,3\n0031,2,3,2,3,4,4,2,2,1,3,1,2,3,4,1,3,4,2,3,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,3,2,3,2,3,3,1,1,2,3,2,3,1,1,2,,,,,,,,,,,,,,,,,,,\n0032,4,3,2,3,1,1,2,2,1,3,2,2,3,1,4,4,4,2,1,3,4,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,3,3,3,2,3,2,1,3,2,4,2,3,2,2,1,1,2,3,2,3,3,4,3,3,2,2,3,3,4,3,1,4,2,3\n0033,4,4,2,3,4,4,2,2,1,3,1,2,3,1,4,3,4,2,4,3,3,4,4,1,1,1,1,3,3,3,4,3,2,2,3,1,3,2,3,4,3,1,1,1,1,3,2,1,2,1,1,1,2,4,2,3,1,4,3,3,2,2,4,3,4,3,1,4,2,3\n0034,4,3,1,3,3,4,2,2,1,3,1,2,3,3,3,2,4,1,1,3,3,3,4,1,1,1,1,1,1,3,4,3,2,2,3,1,3,3,3,3,3,3,2,1,1,2,2,4,2,2,1,1,1,4,3,2,1,1,2,3,2,2,4,2,4,3,1,3,3,3\n0035,1,3,1,3,1,4,1,2,1,3,1,2,3,1,2,3,4,4,3,3,3,4,4,1,1,1,3,4,1,3,4,2,2,2,3,1,1,4,4,2,3,2,1,1,1,3,2,1,2,1,2,1,2,4,2,3,1,4,3,3,2,2,3,3,2,,,,,\n0036,2,3,1,3,3,4,2,2,1,3,1,3,3,1,1,3,1,2,3,1,3,4,4,1,1,1,1,3,1,3,3,3,2,2,3,1,1,2,4,2,1,3,3,1,4,3,3,1,1,2,1,1,2,3,4,3,1,4,3,3,2,2,2,4,2,3,1,4,3,3\n0037,4,3,2,3,3,4,2,2,1,3,1,2,3,1,2,3,4,1,4,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,1,2,2,3,3,3,2,1,1,2,3,2,1,1,1,2,1,2,3,2,3,1,4,3,2,2,2,2,3,1,3,3,4,3,4\n0038,2,3,1,3,3,4,2,2,2,3,1,2,3,1,4,3,4,2,4,3,3,1,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,2,2,2,3,3,1,1,3,4,3,1,1,1,1,1,2,4,3,4,3,2,4,3,2,2,4,3,4,3,3,1,1,4\n0039,4,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,4,4,3,4,1,3,2,3,2,2,3,1,1,3,3,2,3,2,1,4,1,1,2,4,1,1,1,1,1,,2,3,2,4,3,3,2,2,2,3,4,3,1,4,1,3\n0040,4,3,1,3,4,4,2,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,4,1,3,4,3,3,2,3,1,2,3,3,3,3,2,1,1,2,1,2,3,1,1,2,3,1,,3,3,1,4,3,3,3,2,2,3,4,3,3,4,3,3\n0041,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,1,3,4,4,1,1,1,1,3,1,2,4,3,2,2,3,1,1,3,2,2,3,2,2,1,4,3,2,3,1,1,1,1,2,4,3,3,1,4,3,3,2,2,2,3,4,3,1,1,3,3\n0042,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,1,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,3,2,2,3,3,3,1,4,3,2,3,2,2,2,1,2,,2,3,1,2,2,3,2,2,2,3,4,3,1,4,3,4\n0043,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,1,2,2,2,3,2,2,1,3,3,2,3,2,1,1,2,2,,2,3,1,4,3,3,2,3,2,3,2,3,1,4,2,3\n0044,2,3,2,3,3,1,2,3,1,3,1,3,3,1,1,3,4,1,1,3,3,4,4,1,1,4,3,2,1,1,3,4,2,2,3,4,1,2,2,3,3,4,1,1,1,3,3,3,2,1,1,1,2,3,3,3,1,4,3,4,2,4,4,3,4,3,2,1,4,3\n0045,4,3,2,3,4,4,2,2,1,3,1,3,3,1,4,2,1,2,2,4,3,4,4,1,1,1,1,3,1,3,3,3,2,2,3,4,1,3,3,3,3,3,1,1,2,3,2,1,1,1,1,1,2,4,2,3,1,4,3,3,2,2,2,3,2,3,1,4,4,3\n0046,2,3,1,3,4,4,2,3,2,3,2,2,3,1,4,4,4,2,3,3,3,4,4,1,1,1,3,1,1,3,4,3,2,2,3,1,1,3,4,2,3,2,1,1,3,1,2,1,2,1,2,2,1,4,,3,1,4,2,3,2,2,2,3,4,3,3,1,3,3\n0047,1,3,1,3,4,4,2,2,1,3,1,2,3,1,4,1,4,1,1,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,1,2,3,2,3,1,1,1,3,1,3,3,2,1,2,1,2,4,2,3,3,4,3,3,2,2,1,3,2,3,1,4,3,4\n0048,2,3,1,3,1,4,2,2,1,3,1,2,3,1,4,4,4,2,1,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,3,4,4,3,3,2,1,1,1,3,2,,1,1,1,1,1,3,2,3,1,4,3,3,2,2,2,3,4,3,3,4,2,4\n0049,1,1,1,3,1,4,2,2,1,3,1,2,3,1,1,3,4,4,4,3,3,4,4,1,1,1,1,3,3,1,3,3,2,2,3,1,1,2,4,2,3,1,2,3,1,3,4,1,1,1,1,1,2,4,4,3,1,4,3,4,2,2,2,3,2,3,1,1,3,3\n0050,2,1,1,3,1,1,2,2,2,3,1,2,3,3,4,4,4,1,1,2,3,4,4,1,1,1,1,4,1,1,4,3,2,2,3,1,3,2,2,2,3,4,1,1,1,1,2,1,2,2,1,1,2,3,3,2,1,4,2,3,2,2,4,2,2,3,1,4,2,3\n0051,2,3,2,3,1,4,2,3,1,3,2,2,3,1,4,4,4,2,3,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,1,3,3,2,3,2,1,1,1,1,3,1,2,2,1,1,2,4,2,4,1,2,3,3,2,2,4,4,4,3,1,1,4,3\n0052,2,3,1,3,3,1,2,3,2,3,2,2,3,1,4,4,4,1,1,1,2,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,4,2,3,2,1,1,2,3,4,3,1,1,2,1,1,,3,3,1,4,3,3,2,2,2,3,4,3,1,1,3,1\n0053,2,3,2,3,1,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,4,2,3,2,2,3,1,2,4,3,2,3,2,1,4,1,3,4,1,1,2,1,1,2,4,2,3,1,4,3,3,2,2,4,3,2,3,3,1,4,3\n0054,1,3,1,3,3,4,1,3,2,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,3,3,3,2,3,1,1,4,1,3,2,1,1,1,2,1,1,3,3,3,2,4,3,3,2,2,4,3,2,3,1,4,3,3\n0055,4,3,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,2,2,4,2,3,2,2,1,1,3,2,1,1,1,1,1,2,4,3,3,1,4,3,3,2,2,2,3,4,3,3,4,1,3\n0056,1,3,2,1,4,4,2,1,2,3,1,2,3,1,1,4,4,2,4,2,3,4,4,1,1,1,1,4,1,3,2,3,2,2,3,1,2,3,2,2,3,1,2,2,1,3,3,4,1,1,1,1,2,3,3,3,1,4,3,3,2,2,2,3,4,3,3,1,2,3\n0057,1,3,1,3,3,4,1,2,1,3,1,2,3,1,4,2,4,2,1,3,3,4,4,1,1,1,3,4,1,2,2,3,2,2,3,1,2,2,2,2,3,2,1,1,2,1,2,1,1,1,1,1,1,3,3,3,1,4,3,3,2,2,2,3,4,3,1,4,3,3\n0058,4,3,2,3,4,4,1,2,1,3,1,2,3,1,1,3,4,2,1,4,3,4,4,1,1,1,3,4,1,2,3,3,2,2,3,1,2,3,4,3,3,2,1,1,1,1,2,3,1,1,2,1,2,,3,3,1,4,3,3,2,2,2,3,4,3,1,4,2,3\n0059,2,3,2,4,1,4,1,3,2,3,2,2,3,1,1,3,4,2,2,1,3,2,4,1,1,1,3,4,1,2,3,2,2,2,3,4,3,2,3,4,3,4,1,2,1,3,2,4,1,2,1,1,2,2,3,3,1,4,3,3,2,2,2,3,4,3,4,1,2,2\n0060,1,3,2,3,3,3,2,2,2,3,1,3,3,1,4,3,4,2,3,1,3,4,4,1,1,1,3,3,1,3,4,2,2,2,3,1,1,2,3,2,3,3,1,1,1,3,4,2,2,2,1,1,1,4,3,1,1,4,4,3,2,2,4,1,4,3,3,1,1,4\n0061,2,3,1,3,3,4,2,2,1,3,1,2,3,1,1,3,4,1,2,3,3,4,4,1,1,1,3,1,1,3,4,3,2,1,3,1,2,2,3,2,4,2,1,1,1,3,2,1,2,2,1,1,2,4,2,3,1,4,3,3,2,2,3,3,2,3,3,1,3,3\n0062,2,3,1,3,1,4,1,2,1,3,1,2,3,1,4,3,4,2,2,3,3,4,4,1,1,1,3,4,1,3,3,2,2,2,3,1,3,2,3,3,3,2,1,3,4,4,2,3,1,1,1,1,2,3,2,3,4,4,3,1,2,2,2,3,4,3,1,1,1,3\n0063,2,3,2,3,4,4,2,2,1,3,1,3,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,4,2,3,3,3,2,2,3,1,2,2,3,3,3,2,1,1,1,3,2,2,2,1,2,1,1,4,3,3,1,1,3,3,2,2,4,3,2,3,1,4,2,3\n0064,2,1,2,3,1,4,2,2,1,3,1,3,3,1,4,1,4,3,3,3,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,4,3,3,2,1,1,1,1,4,1,1,1,2,1,2,4,2,3,1,4,3,3,2,2,2,3,4,3,1,4,1,3\n0065,4,3,2,3,1,4,1,2,1,3,1,2,3,1,2,2,4,1,3,3,3,4,4,1,1,1,3,3,1,2,3,4,2,2,3,1,1,2,3,4,3,3,1,1,2,1,2,1,2,1,,1,2,,2,3,1,4,3,1,2,2,4,3,4,3,1,1,3,3\n0066,3,4,1,3,1,4,2,2,1,3,1,3,3,1,4,4,3,2,1,3,3,4,4,1,1,1,3,4,1,3,2,3,2,2,3,4,2,2,2,2,3,2,1,1,2,3,2,1,1,2,1,2,2,4,4,3,1,1,2,4,2,4,3,3,4,3,1,4,2,3\n0067,4,1,2,3,3,4,2,2,1,3,1,2,3,1,2,3,4,2,2,3,3,4,4,1,1,1,3,3,1,2,,3,2,2,3,1,1,2,2,3,3,1,1,1,1,3,2,1,1,1,1,1,1,4,2,3,1,4,3,3,2,2,2,3,2,3,1,4,3,3\n0068,2,3,2,3,1,1,1,2,2,3,1,2,3,1,1,3,4,1,1,3,3,3,4,1,1,1,1,2,1,3,3,3,,2,3,1,1,3,2,4,3,2,1,1,1,3,2,1,1,1,1,1,2,,2,3,1,4,,3,2,2,2,3,4,3,1,1,2,1\n0069,2,3,2,3,1,4,2,2,1,3,1,2,3,1,4,3,4,2,2,3,3,4,4,1,1,1,1,3,2,3,2,3,2,2,3,4,1,3,3,3,3,3,1,1,3,3,2,1,1,2,1,1,2,4,2,1,1,4,4,3,2,2,2,1,2,3,1,4,2,1\n0070,4,3,2,3,1,4,2,2,1,3,1,2,3,1,2,3,4,2,3,3,3,3,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,2,3,3,1,3,3,4,2,1,4,2,2,2,2,1,2,3,2,2,1,4,3,4,1,2,4,2,4,3,1,1,2,4\n0071,2,3,2,3,4,4,1,2,2,3,1,2,3,3,1,3,3,1,4,3,3,4,4,1,4,1,3,3,1,1,4,3,2,2,3,1,1,2,3,3,3,2,1,1,1,1,4,1,2,1,1,1,2,4,2,3,1,4,3,1,2,2,2,3,2,3,1,4,1,3\n0072,2,3,2,3,1,1,1,1,1,3,1,2,3,1,2,3,4,1,2,3,3,4,4,1,1,2,1,4,1,3,3,3,2,2,3,1,4,2,3,3,2,2,3,1,1,3,3,2,1,1,2,1,1,1,2,3,3,4,3,3,2,1,1,3,2,3,1,1,3,3\n0073,2,3,2,4,1,4,2,2,2,3,1,2,3,1,2,3,4,1,3,3,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,2,2,2,3,3,4,1,1,3,3,4,3,1,2,1,1,1,,3,3,1,4,3,3,2,2,2,3,2,3,1,4,3,3\n0074,2,3,1,3,1,4,2,3,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,1,4,2,3,2,3,2,1,3,4,1,4,2,2,3,4,1,1,2,3,2,3,2,1,2,1,2,4,4,1,2,2,3,3,2,2,2,3,2,3,1,1,1,3\n0075,1,1,2,3,1,4,1,1,2,3,1,2,3,1,4,4,4,2,2,1,3,4,4,4,1,1,1,4,2,3,3,3,2,2,3,1,3,3,3,3,3,1,1,1,1,1,3,1,2,2,1,1,2,3,2,2,2,2,2,1,2,2,4,2,4,3,3,1,2,4\n0076,2,3,1,3,1,4,1,2,1,3,1,2,3,1,4,3,4,1,1,4,3,3,4,1,1,1,3,4,1,3,2,3,2,2,3,4,1,4,4,3,3,2,3,1,1,3,3,1,1,2,2,2,1,,3,4,1,4,3,3,2,2,2,4,4,3,3,4,3,3\n0077,2,3,1,3,3,4,1,2,1,3,1,2,3,3,4,3,4,2,4,1,3,4,4,1,1,1,1,4,1,4,2,3,2,2,3,4,1,2,2,2,3,3,1,1,4,2,2,1,2,1,1,1,1,3,2,3,1,4,3,3,2,2,2,3,2,3,3,3,2,3\n0078,2,3,2,3,3,4,1,2,1,3,1,2,3,1,4,3,4,1,1,3,3,4,4,1,1,2,1,4,3,3,4,3,2,2,3,1,2,4,3,3,3,2,1,1,2,3,2,3,1,2,2,1,2,,3,4,1,2,3,1,2,2,2,4,2,3,1,1,2,4\n0079,2,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,1,4,1,3,3,3,2,2,3,1,3,3,3,2,1,2,1,1,1,3,4,1,1,2,2,1,2,4,2,3,1,4,3,3,2,2,2,3,4,3,1,4,3,3\n0080,4,4,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,4,1,1,3,1,2,3,3,3,2,2,3,4,3,3,3,2,3,3,1,1,2,3,2,1,1,2,2,1,2,3,2,3,1,4,2,3,2,2,2,3,4,3,3,4,3,3\n0081,4,1,2,3,4,4,2,2,2,3,2,2,3,1,2,4,4,1,3,1,3,3,4,1,1,1,3,1,2,2,3,3,2,2,3,1,3,2,1,3,1,3,1,1,3,4,4,3,1,2,2,1,2,1,4,4,2,2,2,4,4,3,2,1,2,3,2,4,2,3\n0082,4,1,1,3,4,4,2,2,2,3,2,2,3,1,1,4,4,1,3,1,3,1,4,1,1,1,3,1,2,2,3,3,2,2,3,1,3,2,1,3,1,3,3,1,3,4,4,3,1,2,1,1,2,1,4,4,2,2,2,4,4,3,4,1,4,3,2,4,2,3\n0083,4,3,2,3,3,4,1,2,1,3,1,2,3,1,1,4,4,3,1,3,3,4,4,1,1,1,1,3,1,3,4,3,2,2,3,1,2,3,2,3,3,1,1,1,4,4,2,1,2,1,2,1,2,3,2,3,1,4,3,1,2,2,2,3,4,3,1,4,4,3\n0084,1,3,2,3,3,4,2,2,1,3,1,2,3,1,2,4,4,4,3,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,4,2,2,2,2,3,4,2,1,1,3,3,4,1,1,2,1,1,4,3,3,1,4,3,3,2,2,2,3,4,3,3,1,2,4\n0085,1,3,1,3,4,4,2,2,2,3,1,2,3,1,4,3,4,2,2,1,3,4,4,1,1,1,3,3,1,3,2,2,2,2,3,1,1,1,1,1,3,1,1,1,3,4,2,3,2,2,1,1,2,4,3,3,1,4,3,2,2,2,4,3,2,3,3,4,2,3\n0086,2,3,2,3,4,4,2,2,1,3,2,2,3,1,2,3,4,2,3,4,3,4,4,1,1,1,3,3,1,4,4,4,2,2,3,1,1,2,2,3,3,4,1,4,1,3,2,,1,2,1,1,2,4,4,3,1,4,3,3,2,2,2,3,2,3,1,4,3,4\n0087,2,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,2,2,3,3,4,1,1,3,3,1,3,1,1,2,1,2,,3,3,1,4,3,3,2,2,2,3,4,3,1,4,2,3\n0088,4,3,2,3,3,4,2,2,2,3,2,2,3,1,4,3,1,3,3,3,3,3,4,2,1,1,2,1,2,1,4,2,2,2,3,1,1,2,3,2,3,1,1,4,2,3,4,1,1,1,1,1,2,3,4,3,1,4,3,1,2,2,2,3,4,3,1,1,2,3\n0089,2,3,2,3,4,4,2,2,2,3,1,2,3,1,4,4,3,2,2,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,4,1,2,3,2,3,1,1,4,1,3,2,3,2,2,2,1,2,3,3,3,2,4,3,3,2,2,2,3,4,3,1,1,1,4\n0090,4,3,1,3,4,4,2,2,1,3,1,2,3,1,2,4,4,2,1,3,3,4,4,1,1,1,1,4,3,3,4,3,2,2,3,1,2,2,3,3,3,1,1,1,1,3,4,3,1,2,2,1,2,3,2,2,1,4,4,3,2,2,2,3,4,3,1,1,3,4\n0091,4,3,2,3,3,4,2,2,2,3,2,2,3,1,4,4,1,3,3,3,3,3,4,2,1,1,2,1,2,1,4,2,2,2,3,1,1,2,2,2,3,1,1,1,1,3,2,3,1,1,1,1,2,3,2,2,2,3,3,3,2,2,2,3,4,3,1,1,2,3\n0092,2,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,4,3,3,4,1,1,1,3,3,1,3,4,3,2,2,3,1,1,4,3,2,3,1,1,1,1,1,4,1,2,1,2,1,2,3,4,3,4,4,3,3,2,2,3,3,4,3,1,4,3,3\n0093,4,3,1,3,3,4,2,2,2,3,1,2,3,1,4,4,4,2,2,1,3,2,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,2,3,4,2,2,2,1,1,1,3,2,1,2,,2,1,,3,2,3,1,4,3,2,2,2,2,4,3,1,4,3,3\n0094,2,3,1,3,3,4,2,1,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,3,2,2,2,3,1,2,3,3,2,3,2,1,3,1,3,4,3,1,1,1,1,2,3,2,3,1,1,3,3,2,2,2,3,4,3,1,4,3,1\n0095,2,3,2,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,2,1,2,4,3,2,2,3,4,3,2,3,1,1,3,1,1,2,4,2,2,1,2,1,1,2,4,4,2,2,4,3,3,2,2,1,2,2,3,1,1,3,4\n0096,4,3,2,3,1,4,1,2,1,3,1,2,3,1,4,4,4,2,3,4,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,4,2,2,2,2,3,1,1,4,2,1,2,3,1,2,2,1,2,3,2,3,1,4,3,3,2,2,2,3,4,3,3,4,1,4\n0097,2,3,2,3,3,4,2,1,1,3,1,2,3,1,1,3,4,1,2,4,3,4,4,1,1,1,3,4,2,3,3,3,2,2,3,4,1,2,2,2,3,4,3,1,3,4,2,3,1,1,2,1,2,4,3,3,1,4,3,3,2,2,2,3,,4,3,4,3,3\n0098,2,3,1,3,3,4,1,2,2,3,1,2,3,1,4,2,4,2,1,3,3,4,4,1,1,1,3,2,1,2,4,3,2,2,3,4,3,2,3,1,1,3,1,1,2,4,2,2,1,2,1,1,2,4,4,2,2,4,3,3,2,2,1,2,2,3,1,1,3,4\n0099,2,3,2,3,3,4,1,2,2,3,1,2,3,1,4,2,4,2,1,3,3,4,4,1,1,1,3,2,1,2,4,3,2,2,3,4,3,2,3,1,1,3,1,1,2,4,2,2,1,2,1,1,2,4,4,2,2,4,3,3,2,2,1,2,2,3,1,1,3,4\n0100,2,3,1,3,4,4,2,2,1,2,1,2,3,1,4,3,4,3,2,3,3,4,4,1,1,1,3,2,2,1,4,3,2,2,3,1,2,2,2,3,3,3,3,1,1,3,4,1,1,1,1,1,1,3,3,3,1,4,4,3,2,2,2,3,4,3,3,4,3,2\n0101,2,3,1,3,4,4,2,2,1,3,1,2,3,1,4,3,4,3,1,3,3,3,4,1,1,3,3,2,2,1,4,3,2,2,3,1,2,3,2,2,3,2,2,1,1,3,4,1,1,1,1,3,1,1,2,3,1,4,3,3,2,2,2,3,4,3,3,4,3,2\n0102,2,3,2,3,3,4,1,2,1,3,1,2,3,1,4,3,4,1,4,3,3,4,4,1,1,1,3,4,1,1,4,3,2,2,3,1,1,3,3,3,3,2,1,1,1,3,2,3,1,1,2,1,2,3,3,3,1,4,3,2,2,2,2,3,4,3,3,4,3,3\n0103,3,3,2,3,1,4,1,2,2,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,2,2,3,3,3,3,1,4,4,3,2,1,2,2,2,1,2,3,2,3,1,4,3,3,2,2,2,3,4,3,1,1,3,3\n0104,1,3,1,3,1,4,2,1,1,3,1,2,3,1,2,4,4,2,4,3,3,4,4,1,1,1,3,4,1,4,4,2,3,2,3,1,1,2,3,2,1,3,1,4,2,3,2,1,2,2,1,1,2,4,2,3,1,4,2,3,2,1,3,3,4,4,1,4,3,3\n0105,1,1,1,3,1,1,2,3,2,3,2,2,3,1,4,4,3,2,2,4,3,3,4,1,1,2,1,4,3,2,2,3,2,2,3,1,1,4,1,2,3,4,4,4,1,2,3,1,1,2,1,1,2,3,4,4,4,4,2,3,2,1,3,3,4,4,1,4,3,3\n0106,2,3,2,3,3,4,1,2,2,3,1,2,3,1,1,3,4,2,2,1,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,4,3,3,2,2,3,4,3,3,1,1,4,3,1,2,1,1,2,4,2,2,2,4,2,3,2,2,4,2,4,4,1,1,3,3\n0107,4,3,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,1,3,3,2,3,4,1,1,1,1,2,3,1,1,2,1,2,4,2,3,1,4,3,3,2,2,3,3,4,3,1,4,3,3\n0108,2,3,1,3,,4,2,2,1,3,1,2,3,1,2,4,4,2,2,4,3,4,4,1,1,1,3,1,1,2,3,4,2,2,3,1,3,2,2,4,1,4,3,1,2,3,2,1,1,1,1,1,2,4,2,3,3,4,3,2,2,4,2,3,4,4,1,4,2,3\n0109,2,3,1,3,1,4,2,2,1,3,1,2,3,1,4,3,4,2,4,3,3,4,4,1,1,1,3,3,1,3,4,4,2,2,3,1,1,3,1,3,3,1,1,1,1,4,2,1,1,1,2,1,2,4,2,3,1,4,3,3,2,2,4,3,2,3,3,4,3,4\n0110,1,1,2,3,3,4,2,2,1,3,1,2,3,3,1,3,4,1,1,2,3,4,4,1,1,1,3,3,1,3,4,3,3,2,3,1,4,3,3,1,1,1,3,4,2,3,2,3,1,1,1,3,2,3,4,1,3,2,2,4,2,2,2,1,1,2,4,1,2,3\n0111,1,3,1,3,4,4,2,2,2,3,1,2,3,1,4,3,4,1,1,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,1,1,2,1,2,3,1,1,1,4,3,2,1,1,2,1,1,2,3,4,3,1,4,3,3,2,2,2,3,4,3,3,4,3,3\n0112,2,3,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,4,2,4,3,4,4,1,1,3,1,2,1,2,4,3,2,2,3,1,3,4,2,3,3,4,1,1,1,3,2,3,1,1,2,1,2,3,2,1,1,4,3,4,2,2,3,3,4,3,1,1,1,3\n0113,2,3,2,3,1,4,1,2,1,3,1,2,3,1,4,3,4,1,3,3,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,1,2,3,4,1,1,1,1,2,1,1,1,1,1,2,4,2,3,1,4,3,3,2,2,2,3,2,3,1,4,3,4\n0114,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,1,4,1,3,3,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,3,2,3,1,3,1,4,3,2,1,1,1,1,1,2,3,2,3,1,4,2,3,2,2,4,3,4,3,1,1,2,3\n0115,2,3,2,3,3,4,2,2,1,3,,2,3,1,2,3,4,2,4,3,3,4,4,1,1,1,3,3,1,3,4,4,2,2,3,1,4,3,2,2,1,2,1,1,1,3,2,1,1,2,1,1,1,4,3,3,1,4,3,4,2,2,2,3,4,3,1,4,2,4\n0116,1,1,1,3,1,4,2,2,2,4,1,2,3,1,4,4,4,2,3,3,3,4,4,1,1,1,3,3,2,1,4,3,2,2,3,1,1,2,2,3,3,2,1,1,3,3,3,1,2,1,2,1,2,4,2,3,1,4,3,3,2,2,4,3,2,3,1,1,1,3\n0117,1,3,2,3,4,4,2,2,1,3,1,2,3,1,1,4,4,1,4,3,3,4,4,4,,1,3,3,1,3,4,3,2,2,3,1,1,2,1,3,3,2,1,4,2,3,2,1,1,2,2,3,2,,2,3,1,4,3,3,2,2,2,3,2,3,1,4,2,4\n0118,2,3,2,4,4,3,1,2,1,3,1,2,3,1,4,3,4,1,1,3,3,4,4,1,1,3,3,4,1,3,2,2,2,2,3,1,3,2,3,3,3,4,1,3,3,3,2,1,1,1,2,1,2,3,2,3,1,4,3,3,2,4,2,1,3,3,2,4,1,1\n0119,1,3,1,3,3,4,2,1,1,2,1,3,3,1,2,3,4,1,2,3,3,4,4,1,1,1,3,4,1,2,4,3,2,2,3,1,2,2,3,2,3,1,1,1,1,3,2,1,2,1,2,1,2,4,3,3,1,4,2,3,1,1,4,3,2,3,1,1,2,3\n";

  const S = {
    raw: null,
    fileName: "",
    sheetName: "",
    isDemo: false,
    src: null,
    key: [],
    opt: [],
    inc: [],
    result: null,
  };

  const store = {
    get: (k) => {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    },
  };

  const setStatus = (msg, cls = "") => {
    const el = $("status");
    el.textContent = msg;
    el.className = "status " + cls;
  };

  const SUN_ICON =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 4.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM7.25 0h1.5v2h-1.5zM7.25 14h1.5v2h-1.5zM0 7.25h2v1.5H0zM14 7.25h2v1.5h-2zM2.22 1.16l1.06-1.06 1.42 1.42-1.07 1.06zM11.3 12.24l1.06-1.06 1.42 1.42-1.07 1.06zM12.48 2.58L11.42 1.16l1.42-1.42 1.06 1.06zM1.16 13.66L.1 12.24l1.42-1.42 1.06 1.06z"/></svg>';
  const MOON_ICON =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8.9 1.5a6.5 6.5 0 1 0 5.6 5.6.75.75 0 0 0-1.06-.86 5 5 0 0 1-6.2-6.2.75.75 0 0 0-.86-1.06 6.54 6.54 0 0 0-2.48 2.52z"/></svg>';

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    store.set("theme", theme);
    $("themeBtn").innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
    $("themeBtn").title = theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#1f1f1f" : "#0f6cbd");
    if (S.result) renderChart();
  };
  applyTheme(store.get("theme") ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("themeBtn").addEventListener("click", () =>
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"),
  );

  const showTab = (name) => {
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".tab-content").forEach((s) => (s.hidden = s.id !== "tab-" + name));
    if (name === "score" && S.result) renderChart();
  };
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  $("openFile").addEventListener("click", () => $("fileInput").click());
  $("fileInput").addEventListener("change", (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (f) openFile(f);
  });

  const dz = $("dropZone");
  ["dragenter", "dragover"].forEach((t) =>
    dz.addEventListener(t, (e) => {
      e.preventDefault();
      dz.classList.add("dragging");
    }),
  );
  ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, () => dz.classList.remove("dragging")));
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) openFile(f);
  });

  const openFile = async (file) => {
    try {
      setStatus(`${file.name} 읽는 중…`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const raw = readSource(bytes, file.name, window.XLSX);
      loadRaw(raw, file.name, false);
    } catch (err) {
      setStatus(`파일을 읽지 못했습니다: ${err.message}`, "error");
    }
  };

  $("loadDemo").addEventListener("click", async () => {
    try {
      const text =
        typeof EMBEDDED_SAMPLE !== "undefined"
          ? EMBEDDED_SAMPLE
          : await (await fetch("sample-data/answer.dat")).text();
      loadRaw(readSource(new TextEncoder().encode(text), "answer.dat"), "예시자료(answer.dat)", true);
    } catch (err) {
      setStatus(`예시 자료를 불러오지 못했습니다: ${err.message}`, "error");
    }
  });

  const loadRaw = (raw, name, demo, opt = {}) => {
    S.raw = raw;
    S.fileName = name;
    S.sheetName = raw.sheetName || "";
    S.isDemo = demo;
    S.src = buildSource(raw, opt);
    initSetup();
    clearResult();
    $("demoBanner").hidden = !demo;
    $("tabs").hidden = false;
    renderSetup();
    const ok = validate().errors.length === 0;
    if (ok && hasFullPrefill()) {
      runAnalysis();
      setStatus(
        `${name}: 피험자 ${S.src.ids.length}명, 문항 ${S.src.nItems}개. 파일에 정답이 들어 있어 바로 분석했습니다.`,
        "ok",
      );
    } else {
      showTab("setup");
      setStatus(
        `${name}: 피험자 ${S.src.ids.length}명, 문항 ${S.src.nItems}개를 읽었습니다. 정답과 답지 수를 확인하고 [분석 실행]을 누르세요.`,
        "ok",
      );
    }
  };

  const reload = (opt) => {
    try {
      const keep = { key: S.key, opt: S.opt, inc: S.inc };
      S.src = buildSource(S.raw, opt);
      initSetup();

      if (keep.key.length === S.src.nItems) Object.assign(S, keep);
      clearResult();
      renderSetup();
    } catch (err) {
      setStatus(err.message, "error");
    }
  };

  const clearResult = () => {
    S.result = null;
    document.querySelectorAll('#tabs button[data-tab="score"], #tabs button[data-tab="item"]').forEach((b) => (b.disabled = true));
    $("reportAll").disabled = true;
  };

  const runAnalysis = () => {
    const { errors } = validate();
    if (errors.length) {
      setStatus(errors[0], "error");
      return;
    }
    const n = S.src.nItems;
    const model = {
      nItems: n,
      key: S.key.map((k) => k || " "),
      numOptions: S.opt.map((q) => Number(q) || 0),
      scored: [...S.inc],
      weights: new Array(n).fill(1),
      students: S.src.ids.map((id, i) => ({ id, resp: S.src.resp[i] })),
    };
    S.result = analyze(model);
    document.querySelectorAll("#tabs button").forEach((b) => (b.disabled = false));
    $("reportAll").disabled = false;
    renderScores();
    renderItems();
    showTab("score");
    const st = S.result.stats;
    setStatus(`분석 완료: 피험자 ${st.n}명, 분석 포함 ${st.nScored}문항, Cronbach α ${f3(st.reliability)}`, "ok");
  };
  $("runBtn").addEventListener("click", runAnalysis);

  const idLabel = () => {
    const l = S.src?.info?.idLabel || "ID";
    return /^id$/i.test(l) ? "ID" : l;
  };

  const baseName = () => (S.isDemo ? "예시_answer" : S.fileName.replace(/\.[^.]+$/, ""));

  const saveBlob = async (filename, blob) => {
    let dl = null;
    try {
      dl = window.claude?.use ? await window.claude.use("downloads") : null;
    } catch (e) {
      dl = null;
    }
    if (dl) {
      try {
        await dl.save({ filename, data: blob });
        setStatus(`${filename} 파일을 저장했습니다.`, "ok");
      } catch (e) {
        if (e?.code !== "declined") setStatus(`파일을 저장하지 못했습니다 (${e?.code || e?.message || e}).`, "error");
      }
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setStatus(`${filename} 파일을 저장했습니다.`, "ok");
  };

  const saveDocx = async (parts, suffix, btn) => {
    if (!S.result) return;
    if (!window.docx) {
      setStatus("Word 생성 모듈을 불러오지 못했습니다.", "error");
      return;
    }
    btn.disabled = true;
    setStatus("Word 보고서를 만드는 중…");
    try {
      const blob = await buildDocx(
        S.result,
        { fileName: S.isDemo ? "예시 자료(answer.dat)" : S.fileName, idLabel: idLabel(), itemSort: $("itemSort").value },
        parts,
      );
      await saveBlob(`${baseName()}_${suffix}.docx`, blob);
    } catch (err) {
      setStatus(`Word 보고서를 만들지 못했습니다: ${err.message}`, "error");
    } finally {
      btn.disabled = false;
    }
  };

  $("reportAll").addEventListener("click", (e) => saveDocx({ scores: true, items: true }, "분석보고서", e.currentTarget));
  $("scoreDocx").addEventListener("click", (e) => saveDocx({ scores: true }, "점수분석", e.currentTarget));
  $("itemDocx").addEventListener("click", (e) => saveDocx({ items: true }, "문항분석", e.currentTarget));

  $("scoreXlsx").addEventListener("click", async () => {
    if (!S.result) return;
    try {
      await saveBlob(`${baseName()}_분석결과.xlsx`, buildXlsx(S.result, idLabel()));
    } catch (err) {
      setStatus(`Excel 파일을 만들지 못했습니다: ${err.message}`, "error");
    }
  });

  $("aboutBtn").addEventListener("click", () => ($("aboutModal").hidden = false));
  $("aboutClose").addEventListener("click", () => ($("aboutModal").hidden = true));
  document.querySelectorAll(".dialog-close").forEach((b) => b.addEventListener("click", () => (b.closest(".modal").hidden = true)));
  $("aboutModal").addEventListener("click", (e) => e.target === e.currentTarget && (e.currentTarget.hidden = true));
  document.addEventListener("keydown", (e) => e.key === "Escape" && ($("aboutModal").hidden = true));
}
