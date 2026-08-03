import { useSelector } from 'react-redux';

export default function useTranslation() {
    const { languageStrings } = useSelector((state) => state.common);
    const t = (key, fallback = key) => languageStrings?.[key] ?? fallback;
    return { t };
}