import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    setLanguagesList,
    setLangId,
    setLanguageStrings,
    setIsLanguageLoading,
    setBusinessTheme,
} from '../../Store/Reducers/CommonReducer'; // adjust path
import {
    fetchLanguagesList,
    fetchLanguageStrings,
    persistLanguageSelection,
    getPersistedLanguage,
} from '../../Service/languageService';
import { postWithOutToken } from '../../Service/service';

export default function AppInitializer({ children }) {
    const dispatch = useDispatch();
    const { siteSetting, baseUrl, user_slug, userToken } = useSelector((state) => state.common);

    const initLanguage = async () => {
        console.log('AppInitializer: starting language fetch, siteSetting =', baseUrl);
        dispatch(setIsLanguageLoading(true));

        const languages = await fetchLanguagesList(baseUrl);
        dispatch(setLanguagesList(languages));

        const persisted = await getPersistedLanguage();
        let langId = persisted.langId;
        if (!langId) {
            const defaultLang = languages.find((l) => l.default_lang === '1');
            langId = defaultLang ? defaultLang.id : 1;
        }

        if (persisted.strings) {
            dispatch(setLanguageStrings(persisted.strings));
            dispatch(setLangId(langId));
        }

        const freshStrings = await fetchLanguageStrings(baseUrl, user_slug, langId, userToken);
        if (Object.keys(freshStrings).length > 0) {
            dispatch(setLanguageStrings(freshStrings));
            dispatch(setLangId(langId));
            await persistLanguageSelection(langId, freshStrings);
        }

        dispatch(setIsLanguageLoading(false));
    };

    const initBusinessTheme = async () => {
        try {
            const response = await postWithOutToken(siteSetting, 'get-business-app-settings', { user_slug });
            if (response?.status && response?.data) {
                dispatch(setBusinessTheme(response.data));
            }
        } catch (e) {
            console.log('theme fetch error', e);
        }
    };

    const runInitializers = () => {
        // independent of each other — run in parallel, not chained
        initLanguage();
        initBusinessTheme();
    };

    useEffect(() => {
        runInitializers(); // cold start

        const sub = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                runInitializers(); // app resumed from background
            }
        });

        return () => sub.remove();
    }, []);

    return children;
}