import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import {
    responsiveHeight,
    responsiveWidth,
    responsiveFontSize,
} from 'react-native-responsive-dimensions';



const Styles = (screenHeight) => {
    const SCREEN_HEIGHT = screenHeight || Dimensions.get('window').height;
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end',
        },
        container: {
            maxHeight: SCREEN_HEIGHT * 0.85,
            backgroundColor: '#fff',
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
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
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
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
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
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
            backgroundColor: Colors.buttonColor,
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
            overflow: 'hidden',
            marginBottom: 10,
            marginTop: 10,
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
        strikePrice: {
            textDecorationLine: 'line-through',
            color: '#999',
            fontSize: 13,
            fontFamily: Inter.regular,
        },
        currentPrice: {
            color: Colors.buttonColor,
            fontWeight: '700',
            fontSize: 16,
            fontFamily: Inter.bold,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: Colors.buttonColor,
        },
        footerTotalText: {
            color: '#fff',
            fontSize: 15,
            fontWeight: '700',
            fontFamily: Inter.bold,
        },
        qtyBoxFooter: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 12,
        },
        qtyControlBtnLight: {
            paddingHorizontal: 2,
        },
        qtyBtnDark: {
            fontSize: 18,
            color: '#000',
        },
        qtyTextFooter: {
            minWidth: 16,
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 14,
        },
        addBtnNew: {
            backgroundColor: '#fff',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
        },
        addTextNew: {
            color: Colors.buttonColor,
            fontWeight: '700',
            fontFamily: Inter.semiblod,
        },
    });
};

export default Styles;