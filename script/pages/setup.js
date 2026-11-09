"use strict";

const hasFullPrefill = () => !!S.src.prefill.key && S.src.prefill.key.some((k) => k !== " ");

const guessOptions = () => {
  let m = 0;
  S.src.resp.forEach((a) =>
    a.forEach((r) => {
      const v = Number(r);
      if (Number.isInteger(v) && v > m && v <= 9) m = v;
    }),
  );
  return Math.min(9, Math.max(2, m || 4));
};

const initSetup = () => {
  const n = S.src.nItems;
  const p = S.src.prefill;
  const g = guessOptions();
  S.key = Array.from({ length: n }, (_, j) => (p.key?.[j] && /^[1-9]$/.test(p.key[j]) ? p.key[j] : ""));
  S.opt = Array.from({ length: n }, (_, j) => (p.numOptions?.[j] >= 2 ? p.numOptions[j] : g));
  S.inc = Array.from({ length: n }, (_, j) => (p.scored ? p.scored[j] !== false : true));
  $("bulkOpt").value = String(g);
};

const validate = () => {
  const n = S.src.nItems;
  const noKey = [], badKey = [], badOpt = [], outOfRange = [];
  for (let j = 0; j < n; j++) {
    if (!S.inc[j]) continue;
    const Q = S.opt[j];
    if (!(Q >= 2 && Q <= 9)) badOpt.push(j + 1);
    if (!S.key[j]) noKey.push(j + 1);
    else if (Number(S.key[j]) > Q) badKey.push(j + 1);
    if (S.src.resp.some((a) => /^\d+$/.test(a[j]) && (Number(a[j]) > Q || Number(a[j]) < 1))) outOfRange.push(j + 1);
  }
  const list = (a) => a.slice(0, 12).join(", ") + (a.length > 12 ? ` 외 ${a.length - 12}개` : "");
  const errors = [];
  const notes = [];
  if (noKey.length) errors.push(`정답이 비어 있는 문항: ${list(noKey)}`);
  if (badKey.length) errors.push(`정답이 답지 수보다 큰 문항: ${list(badKey)}`);
  if (badOpt.length) errors.push(`답지 수가 2~9가 아닌 문항: ${list(badOpt)}`);
  if (!S.inc.some(Boolean)) errors.push("분석에 포함된 문항이 없습니다.");
  if (outOfRange.length) notes.push(`답지 수를 벗어난 응답이 있는 문항: ${list(outOfRange)} (‘기타’로 집계됩니다)`);
  return { errors, notes };
};

const renderSetup = () => {
  const src = S.src;
  const info = src.info;
  const where = S.sheetName ? ` · 시트 ‘${esc(S.sheetName)}’` : "";
  $("srcSummary").innerHTML =
    `<b>${esc(S.fileName)}</b>${where} · 피험자 <b>${src.ids.length}</b>명 · 문항 <b>${src.nItems}</b>개` +
    (info.testan ? " · TestAn 응답자료 형식" : "");

  const row = $("idRow");
  if (S.raw.kind === "table") {
    row.innerHTML =
      `<label>학번·이름 등 앞쪽 열 수 <input type="number" id="idCols" min="1" max="${Math.max(1, info.ncols - 1)}" value="${info.idCols}" /></label>` +
      `<span class="summary">현재 ID: ${esc(src.ids[0])}${src.ids.length > 1 ? ", " + esc(src.ids[1]) : ""} …${info.stringMode ? " · 응답이 한 칸에 이어 적힌 형식" : ""}</span>`;
    $("idCols").addEventListener("change", (e) => reload({ idCols: Number(e.target.value) || 1 }));
  } else if (S.raw.kind === "fixed") {
    row.innerHTML =
      `<label>1번 문항 앞까지의 칸 수(ID 자릿수) <input type="number" id="idWidth" min="0" max="40" value="${info.idWidth}" /></label>` +
      `<span class="summary">ID와 응답이 붙어 있는 형식입니다. 첫 학생 → ID ‘${esc(src.ids[0])}’ · 1~10번 응답 ‘${esc(src.resp[0].slice(0, 10).join(""))}’. 맞게 나뉘었는지 아래 미리보기로 확인하세요.</span>`;
    $("idWidth").addEventListener("change", (e) => reload({ idWidth: Number(e.target.value) || 0 }));
  } else row.innerHTML = "";
  if (S.raw.kind === "fixed") document.querySelector("details.preview").open = true;

  const n = src.nItems;
  const idx = Array.from({ length: n }, (_, j) => j);
  $("setupTable").innerHTML =
    `<tr><th class="rowhead">문항</th>${idx.map((j) => `<th>${j + 1}</th>`).join("")}</tr>` +
    `<tr><th class="rowhead">정답</th>${idx
      .map((j) => `<td><input class="cell key" data-j="${j}" id="key${j}" inputmode="numeric" maxlength="1" value="${S.key[j]}" aria-label="${j + 1}번 정답" /></td>`)
      .join("")}</tr>` +
    `<tr><th class="rowhead">답지 수</th>${idx
      .map((j) => `<td><input class="cell opt" data-j="${j}" id="opt${j}" inputmode="numeric" maxlength="1" value="${S.opt[j]}" aria-label="${j + 1}번 답지 수" /></td>`)
      .join("")}</tr>` +
    `<tr><th class="rowhead">분석 포함</th>${idx
      .map((j) => `<td><input type="checkbox" class="inc" data-j="${j}" id="inc${j}" ${S.inc[j] ? "checked" : ""} aria-label="${j + 1}번 분석 포함" /></td>`)
      .join("")}</tr>`;
  refreshSetupState();

  const show = Math.min(15, src.ids.length);
  $("previewTable").innerHTML =
    `<tr><th>${esc(idLabel())}</th>${idx.map((j) => `<th>${j + 1}</th>`).join("")}</tr>` +
    src.ids
      .slice(0, show)
      .map((id, i) => `<tr><td class="left">${esc(id)}</td>${src.resp[i].map((r) => `<td>${r === " " ? "" : esc(r)}</td>`).join("")}</tr>`)
      .join("") +
    (src.ids.length > show ? `<tr><td colspan="${n + 1}" class="left muted">… 외 ${src.ids.length - show}명</td></tr>` : "");
};

const refreshSetupState = () => {
  for (let j = 0; j < S.src.nItems; j++) {
    const k = $("key" + j);
    const o = $("opt" + j);
    const bad = S.inc[j] && (!S.key[j] || Number(S.key[j]) > S.opt[j]);
    k.classList.toggle("invalid", bad);
    o.classList.toggle("invalid", S.inc[j] && !(S.opt[j] >= 2 && S.opt[j] <= 9));
    k.closest("td").classList.toggle("excluded", !S.inc[j]);
    o.closest("td").classList.toggle("excluded", !S.inc[j]);
  }
  const { errors, notes } = validate();
  const filled = S.key.filter((k, j) => k && S.inc[j]).length;
  const k = S.inc.filter(Boolean).length;
  $("setupMsg").innerHTML =
    `<p>정답 입력 ${filled}/${k}문항 (분석 포함 ${k}개, 제외 ${S.src.nItems - k}개)</p>` +
    errors.map((e) => `<p class="err">${esc(e)}</p>`).join("") +
    notes.map((e) => `<p class="note">${esc(e)}</p>`).join("");
  $("runBtn").disabled = errors.length > 0;
};

const setupChanged = () => {
  if (S.result) {
    clearResult();
    setStatus("설정을 바꿨습니다. [분석 실행]을 다시 누르면 결과가 갱신됩니다.");
  }
  refreshSetupState();
};

const setupTable = $("setupTable");
setupTable.addEventListener("input", (e) => {
  const t = e.target;
  const j = Number(t.dataset.j);
  if (t.classList.contains("key") || t.classList.contains("opt")) {
    const v = (t.value.match(/[1-9]/g) || []).pop() || "";
    t.value = v;
    if (t.classList.contains("key")) S.key[j] = v;
    else S.opt[j] = v ? Number(v) : 0;
    if (v) $((t.classList.contains("key") ? "key" : "opt") + (j + 1))?.focus();
    setupChanged();
  }
});
setupTable.addEventListener("change", (e) => {
  const t = e.target;
  if (t.classList.contains("inc")) {
    S.inc[Number(t.dataset.j)] = t.checked;
    setupChanged();
  }
});
setupTable.addEventListener("focusin", (e) => e.target.select?.());
setupTable.addEventListener("keydown", (e) => {
  const t = e.target;
  if (!t.dataset.j) return;
  const j = Number(t.dataset.j);
  const kind = t.classList.contains("key") ? "key" : t.classList.contains("opt") ? "opt" : "inc";
  const go = (id) => {
    const el = $(id);
    if (el) {
      e.preventDefault();
      el.focus();
    }
  };
  if (e.key === "ArrowRight") go(kind + (j + 1));
  else if (e.key === "ArrowLeft") go(kind + (j - 1));
  else if (e.key === "ArrowDown") go((kind === "key" ? "opt" : "inc") + j);
  else if (e.key === "ArrowUp") go((kind === "inc" ? "opt" : "key") + j);
  else if (e.key === "Backspace" && t.value === "" && kind !== "inc") go(kind + (j - 1));
});

setupTable.addEventListener("paste", (e) => {
  const t = e.target;
  if (!t.classList.contains("key") && !t.classList.contains("opt")) return;
  const vals = splitKeyText(e.clipboardData.getData("text"));
  if (vals.length <= 1) return;
  e.preventDefault();
  const j0 = Number(t.dataset.j);
  const arr = t.classList.contains("key") ? S.key : S.opt;
  vals.forEach((v, i) => {
    if (j0 + i < S.src.nItems) arr[j0 + i] = t.classList.contains("key") ? v : Number(v) || 0;
  });
  renderSetup();
  setupChanged();
});

const splitKeyText = (text) => {
  const t = String(text).trim();
  const tokens = /[\s,;]/.test(t) ? t.split(/[\s,;]+/) : t.split("");
  return tokens.map((c) => normCell(c)).map((c) => (/^[1-9]$/.test(c) ? c : ""));
};

$("applyKey").addEventListener("click", () => {
  const vals = splitKeyText($("bulkKey").value);
  if (!vals.length || !vals.some(Boolean)) {
    setStatus("정답을 입력하세요. 예: 4313341213…", "error");
    return;
  }
  const n = S.src.nItems;
  for (let j = 0; j < n; j++) S.key[j] = vals[j] ?? S.key[j];
  renderSetup();
  setupChanged();
  setStatus(
    vals.length === n
      ? `정답 ${n}개를 적용했습니다.`
      : `입력한 정답은 ${vals.length}개이고 문항은 ${n}개입니다. 앞에서부터 ${Math.min(vals.length, n)}개를 적용했습니다.`,
    vals.length === n ? "ok" : "error",
  );
});

$("bulkKey").addEventListener("keydown", (e) => e.key === "Enter" && $("applyKey").click());

$("applyOpt").addEventListener("click", () => {
  const vals = splitKeyText($("bulkOpt").value).map(Number);
  if (!vals.length || vals.some((q) => !(q >= 2 && q <= 9))) {
    setStatus("답지 수는 2~9 사이 숫자로 입력하세요. 예: 4 또는 4444455552…", "error");
    return;
  }
  const n = S.src.nItems;
  if (vals.length === 1) S.opt = S.opt.map(() => vals[0]);
  else for (let j = 0; j < Math.min(n, vals.length); j++) S.opt[j] = vals[j];
  renderSetup();
  setupChanged();
  setStatus(
    vals.length === 1
      ? `모든 문항의 답지 수를 ${vals[0]}개로 적용했습니다.`
      : vals.length === n
        ? `문항별 답지 수 ${n}개를 적용했습니다.`
        : `입력한 답지 수는 ${vals.length}개이고 문항은 ${n}개입니다. 앞에서부터 ${Math.min(vals.length, n)}개를 적용했습니다.`,
    vals.length === 1 || vals.length === n ? "ok" : "error",
  );
});

$("bulkOpt").addEventListener("keydown", (e) => e.key === "Enter" && $("applyOpt").click());

$("incAll").addEventListener("click", () => {
  S.inc = S.inc.map(() => true);
  renderSetup();
  setupChanged();
});

$("incNone").addEventListener("click", () => {
  S.inc = S.inc.map(() => false);
  renderSetup();
  setupChanged();
});
