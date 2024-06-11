import { fetchLanguagePacks } from "./utils/fetchLanguagePacks";
import { getLanguageFiles } from "./utils/getLanguageFiles";
import { getTranslationsStrings } from "./utils/getTranslationsStrings";

export type LanguageName = string;
export type ILanguageBookCollection = Map<LanguageName, ILanguageBook>;

export type FileName = string;
export type ILanguageBook = Map<FileName, any>;

export async function getLanguageBookCollection(): Promise<ILanguageBookCollection> {
    const languagePacks = await fetchLanguagePacks();
    const bookCollection = new Map<LanguageName, ILanguageBook>();
    for (const pack of languagePacks) {
        const languageFiles =  await getLanguageFiles(pack);
        const translationStrings = new Map<FileName, any>();
        await Promise.all(languageFiles.map(async (languageFile: { name: string }) => {
            const translations = await getTranslationsStrings(languageFile);
            translationStrings.set(languageFile.name, translations);
        }));
        bookCollection.set(pack.name, translationStrings);
    }
    return bookCollection;
}
