import * as fs from "fs";

export function initializeCacheFromFile(): Map<string, string> {
    const initCache = new Map<string, string>();
    if (fs.existsSync('cache.json')) {
        const cacheData = fs.readFileSync('cache.json', 'utf-8');
        const cacheEntries = JSON.parse(cacheData);
        for (const key in cacheEntries) {
            initCache.set(key, cacheEntries[key]);
        }
    }
    return initCache;
}

// e.g. ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"] => "Error: {0}"
let cache = new Map<string, string>();
function getCache() {
    if (cache.size === 0) {
        cache = initializeCacheFromFile();
    }
    return cache;
}

export function getTranslation(key: string[]): string | undefined {
    const cache = getCache();
    return cache.get(JSON.stringify(key));
}

export function addTranslation(key: string[], translations: string) {
    const cache = getCache();
    cache.set(JSON.stringify(key), translations);

    // Export the cache every fifty translations
    if (cache.size % 50 === 0) {
        exportCacheToFile();
    }
}

export function exportCacheToFile() {
    const cache = getCache();
    fs.writeFileSync('cache.json', JSON.stringify(Object.fromEntries(cache), null, 2));
}
