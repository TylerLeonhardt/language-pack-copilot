import * as fs from "fs";

import { fetchLanguagePacks } from "./utils/fetchLanguagePacks";
import { getLanguageFiles } from "./utils/getLanguageFiles";
import { getTranslationsStrings } from "./utils/getTranslationsStrings";

export type LanguageName = string;
export type LanguageBookCollection = Record<LanguageName, LanguageBook>;

// e.g. "vs/base/browser/ui/actionbar/actionViewItems"
export type LanguagePackChunkCategory = string;
// e.g. { "button dropdown more actions": "Další akce..." }
export type LanguagePackChunk = Record<string, string>;
export type LanguagePackFile = {
    version: string;
    contents: Record<LanguagePackChunkCategory, LanguagePackChunk>;
};
export type FileName = string;
export type LanguageBook = Record<FileName, LanguagePackFile>;

export async function getLanguageBookCollection(): Promise<LanguageBookCollection> {
    const languagePacks = await fetchLanguagePacks();
    const bookCollection: LanguageBookCollection = {};
    for (const pack of languagePacks) {
        const languageFiles =  await getLanguageFiles(pack);
        const translationStrings: LanguageBook = {};
        await Promise.all(languageFiles.map(async (languageFile: { name: string }) => {
            const translations = await getTranslationsStrings(languageFile);
            translationStrings[languageFile.name] = translations;
        }));
        bookCollection[pack.name] = translationStrings;
    }
    return bookCollection;
}

export async function getAndSaveLanguageBookCollection(fileName: string): Promise<void> {
    const bookCollection = await getLanguageBookCollection();
    fs.writeFileSync(fileName, JSON.stringify(bookCollection, null, 2));
}
