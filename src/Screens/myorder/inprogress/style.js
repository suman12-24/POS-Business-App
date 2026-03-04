import { StyleSheet } from 'react-native';
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
const Styles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
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
      width: responsiveWidth(15),
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
      backgroundColor: Colors.buttonColor,
      borderRadius: responsiveWidth(0.6),
    },
    button_Complete_disable: {
      height: responsiveWidth(4),
      width: responsiveWidth(14),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.grey,
      borderRadius: responsiveWidth(0.6),
    },
    button_accept: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.buttonColor,
      borderRadius: responsiveWidth(0.6),
    },
    button_reject: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.red,
      borderRadius: responsiveWidth(0.6),
    },
    button_accept_model: {
      height: responsiveWidth(4),
      width: responsiveWidth(16),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.buttonColor,
      borderRadius: responsiveWidth(0.6),
    },
    button_reject_model: {
      height: responsiveWidth(4),
      width: responsiveWidth(16),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.red,
      borderRadius: responsiveWidth(0.6),
    },
    button_view: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: responsiveWidth(2),
      marginTop: responsiveWidth(4),
    },

    warningh_txt: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.5),
    },
    subwarningh_txt: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.3),
      marginTop: responsiveHeight(4),
      textAlign: 'center',
      maxWidth: '70%',
    },
    modalbutton: {
      width: '40%',
      height: responsiveHeight(6),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: responsiveWidth(0.6),
    },
    warningmodal: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: responsiveWidth(1),
      padding: responsiveWidth(2),
      alignItems: 'center',
    },
    mbtton_txt: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.5),
      color: '#fff',
    },
  });
};
export default Styles;
