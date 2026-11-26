"use strict";

/** TestAn 표기(.25, −.17): 소수점 앞 0 생략, 음수는 수학 기호 */
const fx = (v, d) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  const t = Math.abs(v)
    .toFixed(d)
    .replace(/^0(?=\.)/, "");
  return (v < 0 && Number(t) !== 0 ? "−" : "") + t;
};
/** IRT 표기: 소수 셋째 자리, 앞자리 0 유지(1.234, 0.404), 음수는 수학 기호 */
const fm = (v, d = 3) =>
  v == null || !Number.isFinite(v)
    ? "-"
    : (v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? "−" : "") +
      Math.abs(v).toFixed(d);
const f3 = (v) => fx(v, 3);
const fnum = (v, d) => (Number.isInteger(v) ? String(v) : v.toFixed(d));

/** 문항 표의 지표 열 (화면·Word 공통) */
const ITEM_METRIC_COLS = [
  {
    h: "난이도",
    tip: "P = R / N",
    val: (it) => it.difficulty,
    get: (it) => f3(it.difficulty),
    mean: (s) => f3(s.meanDifficulty),
  },
  {
    h: "추측도",
    tip: "오답자 수 ÷ (답지 수 − 1) ÷ N",
    val: (it) => it.guessing,
    get: (it) => f3(it.guessing),
    mean: (s) => f3(s.meanGuessing),
  },
  {
    h: "교정난이도",
    tip: "난이도 − 추측도",
    val: (it) => it.correctedDifficulty,
    get: (it) => f3(it.correctedDifficulty),
    mean: (s) => f3(s.meanCorrectedDifficulty),
  },
  {
    h: "변별도(r)",
    tip: "문항 점수와 총점의 상관계수",
    val: (it) => it.pointBiserial,
    get: (it) => f3(it.pointBiserial),
    mean: (s) => f3(s.meanPointBiserial),
  },
  {
    h: "수정변별도",
    tip: "문항 점수와 해당 문항을 뺀 총점의 상관계수",
    val: (it) => it.correctedDiscrimination,
    get: (it) => f3(it.correctedDiscrimination),
    mean: (s) => f3(s.meanCorrectedDiscrimination),
  },
  {
    h: "상하위 정답률 차",
    tip: "상위 27% 정답률 − 하위 27% 정답률",
    val: (it) => it.discrimination,
    get: (it) => f3(it.discrimination),
    mean: (s) => f3(s.meanDiscrimination),
  },
  {
    h: "제외 시 α",
    tip: "해당 문항을 뺀 나머지 문항의 Cronbach α",
    val: (it) => it.alphaIfDeleted,
    get: (it) => f3(it.alphaIfDeleted),
    mean: (s) => f3(s.reliability),
  },
];
const OPTION_COLS = ["매력도 기준", "답지", "전체", "상위", "하위", "상관계수"];
const R_COL = 3; // ITEM_METRIC_COLS에서 변별도(r)의 위치
const CIRC = "①②③④⑤⑥⑦⑧⑨";
/** 답지 번호를 원문자로 (기타는 그대로) */
const circ = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 9
    ? CIRC[n - 1]
    : String(v).trim() || "-";
};
/** 표에 보일 답지: 기타는 응답자가 있을 때만 */
const visibleOptions = (it) =>
  it.options.filter((o) => o.option !== "기타" || o.count > 0);

/** 화면에서 정한 순서(문항 번호 배열)대로 문항을 늘어놓는다. 순서가 없으면 문항 번호 순 */
const orderItems = (items, order) =>
  order
    ? order.map((ix) => items.find((it) => it.index === ix)).filter(Boolean)
    : [...items];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
};

/** 점수 분포 그래프를 보고서용(밝은 배경, 고해상도) PNG 바이트로 만든다 */
const chartPng = async (dist) => {
  const c = document.createElement("canvas");
  drawScoreChart(
    c,
    dist,
    { bar: "#2F5D8A", axis: "#555555", text: "#222222", grid: "#E3E3E3" },
    {
      width: 640,
      height: 320,
      dpr: 2.5,
      background: "#FFFFFF",
      title: "검사점수의 분포",
    },
  );
  const blob = await new Promise((res) => c.toBlob(res, "image/png"));
  return new Uint8Array(await blob.arrayBuffer());
};

/**
 * Word 보고서(.docx)를 만든다.
 * parts: { cttItem, cttScore, irtItem, irtScore }
 * meta: { fileName, idLabel, itemOrder, scoreOrder, irt, irtItemRows, thetaRows } (화면의 정렬 순서)
 */
const buildDocx = async (result, meta, parts) => {
  const D = docx;
  const FONT = "맑은 고딕";
  const st = result.stats;
  const border = { style: D.BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const HEAD = "E8EEF4";
  const TOTAL = "F3F6F9";

  const run = (text, o = {}) =>
    new D.TextRun({
      text: String(text),
      font: FONT,
      size: o.size ?? 18,
      bold: o.bold,
      color: o.color,
    });
  const para = (text, o = {}) =>
    new D.Paragraph({
      alignment: o.align ?? D.AlignmentType.LEFT,
      spacing: { before: o.before ?? 0, after: o.after ?? 80 },
      children: Array.isArray(text) ? text : [run(text, o)],
    });
  const heading = (text, level = 1) =>
    new D.Paragraph({
      keepNext: true, // 제목만 쪽 끝에 홀로 남지 않게
      spacing: { before: level === 1 ? 280 : 200, after: 120 },
      children: [run(text, { bold: true, size: level === 1 ? 26 : 22 })],
    });
  const cell = (text, o = {}) =>
    new D.TableCell({
      borders,
      rowSpan: o.rowSpan,
      columnSpan: o.span,
      verticalAlign: D.VerticalAlign.CENTER,
      shading: o.shade
        ? { type: D.ShadingType.CLEAR, color: "auto", fill: o.shade }
        : undefined,
      margins: { top: 30, bottom: 30, left: 60, right: 60 },
      children: [
        new D.Paragraph({
          alignment: o.align ?? D.AlignmentType.CENTER,
          children: [
            run(text, { bold: o.bold, size: o.size ?? 17, color: o.color }),
          ],
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
    para(text, {
      align: D.AlignmentType.CENTER,
      size: 17,
      before: 60,
      after: 200,
    });

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
  const push = (children, properties) =>
    sections.push({
      properties,
      children: sections.length ? children : [...intro, ...children],
    });
  let chap = 0;
  let tno = 0;
  let fno = 0;
  const tcap = (t) => caption(`<표 ${++tno}> ${t}`);
  const fcap = (t) => caption(`[그림 ${++fno}] ${t}`);
  const img = (data, w, h) =>
    new D.Paragraph({
      keepNext: true,
      alignment: D.AlignmentType.CENTER,
      children: [
        new D.ImageRun({
          type: "png",
          data,
          transformation: { width: w, height: h },
        }),
      ],
    });
  const landscape = {
    page: {
      size: { orientation: D.PageOrientation.LANDSCAPE },
      margin: { top: 1000, bottom: 1000, left: 900, right: 900 },
    },
  };
  const RED = "C00000";

  /* ----- 고전검사이론: 문항 분석 ----- */
  if (parts.cttItem) {
    chap++;
    const c = [];
    c.push(heading(`${chap}. 고전검사이론에 의한 문항분석`));
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
    const labels = [
      "문항",
      "정답",
      ...ITEM_METRIC_COLS.map((m) => m.h),
      ...OPTION_COLS,
    ];
    const rows = [headRow(labels, SZ)];
    rows.push(
      new D.TableRow({
        children: [
          cell("전체", { bold: true, shade: TOTAL, size: SZ, span: 2 }),
          ...ITEM_METRIC_COLS.map((m) =>
            cell(m.mean(st), { bold: true, shade: TOTAL, size: SZ }),
          ),
          cell("", { shade: TOTAL, size: SZ, span: OPTION_COLS.length }),
        ],
      }),
    );
    orderItems(result.items, meta.itemOrder).forEach((it) => {
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
                bold:
                  (isAlpha && it.alphaUp) ||
                  (mi === R_COL && it.scored && it.pointBiserial < 0),
                color: !it.scored
                  ? "888888"
                  : isAlpha && it.alphaUp
                    ? "1F4E79"
                    : mi === R_COL && it.pointBiserial < 0
                      ? RED
                      : undefined,
              }),
            );
          });
          cells.push(
            cell(it.scored ? f3(it.attractiveness) : "", {
              rowSpan: span,
              size: SZ,
            }),
          );
        }
        cells.push(
          cell(circ(o.option) + (o.isKey ? " *" : ""), {
            size: SZ,
            bold: o.isKey,
          }),
        );
        [o.propAll, o.propUpper, o.propLower].forEach((v) =>
          cells.push(cell(f3(v), { size: SZ })),
        );
        cells.push(cell(f3(o.pbis), { size: SZ }));
        rows.push(new D.TableRow({ cantSplit: true, children: cells }));
      });
    });
    c.push(
      table(
        rows,
        [
          560, 520, 820, 820, 900, 860, 900, 980, 860, 900, 640, 720, 720, 720,
          900,
        ],
      ),
    );
    c.push(tcap("문항 및 답지 분석 결과"));
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
    push(c, landscape);
  }

  /* ----- 고전검사이론: 점수 분석 ----- */
  if (parts.cttScore) {
    chap++;
    const c = [];
    c.push(heading(`${chap}. 고전검사이론에 의한 점수분석`));
    c.push(heading(`${chap}.1 기술통계`, 2));
    const pairs = [
      ["피험자 수", `${st.n}명`, "만점", `${st.maxScore}점`],
      ["평균", fnum(st.mean, 3), "표준편차", fnum(st.sd, 3)],
      ["분산", fnum(st.variance, 3), "중앙값", fnum(st.median, 1)],
      ["최저점수", String(st.min), "최고점수", String(st.high)],
      ["왜도", fnum(st.skewness, 3), "첨도", fnum(st.kurtosis, 3)],
      ["신뢰도(Cronbach α)", f3(st.reliability), "측정오차", fnum(st.sem, 3)],
      [
        "상위 27% 집단",
        `${result.upper.n}명 (최저 ${result.upper.min}점)`,
        "하위 27% 집단",
        `${result.lower.n}명 (최고 ${result.lower.max}점)`,
      ],
    ];
    c.push(
      table(
        pairs.map(
          (p) =>
            new D.TableRow({
              children: p.map((t, i) =>
                cell(t, {
                  shade: i % 2 === 0 ? HEAD : undefined,
                  bold: i % 2 === 0,
                }),
              ),
            }),
        ),
        [2200, 2300, 2200, 2300],
      ),
    );
    c.push(heading(`${chap}.2 점수 분포`, 2));
    c.push(img(await chartPng(result.distribution), 576, 288));
    c.push(fcap("검사점수의 분포"));
    c.push(
      table(
        [
          headRow([
            "점수",
            "피험자 수",
            "백분율(%)",
            "누가 피험자 수",
            "누가 백분율(%)",
          ]),
          ...result.distribution.map(
            (d) =>
              new D.TableRow({
                children: [
                  d.score,
                  d.n,
                  d.pct.toFixed(2),
                  d.cumN,
                  d.cumPct.toFixed(2),
                ].map((t) => cell(t)),
              }),
          ),
        ],
        [1500, 1800, 1900, 1900, 1900],
      ),
    );
    c.push(tcap("검사점수의 백분율"));
    c.push(heading(`${chap}.3 피험자별 점수`, 2));
    c.push(
      table(
        [
          headRow([meta.idLabel || "ID", "점수", "석차"]),
          ...(meta.scoreOrder || result.students).map(
            (s) =>
              new D.TableRow({
                children: [s.id, s.raw, s.rank].map((t) => cell(t)),
              }),
          ),
        ],
        [4200, 2400, 2400],
      ),
    );
    c.push(tcap("피험자별 점수"));
    push(c);
  }

  /* ----- 문항반응이론 ----- */
  const v = meta.irt;
  const names = {
    "1PL": "1모수 로지스틱",
    "2PL": "2모수 로지스틱",
    "3PL": "3모수 로지스틱",
  };
  const pngs = v && (parts.irtItem || parts.irtScore) ? await irtPngs(v) : null;

  if (parts.irtItem && v) {
    chap++;
    const fit = v.fit;
    const c = [];
    const has3 = v.model === "3PL";
    c.push(heading(`${chap}. 문항반응이론에 의한 문항분석`));
    const div = v.items.filter((it) => it.diverged).map((it) => it.index);
    c.push(
      para(
        `${names[v.model]} 모형으로 피험자 ${v.N}명, ${v.items.length}개 문항의 모수를 추정하였다. ` +
          `추정 방법은 ${v.prior ? "주변최대사후(사전분포: a ~ 로그정규(0, 0.5)" + (has3 ? ", c ~ Beta(20/Q + 1, 20(1 − 1/Q) + 1)" : "") + ")" : "주변최대우도"}` +
          `(EM, θ ~ N(0, 1), 구적점 61개, R mirt와 같은 방식)이며, 변별도 a는 척도 상수 D = ${v.D}로 나타냈다. ` +
          `−2 로그우도는 ${(-2 * fit.logLik).toFixed(3)}, AIC ${fit.AIC.toFixed(3)}, BIC ${fit.BIC.toFixed(3)}이다.` +
          (v.excluded.length
            ? ` 추정에서 뺀 문항: ${v.excluded.map((e) => `${e.index}번(${e.why})`).join(", ")}.`
            : "") +
          (div.length
            ? ` 추정치가 발산한 문항(${div.join(", ")}번)은 값을 고정하고 표준오차를 구하지 않았으며, 빨간 글씨로 표시하였다.`
            : "") +
          " 변별도 a가 음수인 문항의 모수도 빨간 글씨로 표시하였다.",
        { size: 17, after: 160 },
      ),
    );
    c.push(heading(`${chap}.1 모형 비교`, 2));
    c.push(
      table(
        [
          headRow(["모형", "모수 수", "−2 로그우도", "AIC", "BIC"]),
          ...["1PL", "2PL", "3PL"].map(
            (m) =>
              new D.TableRow({
                children: [
                  names[m],
                  v.fits[m].nest,
                  (-2 * v.fits[m].logLik).toFixed(3),
                  v.fits[m].AIC.toFixed(3),
                  v.fits[m].BIC.toFixed(3),
                ].map((t) => cell(t, { bold: m === v.model })),
              }),
          ),
        ],
        [2600, 1400, 1800, 1600, 1600],
      ),
    );
    c.push(tcap("모형 비교 (굵은 글씨: 보고 모형)"));
    c.push(heading(`${chap}.2 문항모수`, 2));
    const rows =
      meta.irtItemRows ||
      [
        ...v.items,
        ...v.excluded.map((e) => ({ index: e.index, why: e.why, ex: true })),
      ].sort((a, b) => a.index - b.index);
    const SZ = 15;
    const bfmt = (b) => (Math.abs(b) > 99 ? (b > 0 ? "> 99" : "< −99") : fm(b));
    c.push(
      table(
        [
          headRow(
            [
              "문항",
              "변별도 a",
              "SE",
              "난이도 b",
              "SE",
              ...(has3 ? ["추측도 c", "SE"] : []),
              "최대 정보 θ",
              "최대 정보량",
              "CTT 난이도",
              "CTT 변별도(r)",
              "비고",
            ],
            SZ,
          ),
          ...rows.map((it) => {
            if (it.ex)
              return new D.TableRow({
                children: [
                  cell(it.index, { size: SZ }),
                  cell("추정 제외", {
                    span: has3 ? 10 : 8,
                    color: "888888",
                    size: SZ,
                  }),
                  cell(it.why, { color: "888888", size: SZ }),
                ],
              });
            const o = { size: SZ, color: it.flag ? RED : undefined };
            return new D.TableRow({
              children: [
                cell(it.index, { size: SZ }),
                cell(fm(it.a), o),
                cell(fm(it.se_a), o),
                cell(bfmt(it.b), o),
                cell(fm(it.se_b), o),
                ...(has3 ? [cell(fm(it.c), o), cell(fm(it.se_c), o)] : []),
                cell(fm(it.maxTheta), o),
                cell(fm(it.maxInfo), o),
                cell(f3(it.p), { size: SZ }),
                cell(f3(it.r), { size: SZ }),
                cell(
                  it.diverged ? "발산(값 고정)" : it.a < 0 ? "변별도 음수" : "",
                  { size: SZ },
                ),
              ],
            });
          }),
        ],
        has3
          ? [600, 850, 700, 850, 700, 850, 700, 900, 900, 900, 1000, 1050]
          : [650, 1000, 800, 1000, 800, 1000, 1000, 1000, 1100, 1150],
      ),
    );
    c.push(tcap("문항모수 추정치"));
    c.push(
      para(
        "최대 정보 θ는 문항정보가 가장 큰 능력 수준이고 최대 정보량은 그때의 문항정보이다. 1·2모수 모형에서는 최대 정보 θ가 난이도 b와 같고, 3모수 모형에서는 추측도 때문에 b보다 조금 높은 곳에 있다(Lord, 1980).",
        { size: 17, after: 160 },
      ),
    );
    c.push(heading(`${chap}.3 문항특성곡선과 문항정보함수`, 2));
    c.push(img(pngs.icc, 560, 300));
    c.push(fcap("문항특성곡선(전체 문항)"));
    c.push(img(pngs.iinfo, 560, 300));
    c.push(fcap("문항정보함수(전체 문항)"));
    push(c);
  }

  if (parts.irtScore && v) {
    chap++;
    const c = [];
    c.push(heading(`${chap}. 문항반응이론에 의한 능력분석`));
    c.push(
      para(
        `${names[v.model]} 모형의 문항모수로 피험자의 능력 θ를 기대사후(EAP) 방법으로 추정하였다. ` +
          `검사정보는 θ = ${fm(pngs.maxTheta, 2)}에서 ${fm(pngs.maxInfo, 3)}로 가장 크며, 이때 측정의 표준오차는 ${fm(1 / Math.sqrt(pngs.maxInfo), 3)}이다. ` +
          `진점수는 능력 추정치 θ̂에서 기대되는 검사점수 τ(θ̂) = Σ P(θ̂)` +
          (v.constScore ? ` + ${v.constScore}(전원 정답 문항 수)` : "") +
          "이다.",
        { size: 17, after: 160 },
      ),
    );
    c.push(heading(`${chap}.1 검사정보함수와 측정의 표준오차`, 2));
    c.push(img(pngs.tif, 560, 300));
    c.push(fcap("검사정보함수"));
    c.push(img(pngs.se, 560, 300));
    c.push(fcap("측정의 표준오차"));
    c.push(heading(`${chap}.2 검사특성곡선과 진점수`, 2));
    c.push(img(pngs.tcc, 560, 300));
    c.push(fcap("검사특성곡선 (점: 피험자의 능력 추정치와 총점)"));
    c.push(heading(`${chap}.3 피험자 능력 추정치`, 2));
    c.push(
      table(
        [
          headRow([v.idLabel || "ID", "총점", "능력 θ (EAP)", "SE", "진점수"]),
          ...(meta.thetaRows || v.students).map(
            (s) =>
              new D.TableRow({
                children: [
                  s.id,
                  s.raw,
                  fm(s.theta),
                  fm(s.se),
                  fm(s.tscore),
                ].map((t) => cell(t)),
              }),
          ),
        ],
        [3000, 1400, 1700, 1400, 1500],
      ),
    );
    c.push(tcap("피험자 능력 추정치"));
    push(c);
  }

  const doc = new D.Document({
    creator: "TestAn Web 실습판",
    title: "문항분석 결과 보고서",
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: sections.map((s) => ({
      properties: s.properties ?? {
        page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
      },
      children: s.children,
    })),
  });
  return D.Packer.toBlob(doc);
};

/** Excel 결과(.xlsx): 피험자 점수, 점수 분포, 문항 분석, 답지 분석 시트 */
const buildXlsx = (result, idLabel = "ID") => {
  const st = result.stats;
  const r3 = (v) => Number(v.toFixed(3)); // 화면 표시(toFixed, TestAn과 일치)와 같은 반올림
  const wb = XLSX.utils.book_new();
  const add = (name, aoa, widths) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };
  add(
    "피험자 점수",
    [
      [idLabel, "점수", "석차"],
      ...result.students.map((s) => [s.id, s.raw, s.rank]),
    ],
    [20, 8, 8],
  );
  add(
    "점수 분포",
    [
      ["점수", "피험자 수", "백분율(%)", "누가 피험자 수", "누가 백분율(%)"],
      ...result.distribution.map((d) => [
        d.score,
        d.n,
        r3(d.pct),
        d.cumN,
        r3(d.cumPct),
      ]),
      [],
      ["피험자 수", st.n],
      ["평균", r3(st.mean)],
      ["표준편차", r3(st.sd)],
      ["분산", r3(st.variance)],
      ["최저점수", st.min],
      ["최고점수", st.high],
      ["중앙값", st.median],
      ["왜도", r3(st.skewness)],
      ["첨도", r3(st.kurtosis)],
      ["Cronbach α", r3(st.reliability)],
      ["측정오차", r3(st.sem)],
    ],
    [12, 10, 11, 14, 14],
  );
  add(
    "문항 분석",
    [
      [
        "문항",
        "정답",
        "분석 포함",
        "답지 수",
        "난이도",
        "추측도",
        "교정난이도",
        "변별도(r)",
        "수정변별도",
        "상하위 정답률 차",
        "제외 시 α",
        "제외 시 α 증가",
        "오답지 매력도 기준",
      ],
      [
        "전체",
        "",
        "",
        "",
        r3(st.meanDifficulty),
        r3(st.meanGuessing),
        r3(st.meanCorrectedDifficulty),
        r3(st.meanPointBiserial),
        r3(st.meanCorrectedDiscrimination),
        r3(st.meanDiscrimination),
        r3(st.reliability),
        "",
      ],
      ...result.items.map((it) => [
        it.index,
        it.key === " " ? "" : circ(it.key),
        it.scored ? "y" : "n",
        it.numOptions,
        r3(it.difficulty),
        r3(it.guessing),
        r3(it.correctedDifficulty),
        r3(it.pointBiserial),
        r3(it.correctedDiscrimination),
        r3(it.discrimination),
        r3(it.alphaIfDeleted),
        it.alphaUp ? "증가" : "",
        r3(it.attractiveness),
      ]),
    ],
    [6, 6, 9, 8, 8, 8, 10, 10, 10, 15, 10, 13, 16],
  );
  add(
    "답지 분석",
    [
      [
        "문항",
        "답지",
        "정답",
        "응답자 수",
        "전체",
        "상위 27%",
        "하위 27%",
        "답지-총점 상관",
      ],
      ...result.items.flatMap((it) =>
        visibleOptions(it).map((o) => [
          it.index,
          circ(o.option),
          o.isKey ? "*" : "",
          o.count,
          r3(o.propAll),
          r3(o.propUpper),
          r3(o.propLower),
          r3(o.pbis),
        ]),
      ),
    ],
    [6, 6, 6, 10, 8, 10, 10, 14],
  );
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

/** IRT 그림을 보고서용 PNG로: 문항특성곡선, 문항정보, 검사정보, 표준오차, 검사특성곡선 */
const irtPngs = async (v) => {
  const cv = () => document.createElement("canvas");
  const style = {
    pal: { axis: "#555555", text: "#222222", grid: "#E3E3E3" },
    accent: "#2F5D8A",
    faint: "#BBBBBB",
    w: 640,
    h: 340,
    dpr: 2.5,
    background: "#FFFFFF",
  };
  const item = [cv(), cv()];
  const test = [cv(), cv(), cv()];
  drawIrtItemCharts(v, "all", item, style);
  const mx = drawIrtTestCharts(v, test, style);
  const png = async (c) =>
    new Uint8Array(
      await (
        await new Promise((res) => c.toBlob(res, "image/png"))
      ).arrayBuffer(),
    );
  const [icc, iinfo, tif, se, tcc] = await Promise.all(
    [...item, ...test].map(png),
  );
  return { icc, iinfo, tif, se, tcc, ...mx };
};

/** IRT Excel: 모형 비교, 문항모수, 능력 추정치 */
const buildIrtXlsx = (v) => {
  const r3 = (x) =>
    x == null || !Number.isFinite(x) ? "" : Number(x.toFixed(3));
  const wb = XLSX.utils.book_new();
  const add = (name, aoa, widths) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };
  const has3 = v.model === "3PL";
  add(
    "IRT 문항모수",
    [
      [
        `모형 ${v.model} · D = ${v.D} · ${v.prior ? "사전분포 사용" : "최대우도"} · 피험자 ${v.N}명`,
      ],
      [
        "문항",
        "변별도 a",
        "SE(a)",
        "난이도 b",
        "SE(b)",
        ...(has3 ? ["추측도 c", "SE(c)"] : []),
        "최대 정보 θ",
        "최대 정보량",
        "CTT 난이도",
        "CTT 변별도(r)",
        "비고",
      ],
      ...[
        ...v.items,
        ...v.excluded.map((e) => ({ index: e.index, why: e.why, ex: true })),
      ]
        .sort((a, b) => a.index - b.index)
        .map((it) =>
          it.ex
            ? [
                it.index,
                "",
                "",
                "",
                "",
                ...(has3 ? ["", ""] : []),
                "",
                "",
                "",
                "",
                `추정 제외(${it.why})`,
              ]
            : [
                it.index,
                r3(it.a),
                r3(it.se_a),
                r3(it.b),
                r3(it.se_b),
                ...(has3 ? [r3(it.c), r3(it.se_c)] : []),
                r3(it.maxTheta),
                r3(it.maxInfo),
                r3(it.p),
                r3(it.r),
                it.diverged ? "발산(값 고정)" : it.a < 0 ? "변별도 음수" : "",
              ],
        ),
    ],
    [6, 10, 8, 10, 8, ...(has3 ? [10, 8] : []), 11, 11, 11, 14, 16],
  );
  add(
    "IRT 능력추정",
    [
      [v.idLabel || "ID", "총점", "능력 θ(EAP)", "SE", "진점수"],
      ...v.students.map((s) => [
        s.id,
        s.raw,
        r3(s.theta),
        r3(s.se),
        r3(s.tscore),
      ]),
    ],
    [20, 8, 12, 8, 10],
  );
  add(
    "IRT 모형비교",
    [
      ["모형", "모수 수", "-2 로그우도", "AIC", "BIC", "수렴"],
      ...["1PL", "2PL", "3PL"].map((m) => [
        m,
        v.fits[m].nest,
        r3(-2 * v.fits[m].logLik),
        r3(v.fits[m].AIC),
        r3(v.fits[m].BIC),
        v.fits[m].converged ? "예" : "아니오",
      ]),
    ],
    [8, 8, 12, 10, 10, 6],
  );
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
