import { StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
const PURPLE_LIGHT = '#EAE8F6';
const DANGER_LIGHT = '#FFE1DF';
const DANGER = '#EF4444';
const CHEVRON = '#B9B8CC';
const BORDER = '#E6E6EF';

const Styles = (isTablet = true, theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5FA',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: responsiveHeight(3),
    },
    main: {
      flexDirection: isTablet ? 'row' : 'column',
      paddingHorizontal: responsiveWidth(isTablet ? 1.3 : 3),
      paddingVertical: responsiveHeight(1),
    },

    /* LEFT SIDEBAR — single outer card holds everything */
    inner_left: {
      width: isTablet ? '26%' : '100%',
      marginBottom: isTablet ? 0 : responsiveHeight(2),
    },
    sidebar_card: {
      backgroundColor: Colors.white,
      borderRadius: responsiveWidth(1.5),
      overflow: 'hidden',
      paddingBottom: responsiveHeight(2),
    },
    sidebar_gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sidebar_content: {
      alignItems: 'center',
      paddingHorizontal: responsiveWidth(isTablet ? 1.5 : 5),
      paddingTop: responsiveHeight(3),
    },
    avatar_circle: {
      width: responsiveWidth(isTablet ? 8 : 18),
      height: responsiveWidth(isTablet ? 8 : 18),
      borderRadius: responsiveWidth(isTablet ? 4 : 9),
      backgroundColor: '#E4E4E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveHeight(1.2),
      overflow: 'visible',
    },
    avatar_image: {
      width: '100%',
      height: '100%',
      borderRadius: responsiveWidth(isTablet ? 4 : 9),
    },
    sidebar_title: {
      marginTop: responsiveHeight(0.8),
      fontSize: responsiveFontSize(isTablet ? 1.4 : 2),
      fontFamily: Inter.semibold,
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(1),
    },
    sidebar_email: {
      fontSize: responsiveFontSize(1),
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(2),
    },
    sidebar_subtitle: {
      fontSize: responsiveFontSize(1),
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,
      textAlign: 'center',
      marginBottom: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(isTablet ? 0.5 : 3),
      lineHeight: responsiveHeight(3.5),
    },
    divider: {
      width: '86%',
      height: 1,
      backgroundColor: BORDER,
      marginBottom: responsiveHeight(2),
      alignSelf: 'center',
    },

    /* Selected nav item */
    nav_item_active: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: PURPLE_LIGHT,
      borderWidth: 0,
      borderRadius: responsiveWidth(0.5),
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(1),
      marginBottom: responsiveHeight(1),
      width: isTablet ? '86%' : '89%',
      alignSelf: 'center',
    },
    /* Unselected nav item (also base style for Delete Profile) */
    nav_item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: responsiveWidth(0.5),
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(1),
      width: isTablet ? '86%' : '89%',
      alignSelf: 'center',
      marginBottom: responsiveHeight(1),
    },
    nav_item_left: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    /* Selected icon badge — solid indigo, white glyph */
    nav_icon_active: {
      width: responsiveWidth(isTablet ? 3 : 3.8),
      height: responsiveWidth(isTablet ? 3 : 3.8),
      borderRadius: responsiveWidth(isTablet ? 1 : 1.3),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1),
    },

    nav_icon_inactive: {
      width: responsiveWidth(isTablet ? 3 : 3.8),
      height: responsiveWidth(isTablet ? 3 : 3.8),
      borderRadius: responsiveWidth(isTablet ? 1 : 1.3),
      backgroundColor: PURPLE_LIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1),
    },
    /* Delete icon badge — light pink/red, red glyph */
    nav_icon_danger: {
      width: responsiveWidth(isTablet ? 3 : 3.8),
      height: responsiveWidth(isTablet ? 3 : 3.8),
      borderRadius: responsiveWidth(isTablet ? 1 : 1.3),
      backgroundColor: DANGER_LIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1.2),
    },

    /* Selected label text */
    nav_item_active_text: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.regular,
      color: theme.primary,
    },
    /* Unselected label text */
    nav_item_text_inactive: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.regular,
      color: theme.primary,
    },
    /* Delete Profile label (always red) */
    nav_item_text: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.regular,
      color: DANGER,
    },
    chevron_color: {
      color: CHEVRON,
    },

    /* "Your Data is Safe" — nested block inside sidebar_card */
    safe_card: {
      backgroundColor: PURPLE_LIGHT,
      borderRadius: responsiveWidth(1),
      alignItems: 'center',
      paddingHorizontal: responsiveWidth(isTablet ? 1 : 4),
      paddingVertical: responsiveHeight(1),
      marginHorizontal: responsiveWidth(isTablet ? 1.6 : 3),
    },
    safe_icon_wrap: {
      width: responsiveWidth(isTablet ? 10 : 16),
      height: responsiveHeight(isTablet ? 10 : 16),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveHeight(1),
    },
    safe_logo_image: {
      width: '100%',
      height: '100%',
    },
    safe_title: {

      fontSize: responsiveFontSize(1.3),
      fontFamily: Inter.semibold,
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(0.8),
    },
    safe_subtitle: {
      fontSize: responsiveFontSize(0.8),
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,

    },

    /* RIGHT CONTENT */
    inner_right: {
      width: isTablet ? '74%' : '100%',
      marginLeft: isTablet ? responsiveWidth(1.5) : 0,
    },
    form_card: {
      backgroundColor: Colors.white,
      borderRadius: responsiveWidth(1.25),
      paddingHorizontal: responsiveWidth(isTablet ? 3 : 4),
      paddingVertical: responsiveHeight(2),
    },
    form_title: {
      fontSize: responsiveFontSize(isTablet ? 1.5 : 2),
      fontFamily: Inter.semibold,
      color: theme.fontColorOnBackground,
    },
    title_underline: {
      width: responsiveWidth(5),
      height: 5,
      backgroundColor: theme.primary,
      borderRadius: 2,
      marginTop: responsiveHeight(1),
      marginBottom: responsiveHeight(1.5),
    },
    form_subtitle: {
      fontSize: responsiveFontSize(0.9),
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(2),
    },
    field_label: {
      fontSize: responsiveFontSize(0.9),
      fontFamily: Inter.medium,
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(0.8),
    },
    input_wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: responsiveWidth(0.8),
      paddingHorizontal: responsiveWidth(1),
      marginBottom: responsiveHeight(2),
      backgroundColor: Colors.white,
    },
    input_icon_circle: {
      width: responsiveWidth(isTablet ? 3 : 3.6),
      height: responsiveWidth(isTablet ? 3 : 3.6),
      borderRadius: responsiveWidth(isTablet ? 1.5 : 1.8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    text_input: {
      flex: 1,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
      fontFamily: Inter.regular,
      paddingVertical: responsiveHeight(0.5),
    },

    button: {
      flexDirection: 'row',
      alignSelf: isTablet ? 'flex-start' : 'stretch',
      justifyContent: 'center',
      height: responsiveHeight(6.5),
      paddingHorizontal: responsiveWidth(2.5),
      backgroundColor: theme.primary,
      alignItems: 'center',
      borderRadius: responsiveWidth(2.5),
      marginTop: responsiveHeight(2),
    },
    button_disable: {
      flexDirection: 'row',
      alignSelf: isTablet ? 'flex-start' : 'stretch',
      justifyContent: 'center',
      height: responsiveHeight(6.5),
      paddingHorizontal: responsiveWidth(2),
      backgroundColor: Colors.grey || '#D1D5DB',
      alignItems: 'center',
      borderRadius: responsiveWidth(2.5),
      marginTop: responsiveHeight(1),
    },

    button_text: {
      fontSize: responsiveFontSize(1.3),
      color: theme.fontColor,
      fontFamily: Inter.semibold,
    },
    /* Active/Selected Danger Nav Item */
    nav_item_active_danger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: DANGER_LIGHT, // Soft light red background
      borderWidth: 0,
      borderColor: DANGER,
      borderRadius: responsiveWidth(0.5),
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(1),
      marginBottom: responsiveHeight(1),
      width: isTablet ? '86%' : '89%',
      alignSelf: 'center',
    },

    /* Active Danger Icon Badge */
    nav_icon_active_danger: {
      width: responsiveWidth(isTablet ? 3 : 3.8),
      height: responsiveWidth(isTablet ? 3 : 3.8),
      borderRadius: responsiveWidth(isTablet ? 1 : 1.3),
      backgroundColor: DANGER, // Solid red badge
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1.2),
    },

    /* Active Danger Text Style */
    nav_item_active_danger_text: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.bold,
      color: DANGER,
    },
    avatar_edit_badge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: responsiveFontSize(2.4),
      height: responsiveFontSize(2.4),
      borderRadius: responsiveFontSize(1.2),
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
  });
};

export default Styles;