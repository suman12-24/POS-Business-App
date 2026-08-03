// LoginFormStyles.js

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../Constants/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { Inter } from '../../Constants/Fonts';

const BRAND = {
  indigo: '#3B2FA0',
  textDark: '#1F1F29',
  inputBorder: '#E4E4EC',
  inputBg: '#FFFFFF',
};


const Styles = (theme) => {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      position: 'relative',
    },
    Bg: {
      height: '100%',
      width: '100%',
      position: 'absolute',
    },

    main: {
      flex: 1,
      width: '100%',

    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(4),
    },

    // Larger card: bigger width, more generous padding
    main_inner: {
      backgroundColor: theme.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 12,
      width: isLandscape ? '50%' : '92%',
      minWidth: 340,
      maxWidth: 560,
      paddingHorizontal: responsiveWidth(2),
      paddingVertical: responsiveHeight(2),
      borderRadius: 10,
      alignItems: 'center',
    },

    // ---- Logo (now an image) ----
    logoWrap: {
      width: '100%',
      alignItems: 'center',
      marginBottom: responsiveHeight(1),
    },
    logoImage: {
      width: responsiveWidth(20),
      height: responsiveHeight(10),
    },

    // ---- Heading ----
    welcomeText: {
      fontSize: responsiveFontSize(1.8),
      color: theme.fontColorOnBackground,
      fontFamily: Inter.regular,
      marginBottom: responsiveHeight(1.8),
      textAlign: 'center',
    },

    // ---- Form ----
    formWrap: {
      width: '80%',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: BRAND.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: responsiveHeight(6.8),
      marginBottom: responsiveHeight(1.8),
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      fontFamily: Inter.regular,
      padding: 0,
    },
    eyeIcon: {
      paddingLeft: 8,
    },

    // ---- Button ----
    button: {
      height: responsiveHeight(6.5),
      width: '100%',
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: responsiveHeight(1),
      borderRadius: 7,
    },
    button_dis: {
      height: responsiveHeight(6.5),
      width: '100%',
      backgroundColor: Colors.grey,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: responsiveHeight(1),
      borderRadius: 7,
    },
    buttonText: {
      fontWeight: '600',
      letterSpacing: 1,
      fontSize: responsiveFontSize(1),
      color: theme.fontColor,
      fontFamily: Inter.medium,
    },
    buttonTextDis: {
      fontWeight: '600',
      letterSpacing: 1,
      fontSize: responsiveFontSize(1),
      color: theme.fontColor,
      fontFamily: Inter.medium,
    },

    // ---- Forgot password link ----
    forgotText: {
      fontSize: responsiveFontSize(1),
      color: theme.primary,
      fontFamily: Inter.regular,
      paddingTop: responsiveHeight(2.2),
      textAlign: 'center',
    },
  });
};

export default Styles;