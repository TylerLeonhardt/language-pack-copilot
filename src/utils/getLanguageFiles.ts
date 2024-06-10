import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

export async function getLanguageFiles(languageInfo: any) {
    const languageDir = await octokit.request(`GET /repos/microsoft/vscode-loc/git/trees/${languageInfo.sha}?recursive=1`, {
        owner: 'microsoft',
        repo: 'vscode-loc',
        tree_sha: languageInfo.sha,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
    return languageDir.data.tree
    .filter((file: any) => file.path.endsWith("i18n.json"))
    .map((languagePack: any) => {return {"path": `${languageInfo.path}/${languagePack.path}`, "sha": languagePack.sha, url:languagePack.url};});
}
