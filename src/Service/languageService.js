import {
    postWithOutToken,
    postWithToken,
} from './service'; // adjust to your actual path
import { getData, setData } from './localStorage'; // adjust path


const LANG_ID_KEY = 'SELECTED_LANG_ID';
const LANG_STRINGS_KEY = 'SELECTED_LANG_STRINGS';


/**
 * Fetch list of available languages
 * POST (no body, no token) -> get-languages
 */
export const fetchLanguagesList = async (baseUrl) => {
    try {
        const response = await postWithOutToken(baseUrl, 'get-languages');

        if (response?.status) {
            return response.data; // array of { id, name, short_name, default_lang }
        }
        return [];
    } catch (error) {
        console.log('fetchLanguagesList error:', error);
        return [];
    }
};

/**
 * Fetch key-value translation strings for a given language
 * POST (with token) -> get-languages-new-text
 * body: { user_slug, lang_id }
 */
export const fetchLanguageStrings = async (baseUrl, userSlug, langId, userToken) => {
    try {
        const response = await postWithToken(
            baseUrl,
            'get-languages-new-text',
            { user_slug: userSlug, lang_id: langId },
            userToken
        );
        if (response?.status && response?.data) {
            return response.data[String(langId)] || response.data[langId] || {};
        }
        return {};
    } catch (error) {
        console.log('fetchLanguageStrings error:', error);
        return {};
    }
};

/** Persist selected language locally so it survives app restarts */
export const persistLanguageSelection = async (langId, strings) => {
    await setData(LANG_ID_KEY, String(langId));
    await setData(LANG_STRINGS_KEY, JSON.stringify(strings));
};

export const getPersistedLanguage = async () => {
    const langId = await getData(LANG_ID_KEY);
    const stringsRaw = await getData(LANG_STRINGS_KEY);
    return {
        langId: langId ? Number(langId) : null,
        strings: stringsRaw ? JSON.parse(stringsRaw) : null,
    };
};