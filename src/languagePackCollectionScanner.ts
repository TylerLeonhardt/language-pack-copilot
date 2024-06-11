import { LanguagePackCollection } from "./languagePackCollection";

// e.g. "vs/base/browser/ui/actionbar/actionViewItems"
type ScanChunkKey = string;
// e.g. "alertErrorMessage": ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"]
type ScanChunk = Record<string, string[]>;

export type ScanChunkFile = Record<ScanChunkKey, ScanChunk>;

type FileName = string;
export type ScanChunkCollection = Record<FileName, ScanChunkFile>;

/**
 * A book collection is a collection of language packs where the keys are language packs.
 * A scan flattens the innermost translated values across language packs.
 */
export function scanLanguagePackCollection(bookCollection: LanguagePackCollection): ScanChunkCollection {
    // Use the first language pack as a reference
    const referenceLanguagePack = bookCollection[Object.keys(bookCollection)[0]];
    const scanChunkCollection: ScanChunkCollection = {};
    for (const fileKey in referenceLanguagePack) {
        const file = referenceLanguagePack[fileKey];
        const scanChunkFile: ScanChunkFile = {};
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
            scanChunkFile[chunkKey] = scannedChunk;
        }
        scanChunkCollection[fileKey] = scanChunkFile;
    }
   return scanChunkCollection;
}