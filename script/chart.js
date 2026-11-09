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
  const font = opt.font || "'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif";
  const padL = 52, padR = 16, padT = 34, padB = 46;
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
