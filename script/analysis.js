"use strict";

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
