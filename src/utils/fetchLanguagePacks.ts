import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  "auth": "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"
});

export interface ILanguagePack {
  name: string;
  path: string;
  sha: string;
}

export async function fetchLanguagePacks(): Promise<ILanguagePack[]> {
  const repoDir = await octokit.request('GET /repos/microsoft/vscode-loc/contents/i18n', {
      owner: 'microsoft',
      repo: 'vscode-loc',
      path: 'i18n',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  return repoDir.data.map((languagePack: any) => {
    return {
      "name": languagePack.name,
      "path": languagePack.path,
      "sha": languagePack.sha
    };
  });
}