import { StyleSheet, Dimensions } from 'react-native';
import { Inter } from '../../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

const Styles = (screenHeight, theme) => {
  const SCREEN_HEIGHT = screenHeight || Dimensions.get('window').height;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'center',
    },
    container: {
      maxHeight: SCREEN_HEIGHT * 0.87,
      backgroundColor: theme.background,
      borderRadius: 14,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { fontSize: 16, fontWeight: '600', fontFamily: Inter.bold },
    close: { fontSize: 18 },

    fixedImageWrapper: {
      width: '100%',
      paddingTop: 10,
      paddingBottom: 4,
      backgroundColor: theme.background,
    },

    imageBox: {
      height: 250,
      //borderRadius: 12,
      overflow: 'hidden',
      // paddingHorizontal: 16,
      position: 'relative',
    },

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
      backgroundColor: theme.primary,
      borderColor: theme.primary,
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
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    choiceText: { fontSize: 14, fontFamily: Inter.regular },

    qtyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingRight: 16,
    },
    qtyBtn: { fontSize: 18, paddingHorizontal: 4, color: theme.fontColor },
    qtyText: { minWidth: 20, textAlign: 'center' },

    stickyHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      backgroundColor: theme.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderBottomWidth: 0.5,
      borderColor: '#ddd',
      zIndex: 100,
      elevation: 10,
    },

    stickyTitle: {
      fontSize: 15,
      fontWeight: '600',
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
      borderRadius: 16,
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
      color: theme.primary,
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
      backgroundColor: theme.primary,
    },
    footerTotalText: {
      color: theme.fontColor,
      fontSize: 15,
      fontWeight: '700',
      fontFamily: Inter.bold,
    },
    qtyBoxFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 8,
      overflow: 'hidden', // Ensures inner sections conform to rounded corners
      height: 36,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    qtyBtnSide: {
      width: 36,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyBtnDisabled: {
      backgroundColor: '#EAEAEA', // Light gray background when disabled
    },
    qtyBtnEnabled: {
      backgroundColor: theme.background,
    },
    qtySymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000',
      textAlign: 'center',
    },
    qtySymbolDisabled: {
      color: '#A0AEC0', // Muted gray symbol when min quantity is reached
    },
    qtyCenterBox: {
      height: '100%',
      paddingHorizontal: 16,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 40,
    },
    qtyTextFooter: {
      color: theme.fontColor,
      fontWeight: '700',
      fontSize: 16,
      textAlign: 'center',
      fontFamily: Inter.bold,
    },
    addBtnNew: {
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    addTextNew: {
      color: theme.primary,
      fontSize: 16,
      fontFamily: Inter.semibold,
    },
    // Add these inside Styles.js
    sectionCard: {
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 10,
      marginHorizontal: 16,
      marginTop: 14,
      overflow: 'hidden',
      backgroundColor: theme.background,
    },
    sectionHeaderBand: {
      backgroundColor: '#EAEAEA',
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionHeaderTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.fontColorOnBackground,
      fontFamily: Inter.bold,
    },
    commentInput: {
      height: 80,
      textAlignVertical: 'top',
      padding: 12,
      fontSize: 14,
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,
    },
  });
};

export default Styles;