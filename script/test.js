"use strict";
const fs = require("fs");
const path = require("path");
const { readSource, buildSource, analyze } = require("./app.js");

const dir = path.join(__dirname, "..", "sample-data");

const toModel = (src) => {
  const n = src.nItems;
  return {
    nItems: n,
    key: (src.prefill.key || new Array(n).fill(null)).map((k) => k || " "),
    numOptions: (src.prefill.numOptions || new Array(n).fill(0)).map((q) => Number(q) || 0),
    scored: src.prefill.scored || new Array(n).fill(true),
    weights: new Array(n).fill(1),
    students: src.ids.map((id, i) => ({ id, resp: src.resp[i] })),
  };
};

const toCsv = (src) => {
  const n = src.nItems;
  const lines = [];
  const meta = (name, vals) =>
    lines.push([name, ...Array.from({ length: n }, (_, j) => (vals && vals[j] != null ? vals[j] : ""))].join(","));
  if (src.prefill.key) meta("KEY", src.prefill.key);
  if (src.prefill.numOptions) meta("OPTIONS", src.prefill.numOptions);
  if (src.prefill.scored) meta("INCLUDE", src.prefill.scored.map((v) => (v ? "y" : "n")));
  lines.push(["id", ...Array.from({ length: n }, (_, j) => `q${j + 1}`)].join(","));
  src.ids.forEach((id, i) =>
    lines.push([id, ...src.resp[i].map((r) => (r === " " ? "" : r))].join(",")),
  );
  return lines.join("\n") + "\n";
};

const toFixed = (src, idWidth) =>
  src.ids
    .map((id, i) => String(id).padStart(idWidth, "0") + src.resp[i].map((r) => (r === " " ? " " : r)).join(""))
    .join("\n") + "\n";

let pass = 0;
let fail = 0;

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".dat")).sort();
files.forEach((f) => {
  try {
    const src = buildSource(readSource(fs.readFileSync(path.join(dir, f)), f));
    const result = analyze(toModel(src));
    if (!result.students.length || !result.items.length) throw new Error("빈 결과");
    console.log(
      `OK  ${f}: 학생 ${result.students.length}명, 문항 ${src.nItems}개, ` +
        `평균 ${result.stats.mean.toFixed(2)}, α ${result.stats.reliability.toFixed(3)}`,
    );
    pass++;
  } catch (e) {
    console.log(`FAIL ${f}: ${e.message}`);
    fail++;
  }
});

const ansSrc = buildSource(readSource(fs.readFileSync(path.join(dir, "answer.dat")), "answer.dat"));
const ansResult = analyze(toModel(ansSrc));
const st = ansResult.stats;
const round = (x, d) => {
  const p = Math.pow(10, d);
  return Math.round(x * p) / p;
};

const golden = [
  ["피험자수", st.n, 119],
  ["평균", round(st.mean, 3), 45.059],
  ["표준편차", round(st.sd, 3), 5.282],
  ["분산", round(st.variance, 3), 27.904],
  ["최저", st.min, 31],
  ["최고", st.high, 57],
  ["중앙값", st.median, 45],
  ["왜도", round(st.skewness, 3), -0.342],
  ["첨도", round(st.kurtosis, 3), -0.144],
  ["평균난이도", round(st.meanDifficulty, 3), 0.644],
  ["평균변별도", round(st.meanDiscrimination, 3), 0.18],
  ["Alpha", round(st.reliability, 3), 0.633],
  ["측정오차", round(st.sem, 3), 3.201],
  ["상위27% 수", ansResult.upper.n, 36],
  ["상위 최저", ansResult.upper.min, 49],
  ["하위27% 수", ansResult.lower.n, 32],
  ["하위 최고", ansResult.lower.max, 41],
  ["문항1 난이도", round(ansResult.items[0].difficulty, 2), 0.25],
  ["문항1 상관계수", round(ansResult.items[0].pointBiserial, 2), 0.02],
  [
    "문항1 변별도차",
    round(ansResult.items[0].pUpper - ansResult.items[0].pLower, 2),
    0.06,
  ],
  ["제외시α 문항1", round(ansResult.items[0].alphaIfDeleted, 3), 0.641],
  ["제외시α 문항2", round(ansResult.items[1].alphaIfDeleted, 3), 0.626],
  ["제외시α 문항29", round(ansResult.items[28].alphaIfDeleted, 3), 0.645],
  ["제외시α 문항50", round(ansResult.items[49].alphaIfDeleted, 3), 0.614],
  ["제외시α 문항56", round(ansResult.items[55].alphaIfDeleted, 3), 0.609],
];
golden.forEach(([name, val, exp]) => {
  if (Math.abs(val - exp) < 0.0005) {
    console.log(`OK  골든 ${name}: ${val}`);
    pass++;
  } else {
    console.log(`FAIL 골든 ${name}: ${val} (기대 ${exp})`);
    fail++;
  }
});

const csvPath = path.join(dir, "_roundtrip.csv");
fs.writeFileSync(csvPath, toCsv(ansSrc));
const reResult = analyze(toModel(buildSource(readSource(fs.readFileSync(csvPath), "_roundtrip.csv"))));
fs.unlinkSync(csvPath);
const same =
  Math.abs(reResult.stats.mean - st.mean) < 1e-9 &&
  Math.abs(reResult.stats.reliability - st.reliability) < 1e-9 &&
  reResult.students.length === st.n &&
  reResult.items.every((it, i) => it.difficulty === ansResult.items[i].difficulty);
if (same) {
  console.log(
    `OK  CSV 왕복: 평균 ${reResult.stats.mean.toFixed(3)}, α ${reResult.stats.reliability.toFixed(3)} 동일`,
  );
  pass++;
} else {
  console.log("FAIL CSV 왕복 불일치");
  fail++;
}

const idWidth = Math.max(...ansSrc.ids.map((id) => String(id).length));
const datPath = path.join(dir, "_roundtrip.dat");
fs.writeFileSync(datPath, toFixed(ansSrc, idWidth));
const datSrc = buildSource(readSource(fs.readFileSync(datPath), "_roundtrip.dat"));
fs.unlinkSync(datPath);
const datResult = analyze({ ...toModel(datSrc), key: toModel(ansSrc).key });
const datOk =
  datSrc.nItems === ansSrc.nItems &&
  datSrc.ids.every((id, i) => id === ansSrc.ids[i]) &&
  JSON.stringify(datSrc.resp) === JSON.stringify(ansSrc.resp) &&
  Math.abs(round(datResult.stats.mean, 3) - 45.059) < 0.0005 &&
  Math.abs(round(datResult.stats.reliability, 3) - 0.633) < 0.0005;
if (datOk) {
  console.log(
    `OK  고정폭 왕복: 평균 ${datResult.stats.mean.toFixed(3)}, α ${datResult.stats.reliability.toFixed(3)} (골든 일치)`,
  );
  pass++;
} else {
  console.log("FAIL 고정폭 왕복 불일치");
  fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
