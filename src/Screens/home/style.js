import { StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
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
      minHeight: '100%',
      flexDirection: 'row',
      paddingHorizontal: responsiveWidth(2),
      paddingVertical: responsiveHeight(2),
    },
    inner_left: {
      display: 'flex',
      width: '65%',
    },
    inner_right: {
      display: 'flex',
      width: '33.5%',
      marginLeft: responsiveWidth(1.5),
    },
    button: {
      height: responsiveWidth(4),
      width: '96%',
      backgroundColor: Colors.buttonColor,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: responsiveWidth(0.6),
    },
    radioButton: {},
    checkbox: {
      alignSelf: 'center',
    },
    add_button: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      backgroundColor: Colors.buttonColor,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: responsiveWidth(0.6),
    },
    searchContainer: {
      height: responsiveWidth(5),
      padding: responsiveWidth(3),
      borderWidth: 0.9,
      borderColor: '#CCCCCC',
      borderRadius: responsiveWidth(17),
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: responsiveWidth(5),
    },
    searchInput: {
      height: responsiveWidth(5),
      padding: responsiveWidth(5),
      position: 'relative',
      color: '#000',
    },
    /*upload model*/
    upload_modal_main: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0,0,0.5)',
      position: 'relative',
    },
    upload_modal_inner_modalView: {
      width: responsiveWidth(60),
      height: responsiveHeight(70),
      padding: responsiveWidth(2),
      backgroundColor: 'white',
      borderRadius: responsiveWidth(2),
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: responsiveWidth(5),
      paddingTop: responsiveHeight(1),
    },
    upload_modal_header: {
      fontSize: responsiveFontSize(3),
      color: '#000',
      fontWeight: '500',
      borderBottomWidth: 2,
    },
    upload_modal_view: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },

    Button_choose: {
      height: responsiveHeight(5),
      width: responsiveWidth(70),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: responsiveWidth(0.6),
      backgroundColor: '#FFFFFF',
      borderWidth: responsiveWidth(0.5),
      paddingHorizontal: responsiveWidth(2),
    },
    check_logo: {
      height: responsiveWidth(6),
      width: responsiveWidth(6),
    },
    button_sty: {
      width: responsiveWidth(30),
      height: responsiveHeight(10),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: responsiveWidth(0.6),
      alignSelf: 'center',
      marginTop: responsiveHeight(1),
      marginBottom: responsiveHeight(1),
    },
    button_txt: {
      textAlign: 'center',
      fontSize: responsiveFontSize(2),
      fontFamily: Inter.regular,
    },
  });
};
export default Styles;
