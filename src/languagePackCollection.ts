import * as fs from "fs";

import { fetchLanguagePacks } from "./utils/fetchLanguagePacks";
import { getLanguageFiles } from "./utils/getLanguageFiles";
import { getTranslationsStrings } from "./utils/getTranslationsStrings";

// e.g. "vs/base/browser/ui/actionbar/actionViewItems"
type LanguagePackChunkKey = string;
// e.g. { "button dropdown more actions": "Další akce..." }
type LanguagePackChunk = Record<string, string>;
export type LanguagePackFile = {
    "": string;
    version: string;
    contents: Record<LanguagePackChunkKey, LanguagePackChunk>;
};
type FileName = string;
export type LanguagePack = Record<FileName, LanguagePackFile>;

type LanguageName = string;
export type LanguagePackCollection = Record<LanguageName, LanguagePack>;

export async function getLanguagePackCollection(): Promise<LanguagePackCollection> {
    const languagePacks = await fetchLanguagePacks();
    const collection: LanguagePackCollection = {};
    for (const pack of languagePacks) {
        if (pack.name === 'vscode-language-pack-qps-ploc') {
            continue;
        }
        const languageFiles =  await getLanguageFiles(pack);
        const translationStrings: LanguagePack = {};
        await Promise.all(languageFiles.map(async (languageFile: { name: string }) => {
            const translations = await getTranslationsStrings(languageFile);
            translationStrings[languageFile.name] = translations;
        }));
        collection[pack.name] = translationStrings;
    }
    return collection;
}

export async function getAndSaveLanguagePackCollection(fileName: string): Promise<void> {
    const collection = await getLanguagePackCollection();
    fs.writeFileSync(fileName, JSON.stringify(collection, null, 2));
}
