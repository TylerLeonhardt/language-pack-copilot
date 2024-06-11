// import * as fs from "fs";
// import { LanguagePackCollection } from "./languagePacks";

// /**
//  * A scan flattens the innermost translated values across language packs.
//  */
// export function scanLanguagePackCollection(languagePackCollection: LanguagePackCollection): ScanChunkCollection {
//     if (fs.existsSync('scanChunkCollection.json')) {
//         return JSON.parse(fs.readFileSync('scanChunkCollection.json', 'utf-8'));
//     }

//     // Use the first language pack as a reference
//     const referenceLanguagePack = languagePackCollection[Object.keys(languagePackCollection)[0]];
//     const scanChunkCollection: ScanChunkCollection = {};
//     for (let i = 0; i < referenceLanguagePack.contents.length; i++) {
//         const file = referenceLanguagePack.contents[i];
//         const scanChunkFile: ScanChunkFile = {};
//         for (const partKey in file.contents.contents) {
//             const part = file.contents.contents[partKey];
//             const scannedChunk: ScanChunk = {};
//             for (const id in part) {
//                 // We now want to iterate through all language packs and grab the value for this
//                 // chunkKey/key pair
//                 const matchingValues: string[] = [];
//                 for (const languagePackName in languagePackCollection) {
//                     const matchingPart = languagePackCollection[languagePackName].contents[i].contents.contents[partKey]; // tru hackathon
//                     const matchingValue = matchingPart[id];
//                     matchingValues.push(matchingValue);
//                 }
//                 scannedChunk[id] = matchingValues;
//             }
//             scanChunkFile[partKey] = scannedChunk;
//         }
//         scanChunkCollection[file.path] = scanChunkFile;
//     }
//     fs.writeFileSync('scanChunkCollection.json', JSON.stringify(scanChunkCollection, null, 2));
//     return scanChunkCollection;
// }