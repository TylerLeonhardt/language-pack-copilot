import { getGitHubOctokit } from "../auth";
import fetch from 'node-fetch';

// const octokit = new Octokit({
//     "auth": "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"
// });

export async function getTranslationsStrings(locationFile: any) {
    const octokit = await getGitHubOctokit();
    const fileContent = await octokit.request(`GET /repos/microsoft/vscode-loc/contents/${locationFile.path}`, {
        owner: 'microsoft',
        repo: 'vscode-loc',
        path: locationFile.path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          'Accept': 'application/vnd.github+json'
        }
      });

    // Assuming the content is encoded in Base64, decode it
    let decodedContent = Buffer.from(fileContent.data.content, 'base64').toString('utf-8');

    // Parse the JSON content
    // If the decodedContent is empty, fetch the content using download_url
    if (!decodedContent) {
        const response = await fetch(fileContent.data.download_url);
        decodedContent = await response.text();
    }

    return JSON.parse(decodedContent);
}
