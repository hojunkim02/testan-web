"use strict";

/**
 * 검사점수 분포 그래프 (x: 점수, y: 백분율 %). 화면과 Word 보고서가 같은 함수를 쓴다.
 * dist: analyze().distribution, pal: { bar, axis, text, grid, line }
 * 반환: 막대별 히트 영역 [{x0, x1, d}] (툴팁용)
 */
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
  const font =
    opt.font || "'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif";
  const padL = 52,
    padR = 16,
    padT = 34,
    padB = 46;
  const pw = W - padL - padR;
  const ph = H - padT - padB;
  const maxPct = Math.max(1, ...dist.map((d) => d.pct));
  // 눈금: 1·2·5 단위
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

  // 축 제목
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

/**
 * 선 그래프 (문항특성곡선·정보함수·표준오차). 화면과 Word 보고서 공통.
 * series: [{ xs, ys, color, width, dash, label }]
 * o: { width, height, dpr, xmin, xmax, ymin, ymax, xlabel, ylabel, title, background, font, pal, hlines: [{y, color, dash}], vlines: [{x, color, dash}] }
 */
const drawLineChart = (canvas, series, o) => {
  const W = o.width,
    H = o.height,
    dpr = o.dpr || 1;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (o.background) {
    ctx.fillStyle = o.background;
    ctx.fillRect(0, 0, W, H);
  }
  const font =
    o.font || "'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif";
  const pal = o.pal;
  const padL = 48,
    padR = 14,
    padT = 32,
    padB = 40;
  const pw = W - padL - padR,
    ph = H - padT - padB;
  const ymax =
    o.ymax ??
    Math.max(1e-9, ...series.flatMap((s) => s.ys.filter(Number.isFinite)));
  const ymin = o.ymin ?? 0;
  const X = (v) => padL + ((v - o.xmin) / (o.xmax - o.xmin)) * pw;
  const Y = (v) => padT + ph * (1 - (v - ymin) / (ymax - ymin));
  // 눈금
  const niceStep = (span) => {
    const raw = span / 5;
    const p = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => span / s <= 6);
  };
  const ys = niceStep(ymax - ymin);
  ctx.font = `600 13px ${font}`;
  ctx.fillStyle = pal.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(o.title || "", padL, 19);
  ctx.font = `11px ${font}`;
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let v = Math.ceil(ymin / ys) * ys; v <= ymax + 1e-9; v += ys) {
    const yy = Math.round(Y(v)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(W - padR, yy);
    ctx.stroke();
    ctx.fillStyle = pal.axis;
    ctx.fillText(Number(v.toFixed(3)).toString(), padL - 6, yy);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let v = Math.ceil(o.xmin); v <= o.xmax; v++) {
    const xx = Math.round(X(v)) + 0.5;
    ctx.strokeStyle = pal.grid;
    ctx.beginPath();
    ctx.moveTo(xx, padT);
    ctx.lineTo(xx, padT + ph);
    ctx.stroke();
    ctx.fillStyle = pal.axis;
    ctx.fillText(String(v), xx, padT + ph + 6);
  }
  const ref = (l, horiz) => {
    ctx.save();
    ctx.strokeStyle = l.color || pal.axis;
    ctx.setLineDash(l.dash || [4, 4]);
    ctx.beginPath();
    if (horiz) {
      ctx.moveTo(padL, Y(l.y));
      ctx.lineTo(W - padR, Y(l.y));
    } else {
      ctx.moveTo(X(l.x), padT);
      ctx.lineTo(X(l.x), padT + ph);
    }
    ctx.stroke();
    ctx.restore();
  };
  (o.hlines || []).forEach((l) => ref(l, true));
  (o.vlines || [])
    .filter((l) => l.x >= o.xmin && l.x <= o.xmax)
    .forEach((l) => ref(l, false));
  // 선
  ctx.save();
  ctx.beginPath();
  ctx.rect(padL, padT - 2, pw, ph + 4);
  ctx.clip();
  series.forEach((s) => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width || 2;
    ctx.setLineDash(s.dash || []);
    ctx.beginPath();
    s.xs.forEach((x, i) =>
      i ? ctx.lineTo(X(x), Y(s.ys[i])) : ctx.moveTo(X(x), Y(s.ys[i])),
    );
    ctx.stroke();
  });
  // 점(예: 피험자의 θ̂와 총점)과 표식(예: 최대 정보 지점)
  if (o.points && o.points.length) {
    ctx.fillStyle = o.pointColor || pal.axis;
    ctx.globalAlpha = o.pointAlpha ?? 0.35;
    const r = o.pointRadius || 2.2;
    o.points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(X(p.x), Y(p.y), r, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  (o.markers || []).forEach((m) => {
    if (!(m.x >= o.xmin && m.x <= o.xmax)) return;
    ctx.save();
    ctx.strokeStyle = m.color || pal.text;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(X(m.x), Y(m.y));
    ctx.lineTo(X(m.x), padT + ph);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = m.color || pal.text;
    ctx.beginPath();
    ctx.arc(X(m.x), Y(m.y), 4, 0, 2 * Math.PI);
    ctx.fill();
    if (m.label) {
      ctx.font = `600 11px ${font}`;
      ctx.textBaseline = "bottom";
      const tx = X(m.x);
      ctx.textAlign =
        tx > padL + pw * 0.7
          ? "right"
          : tx < padL + pw * 0.3
            ? "left"
            : "center";
      ctx.fillText(
        m.label,
        tx +
          (ctx.textAlign === "left" ? 6 : ctx.textAlign === "right" ? -6 : 0),
        Y(m.y) - 7,
      );
    }
    ctx.restore();
  });
  // 축
  ctx.strokeStyle = pal.axis;
  ctx.setLineDash([]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + ph + 0.5);
  ctx.lineTo(W - padR, padT + ph + 0.5);
  ctx.stroke();
  ctx.fillStyle = pal.axis;
  ctx.font = `600 11px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(o.xlabel || "θ", padL + pw / 2, H - 4);
  ctx.save();
  ctx.translate(13, padT + ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText(o.ylabel || "", 0, 0);
  ctx.restore();
  // 범례
  const lab = series.filter((s) => s.label);
  if (lab.length && lab.length <= 4) {
    ctx.font = `11px ${font}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let x = W - padR;
    [...lab].reverse().forEach((s) => {
      const w = ctx.measureText(s.label).width;
      x -= w + 26;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width || 2;
      ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      ctx.moveTo(x, 18);
      ctx.lineTo(x + 16, 18);
      ctx.stroke();
      ctx.fillStyle = pal.text;
      ctx.fillText(s.label, x + 20, 18);
    });
    ctx.setLineDash([]);
  }
  return { X, Y, padL, padT, pw, ph };
};

if (typeof module !== "undefined") module.exports.drawLineChart = drawLineChart;
