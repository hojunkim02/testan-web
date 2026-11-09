"use strict";

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
