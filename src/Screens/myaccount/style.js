import {StyleSheet} from 'react-native';
import {Colors} from '../../Constants/Colors';
import {Inter} from '../../Constants/Fonts';
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
      backgroundColor: Colors.green,
      alignItems: 'center',
      justifyContent: 'center',
      // alignSelf: "center",
      borderRadius: 10,
      marginTop: responsiveHeight(3),
    },
    button_left: {
      height: responsiveWidth(4),
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
  });
};
export default Styles;
