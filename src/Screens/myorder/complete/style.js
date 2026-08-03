import { StyleSheet } from 'react-native';
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
const Styles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      position: 'relative',
    },
    main: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      paddingHorizontal: responsiveWidth(2),
      paddingVertical: responsiveHeight(2),
    },
    tab_button: {
      height: responsiveWidth(4),
      width: responsiveWidth(13),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    button_Complete: {
      height: responsiveWidth(4),
      width: responsiveWidth(14),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: theme.primary,
      borderRadius: responsiveWidth(0.6),
    },
    button_accept: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: theme.primary,
      borderRadius: responsiveWidth(0.6),
    },
    button_reject: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: theme.cancelButton,
      borderRadius: responsiveWidth(0.6),
    },
    button_accept_model: {
      height: responsiveWidth(4),
      width: responsiveWidth(16),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: theme.primary,
      borderRadius: responsiveWidth(0.6),
    },
    button_reject_model: {
      height: responsiveWidth(4),
      width: responsiveWidth(16),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: theme.cancelButton,
      borderRadius: responsiveWidth(0.6),
    },
  });
};
export default Styles;
