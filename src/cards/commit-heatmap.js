// @ts-check
import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = [0, 6, 12, 18, 23];

const CELL_W = 13;
const CELL_H = 10;
const STEP_X = 15; // CELL_W + 2 gap
const STEP_Y = 12; // CELL_H + 2 gap
const LABEL_W = 30;
const PAD_X = 25;
const GRID_X = PAD_X + LABEL_W;
const GRID_Y = 18; // below hour labels in body space
const CARD_W = 450;
const CARD_H = 170;

const getOpacity = (val, maxVal) => {
  if (val === 0) return 0.07;
  const ratio = val / maxVal;
  if (ratio < 0.25) return 0.3;
  if (ratio < 0.5) return 0.55;
  if (ratio < 0.75) return 0.75;
  return 1.0;
};

/**
 * Render commit heatmap as an SVG card.
 *
 * @param {{ matrix: number[][], total: number }} data
 * @param {object} options
 * @returns {string} SVG string.
 */
const renderCommitHeatmap = (data, options = {}) => {
  const { matrix, total } = data;
  const {
    title_color,
    text_color,
    bg_color,
    border_color,
    theme = "default",
    hide_border = false,
    hide_title = false,
    custom_title,
    border_radius,
    disable_animations = false,
  } = options;

  const { titleColor, textColor, bgColor, borderColor } = getCardColors({
    title_color,
    text_color,
    icon_color: "",
    bg_color,
    border_color,
    ring_color: "",
    theme,
  });

  const maxVal = Math.max(1, ...matrix.flat());

  const hourLabels = HOUR_LABELS.map((h) => {
    const x = GRID_X + h * STEP_X + CELL_W / 2;
    return `<text x="${x}" y="10" class="small" text-anchor="middle">${String(h).padStart(2, "0")}</text>`;
  }).join("");

  const dayLabels = DAYS.map((d, i) => {
    const y = GRID_Y + i * STEP_Y + CELL_H / 2 + 4;
    return `<text x="${PAD_X + LABEL_W - 4}" y="${y}" class="small" text-anchor="end">${d}</text>`;
  }).join("");

  const cells = matrix
    .map((row, day) =>
      row
        .map((val, hour) => {
          const x = GRID_X + hour * STEP_X;
          const y = GRID_Y + day * STEP_Y;
          const opacity = getOpacity(val, maxVal);
          return `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" rx="2" fill="${titleColor}" fill-opacity="${opacity}" />`;
        })
        .join(""),
    )
    .join("");

  const card = new Card({
    width: CARD_W,
    height: CARD_H,
    border_radius,
    colors: { titleColor, textColor, bgColor, borderColor, ringColor: titleColor, iconColor: titleColor },
    defaultTitle: "Commit Activity",
    customTitle: custom_title,
  });

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  if (disable_animations) card.disableAnimations();

  card.setCSS(
    `.small { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }`,
  );

  card.setAccessibilityLabel({
    title: "Commit Activity Heatmap",
    desc: `Heatmap of ${total} recent commits by hour and day of week (UTC)`,
  });

  return card.render(`${hourLabels}${dayLabels}${cells}`);
};

export { renderCommitHeatmap };
export default renderCommitHeatmap;
