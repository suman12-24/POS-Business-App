import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const Styles = () => {
  return StyleSheet.create({
    /*button:{
      height: responsiveWidth(4),
      width: "96%",
      backgroundColor: Colors.green,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 10,
      
    },
    radioButton: {
            
    },
    checkbox: {
      alignSelf: 'center',
      
    },

    add_button:{
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      backgroundColor: Colors.blue,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 10,
    }*/

    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    container: {
      height: SCREEN_HEIGHT * 0.88,
      backgroundColor: '#fff',
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      // padding: 16,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { fontSize: 16, fontWeight: '600', fontFamily: Inter.bold },
    close: { fontSize: 18 },

    optionBlock: {
      marginTop: 14,
    },
    optionErrorBorder: {
      borderWidth: 1,
      borderColor: 'red',
      borderRadius: 6,
      padding: 6,
      marginHorizontal: 4,
    },

    optionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 10,
      fontFamily: Inter.regular,
    },
    optionTitlebox: {
      alignItems: 'center',
      gap: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
      marginRight: 7,
      fontFamily: Inter.regular,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '700',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
      fontFamily: Inter.blod,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },

    radio: {
      width: 18,
      height: 18,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#999',
      marginRight: 8,
    },
    radioSelected: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },

    checkbox: {
      width: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#999',
      marginRight: 8,
    },
    checkboxChecked: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },

    choiceText: { fontSize: 14, fontFamily: Inter.regular },

    qtyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingRight: 16,
    },
    qtyBtn: { fontSize: 18, paddingHorizontal: 4, color: '#fff' },
    qtyText: { minWidth: 20, textAlign: 'center' },

    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    total: { fontSize: 15, fontWeight: '600' },
    addBtn: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      flexDirection: 'row',
      width: '60%',
      gap: 20,
      justifyContent: 'space-between',
    },
    addText: {
      color: '#fff',
      fontWeight: '600',
      fontFamily: Inter.semiblod,
    },
    stickyHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      backgroundColor: '#fff',
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderBottomWidth: 0.5,
      borderColor: '#ddd',
      backgroundColor: '#fff', // keep solid
      zIndex: 100, // stronger stacking
      elevation: 10, // Android stacking fix
    },

    stickyTitle: {
      fontSize: 15,
      fontWeight: '600',
    },

    imageBox: {
      height: '100%',
      borderRadius: 12,
      // overflow: 'hidden',
      marginBottom: 10,
      marginTop: 12,
      paddingHorizontal: 16,
      position: 'relative',
    },

    fakeImage: {
      backgroundColor: '#eee',
      flex: 1,
      borderRadius: 12,
    },

    imageClose: {
      position: 'absolute',
      top: 15,
      right: 20,
      backgroundColor: '#fff',
      borderRadius: 16,
      // padding: 6,
      height: 30,
      width: 30,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 11,
      zIndex: 200,
    },
    divider: {
      width: '100%',
      height: 4,
      backgroundColor: '#ddd',
    },
  });
};

export default Styles;
