import * as fs from "fs";
import * as path from "path";
import { LanguagePack } from "./languagePacks";

export async function writeLanguagePack(languagePack: LanguagePack) {
  const newLanguagePackFolder = path.join(
    path.dirname(__dirname),
    `vscode-language-pack-${languagePack.languageId}`,
    "translations"
  );
  for (const languageFile of languagePack.contents) {
    const fullPath = path.join(newLanguagePackFolder, languageFile.path);
    const content = JSON.stringify(languageFile.contents, null, 2); 
    const dirPath = path.dirname(fullPath);

    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      await fs.promises.writeFile(fullPath, content, "utf8");
      console.log(`File written successfully: ${fullPath}`);
    } catch (error) {
      console.error(`Error writing file ${fullPath}:`, error);
    }
  }
}
