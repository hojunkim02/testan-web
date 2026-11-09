"use strict";

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
