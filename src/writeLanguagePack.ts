import * as fs from "fs";
import * as path from "path";
import { LanguagePack } from "./languagePacks";

export async function overwriteLanguagePack(languagePack: LanguagePack) {
  // TODO: this is really an implementation detail...
  try {
    fs.rmdirSync('translations', { recursive: true });
  } catch (e) {
    console.warn(e);
  }
  for (const languageFile of languagePack.contents) {
    const fullPath = path.resolve(languageFile.path);
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
