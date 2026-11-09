"use strict";

/**
 * TestAn 문항분석에 쓰이는 수학 공식 모음.
 * 모든 함수는 순수 계산만 하며, 공식 원문은 성태제(2000) TestAn 1.0 매뉴얼을 따른다.
 * 집계값 표기: ΣX = 문항점수 합, ΣX² = 문항점수 제곱합, ΣY = 총점 합,
 *             ΣY² = 총점 제곱합, ΣXY = (문항점수×총점) 합, N = 피험자 수
 */

/**
 * 피어슨 적률상관계수 (Pearson product-moment correlation)
 *   r = (N·ΣXY − ΣX·ΣY) / ( √(N·ΣX² − (ΣX)²) · √(N·ΣY² − (ΣY)²) )
 * 분모가 0이면(분산 없음) 0으로 둔다.
 */
const pearson = (sX, sX2, sXY, sY, sY2, N) => {
  const dX = N * sX2 - sX * sX;
  const dY = N * sY2 - sY * sY;
  return dX > 0 && dY > 0 ? (N * sXY - sX * sY) / (Math.sqrt(dX) * Math.sqrt(dY)) : 0;
};

/**
 * 점이중상관계수 (point-biserial correlation, r_pbi)
 * 문항점수 X가 0/1(또는 배점)의 이분 변수일 때의 피어슨 상관과 본질적으로 같은 식이다.
 *   r_pbi = (정답자 평균 − 전체 평균) / σ_Y · √(P·(1−P))
 * 여기서는 집계값 기반 피어슨 공식으로 직접 계산한다.
 */
const pointBiserial = (sX, sX2, sXY, sY, sY2, N) => pearson(sX, sX2, sXY, sY, sY2, N);

/**
 * 수정(교정) 변별도 (corrected discrimination, r_pbi(rest))
 * 총점에 해당 문항 점수가 포함되면 생기는 자기상관(inflation)을 없애기 위해
 * 문항점수 X와 '나머지 점수 (Y − X)'의 상관을 구한다.
 *   Σ(Y−X) = ΣY − ΣX
 *   Σ(Y−X)² = ΣY² − 2·ΣXY + ΣX²
 *   ΣX(Y−X) = ΣXY − ΣX²
 * 위 치환을 한 뒤 피어슨 공식에 대입한다.
 */
const correctedDiscrimination = (sX, sX2, sXY, sY, sY2, N) =>
  pearson(sX, sX2, sXY - sX2, sY - sX, sY2 - 2 * sXY + sX2, N);

/**
 * 문항 난이도 (difficulty index)
 *   P = R / N      (R = 정답자 수, N = 전체 피험자 수)
 */
const itemDifficulty = (R, N) => R / N;

/**
 * 추측도 (guessing): 답지를 몰라도 찍어서 맞을 기대 비율.
 * 해당 문항의 오답자 수 W(답지 범위 안의 응답만)를 정답이 아닌 답지 수 (Q−1)에
 * 균등하게 나눈 뒤 전체 피험자 수 N으로 나눠 비율로 만든다.
 *   g = W / (Q − 1) / N      (Q = 답지 수)
 */
const guessingRate = (W, Q, N) => (Q > 1 ? W / (Q - 1) / N : 0);

/**
 * 교정 난이도 (corrected difficulty)
 *   P' = P − g      (난이도에서 추측으로 맞은 몫을 뺀다)
 */
const correctedDifficulty = (P, g) => P - g;

/**
 * 변별도 지수 (discrimination index, D — Kelly의 상·하위 27% 법)
 *   D = P_U − P_L      (P_U = 상위집단 정답률, P_L = 하위집단 정답률)
 */
const discriminationIndex = (pUpper, pLower) => pUpper - pLower;

/**
 * 오답지 매력도 (attractiveness of distractors)
 *   P_o = (1 − P) / (Q − 1)
 * 오답지가 균등하게 선택될 때의 기대 선택률. 실제 선택률이 이보다 높으면
 * "더 매력적"인 오답지로 본다.
 */
const optionAttractiveness = (P, Q) => (Q > 1 ? (1 - P) / (Q - 1) : 0);

/**
 * 문항분산 (item variance)
 *   s_i² = ( ΣX² − (ΣX)²/N ) / N      (모집단 분산, 매뉴얼 방식)
 */
const itemVariance = (sX, sX2, N) => (sX2 - (sX * sX) / N) / N;

/**
 * 총점의 모집단 표준편차 (population standard deviation, 매뉴얼 방식)
 *   σ = √( ΣY²/N − μ² ),  μ = ΣY/N
 */
const populationSd = (sY2, meanY, N) =>
  Math.sqrt(Math.max(0, sY2 / N - meanY * meanY));

/**
 * 총점의 표본분산 (sample variance)
 *   s_x² = ( ΣY² − (ΣY)²/N ) / (N − 1)
 */
const sampleVariance = (sY, sY2, N) => (N > 1 ? (sY2 - (sY * sY) / N) / (N - 1) : 0);

/**
 * Cronbach α (내적합치도 계수)
 *   α = (k / (k−1)) · ( 1 − Σs_i² / s_x² )
 * k = 분석 포함 문항 수, Σs_i² = 문항분산 합, s_x² = 총점 분산.
 * 매뉴얼의 s_i²는 모집단 분모(N)이고 s_x²는 표본 분모(N−1)이므로
 * 보정 계수 scale = N/(N−1)을 곱해 분모를 맞춘다.
 */
const cronbachAlpha = (k, sumSi2, scale, sX2sample) =>
  k >= 2 && sX2sample > 0 ? (k / (k - 1)) * (1 - (sumSi2 * scale) / sX2sample) : 0;

/**
 * 문항 제외 시 α (alpha if item deleted)
 * 문항 j 하나를 뺀 나머지 k−1개 문항으로 다시 α를 구한다.
 * 총점에서 문항 점수를 뺀 '나머지 점수'의 분산 s_x²(−j)로 계산하며
 * 문항분산 합에서도 해당 문항의 s_i²만 뺀다.
 *   α(−j) = ((k−1)/(k−2)) · ( 1 − (Σs_i² − s_j²)·scale / s_x²(−j) )
 */
const alphaIfDeleted = (k, s_i2, sumSi2, sYx, sY2x, N) => {
  const varX = N > 1 ? (sY2x - (sYx * sYx) / N) / (N - 1) : 0;
  const kk = k - 1;
  const scale = N / (N - 1 || 1);
  return kk >= 2 && varX > 0
    ? (kk / (kk - 1)) * (1 - ((sumSi2 - s_i2) * scale) / varX)
    : 0;
};

/**
 * 왜도 (skewness, g₁)
 *   g₁ = m₃ / (N·σ³),  m₃ = Σ(Y−μ)³
 * 분모에 쓰는 σ는 0이면 계산할 수 없으므로 0으로 둔다.
 */
const skewness = (m3, N, sd) => (sd ? m3 / N / sd ** 3 : 0);

/**
 * 첨도 (kurtosis, 초과첨도 g₂)
 *   g₂ = m₄ / (N·σ⁴) − 3,  m₄ = Σ(Y−μ)⁴
 * 정규분포면 0이 된다(3을 빼는 이유).
 */
const kurtosis = (m4, N, sd) => (sd ? m4 / N / sd ** 4 - 3 : 0);

/**
 * 측정의 표준오차 (standard error of measurement, SEM)
 *   SEM = σ · √(1 − α)
 */
const sem = (sd, alpha) => sd * Math.sqrt(Math.max(0, 1 - alpha));

/** 분석 포함 문항(k개)에 대한 지표의 산술평균: Σ지표/k */
const meanOf = (items, k, f) =>
  k ? items.reduce((a, it) => a + (it.scored ? f(it) : 0), 0) / k : 0;

if (typeof module !== "undefined")
  module.exports = {
    pearson,
    pointBiserial,
    correctedDiscrimination,
    itemDifficulty,
    guessingRate,
    correctedDifficulty,
    discriminationIndex,
    optionAttractiveness,
    itemVariance,
    populationSd,
    sampleVariance,
    cronbachAlpha,
    alphaIfDeleted,
    skewness,
    kurtosis,
    sem,
    meanOf,
  };
