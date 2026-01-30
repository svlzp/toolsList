import i18n from '../i18n';

type LanguageCode = 'ru' | 'en' | 'he';


const translationCache = new Map<string, string>();



const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';


const languageMap: Record<LanguageCode, string> = {
  ru: 'ru',
  en: 'en',
  he: 'he',
};


export const translateServerText = async (
  text: string,
  targetLanguage?: LanguageCode
): Promise<string> => {
  const currentLang = (targetLanguage || i18n.language) as LanguageCode;


  if (currentLang === 'ru') {
    return text;
  }

  const cacheKey = `${text}|${currentLang}`;


  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout


    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'ru',
      tl: languageMap[currentLang],
      dt: 't',
      q: text,
    });

    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Translation API error: ${response.status} ${response.statusText}`);
      return text;
    }

    const data = await response.json();

    
    if (Array.isArray(data) && data[0]?.[0]?.[0]) {
      const translatedText = data[0][0][0];
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    }

    return text;
  } catch (error) {
    console.warn('Translation request failed, using original text:', error);
  
    return text;
  }
};


export const translateServerObject = async <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  targetLanguage?: LanguageCode
): Promise<T> => {
  const currentLang = (targetLanguage || i18n.language) as LanguageCode;

  if (currentLang === 'ru') {
    return obj;
  }

  const translatedObj = { ...obj };

  try {
    for (const field of fields) {
      if (typeof translatedObj[field] === 'string' && translatedObj[field]) {
        translatedObj[field] = (await translateServerText(
          translatedObj[field] as string,
          currentLang
        )) as T[keyof T];
      }
    }
  } catch (error) {
    console.warn('Error translating object, returning original:', error);
    return obj;
  }

  return translatedObj;
};


export const translateServerArray = async <T extends Record<string, any>>(
  arr: T[],
  fields: (keyof T)[],
  targetLanguage?: LanguageCode
): Promise<T[]> => {
  if (!arr || arr.length === 0) {
    return arr;
  }

  try {
    return await Promise.all(
      arr.map(item => translateServerObject(item, fields, targetLanguage))
    );
  } catch (error) {
    console.warn('Error translating array, returning original:', error);
    return arr;
  }
};


export const clearTranslationCache = () => {
  translationCache.clear();
};
