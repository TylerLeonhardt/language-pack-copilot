import { existsSync, readdirSync, readFileSync } from "fs";
import { Readable } from "stream";
import { getGitHubOctokit } from "./auth";
import * as unzipper from 'unzipper';
import path from "path";
import * as os from "os";

export interface LanguagePackTranslation {
    // e.g. { "button dropdown more actions": "Další akce..." }
    [id: string]: string
}
export interface LanguagePackFilePart {
    // e.g. "vs/base/browser/ui/actionbar/actionViewItems"
    [partKey: string]: LanguagePackTranslation
}
export interface LanguagePackFile {
    // This is usually just the copyright
    "": string;
    // This is usually 1.0.0
    version: string;
    contents: LanguagePackFilePart;
};
export interface LanguagePackContents {
    // main.i18n.json
    id: string,
    path: string,
    contents: LanguagePackFile
}
export interface LanguagePack {
    contents: LanguagePackContents[]
    // TODO: include other unique properties from the package.json
    languageId: string;
    languageName: string;
    localizedLanguageName: string;
}
export interface LanguagePackCollection {
    [languageName: string]: LanguagePack
}

/**
 * downloads and extracts vscode-loc to a temp location and returns that location
 * @returns file path
 */
export async function DownloadVScodeLocRepoToATempLocation(): Promise<string> {
    const tempLocation = path.join(os.tmpdir(), 'microsoft-vscode-loc-main');
    if (existsSync(tempLocation)) {
        const extractedFolders = readdirSync(tempLocation, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);
        return path.join(tempLocation, extractedFolders[0]);
    }
    const octokit = await getGitHubOctokit();

    const { data } = await octokit.repos.downloadZipballArchive({
        owner: 'microsoft',
        repo: 'vscode-loc',
        ref: 'main'
    });

    const buffer = Buffer.from(data as ArrayBuffer);
    return await new Promise((resolve) => {
        Readable.from(buffer)
            .pipe(unzipper.Extract({ path: tempLocation }))
            .on('close', () => {
                const extractedFolders = readdirSync(tempLocation, { withFileTypes: true })
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name);
                resolve(path.join(tempLocation, extractedFolders[0]));
            });
    });
}

export function loadLanguagePacks(filePath: string): LanguagePackCollection {
    const folderWithLanguagePacks = path.join(filePath, 'i18n');
    const languagePackFolders = readdirSync(folderWithLanguagePacks, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const languagePackCollection: LanguagePackCollection = {};
    for (const languagePackFolder of languagePackFolders) {
        const packageJsonPath = path.join(folderWithLanguagePacks, languagePackFolder, "package.json");
        const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);
        const { languageId, languageName, localizedLanguageName, translations } = packageJson.contributes.localizations[0];

        const contents = new Array<LanguagePackContents>();
        for (const translation of translations) {
            const translationPath = path.join(folderWithLanguagePacks, languagePackFolder, translation.path);
            const translationContent = readFileSync(translationPath, "utf-8");
            const translationFile = JSON.parse(translationContent);
            contents.push({ id: translation.id, path: translation.path, contents: translationFile });
        }

        const languagePack: LanguagePack = { contents, languageId, languageName, localizedLanguageName };
        languagePackCollection[languageId] = languagePack;
    }

    return languagePackCollection;
}

// USAGE
// const filePath = await DownloadVScodeLocRepoToATempLocation();
// const collection = loadLanguagePacks(filePath);
