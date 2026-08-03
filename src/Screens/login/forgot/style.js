// LoginFormStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from '../../../Constants/Colors';
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
    Bg: {
      height: '100%',
      width: '100%',
      position: 'absolute',
    },

    button: {
      height: responsiveWidth(4.5),
      width: '100%',
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: responsiveWidth(2),
      borderRadius: responsiveWidth(0.6),
    },
    button_dis: {
      height: responsiveWidth(4.5),
      width: '100%',
      backgroundColor: Colors.grey,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: responsiveWidth(2),
      borderRadius: responsiveWidth(0.6),
    },
    main: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    main_inner: {
      backgroundColor: theme.background,
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
      elevation: 10,
      width: '45%',
      paddingHorizontal: 50,
      paddingVertical: 25,
      borderRadius: 20,
    },
  });
};
export default Styles;
