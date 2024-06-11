import { Octokit } from '@octokit/rest';
import { ILanguagePack } from './fetchLanguagePacks';

const octokit = new Octokit({
    "auth": "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"
});

export interface ILanguageFile {
  name: string;
  path: string;
  sha: string;
}

export async function getLanguageFiles(languageInfo: ILanguagePack): Promise<ILanguageFile[]> {
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
    .map((languagePack: any) => { return {
        "name": languagePack.path,
        "path": `${languageInfo.path}/${languagePack.path}`,
        "sha": languagePack.sha, url:languagePack.url
      };
    });
}
