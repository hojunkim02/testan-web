"use strict";

/**
 * 이분 문항반응이론(IRT) 추정 — R mirt(1.47)와 같은 방식
 *   모형: 1PL(공통 변별도), 2PL, 3PL
 *   P(θ) = g + (1 − g) / (1 + exp(−(a θ + d)))      (mirt 기울기-절편, D = 1)
 *   문항모수 표기: b = −d / a, 표시용 변별도 = a / D (D = 1.7 또는 1)
 *   추정: 주변최대우도 EM (Bock & Aitkin, 1981)
 *     구적점 61개, θ ∈ [−6, 6] 등간격, 가중치 = 표준정규 밀도(합 1로 정규화)
 *   사전분포(선택): a ~ lognormal(0, 0.5), 3PL의 g ~ Beta(20/Q + 1, 20(1 − 1/Q) + 1)  [BILOG-MG 관례, mirt의 lnorm·expbeta]
 *   표준오차: 주변 로그(사후)우도의 관측정보행렬 (Fisher 항등식 기울기의 수치 미분)
 *   능력: EAP(사후평균)와 사후표준편차
 */

const IRT_D_DEFAULT = 1.7;
const QPTS = 61;
const THETA = Array.from(
  { length: QPTS },
  (_, q) => -6 + (12 * q) / (QPTS - 1),
);
const QW = (() => {
  const w = THETA.map((t) => Math.exp(-0.5 * t * t));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((v) => v / s);
})();
const LOG_QW = QW.map(Math.log);
const LNORM_SD = 0.5;

const sigmoid = (z) =>
  z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
const logit = (p) => Math.log(p / (1 - p));
const lgamma = (x) => {
  // Lanczos 근사
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61503916999185, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return (
    0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
  );
};

/**
 * X: 피험자 × 문항 0/1 행렬 (분석에 넣을 문항만)
 * opt: { model: "1PL" | "2PL" | "3PL", prior: bool, Q: [문항별 답지 수] }
 */
const irtEstimate = (X, opt) => {
  const N = X.length;
  const k = X[0].length;
  const model = opt.model;
  const usePriorA = opt.prior && model !== "1PL";
  const useG = model === "3PL";
  const usePriorG = useG && opt.prior;
  const betaAB = (opt.Q || []).map((Q) => [20 / Q + 1, 20 * (1 - 1 / Q) + 1]);

  // 같은 응답 유형은 묶어서 계산
  const patMap = new Map();
  X.forEach((row, i) => {
    const key = row.join("");
    const p = patMap.get(key);
    if (p) (p.count++, p.who.push(i));
    else patMap.set(key, { x: row, count: 1, who: [i] });
  });
  const pats = [...patMap.values()];

  // 시작값 (mirt와 같은 방식은 아니지만 수렴점은 같다): 정답률로 절편, 기울기 1
  const pj = Array.from(
    { length: k },
    (_, j) => X.reduce((s, r) => s + r[j], 0) / N,
  );
  let a = new Array(k).fill(1);
  let d = pj.map((p) => logit(Math.min(0.99, Math.max(0.01, p))) * 1.3);
  let g = pj.map((_, j) => (useG ? 1 / (opt.Q?.[j] || 5) : 0));

  // 현재 모수로 구적점별 확률
  const probTable = (A, Dd, G) => {
    const P = new Array(k);
    for (let j = 0; j < k; j++) {
      const row = new Float64Array(QPTS);
      for (let q = 0; q < QPTS; q++)
        row[q] = G[j] + (1 - G[j]) * sigmoid(A[j] * THETA[q] + Dd[j]);
      P[j] = row;
    }
    return P;
  };

  /** E 단계: 기대 빈도 n_q, r_jq, 주변 로그우도, 피험자 유형별 사후분포 */
  const eStep = (A, Dd, G, keepPost = false) => {
    const P = probTable(A, Dd, G);
    const base = new Float64Array(QPTS);
    const dlog = new Array(k);
    for (let j = 0; j < k; j++) {
      const lq = new Float64Array(QPTS);
      for (let q = 0; q < QPTS; q++) {
        const p = Math.min(1 - 1e-15, Math.max(1e-15, P[j][q]));
        base[q] += Math.log(1 - p);
        lq[q] = Math.log(p) - Math.log(1 - p);
      }
      dlog[j] = lq;
    }
    const n = new Float64Array(QPTS);
    const r = Array.from({ length: k }, () => new Float64Array(QPTS));
    let ll = 0;
    const post = keepPost ? [] : null;
    const lw = new Float64Array(QPTS);
    for (const pt of pats) {
      for (let q = 0; q < QPTS; q++) lw[q] = base[q] + LOG_QW[q];
      for (let j = 0; j < k; j++)
        if (pt.x[j]) for (let q = 0; q < QPTS; q++) lw[q] += dlog[j][q];
      let m = -Infinity;
      for (let q = 0; q < QPTS; q++) if (lw[q] > m) m = lw[q];
      let s = 0;
      const w = new Float64Array(QPTS);
      for (let q = 0; q < QPTS; q++) s += w[q] = Math.exp(lw[q] - m);
      ll += pt.count * (m + Math.log(s));
      for (let q = 0; q < QPTS; q++) w[q] /= s;
      for (let q = 0; q < QPTS; q++) n[q] += pt.count * w[q];
      for (let j = 0; j < k; j++)
        if (pt.x[j]) for (let q = 0; q < QPTS; q++) r[j][q] += pt.count * w[q];
      if (keepPost) post.push(w);
    }
    return { n, r, ll, post, P };
  };

  // 사전분포 로그밀도와 도함수 (mirt dlnorm·dbeta와 같은 상수 포함)
  const lpA = (x) =>
    usePriorA
      ? -Math.log(x) -
        Math.log(LNORM_SD * Math.sqrt(2 * Math.PI)) -
        Math.log(x) ** 2 / (2 * LNORM_SD ** 2)
      : 0;
  const dlpA = (x) =>
    usePriorA ? -1 / x - Math.log(x) / (LNORM_SD ** 2 * x) : 0;
  const lpG = (x, j) => {
    if (!usePriorG) return 0;
    const [al, be] = betaAB[j];
    return (
      (al - 1) * Math.log(x) +
      (be - 1) * Math.log(1 - x) -
      (lgamma(al) + lgamma(be) - lgamma(al + be))
    );
  };
  const dlpG = (x, j) => {
    if (!usePriorG) return 0;
    const [al, be] = betaAB[j];
    return (al - 1) / x - (be - 1) / (1 - x);
  };
  const logPriorAll = (A, G) => {
    let s = 0;
    if (usePriorA) for (let j = 0; j < k; j++) s += lpA(A[j]);
    if (usePriorG) for (let j = 0; j < k; j++) s += lpG(G[j], j);
    return s;
  };

  /** 문항 j의 완전자료 로그우도 기울기 (a, d, g 순). n, r는 E 단계 기대 빈도 */
  const itemGrad = (j, aj, dj, gj, n, rj) => {
    let ga = 0,
      gd = 0,
      gg = 0;
    for (let q = 0; q < QPTS; q++) {
      const s = sigmoid(aj * THETA[q] + dj);
      if (gj === 0) {
        const e = rj[q] - n[q] * s;
        ga += e * THETA[q];
        gd += e;
      } else {
        const P = gj + (1 - gj) * s;
        const dl = rj[q] / P - (n[q] - rj[q]) / (1 - P);
        const dz = (1 - gj) * s * (1 - s);
        ga += dl * dz * THETA[q];
        gd += dl * dz;
        gg += dl * (1 - s);
      }
    }
    const withPrior = !(seStage && opt.seNoPrior);
    return [
      ga + (withPrior ? dlpA(aj) : 0),
      gd,
      gg + (withPrior ? dlpG(gj, j) : 0),
    ];
  };
  const itemObj = (j, aj, dj, gj, n, rj) => {
    let f = 0;
    for (let q = 0; q < QPTS; q++) {
      const P = Math.min(
        1 - 1e-15,
        Math.max(1e-15, gj + (1 - gj) * sigmoid(aj * THETA[q] + dj)),
      );
      f += rj[q] * Math.log(P) + (n[q] - rj[q]) * Math.log(1 - P);
    }
    return f + (usePriorA ? lpA(aj) : 0) + (usePriorG ? lpG(gj, j) : 0);
  };

  let seStage = false; // 표준오차 단계 표시
  const okA = (x) => !usePriorA || x > 1e-3;
  const okG = (x) => x > 1e-6 && x < 1 - 1e-6;

  /** M 단계: 문항별 뉴턴-랩슨 (헤시안은 해석 기울기의 중앙차분) */
  const mStepItem = (j, n, rj) => {
    let x = useG ? [a[j], d[j], g[j]] : [a[j], d[j]];
    const dim = x.length;
    const grad = (v) =>
      itemGrad(j, v[0], v[1], useG ? v[2] : 0, n, rj).slice(0, dim);
    const obj = (v) => itemObj(j, v[0], v[1], useG ? v[2] : 0, n, rj);
    let f = obj(x);
    for (let it = 0; it < 30; it++) {
      const G0 = grad(x);
      const H = numHess(grad, x);
      let step = solve(
        H.map((r) => r.map((v) => -v)),
        G0,
      );
      if (!step || !isNegDef(H))
        step = G0.map((v) => (v * 0.1) / (1 + Math.abs(v))); // 볼록하지 않으면 기울기 방향
      let t = 1;
      let xn, fn;
      for (let h = 0; h < 40; h++) {
        xn = x.map((v, i) => v + t * step[i]);
        if (okA(xn[0]) && (!useG || okG(xn[2]))) {
          fn = obj(xn);
          if (fn >= f - 1e-12) break;
        }
        t /= 2;
        fn = -Infinity;
      }
      if (!(fn > -Infinity)) break;
      const delta = Math.max(...xn.map((v, i) => Math.abs(v - x[i])));
      x = xn;
      f = fn;
      if (delta < 1e-10) break;
    }
    a[j] = x[0];
    d[j] = x[1];
    if (useG) g[j] = x[2];
  };

  /** 1PL M 단계: 공통 a와 문항별 d를 함께 (화살표 모양 헤시안, 해석적) */
  const mStep1PL = (n, r) => {
    for (let it = 0; it < 50; it++) {
      const A = a[0];
      let Ga = 0,
        Haa = 0;
      const Gd = new Float64Array(k),
        Hdd = new Float64Array(k),
        Had = new Float64Array(k);
      for (let j = 0; j < k; j++) {
        for (let q = 0; q < QPTS; q++) {
          const s = sigmoid(A * THETA[q] + d[j]);
          const e = r[j][q] - n[q] * s;
          const w = n[q] * s * (1 - s);
          Ga += e * THETA[q];
          Gd[j] += e;
          Haa -= w * THETA[q] * THETA[q];
          Had[j] -= w * THETA[q];
          Hdd[j] -= w;
        }
      }
      // 화살표 행렬 풀이: [Haa Had'; Had diag(Hdd)] [Δa; Δd] = −[Ga; Gd]
      let S = Haa,
        rhs = -Ga;
      for (let j = 0; j < k; j++) {
        S -= (Had[j] * Had[j]) / Hdd[j];
        rhs -= (Had[j] * -Gd[j]) / Hdd[j];
      }
      const da = rhs / S;
      let delta = Math.abs(da);
      a = a.map(() => A + da);
      for (let j = 0; j < k; j++) {
        const dd = (-Gd[j] - Had[j] * da) / Hdd[j];
        d[j] += dd;
        delta = Math.max(delta, Math.abs(dd));
      }
      if (delta < 1e-10) break;
    }
  };

  // ---------- EM ----------
  const MAXIT = opt.maxIter || 3000;
  const TOL = opt.tol || 1e-8;
  let iter = 0;
  let converged = false;
  let es;
  // 발산 문항: |b| 또는 |a|가 한계를 넘으면 그 값에 고정하고 수렴 판정에서 뺀다
  //   (3PL에서 매우 어려운 문항은 "추측만으로 맞히는 문항"이 사후확률 최대가 되어 b → +∞,
  //    최대우도 2PL에서는 변별도 a → ∞로 발산할 수 있다)
  // 판정은 b가 아니라 절편 d와 기울기 a로 한다 (a ≈ 0인 문항은 b가 커도 유한한 추정치)
  const D_MAX = 25,
    A_MAX = 20;
  const frozen = new Array(k).fill(false);
  for (iter = 1; iter <= MAXIT; iter++) {
    const prev = [...a, ...d, ...g];
    es = eStep(a, d, g);
    if (model === "1PL") mStep1PL(es.n, es.r);
    else
      for (let j = 0; j < k; j++) if (!frozen[j]) mStepItem(j, es.n, es.r[j]);
    if (![...a, ...d, ...g].every(Number.isFinite)) break;
    if (model !== "1PL")
      for (let j = 0; j < k; j++)
        if (!frozen[j] && (Math.abs(d[j]) > D_MAX || Math.abs(a[j]) > A_MAX))
          frozen[j] = true;
    let delta = 0;
    for (let j = 0; j < k; j++) {
      if (frozen[j]) continue;
      delta = Math.max(
        delta,
        Math.abs(a[j] - prev[j]),
        Math.abs(d[j] - prev[k + j]),
        Math.abs(g[j] - prev[2 * k + j]),
      );
    }
    if (delta < TOL) {
      converged = true;
      break;
    }
  }
  es = eStep(a, d, g, true);
  const logLik = es.ll;
  const logPrior = logPriorAll(a, g);

  // ---------- 표준오차: 주변 로그(사후)우도의 관측정보 ----------
  // 모수 벡터: 1PL [a, d1..dk], 2PL [a1,d1, a2,d2, …], 3PL [a1,d1,g1, …]
  const npar = model === "1PL" ? k + 1 : k * (useG ? 3 : 2);
  const pack = () =>
    model === "1PL"
      ? [a[0], ...d]
      : a.flatMap((v, j) => (useG ? [v, d[j], g[j]] : [v, d[j]]));
  const unpack = (v) => {
    if (model === "1PL")
      return [new Array(k).fill(v[0]), v.slice(1), new Array(k).fill(0)];
    const st = useG ? 3 : 2;
    return [
      Array.from({ length: k }, (_, j) => v[j * st]),
      Array.from({ length: k }, (_, j) => v[j * st + 1]),
      Array.from({ length: k }, (_, j) => (useG ? v[j * st + 2] : 0)),
    ];
  };
  const margGrad = (v) => {
    const [A, Dd, G] = unpack(v);
    const e = eStep(A, Dd, G);
    seStage = true;
    if (model === "1PL") {
      let ga = 0;
      const gd = [];
      for (let j = 0; j < k; j++) {
        const gr = itemGrad(j, A[j], Dd[j], 0, e.n, e.r[j]);
        ga += gr[0];
        gd.push(gr[1]);
      }
      return [ga, ...gd];
    }
    return Array.from({ length: k }, (_, j) =>
      itemGrad(j, A[j], Dd[j], G[j], e.n, e.r[j]).slice(0, useG ? 3 : 2),
    ).flat();
  };
  const est = pack();
  const idx = (j, which) =>
    model === "1PL" ? (which === 0 ? 0 : j + 1) : j * (useG ? 3 : 2) + which;
  // 표준오차는 고정(발산)되지 않은 모수에 대해서만
  const free = [];
  for (let i = 0; i < npar; i++) {
    const j =
      model === "1PL" ? (i === 0 ? -1 : i - 1) : Math.floor(i / (useG ? 3 : 2));
    if (j < 0 || !frozen[j]) free.push(i);
  }
  const pos = new Map(free.map((p, i) => [p, i]));
  let cov = null;
  const warnings = [];
  if (opt.se !== false && free.length) {
    const subGrad = (vs) => {
      const v = est.slice();
      free.forEach((p, i) => (v[p] = vs[i]));
      const gfull = margGrad(v);
      return free.map((p) => gfull[p]);
    };
    const H = numHess(
      subGrad,
      free.map((p) => est[p]),
    );
    cov = invert(H.map((r) => r.map((x) => -x)));
    if (!cov || cov.some((r, i) => !(r[i] > 0))) {
      cov = null;
      warnings.push(
        "정보행렬을 역산할 수 없어 표준오차를 계산하지 못했습니다(모형이 경험적으로 식별되지 않음).",
      );
    }
  }
  const C = (p1, p2) => cov[pos.get(p1)][pos.get(p2)];

  const items = Array.from({ length: k }, (_, j) => {
    const A = a[j],
      Dd = d[j],
      G = g[j];
    const it = { a1: A, d: Dd, g: G, b: -Dd / A, diverged: frozen[j] };
    if (cov && !frozen[j]) {
      const ia = idx(j, 0),
        id = idx(j, 1);
      const va = C(ia, ia),
        vd = C(id, id),
        cad = C(ia, id);
      it.se_a1 = Math.sqrt(va);
      it.se_d = Math.sqrt(vd);
      const db_da = Dd / (A * A),
        db_dd = -1 / A;
      it.se_b = Math.sqrt(
        db_da * db_da * va + db_dd * db_dd * vd + 2 * db_da * db_dd * cad,
      );
      if (useG) it.se_g = Math.sqrt(C(idx(j, 2), idx(j, 2)));
    }
    return it;
  });

  // 수렴·발산 진단
  if (!converged)
    warnings.push(`EM 추정이 ${MAXIT}회 안에 수렴하지 않았습니다.`);
  const div = items
    .map((it, j) => (it.diverged ? j : -1))
    .filter((j) => j >= 0);
  if (div.length) warnings.push("divergent"); // 화면에서 문항 번호와 함께 안내

  // EAP 능력 추정
  const theta = new Float64Array(N);
  const thetaSE = new Float64Array(N);
  pats.forEach((pt, p) => {
    const w = es.post[p];
    let m = 0;
    for (let q = 0; q < QPTS; q++) m += w[q] * THETA[q];
    let v = 0;
    for (let q = 0; q < QPTS; q++) v += w[q] * (THETA[q] - m) ** 2;
    pt.who.forEach((i) => {
      theta[i] = m;
      thetaSE[i] = Math.sqrt(v);
    });
  });

  const nest = npar;
  return {
    model,
    prior: !!opt.prior,
    N,
    k,
    items,
    logLik,
    logPrior,
    nest,
    AIC: -2 * logLik + 2 * nest,
    BIC: -2 * logLik + Math.log(N) * nest,
    iterations: iter,
    converged,
    warnings,
    theta: [...theta],
    thetaSE: [...thetaSE],
  };
};

/** 문항정보함수 I(θ) = (dP/dθ)² / (P(1 − P)) — D = 1 기울기 a1로 계산 (θ 척도에서는 D와 무관) */
const irtInfo = (it, t) => {
  const s = sigmoid(it.a1 * t + it.d);
  const P = it.g + (1 - it.g) * s;
  const dP = (1 - it.g) * it.a1 * s * (1 - s);
  return (dP * dP) / (P * (1 - P));
};
const irtProb = (it, t) => it.g + (1 - it.g) * sigmoid(it.a1 * t + it.d);
/**
 * 문항정보가 가장 큰 능력 수준과 그때의 정보량.
 * z = aθ + d로 두면 정보가 최대인 z는 ln[(1 + √(1 + 8c)) / 2] (Lord, 1980)이므로 θ* = (z* − d) / a.
 * 1·2모수(c = 0)이면 θ* = b.
 */
const irtMaxInfo = (it) => {
  if (!Number.isFinite(it.a1) || Math.abs(it.a1) < 1e-8)
    return { theta: NaN, info: 0 };
  const zs = Math.log((1 + Math.sqrt(1 + 8 * it.g)) / 2);
  const t = (zs - it.d) / it.a1;
  return { theta: t, info: irtInfo(it, t) };
};

/* ---------- 작은 선형대수 ---------- */
function numHess(grad, x) {
  const n = x.length;
  const H = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    const h = 1e-5 * Math.max(1, Math.abs(x[i]));
    const xp = x.slice(),
      xm = x.slice();
    xp[i] += h;
    xm[i] -= h;
    const gp = grad(xp),
      gm = grad(xm);
    for (let j = 0; j < n; j++) H[j][i] = (gp[j] - gm[j]) / (2 * h);
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++) {
      const m = (H[i][j] + H[j][i]) / 2;
      H[i][j] = H[j][i] = m;
    }
  return H;
}
function solve(A, b) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++)
      if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}
function invert(A) {
  const n = A.length;
  const M = A.map((r, i) => [
    ...r,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++)
      if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (!(Math.abs(M[p][c]) > 1e-12)) return null;
    [M[c], M[p]] = [M[p], M[c]];
    const piv = M[c][c];
    for (let k = 0; k < 2 * n; k++) M[c][k] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f) for (let k = 0; k < 2 * n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r) => r.slice(n));
}
function isNegDef(H) {
  // 콜레스키로 −H가 양정치인지 확인
  const n = H.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let s = -H[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (s <= 0) return false;
        L[i][i] = Math.sqrt(s);
      } else L[i][j] = s / L[j][j];
    }
  return true;
}

if (typeof module !== "undefined")
  module.exports = {
    irtEstimate,
    irtInfo,
    irtProb,
    irtMaxInfo,
    IRT_D_DEFAULT,
    THETA,
  };
