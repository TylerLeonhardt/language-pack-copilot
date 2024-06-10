import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

export async function getTranslationsStrings(locationFile: any) {
    const fileContent = await octokit.request(`GET /repos/microsoft/vscode-loc/contents/${locationFile.path}`, {
        owner: 'microsoft',
        repo: 'vscode-loc',
        path: locationFile.path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

    // Assuming the content is encoded in Base64, decode it
    const decodedContent = Buffer.from(fileContent.data.content, 'base64').toString('utf-8');

    // Parse the JSON content
    const jsonContent = JSON.parse(decodedContent);

    return jsonContent;
}