import { StyleSheet } from 'react-native';
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

const PURPLE = Colors.buttonColor || '#7C3AED';
const PURPLE_LIGHT = '#EAE8F6';
const PURPLE_DARK = '#2916A1';
const DANGER = '#EF4444';
const DANGER_LIGHT = '#FFE1DF';
const TEXT_DARK = '#1F1B2E';
const TEXT_MUTED = '#6B7280';
const CHEVRON = '#B9B8CC';
const BORDER = '#E6E6EF';

const StylesDelete = (isTablet = true) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor || '#F5F5FA',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: responsiveHeight(4),
    },
    main: {
      flexDirection: isTablet ? 'row' : 'column',
      paddingHorizontal: responsiveWidth(isTablet ? 1.3 : 3),
      paddingVertical: responsiveHeight(1),
    },

    /* LEFT SIDEBAR — identical structure/tokens to MyAccount.js */
    inner_left: {
      width: isTablet ? '26%' : '100%',
      marginBottom: isTablet ? 0 : responsiveHeight(2),
    },
    sidebar_card: {
      backgroundColor: Colors.white,
      borderRadius: responsiveWidth(3),
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
      width: responsiveWidth(isTablet ? 7 : 18),
      height: responsiveWidth(isTablet ? 7 : 18),
      borderRadius: responsiveWidth(isTablet ? 3.5 : 9),
      backgroundColor: PURPLE_LIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginBottom: responsiveHeight(1.2),
    },
    avatar_image: {
      width: '100%',
      height: '100%',
    },
    sidebar_title: {
      fontSize: responsiveFontSize(isTablet ? 1.5 : 2),
      fontFamily: Inter.bold,
      color: TEXT_DARK,
      marginBottom: responsiveHeight(0.3),
    },
    sidebar_email: {
      fontSize: responsiveFontSize(1),
      fontFamily: Inter.regular,
      color: TEXT_MUTED,
      marginBottom: responsiveHeight(0.8),
    },
    sidebar_subtitle: {
      fontSize: responsiveFontSize(1),
      fontFamily: Inter.regular,
      color: TEXT_MUTED,
      textAlign: 'center',
      marginBottom: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(isTablet ? 0.5 : 3),
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
    nav_icon_active: {
      width: responsiveWidth(isTablet ? 3 : 3.8),
      height: responsiveWidth(isTablet ? 3 : 3.8),
      borderRadius: responsiveWidth(isTablet ? 1 : 1.3),
      backgroundColor: PURPLE_DARK,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1),
    },
    nav_item_active_text: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.regular,
      color: PURPLE,
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
    nav_item_text_inactive: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.regular,
      color: PURPLE,
    },
    /* kept for compatibility if referenced elsewhere */
    nav_item_text: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.regular,
      color: TEXT_DARK,
    },
    chevron_color: {
      color: CHEVRON,
    },

    /* Active (danger) nav item — Delete Profile, highlighted on this page */
    nav_item_active_danger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: DANGER_LIGHT,
      borderWidth: 0,
      borderRadius: responsiveWidth(0.5),
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(1),
      marginBottom: responsiveHeight(1),
      width: isTablet ? '86%' : '89%',
      alignSelf: 'center',
    },
    nav_icon_danger_active: {
      width: responsiveWidth(isTablet ? 3 : 3.8),
      height: responsiveWidth(isTablet ? 3 : 3.8),
      borderRadius: responsiveWidth(isTablet ? 1 : 1.3),
      backgroundColor: DANGER,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1),
    },
    nav_item_active_danger_text: {
      fontSize: responsiveFontSize(0.85),
      fontFamily: Inter.medium,
      fontWeight: 'bold',
      color: DANGER,
    },

    /* "Your Data is Safe" nested block — same as MyAccount.js */
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
      height: responsiveWidth(isTablet ? 10 : 16),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveHeight(1),
    },
    safe_logo_image: {
      width: '100%',
      height: '100%',
    },
    safe_title: {
      fontSize: responsiveFontSize(1.5),
      fontFamily: Inter.medium,
      fontWeight: 'bold',
      color: TEXT_DARK,
      marginBottom: responsiveHeight(0.8),
    },
    safe_subtitle: {
      fontSize: responsiveFontSize(1),
      fontFamily: Inter.regular,
      color: TEXT_MUTED,
    },

    /* RIGHT CONTENT — confirmation card */
    inner_right: {
      backgroundColor: Colors.white,
      width: isTablet ? '74%' : '100%',
      marginLeft: isTablet ? responsiveWidth(1.5) : 0,
      alignItems: isTablet ? 'flex-start' : 'stretch',
      justifyContent: isTablet ? 'center' : 'flex-start',
      minHeight: isTablet ? responsiveHeight(70) : undefined,
      borderRadius: isTablet ? responsiveWidth(2.5) : 2,
    },
    confirm_card: {
      backgroundColor: Colors.white,
      borderRadius: responsiveWidth(2),
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
      paddingHorizontal: responsiveWidth(3),
      paddingVertical: responsiveHeight(3),
      alignItems: 'center',
      alignSelf: isTablet ? 'center' : 'stretch',
      width: isTablet ? responsiveWidth(40) : '100%',
      marginTop: isTablet ? 0 : responsiveHeight(2),
    },
    warning_icon_circle: {
      width: responsiveWidth(isTablet ? 8 : 18),
      height: responsiveWidth(isTablet ? 8 : 18),
      borderRadius: responsiveWidth(isTablet ? 4 : 9),
      backgroundColor: DANGER_LIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveHeight(2),
    },
    confirm_title: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(2.5),
      color: TEXT_DARK,
      marginBottom: responsiveHeight(0.75),
      textAlign: 'center',
    },
    confirm_subtitle: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.6),
      color: TEXT_MUTED,
      textAlign: 'center',
      marginBottom: responsiveHeight(2.5),
    },
    confirm_button_row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: responsiveWidth(1.5),
    },
    button_no: {
      flexDirection: 'row',
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(4),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: PURPLE,
      borderRadius: responsiveWidth(3),
    },
    button_yes: {
      flexDirection: 'row',
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(3),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: DANGER,
      borderRadius: responsiveWidth(3),
    },
    button_no_disable: {
      flexDirection: 'row',
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(4),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: responsiveWidth(3),
      opacity: 0.5,
    },
    button_yes_disable: {
      flexDirection: 'row',
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(3),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: DANGER,
      borderRadius: responsiveWidth(3),
      opacity: 0.5,
    },
    button_no_text: {
      fontSize: responsiveFontSize(1.75),
      color: PURPLE,
      fontFamily: Inter.medium,
      fontWeight: 'bold',
    },
    button_yes_text: {
      fontSize: responsiveFontSize(1.75),
      color: Colors.white,
      fontFamily: Inter.medium,
      fontWeight: 'bold',
    },
    button_yes_disable_text: {
      fontSize: responsiveFontSize(1.75),
      color: Colors.white,
      fontFamily: Inter.medium,
      fontWeight: 'bold',
    },
  });
};
export default StylesDelete;