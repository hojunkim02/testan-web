"use strict";

const fx = (v, d) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  const t = Math.abs(v).toFixed(d).replace(/^0(?=\.)/, "");
  return (v < 0 && Number(t) !== 0 ? "−" : "") + t;
};
const f2 = (v) => fx(v, 2);
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
