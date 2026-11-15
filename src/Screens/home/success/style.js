import { StyleSheet } from 'react-native';
import { Inter } from '../../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

const INDIGO_LIGHT = '#F4F3FA';
const GREEN = '#4CAF50';       // success checkmark circle
const GREY_BORDER = '#EEF0F4';
const PAGE_BG = '#F7F7FB';

const Styles = (theme) => {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: PAGE_BG, position: 'relative' },
    main: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      paddingHorizontal: responsiveWidth(1.8),
      paddingTop: responsiveHeight(1),
    },
    loaderOverlay: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 1,
    },

    // ---------- Success block ----------
    successWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: responsiveHeight(1),
      marginBottom: responsiveHeight(1.5),
    },
    successCircle: {
      width: responsiveWidth(4.2),
      height: responsiveWidth(4.2),
      borderRadius: responsiveWidth(2.1),
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveHeight(0.6),
    },
    successTitle: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(1.5),
      color: theme.fontColorOnBackground,
      marginBottom: 2,
    },
    orderNumberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    orderNumberLabel: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.95),
      color: theme.fontColorOnBackground,
    },
    orderNumberValue: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(0.95),
      color: theme.primary,
    },
    successSubtitle: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.85),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
    },

    // ---------- Generic card ----------
    card: {
      backgroundColor: theme.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: GREY_BORDER,
      marginBottom: responsiveHeight(2),
      overflow: 'hidden',
      paddingBottom: responsiveHeight(2),

    },
    plainCardTitle: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(1.1),
      color: theme.fontColorOnBackground,
      paddingHorizontal: responsiveWidth(2),
      paddingTop: responsiveHeight(1),
      paddingBottom: responsiveHeight(0.5),
    },
    plainCardTitleWithBorder: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      paddingHorizontal: responsiveWidth(2),
      paddingTop: responsiveHeight(1),
      paddingBottom: responsiveHeight(0.8)
    },

    // ---------- Contact / Delivery dual cards ----------
    dualCardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: responsiveHeight(2),
    },
    dualCard: {
      width: '49%',
      backgroundColor: theme.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#F9F9FC',
      elevation: 1,
      overflow: 'hidden',
    },
    deliveryWrap: {
      flexDirection: 'row',
      paddingHorizontal: responsiveWidth(2),
      paddingBottom: responsiveHeight(1),
    },
    roundIconBadge: {
      width: responsiveWidth(3.6),
      height: responsiveWidth(3.6),
      borderRadius: responsiveWidth(1),
      backgroundColor: INDIGO_LIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1.6),
      marginTop: 2,
    },
    deliveryBoldLabel: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
      marginBottom: 1,
    },
    deliveryText: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
      lineHeight: responsiveFontSize(1.35),
    },

    // ---------- Order summary items ----------
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(2.2),

    },
    itemDivider: {
      height: 1,
      backgroundColor: GREY_BORDER,
      marginHorizontal: responsiveWidth(2.5), // gap from left/right
    },
    itemThumbWrap: {
      width: responsiveWidth(2.5),
      height: responsiveWidth(2.5),
      borderRadius: responsiveWidth(0.5),
      backgroundColor: INDIGO_LIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1.4),
      overflow: 'hidden',
    },
    itemThumbWrapEmpty: {
      backgroundColor: 'transparent',
    },
    itemThumb: { width: '100%', height: '100%' },
    qtyBadge: {
      width: responsiveWidth(1.5),
      height: responsiveWidth(1.5),
      borderRadius: responsiveWidth(0.5),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1.4),
      marginTop: 2,
    },
    qtyBadgeText: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.5),
      color: '#fff',
    },
    itemName: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
    },
    itemDetailText: {
      width: '85%',
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.8),
      color: theme.fontColorOnBackground,
      marginTop: 2,
    },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    itemPrice: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.95),
      color: theme.fontColorOnBackground,
      marginLeft: responsiveWidth(1),
    },

    // ---------- Totals ----------
    summaryDivider: {
      height: 1,
      backgroundColor: GREY_BORDER,
      marginTop: responsiveHeight(0.4),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: responsiveHeight(0.3),
      paddingHorizontal: responsiveWidth(2.2),
    },
    summaryLabel: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.9),
      color: '#374151',
    },
    summaryLabelNote: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.75),
      color: theme.fontColorOnBackground,
      marginTop: 1,
    },
    summaryValue: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: responsiveHeight(1),
      paddingHorizontal: responsiveWidth(2.2),
      marginTop: responsiveHeight(0.3),
    },
    totalLabel: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
    },
    totalValue: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(1.15),
      color: theme.fontColorOnBackground,
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: responsiveWidth(2.2),
      paddingTop: responsiveHeight(0.2),
    },
    paymentValue: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
      marginLeft: 4,
    },

    // ---------- Fixed bottom buttons ----------
    footerButtonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: responsiveHeight(1),
      paddingBottom: responsiveHeight(1.5),
      backgroundColor: PAGE_BG,
    },
    outlineButton: {
      height: responsiveHeight(6),
      paddingHorizontal: responsiveWidth(3),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(2),
      backgroundColor: theme.primary,
    },
    outlineButtonText: {
      fontFamily: Inter.bold,
      color: theme.fontColor,
      fontSize: responsiveFontSize(0.95),
    },
    button: {
      height: responsiveHeight(6),
      paddingHorizontal: responsiveWidth(3),
      backgroundColor: theme.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    buttonText: {
      fontFamily: Inter.bold,
      fontSize: responsiveFontSize(0.95),
      color: theme.fontColor,
    },
  });
};

export default Styles;