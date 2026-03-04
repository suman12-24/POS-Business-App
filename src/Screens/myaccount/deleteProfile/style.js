import { StyleSheet } from 'react-native';
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
  responsiveScreenHeight,
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
      flexDirection: 'row',
      paddingHorizontal: responsiveWidth(1),
      paddingVertical: responsiveHeight(2),
    },
    inner_left: {
      display: 'flex',
      width: '20%',
      backgroundColor: Colors.white,
    },
    inner_right: {
      display: 'flex',
      width: '76%',
      backgroundColor: '#F0F0F0',
      marginLeft: responsiveWidth(1.5),
      paddingVertical: responsiveHeight(1),
      height: responsiveScreenHeight(100),
    },
    button: {
      height: responsiveWidth(4),
      width: responsiveWidth(12),
      backgroundColor: Colors.buttonColor,
      alignItems: 'center',
      justifyContent: 'center',
      // alignSelf: "center",
      borderRadius: responsiveWidth(0.6),
      marginTop: responsiveHeight(3),
    },
    button_left: {
      height: responsiveWidth(4),
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    button_no: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.red,
      borderRadius: responsiveWidth(0.6),
    },
    button_yes: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.buttonColor,
      borderRadius: responsiveWidth(0.6),
    },
    button_no_disable: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.grey,
      borderRadius: responsiveWidth(0.6),
    },
    button_yes_disable: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.grey,
      borderRadius: responsiveWidth(0.6),
    },
  });
};
export default Styles;
