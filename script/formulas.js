"use strict";

const pearson = (sX, sX2, sXY, sY, sY2, N) => {
  const dX = N * sX2 - sX * sX;
  const dY = N * sY2 - sY * sY;
  return dX > 0 && dY > 0
    ? (N * sXY - sX * sY) / (Math.sqrt(dX) * Math.sqrt(dY))
    : 0;
};

const pointBiserial = (sX, sX2, sXY, sY, sY2, N) =>
  pearson(sX, sX2, sXY, sY, sY2, N);

const correctedDiscrimination = (sX, sX2, sXY, sY, sY2, N) =>
  pearson(sX, sX2, sXY - sX2, sY - sX, sY2 - 2 * sXY + sX2, N);

const itemDifficulty = (R, N) => R / N;

const guessingRate = (W, Q, N) => (Q > 1 ? W / (Q - 1) / N : 0);

const correctedDifficulty = (P, g) => P - g;

const discriminationIndex = (pUpper, pLower) => pUpper - pLower;

const optionAttractiveness = (P, Q) => (Q > 1 ? (1 - P) / (Q - 1) : 0);

const itemVariance = (sX, sX2, N) => (sX2 - (sX * sX) / N) / N;

const populationSd = (sY2, meanY, N) =>
  Math.sqrt(Math.max(0, sY2 / N - meanY * meanY));

const sampleVariance = (sY, sY2, N) =>
  N > 1 ? (sY2 - (sY * sY) / N) / (N - 1) : 0;

const cronbachAlpha = (k, sumSi2, scale, sX2sample) =>
  k >= 2 && sX2sample > 0
    ? (k / (k - 1)) * (1 - (sumSi2 * scale) / sX2sample)
    : 0;

const alphaIfDeleted = (k, s_i2, sumSi2, sYx, sY2x, N) => {
  const varX = N > 1 ? (sY2x - (sYx * sYx) / N) / (N - 1) : 0;
  const kk = k - 1;
  const scale = N / (N - 1 || 1);
  return kk >= 2 && varX > 0
    ? (kk / (kk - 1)) * (1 - ((sumSi2 - s_i2) * scale) / varX)
    : 0;
};

const skewness = (m3, N, sd) => (sd ? m3 / N / sd ** 3 : 0);

const kurtosis = (m4, N, sd) => (sd ? m4 / N / sd ** 4 - 3 : 0);

const sem = (sd, alpha) => sd * Math.sqrt(Math.max(0, 1 - alpha));

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
