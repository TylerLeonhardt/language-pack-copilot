import * as fs from "fs";

import { fetchLanguagePacks } from "./utils/fetchLanguagePacks";
import { getLanguageFiles } from "./utils/getLanguageFiles";
import { getTranslationsStrings } from "./utils/getTranslationsStrings";

export type LanguageName = string;
export type ILanguageBookCollection = Record<LanguageName, ILanguageBook>;

// e.g. "vs/base/browser/ui/actionbar/actionViewItems"
export type LanguagePackChunkCategory = string;
// e.g. { "button dropdown more actions": "Další akce..." }
export type LanguagePackChunk = Record<string, string>;
export type LanguagePackFile = {
    version: string;
    contents: Record<LanguagePackChunkCategory, LanguagePackChunk>;
};
export type FileName = string;
export type ILanguageBook = Record<FileName, LanguagePackFile>;

export async function getLanguageBookCollection(): Promise<ILanguageBookCollection> {
    const languagePacks = await fetchLanguagePacks();
    const bookCollection: ILanguageBookCollection = {};
    for (const pack of languagePacks) {
        const languageFiles =  await getLanguageFiles(pack);
        const translationStrings: ILanguageBook = {};
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
