import { StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
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
    //drop down
    dropdown: {
      //margin: 16,
      marginTop: 16,
      height: 50,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,

      elevation: 2,
    },
    icon: {
      marginRight: 5,
    },
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedItem: {
      backgroundColor: '#f0f0ff',
    },
    textItem: {
      flex: 1,
      fontSize: 16,
    },
    selectedText: {
      fontWeight: '600',
      color: theme.primary,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    addbox: {
      width: '85%',
      paddingHorizontal: 14,
      paddingVertical: 30,
      backgroundColor: theme.background,
      top: '20%',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 15,
    },
    wrapper: {
      width: '100%',
      position: 'relative',
    },
    drop: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      borderColor: '#CCCCCC',
      borderWidth: 1,
      borderRadius: 25,
      position: 'relative',
      zIndex: 1,
      maxHeight: 160,
      backgroundColor: '#fff',
    },
    droplist: {
      position: 'absolute',
      top: '100%',
      marginTop: 4,
      padding: 10,
      backgroundColor: '#f5f5f5',
      width: '100%',
      zIndex: 1,
      height: 130,
      paddingBottom: 60,
      borderRadius: 10,
    },
    dropItem: {
      paddingVertical: 4,
      paddingHorizontal: 3,
      fontFamily: Inter.medium,
    },
    placeholder: {
      fontFamily: Inter.medium,
      color: '#888888',
    },
    butt: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 15,
    },
    modalbutt: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: Colors.buttonColor,
    },
    modalbutt2: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: '#333333',
    },
  });
};
export default Styles;
