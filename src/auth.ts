import { Octokit } from "@octokit/rest";

let octokit: Octokit | undefined = undefined;
export async function getGitHubOctokit(): Promise<Octokit> {
    if (octokit) {
        return octokit;
    }
    if (process.env.GITHUB_PAT) {
        octokit = new Octokit({
            auth: process.env.GITHUB_PAT
        });
        return octokit;
    }

    // we only need user:email scope because vscode-loc is a public repo
    // however, make sure to SAML the Microsoft org.
    const session = await require('vscode').authentication.getSession('github', ['user:email'], { createIfNone: true });
    if (!session) {
        throw new Error('Failed to get GitHub session');
    }
    octokit = new Octokit({
        auth: session.accessToken
    });
    return octokit;
}
