"use strict";

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
