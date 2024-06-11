import { LanguageBookCollection as LanguageBookCollection } from "./languageBookCollection";

// TODO: We still want to recall which file the value came from

// e.g. "vs/base/browser/ui/actionbar/actionViewItems"
export type ScanChunkKey = string;

// e.g. "alertErrorMessage": ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"]
export type ScanChunk = Record<string, string[]>;

export type ScanChunkCollection = Record<ScanChunkKey, ScanChunk>;

/**
 * A book collection is a collection of language packs where the keys are language packs.
 * A scan is a record of keys to lists of values.
 * For example:
 *  "vs/base/browser/ui/actionbar/actionViewItems": {
 *      "alertErrorMessage": ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"]
 *  }
 */
export function scanBookCollection(bookCollection: LanguageBookCollection): ScanChunkCollection {
    // Use the first language pack as a reference
    const referenceLanguagePack = bookCollection[Object.keys(bookCollection)[0]];
    const scanChunkCollection: ScanChunkCollection = {};
    for (const fileKey in referenceLanguagePack) {
        const file = referenceLanguagePack[fileKey];
        for (const chunkKey in file.contents) {
            const chunk = file.contents[chunkKey];
            const scannedChunk: ScanChunk = {};
            for (const key in chunk) {
                // We now want to iterate through all language packs and grab the value for this
                // chunkKey/key pair
                const matchingValues: string[] = [];
                for (const languagePackName in bookCollection) {
                    const matchingFile = bookCollection[languagePackName][fileKey];
                    const matchingChunk = matchingFile.contents[chunkKey];
                    const matchingValue = matchingChunk[key];
                    matchingValues.push(matchingValue);
                }
                scannedChunk[key] = matchingValues;
            }
            scanChunkCollection[chunkKey] = scannedChunk;
        }
    }
   return scanChunkCollection;
}