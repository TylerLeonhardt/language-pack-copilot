import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

export async function fetchLanguagePacks() {
    const repoDir = await octokit.request('GET /repos/microsoft/vscode-loc/contents/i18n', {
        owner: 'microsoft',
        repo: 'vscode-loc',
        path: 'i18n',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
    console.log(repoDir);
    return repoDir.data.map((languagePack: any) => {return {"name": languagePack.name, "path": languagePack.path, "sha": languagePack.sha};});
}