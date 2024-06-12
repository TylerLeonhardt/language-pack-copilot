import { translatePhrases } from "./azureIntegration";
import { exportCacheToFile as exportTranslationsCacheToFile } from './azureCache';
import { downloadVSCodeLocToTempLocation, LanguagePack, LanguagePackFile, LanguagePackFileContentPart, LanguagePackTranslation, loadLanguagePacks } from "./languagePacks";
import { writeLanguagePack } from "./writeLanguagePack";

async function run() {
    console.log('Downloading & extracting vscode-loc repo...');
    const tempLocation = await downloadVSCodeLocToTempLocation();
    console.log('Loading language packs...');
    const languagePackCollection = loadLanguagePacks(tempLocation);

    // Set the reference language pack to French for now.
    const referenceLanguagePack = languagePackCollection['fr'];
    const newLanguagePack: LanguagePack = {
        "languageId": 'en-gb',
        "languageName": "English (UK)",
        "localizedLanguageName": "English (UK)",
        "contents": []
    };
    for (let i = 0; i < referenceLanguagePack.contents.length; i++) {
        const file = referenceLanguagePack.contents[i];
        const fileContents = file.contents;
        const newLanguagePackFileContentPart: LanguagePackFileContentPart = {};
        for (const partKey in fileContents.contents) {
            const part = fileContents.contents[partKey];
            const newLanguagePackTranslations: LanguagePackTranslation = {};
            for (const key in part) {
                const values: string[] = [];
                for (const languagePackName in languagePackCollection) {
                    const matchingPart = languagePackCollection[languagePackName].contents[i].contents.contents[partKey];
                    const matchingValue = matchingPart?.[key];
                    if (matchingValue !== undefined) {
                        values.push(matchingValue);
                    }
                }
                // e.g. ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"] => "Error: {0}"
                console.log(`Translating ${key}...`);
                let translation: string | null;
                try {
                    translation = await translatePhrases(values);
                } catch (error) {
                    console.error("Translation failed for key: ", key, " with error: ", error);
                    translation = null;
                }
                if (translation === null) {
                    // Default to the reference language pack
                    translation = part[key];
                }
                newLanguagePackTranslations[key] = translation;
            }
            newLanguagePackFileContentPart[partKey] = newLanguagePackTranslations;
        }

        const newLanguagePackFile: LanguagePackFile = {
            "id": file.id,
            "path": file.path,
            "contents": {
                "": file.contents[""],
                "version": "1.0.0",
                "contents": newLanguagePackFileContentPart
            }
        };
        newLanguagePack.contents.push(newLanguagePackFile);
    }
    console.log('Writing language pack...');
    await writeLanguagePack(newLanguagePack);
    console.log('Updating cache one last time...');
    exportTranslationsCacheToFile();
    console.log('DONE!');
}

run()
    .then(() => console.log('Done'))
    .catch(err => console.error(err));