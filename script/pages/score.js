"use strict";

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
