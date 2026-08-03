// src/Hooks/useAppTheme.js
import { useSelector } from 'react-redux';

export const useAppTheme = () => {
    const { businessTheme, isDarkMode } = useSelector(state => state.common);

    return {
        primary: businessTheme.business_primary_color,
        secondary: businessTheme.business_secondary_color,
        background: isDarkMode ? '#121212' : businessTheme.business_background,
        fontColor: businessTheme.business_font_color,
        fontColorOnBackground: businessTheme.business_font_color_on_background,
        selectedButton: businessTheme.business_selected_button_color,
        secondaryBackground: businessTheme.business_secondary_background,
        highlighted: businessTheme.businees_highlighted_color,
        loginImage: businessTheme.business_login_image_path,
        cancelButton: businessTheme.business_cancelbutton,
        fontColorOnSecondaryBackground: businessTheme.business_font_color_on_secondary_background
    };
};