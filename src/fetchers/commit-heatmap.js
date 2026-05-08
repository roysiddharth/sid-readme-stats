// @ts-check
import axios from "axios";
import { MissingParamError } from "../common/error.js";

/**
 * Fetch commit timestamps and return a 7x24 activity matrix.
 * day: 0=Mon ... 6=Sun, hour: 0-23 UTC
 *
 * @param {string} username GitHub username.
 * @returns {Promise<{ matrix: number[][], total: number }>}
 */
const fetchCommitHeatmap = async (username) => {
  if (!username) throw new MissingParamError(["username"]);

  const token = process.env.PAT_1;
  const res = await axios.get(
    `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.cloak-preview",
      },
    },
  );

  const matrix = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const item of res.data.items) {
    const date = new Date(item.commit.author.date);
    const day = (date.getUTCDay() + 6) % 7; // 0=Mon, 6=Sun
    const hour = date.getUTCHours();
    matrix[day][hour]++;
  }

  return { matrix, total: res.data.items.length };
};

export { fetchCommitHeatmap };
export default fetchCommitHeatmap;
