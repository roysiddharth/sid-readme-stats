// @ts-check
import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";

const ROW_H = 26;
const PAD_X = 25;
const NAME_COL_W = 125;
const BAR_X = PAD_X + NAME_COL_W;
const BAR_MAX_W = 185;
const CARD_W = 400;

/**
 * Render most-active-repos bar chart as an SVG card.
 *
 * @param {Array<{ name: string, commits: number, isPrivate: boolean }>} repos
 * @param {object} options
 * @returns {string} SVG string.
 */
const renderActiveRepos = (repos, options = {}) => {
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

  const maxCommits = Math.max(1, repos[0]?.commits ?? 1);
  const CARD_H = 55 + repos.length * ROW_H + 20;

  const rows = repos
    .map((repo, i) => {
      const y = 10 + i * ROW_H;
      const name = repo.name.length > 16 ? repo.name.slice(0, 15) + "…" : repo.name;
      const barW = Math.max(2, Math.round((repo.commits / maxCommits) * BAR_MAX_W));
      const countText =
        repo.commits >= 1000
          ? `${(repo.commits / 1000).toFixed(1)}k`
          : String(repo.commits);
      const lock = repo.isPrivate
        ? `<text x="${PAD_X + 112}" y="${y + 12}" class="lock">⚿</text>`
        : "";
      return `
      <text x="${PAD_X}" y="${y + 12}" class="label">${name}</text>
      ${lock}
      <rect x="${BAR_X}" y="${y + 3}" width="${BAR_MAX_W}" height="13" rx="3" fill="${textColor}" fill-opacity="0.08" />
      <rect x="${BAR_X}" y="${y + 3}" width="${barW}" height="13" rx="3" fill="${titleColor}" fill-opacity="0.85" />
      <text x="${BAR_X + barW + 5}" y="${y + 13}" class="count">${countText}</text>
    `;
    })
    .join("");

  const card = new Card({
    width: CARD_W,
    height: CARD_H,
    border_radius,
    colors: { titleColor, textColor, bgColor, borderColor, ringColor: titleColor, iconColor: titleColor },
    defaultTitle: "Most Active Repos",
    customTitle: custom_title,
  });

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  if (disable_animations) card.disableAnimations();

  card.setCSS(`
    .label { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    .count { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; opacity: 0.8; }
    .lock  { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; opacity: 0.6; }
  `);

  card.setAccessibilityLabel({
    title: "Most Active Repositories",
    desc: `Top ${repos.length} repositories by all-time commit count`,
  });

  return card.render(rows);
};

export { renderActiveRepos };
export default renderActiveRepos;
