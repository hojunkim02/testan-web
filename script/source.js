"use strict";

/**
 * 응답자료 파일 읽기.
 * 지원 형식
 *   - Excel (.xlsx .xls .xlsm .ods): 첫 번째로 내용이 있는 시트
 *   - 구분자 텍스트 (.csv .txt .tsv): 쉼표·탭·세미콜론·공백 구분
 *   - 고정폭 텍스트 (.txt .dat): 한 줄에 "ID+응답" 문자열, ID 자릿수 지정
 *   - TestAn 1.0 응답자료 (.dat): control line + 정답·답지 수·분석 포함 줄
 * 어느 형식이든 결과는 { ids, resp, nItems, prefill, info } 하나로 모인다.
 */

const ID_HEADER =
  /^(id|학번|번호|수험번호|학생|학생번호|이름|성명|name|student|no\.?)$/i;
const META_KEY = /^(key|정답|답)$/i;
const META_OPT = /^(options?|답지\s*수|답지수|선택지\s*수)$/i;
const META_INC = /^(include|분석\s*포함(\s*여부)?|포함)$/i;
const CIRCLED = "①②③④⑤⑥⑦⑧⑨";

/** 셀 하나를 응답 기호로 정규화: 빈칸 → " ", ①~⑨ → 1~9, 1.0 → 1 */
const normCell = (v) => {
  let s = String(v ?? "").trim();
  if (!s) return " ";
  const ci = CIRCLED.indexOf(s);
  if (s.length === 1 && ci >= 0) return String(ci + 1);
  if (/^\d+(\.0+)?$/.test(s)) return String(Number.parseInt(s, 10));
  return s;
};

/** 응답 한 칸으로 보이는 값인가 (빈칸·한 글자 숫자·①~⑨·*) */
const looksLikeResponse = (s) => {
  const t = String(s ?? "").trim();
  return (
    t === "" ||
    /^[0-9*]$/.test(t) ||
    (t.length === 1 && CIRCLED.includes(t)) ||
    /^\d\.0+$/.test(t)
  );
};

/** RFC 4180 CSV 파서 (따옴표·줄바꿈 이스케이프 지원) */
const parseCsv = (text, delim = ",") => {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

/** 바이트를 텍스트로: UTF-8이 아니면 한글 Windows 인코딩(CP949/EUC-KR)으로 읽는다 */
const decodeText = (bytes) => {
  try {
    return new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .replace(/^﻿/, "");
  } catch (e) {
    return new TextDecoder("euc-kr").decode(bytes);
  }
};

/**
 * 2차원 표(행 배열)를 응답자료로 바꾼다.
 * idCols를 주지 않으면 왼쪽에서부터 '응답처럼 보이지 않는' 열을 ID 열로 자동 판단한다.
 */
const tableToSource = (rawRows, idColsArg) => {
  let rows = rawRows
    .map((r) => (Array.isArray(r) ? r : [r]).map((c) => String(c ?? "").trim()))
    .filter((r) => r.some((c) => c !== ""));
  if (!rows.length) throw new Error("파일에 자료가 없습니다.");

  // 정답·답지 수·분석 포함 행 (첫 칸이 KEY/정답, OPTIONS/답지수, INCLUDE/분석포함)
  const meta = {};
  rows = rows.filter((r) => {
    const h = r[0];
    if (META_KEY.test(h)) return ((meta.key = r), false);
    if (META_OPT.test(h)) return ((meta.opt = r), false);
    if (META_INC.test(h)) return ((meta.inc = r), false);
    return true;
  });

  // 머리글 행: 첫 칸이 학번/ID 등이거나, 나머지 칸에 문자(q1, 문1, 1번 …)가 많은 행
  let header = null;
  if (rows.length) {
    const r0 = rows[0];
    const rest = r0.slice(1).filter((c) => c !== "");
    const wordy = rest.filter((c) => /[A-Za-z가-힣]/.test(c)).length;
    if (ID_HEADER.test(r0[0]) || (rest.length && wordy >= rest.length / 2))
      header = rows.shift();
  }
  if (!rows.length) throw new Error("학생 응답 행이 없습니다.");

  const ncols = Math.max(
    ...rows.map((r) => r.length),
    header ? header.length : 0,
  );
  const sample = rows.slice(0, 200);
  const isInfoCol = (c) =>
    sample.filter((r) => !looksLikeResponse(r[c])).length > sample.length / 2;

  let auto = 0;
  while (auto < ncols && isInfoCol(auto)) auto++;
  // 마지막 열이 "5255323452"처럼 응답을 이어 쓴 문자열이면 그 앞의 모든 열이 ID (예: "1 01 5255323452" = 분반·번호·응답)
  const last = ncols - 1;
  const lastIsString =
    ncols >= 2 &&
    sample.filter((r) => /^[0-9 *]{3,}$/.test(r[last] ?? "")).length >
      sample.length * 0.8;
  if (lastIsString) auto = last;
  let idCols = idColsArg ?? Math.max(1, auto);
  idCols = Math.min(Math.max(1, idCols), Math.max(1, ncols - 1));

  // 응답 열이 하나뿐이고 "231341…" 같은 문자열이면 한 글자씩 나눈다
  const respCols = ncols - idCols;
  const isStringCol =
    respCols === 1 &&
    sample.filter((r) => /^[0-9 *]{2,}$/.test(r[idCols] ?? "")).length >
      sample.length / 2;

  const splitResp = (r) =>
    isStringCol
      ? String(r[idCols] ?? "")
          .split("")
          .map(normCell)
      : r.slice(idCols).map(normCell);

  const ids = rows.map(
    (r, i) =>
      r
        .slice(0, idCols)
        .filter((c) => c !== "")
        .join(" ") || String(i + 1),
  );
  const resp = rows.map(splitResp);
  let nItems = Math.max(...resp.map((a) => a.length));
  // 오른쪽 끝의 완전히 빈 열은 문항이 아니다
  while (nItems > 0 && resp.every((a) => (a[nItems - 1] ?? " ") === " "))
    nItems--;
  if (!nItems)
    throw new Error("응답 열을 찾지 못했습니다. ID 열 수를 확인하세요.");
  resp.forEach((a) => {
    a.length = nItems;
    for (let j = 0; j < nItems; j++) a[j] ??= " ";
  });

  const metaVals = (r) => (r ? splitResp(r).slice(0, nItems) : null);
  return {
    ids,
    resp,
    nItems,
    prefill: {
      key: metaVals(meta.key),
      numOptions:
        metaVals(meta.opt)?.map((v) => Number.parseInt(v, 10) || 0) ?? null,
      scored: meta.inc
        ? splitResp(meta.inc)
            .slice(0, nItems)
            .map((v) => !/^n$/i.test(v))
        : null,
    },
    info: {
      idCols,
      idLabel: header ? header.slice(0, idCols).join(" ") : "ID",
      hasHeader: !!header,
      stringMode: isStringCol,
      ncols,
    },
  };
};

/** 고정폭 텍스트(한 줄 = ID + 응답 문자열)를 응답자료로 바꾼다 */
const fixedToSource = (lines, idWidth) => {
  const L = lines.filter((l) => l.trim() !== "");
  if (!L.length) throw new Error("파일에 자료가 없습니다.");
  const w = Math.max(0, idWidth);
  const ids = L.map((l, i) => l.slice(0, w).trim() || String(i + 1));
  const resp = L.map((l) =>
    l.slice(w).replace(/\s+$/, "").split("").map(normCell),
  );
  const nItems = Math.max(...resp.map((a) => a.length));
  if (!nItems) throw new Error("응답이 없습니다. ID 자릿수를 확인하세요.");
  resp.forEach((a) => {
    for (let j = 0; j < nItems; j++) a[j] ??= " ";
  });
  return {
    ids,
    resp,
    nItems,
    prefill: { key: null, numOptions: null, scored: null },
    info: { idWidth: w, idLabel: "ID", fixed: true },
  };
};

/**
 * TestAn 1.0 응답자료(.dat). 칸 위치가 바이트 기준이므로 바이트로 자르고,
 * ID 부분만 한글(CP949) 또는 UTF-8로 해석한다.
 */
const testanToSource = (bytes) => {
  const lines = [];
  let s = 0;
  for (let i = 0; i <= bytes.length; i++) {
    if (i === bytes.length || bytes[i] === 10) {
      let e = i;
      if (e > s && bytes[e - 1] === 13) e--;
      lines.push(bytes.subarray(s, e));
      s = i + 1;
    }
  }
  const ascii = (b) => String.fromCharCode(...b);
  const ctl = ascii(lines[0]);
  const n = Number.parseInt(ctl.slice(0, 3), 10);
  const w = Number.parseInt(ctl.slice(8, 10), 10) || 0;
  const cells = (b) => ascii(b).padEnd(n, " ").slice(0, n).split("");
  const key = cells(lines[1]);
  const opt = cells(lines[2]).map((c) => Number.parseInt(c, 10) || 0);
  const inc = cells(lines[3]).map((c) => !/n/i.test(c));
  const ids = [];
  const resp = [];
  lines.slice(4).forEach((b) => {
    if (!b.length || ascii(b).trim() === "") return;
    ids.push(decodeText(b.subarray(0, w)).trim() || String(ids.length + 1));
    resp.push(
      ascii(b.subarray(w)).padEnd(n, " ").slice(0, n).split("").map(normCell),
    );
  });
  return {
    ids,
    resp,
    nItems: n,
    prefill: { key: key.map(normCell), numOptions: opt, scored: inc },
    info: { idWidth: w, idLabel: "ID", testan: true },
  };
};

const isTestanDat = (text) => {
  const L = text.split(/\r?\n/);
  return (
    L.length >= 5 &&
    /^\s*\d{1,3}\s+\d{1,2}\s*$/.test(L[0]) &&
    /^[yYnN ]+$/.test(L[3].replace(/\s+$/, "") || "x")
  );
};

/**
 * 파일 내용(바이트)을 읽어 '원천 자료'를 만든다.
 * 반환: { kind: "table" | "fixed" | "testan", rows | lines | bytes, sheetName? }
 */
const readSource = (bytes, filename, XLSX) => {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  if (["xlsx", "xls", "xlsm", "xlsb", "ods"].includes(ext)) {
    if (!XLSX) throw new Error("Excel 읽기 모듈을 불러오지 못했습니다.");
    const wb = XLSX.read(bytes, { type: "array" });
    for (const name of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], {
        header: 1,
        raw: false,
        defval: "",
      });
      const filled = rows.filter((r) => r.some((c) => String(c).trim() !== ""));
      if (!filled.length) continue;
      // 한 칸에 "ID+응답"이 붙어 있는 시트는 고정폭 텍스트처럼 읽는다
      const single = filled.filter(
        (r) => r.filter((c) => String(c).trim() !== "").length === 1,
      ).length;
      if (single > filled.length * 0.8)
        return {
          kind: "fixed",
          lines: filled.map((r) =>
            String(r.find((c) => String(c).trim() !== "")).replace(/\s+$/, ""),
          ),
          sheetName: name,
        };
      return { kind: "table", rows, sheetName: name };
    }
    throw new Error("Excel 파일에 내용이 있는 시트가 없습니다.");
  }
  const text = decodeText(bytes).replaceAll(/\r\n?/g, "\n");
  if (isTestanDat(text)) return { kind: "testan", bytes };
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const share = (re) =>
    lines.filter((l) => re.test(l)).length / (lines.length || 1);
  if (share(/\t/) > 0.5)
    return { kind: "table", rows: lines.map((l) => l.split("\t")) };
  if (share(/,/) > 0.5) return { kind: "table", rows: parseCsv(text, ",") };
  if (share(/;/) > 0.5) return { kind: "table", rows: parseCsv(text, ";") };
  if (share(/\S\s+\S/) > 0.5)
    return { kind: "table", rows: lines.map((l) => l.trim().split(/\s+/)) };
  return { kind: "fixed", lines };
};

/** 원천 자료 + 사용자 지정(ID 열 수·ID 자릿수) → 응답자료 */
const buildSource = (raw, opt = {}) => {
  if (raw.kind === "testan") return testanToSource(raw.bytes);
  if (raw.kind === "fixed")
    return fixedToSource(raw.lines, opt.idWidth ?? guessIdWidth(raw.lines));
  return tableToSource(raw.rows, opt.idCols);
};

/**
 * 고정폭 자료의 ID 자릿수 추정 (사용자가 반드시 확인·수정할 수 있는 초깃값)
 * 1) 모든 줄에서 같은 위치에 공백이 있으면 그 앞까지
 * 2) 아니면 모든 학생이 서로 구별되는 가장 짧은 앞부분 길이 (학번이 연번이면 학번 길이와 같다)
 * 3) 둘 다 안 되면 4
 */
const guessIdWidth = (lines) => {
  const pos = lines.map((l) => l.search(/\s/)).filter((p) => p > 0);
  if (pos.length === lines.length && new Set(pos).size === 1) return pos[0];
  if (lines.length >= 10) {
    const maxW = Math.min(20, Math.min(...lines.map((l) => l.length)) - 1);
    for (let w = 1; w <= maxW; w++)
      if (new Set(lines.map((l) => l.slice(0, w))).size === lines.length)
        return w;
  }
  return 4;
};

if (typeof module !== "undefined")
  module.exports = {
    readSource,
    buildSource,
    tableToSource,
    fixedToSource,
    testanToSource,
    decodeText,
    parseCsv,
    normCell,
  };
