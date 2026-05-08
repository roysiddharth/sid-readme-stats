// @ts-check
import axios from "axios";
import { MissingParamError } from "../common/error.js";

/**
 * Fetch public repos for the token owner and return
 * top 8 sorted by the given user's all-time commit count.
 *
 * @param {string} username GitHub username.
 * @returns {Promise<Array<{ name: string, commits: number, isPrivate: boolean }>>}
 */
const fetchActiveRepos = async (username) => {
  if (!username) throw new MissingParamError(["username"]);

  const token = process.env.PAT_1;
  const headers = { Authorization: `token ${token}` };

  const reposRes = await axios.get(
    "https://api.github.com/user/repos?type=public&per_page=100&sort=pushed",
    { headers },
  );

  const results = [];

  await Promise.all(
    reposRes.data.map(async (repo) => {
      try {
        const contribRes = await axios.get(
          `https://api.github.com/repos/${repo.full_name}/contributors?per_page=100`,
          { headers },
        );
        if (contribRes.status !== 200 || !Array.isArray(contribRes.data)) return;
        const contributor = contribRes.data.find(
          (c) => c.login.toLowerCase() === username.toLowerCase(),
        );
        if (contributor) {
          results.push({
            name: repo.name,
            commits: contributor.contributions,
            isPrivate: false,
          });
        }
      } catch {
        // skip empty or inaccessible repos
      }
    }),
  );

  results.sort((a, b) => b.commits - a.commits);
  return results.slice(0, 8);
};

export { fetchActiveRepos };
export default fetchActiveRepos;
