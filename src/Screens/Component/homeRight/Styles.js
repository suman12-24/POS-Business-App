import { StyleSheet } from 'react-native';
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const AccentSoft = '#EDE9FE';
const BorderSoft = '#DEDEDE';
const DeleteRed = '#E24C4C';

const Styles = (theme = {}) => {
  return StyleSheet.create({
    /* ---------- outer purple-bordered panel ---------- */
    purpleBox: {
      flex: 1,
      width: '100%',
      borderWidth: 0.9,
      borderColor: theme.primary,
      borderRadius: responsiveWidth(1.4),
      paddingHorizontal: responsiveWidth(1.1),
      paddingVertical: responsiveHeight(1.4),
      backgroundColor: theme.background,
      overflow: 'hidden',
    },
    scrollContent: {
      paddingBottom: responsiveHeight(2),
    },
    // all header text styles
    headerText: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(1)
    },
    /* ---------- icon inputs (First Name / Last Name / Phone / Email / Address) ---------- */
    inputBlock: {
      marginBottom: responsiveHeight(1.5),
      width: '100%',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      minHeight: responsiveHeight(5.5),
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1),
      paddingHorizontal: responsiveWidth(1),
      backgroundColor: theme.background,
    },
    addressInputRow: {              // NEW — smaller height, just for the address field
      minHeight: responsiveHeight(4.2),
    },
    inputRowError: {
      borderColor: Colors.red,
    },
    inputIconWrap: {
      marginRight: responsiveWidth(1),
      flexShrink: 0,
    },
    inputField: {
      flex: 1,
      minWidth: 0,
      padding: 0,
      margin: 0,
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
    },
    errorText: {
      color: Colors.red,
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.05),
      marginTop: responsiveHeight(0.6),
      marginLeft: responsiveWidth(0.5),
    },

    /* ---------- discount coupon row ---------- */
    couponRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: responsiveHeight(0.5),
      width: '100%',
    },
    couponInputWrap: {
      flex: 1,
      marginRight: responsiveWidth(1),
    },
    applyBtn: {
      height: responsiveHeight(5.6),
      paddingHorizontal: responsiveWidth(1.6),
      borderRadius: responsiveWidth(0.8),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnDisabled: {
      height: responsiveHeight(5.6),
      paddingHorizontal: responsiveWidth(1.6),
      borderRadius: responsiveWidth(1),
      backgroundColor: '#E3E3EA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnText: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColor,
    },
    applyBtnTextDisabled: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
    },

    /* ---------- estimate-time dropdown wrapper (kept, just spaced) ---------- */
    dropdownBlock: {
      marginBottom: responsiveHeight(1),
      width: '100%',
    },
    dropdown: {
      height: responsiveHeight(5.6),
      backgroundColor: theme.background,
      borderRadius: responsiveWidth(1),
      borderWidth: 1,
      borderColor: BorderSoft,
      paddingHorizontal: responsiveWidth(1),
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
      backgroundColor: AccentSoft,
    },
    textItem: {
      flex: 1,
      fontSize: 16,
      fontFamily: Inter.regular,
    },
    selectedText: {
      fontFamily: Inter.semibold,
      color: theme.primary,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    placeholderStyle: {
      fontSize: responsiveFontSize(0.9),
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,
      paddingLeft: responsiveWidth(0.9),
    },
    selectedTextStyle: {
      fontSize: responsiveFontSize(1),
      fontFamily: Inter.regular,
      color: theme.fontColorOnBackground,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    /* ---------- phone lookup dropdown menu ---------- */
    phoneMenu: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1),
      marginTop: responsiveHeight(0.5),
      maxHeight: responsiveHeight(25),
      overflow: 'hidden',
      position: 'absolute',
      top: '100%',
      zIndex: 999,
      elevation: 3,
      width: '100%',
    },

    /* ---------- preorder/pickup toggle ---------- */
    orderModeBlock: {
      width: '100%',
      marginBottom: responsiveHeight(1),
    },
    orderModeBtn: {
      width: '100%',
      height: responsiveHeight(5),
      borderRadius: responsiveWidth(1),
      borderWidth: 0.9,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: responsiveHeight(0.5),
      marginBottom: responsiveHeight(0.8),
      elevation: 1,
      backgroundColor: theme.background,
      elevation: 3,
      shadowColor: "#000",
    },
    orderModeBtnText: {
      fontSize: responsiveFontSize(0.95),
      color: theme.fontColorOnBackground,
      fontFamily: Inter.medium
    },

    orderModePickupLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    orderModePickupEditIcon: {
      marginLeft: responsiveWidth(0.7),
    },

    /* ---------- preorder selection summary bar ---------- */
    preorderSummaryBar: {
      position: 'relative',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1),
      paddingHorizontal: responsiveWidth(1.4),
      paddingVertical: responsiveHeight(1.2),
      marginBottom: responsiveHeight(0.8),
      marginTop: responsiveHeight(0.5),
    },
    preorderSummaryCloseBadge: {
      position: 'absolute',
      top: -responsiveHeight(1.1),
      right: responsiveWidth(0.001),
      width: responsiveHeight(3),
      height: responsiveHeight(3),
      borderRadius: responsiveHeight(1.5),
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: BorderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    preorderSummaryTitle: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.1),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
    },
    preorderSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: responsiveHeight(0.6),
    },
    preorderSummaryLabel: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.1),
      color: theme.fontColorOnBackground,
      marginHorizontal: responsiveWidth(1),
    },
    preorderSummaryDateValue: {
      fontFamily: Inter.semibold,
      color: theme.primary,
    },
    preorderSummaryTimeValue: {
      fontFamily: Inter.semibold,
      color: theme.fontColorOnBackground,
    },

    /* ---------- date/time picker modal ---------- */
    pickerModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(20,10,50,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerModalCard: {
      width: responsiveWidth(46),
      maxHeight: responsiveHeight(80),
      backgroundColor: theme.background,
      borderRadius: responsiveWidth(2),
      paddingHorizontal: responsiveWidth(1.6),
      paddingTop: responsiveHeight(2.5),
      paddingBottom: responsiveHeight(1.6),
    },
    pickerModalCloseBtn: {
      position: 'absolute',
      top: responsiveHeight(1.4),
      left: responsiveWidth(1.4),
      width: responsiveHeight(4),
      height: responsiveHeight(4),
      borderRadius: responsiveHeight(2),
      borderWidth: 1,
      borderColor: BorderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    pickerModalTitle: {
      textAlign: 'center',
      fontSize: responsiveFontSize(1.9),
    },
    pickerModalTitleAccentDark: {
      fontFamily: Inter.semibold,
      color: theme.primary,
    },
    pickerModalTitleAccentOrange: {
      fontFamily: Inter.semibold,
      color: '#E08A2E',
    },
    pickerModalSubtitle: {
      textAlign: 'center',
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.15),
      color: theme.fontColorOnBackground,
      marginTop: responsiveHeight(0.6),
    },
    pickerModalUnderline: {
      alignSelf: 'center',
      width: responsiveWidth(6),
      height: 2,
      backgroundColor: theme.primary,
      marginTop: responsiveHeight(0.8),
      marginBottom: responsiveHeight(1.6),
      borderRadius: 2,
    },
    pickerModalList: {
      maxHeight: responsiveHeight(55),
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1),
      paddingVertical: responsiveHeight(1.3),
      paddingHorizontal: responsiveWidth(1),
      marginBottom: responsiveHeight(0.8),
    },
    pickerRowSelected: {
      backgroundColor: AccentSoft,
      borderColor: AccentSoft,
    },
    pickerRowIconWrap: {
      marginRight: responsiveWidth(1),
    },
    pickerRowMiddle: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pickerRowDateText: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColorOnBackground,
      marginRight: responsiveWidth(0.8),
    },
    pickerRowTimeText: {
      flex: 1,
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColorOnBackground,
    },
    pickerTodayBadge: {
      borderRadius: responsiveWidth(2),
      paddingHorizontal: responsiveWidth(0.7),
      paddingVertical: responsiveHeight(0.1),
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    pickerTodayBadgeText: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(0.95),
      color: theme.primary,
    },
    pickerRowWeekday: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.1),
      color: theme.primary,
      marginRight: responsiveWidth(0.6),
    },
    pickerRowWeekdaySunday: {
      color: '#E08A2E',
    },
    pickerCheckBadge: {
      width: responsiveHeight(2.6),
      height: responsiveHeight(2.6),
      borderRadius: responsiveHeight(1.3),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerNoticeBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF4E9',
      borderRadius: responsiveWidth(1),
      paddingHorizontal: responsiveWidth(1),
      paddingVertical: responsiveHeight(1),
      marginTop: responsiveHeight(1.2),
    },
    pickerNoticeText: {
      flex: 1,
      marginLeft: responsiveWidth(0.8),
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.05),
      color: theme.fontColorOnBackground,
    },
    pickerNoticeTextAccent: {
      fontFamily: Inter.medium,
      color: '#E08A2E',
    },

    /* ---------- cart item card (redesigned) ---------- */
    cartItemCard: {
      flexDirection: 'column',
      borderWidth: 1,
      borderColor: '#EDECF7',
      borderRadius: responsiveWidth(1),
      padding: responsiveWidth(1),
      marginBottom: responsiveHeight(2),
      backgroundColor: theme.background,
    },
    cartItemTopSection: {        // NEW — holds image + text side by side
      flexDirection: 'row',
    },
    cartItemImageWrap: {
      width: responsiveWidth(3.6),
      height: responsiveWidth(3.6),
      borderRadius: responsiveWidth(0.8),
      overflow: 'hidden',
      backgroundColor: '#F5F5FA',
      marginRight: responsiveWidth(1),
      flexShrink: 0,
    },
    cartItemImage: {
      width: '100%',
      height: '100%',
    },
    cartItemBody: {
      flex: 1,
      minWidth: 0,
    },
    cartItemTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    cartItemName: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColorOnBackground,
      flexShrink: 1,
      flex: 1,
    },
    cartItemNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      paddingRight: responsiveWidth(0.5),
    },
    cartItemQtyBadge: {
      width: responsiveHeight(3),
      height: responsiveHeight(3),
      borderRadius: responsiveWidth(0.5),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      right: responsiveWidth(0.5),
    },
    cartItemQtyBadgeText: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.8),
      color: theme.fontColor,
    },
    cartItemPrice: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColorOnBackground,
      flexShrink: 0,
    },
    cartItemCategory: {
      width: '80%',
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      marginTop: responsiveHeight(0.2),
    },
    cartItemNoteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      marginTop: responsiveHeight(0.8),
    },
    cartItemNoteIcon: {
      marginRight: responsiveWidth(0.5),
      marginTop: responsiveHeight(0.15),
    },
    cartItemNoteText: {
      flex: 1,
      fontFamily: Inter.regular,
      fontStyle: 'italic',
      fontSize: responsiveFontSize(1.05),
      color: theme.fontColorOnBackground,
    },
    cartItemNoteEditRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      width: '100%',
      marginTop: responsiveHeight(0.8),
      justifyContent: "space-between"
    },
    cartItemNoteInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(0.8),
      paddingHorizontal: responsiveWidth(0.8),
      paddingVertical: responsiveHeight(0.5),
      fontFamily: Inter.regular,
      fontStyle: 'italic',
      fontSize: responsiveFontSize(1.05),
      color: theme.fontColorOnBackground,
      minHeight: responsiveHeight(3.6),
      maxHeight: responsiveHeight(8),
      textAlignVertical: 'top',
    },
    cartItemNoteSaveBtn: {
      width: responsiveHeight(4.8),
      height: responsiveHeight(4.8),
      borderRadius: responsiveWidth(0.5),
      borderWidth: 1,
      borderColor: BorderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: responsiveWidth(0.5),
    },
    cartItemNotePlaceholder: {
      flex: 1,
      fontFamily: Inter.regular,
      fontStyle: 'italic',
      fontSize: responsiveFontSize(1.05),
      color: theme.fontColorOnBackground,
    },
    cartItemBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: responsiveHeight(1),
      width: '100%',
    },
    qtyStepper: {
      flexDirection: 'row',
      alignItems: 'stretch',
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(0.5),
      height: responsiveHeight(5),   // was 4.6 — taller, matches image
      overflow: 'hidden',
    },
    qtyStepperBtn: {
      paddingHorizontal: responsiveWidth(0.5),   // narrower
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyStepperValue: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColorOnBackground,
      minWidth: responsiveWidth(2.6),   // was 3
      textAlign: 'center',
      textAlignVertical: 'center',
      alignSelf: 'center',
      paddingHorizontal: responsiveWidth(0.9),  // was 1.2
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: BorderSoft,
    },
    deleteBtn: {
      width: responsiveHeight(5),
      height: responsiveHeight(5),
      borderRadius: responsiveWidth(0.5),
      borderWidth: 1,
      borderColor: '#F3D4D4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editBtn: {
      width: responsiveHeight(3.6),
      height: responsiveHeight(3.6),
      borderRadius: responsiveWidth(0.8),
      borderWidth: 1,
      borderColor: BorderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      // marginLeft: responsiveWidth(0.6),
    },

    /* ---------- fee breakdown (redesigned: plain, not a purple block) ---------- */
    feeBox: {
      marginTop: responsiveHeight(0.5),
      marginBottom: responsiveHeight(1.4),
      paddingTop: responsiveHeight(1),
      borderTopWidth: 1,
      borderTopColor: theme.fontColorOnBackground,
      borderStyle: 'dashed',
    },
    feeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: responsiveHeight(0.7),
    },
    feeLabel: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
    },
    feeValue: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
    },
    feeValueDiscount: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: DeleteRed,
    },
    totalDivider: {
      height: 1,
      backgroundColor: theme.fontColorOnBackground,
      marginVertical: responsiveHeight(0.8),
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1.1),
      color: theme.fontColorOnBackground,
    },
    totalValue: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1.1),
      color: theme.fontColorOnBackground,
    },

    /* ---------- notes textarea ---------- */
    notesBlock: {
      marginTop: responsiveHeight(2),
      marginBottom: responsiveHeight(1.4),
      width: '100%',
      position: 'relative',
    },
    notesInput: {
      width: '100%',
      minHeight: responsiveHeight(15),
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1),
      paddingHorizontal: responsiveWidth(1),
      paddingVertical: responsiveHeight(0.8),
      paddingBottom: responsiveHeight(3),
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColorOnBackground,
      textAlignVertical: 'top',
    },
    notesCounter: {
      position: 'absolute',
      right: responsiveWidth(2),
      bottom: responsiveHeight(0.8),
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      backgroundColor: 'transparent',
    },

    /* ---------- payment method cards ---------- */
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: responsiveHeight(0.5),
    },
    paymentCard: {
      width: '46%',
      minHeight: responsiveHeight(9),      // taller box so label wraps cleanly
      flexDirection: 'column',              // icon + label stack vertically now
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1.2),
      paddingVertical: responsiveHeight(1.6),
      paddingHorizontal: responsiveWidth(1),
      marginBottom: responsiveHeight(1),
      position: 'relative',
      backgroundColor: theme.background,
    },
    paymentCardSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.background,
    },
    paymentCardIconWrap: {
      marginBottom: responsiveHeight(0.6),   // was marginRight — icon sits above label now
    },
    paymentCardLabel: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
    },
    paymentCheckBadge: {
      position: 'absolute',
      top: responsiveHeight(0.7),           // now inside the card, not overflowing
      right: responsiveWidth(0.7),
      width: responsiveHeight(3),
      height: responsiveHeight(3),
      borderRadius: responsiveHeight(1.5),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* ---------- pay now / minimum-order buttons ---------- */
    button: {
      marginTop: responsiveHeight(1),
      height: responsiveHeight(6.2),
      width: '100%',
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: responsiveWidth(1.2),
    },
    button_disable: {
      height: responsiveHeight(6.2),
      width: '100%',
      backgroundColor: '#E3E3EA',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: responsiveWidth(1.2),
    },
    buttonText: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.3),
      color: theme.fontColor,
    },
    buttonTextDisabled: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.5),
      color: theme.fontColorOnBackground,
    },
    minimumFeeText: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.15),
      color: Colors.red,
      textAlign: 'center',
      paddingVertical: responsiveHeight(1),
    },

    /* ---------- empty cart state ---------- */
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: responsiveHeight(70),
    },
    emptyIconCircle: {
      alignItems: 'center',
      justifyContent: 'center',
      width: responsiveWidth(10),
      height: responsiveWidth(10),
      borderRadius: responsiveWidth(5),
      backgroundColor: AccentSoft,
    },
    emptyTitle: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1.5),
      color: theme.fontColorOnBackground,
      marginTop: responsiveHeight(2.5),
      textAlign: 'center',
    },
    emptySubtitle: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.3),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
      marginTop: responsiveHeight(1.2),
    },

    /* ---------- order type (Pickup) modal ---------- */
    orderTypeModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(20,10,50,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    orderTypeModalCard: {
      width: responsiveWidth(60),
      maxHeight: responsiveHeight(85),
      backgroundColor: theme.background,
      borderRadius: responsiveWidth(2),
      paddingHorizontal: responsiveWidth(2),
      paddingTop: responsiveHeight(2.5),
      paddingBottom: responsiveHeight(2),
    },
    orderTypeModalCloseBtn: {
      position: 'absolute',
      top: responsiveHeight(1.4),
      left: responsiveWidth(1.4),
      width: responsiveHeight(4),
      height: responsiveHeight(4),
      borderRadius: responsiveHeight(2),
      borderWidth: 1,
      borderColor: BorderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    orderTypeModalDivider: {
      height: 1,
      backgroundColor: BorderSoft,
      marginVertical: responsiveHeight(1.8),
    },
    serviceTypeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start', //
    },
    serviceTypeCard: {
      width: '22%',
      minWidth: responsiveWidth(9),
      borderRadius: responsiveWidth(1),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(0.4),
      marginHorizontal: responsiveWidth(1.5), // 
      marginBottom: responsiveHeight(1),
      position: 'relative',
      borderColor: BorderSoft,
      borderWidth: 1,
    },
    serviceTypeCardSelected: {
      borderColor: theme.primary,
      backgroundColor: AccentSoft,
    },
    serviceTypeCheckBadge: {
      position: 'absolute',
      top: responsiveHeight(1),
      right: responsiveWidth(1),
      width: responsiveHeight(2.2),
      height: responsiveHeight(2.2),
      borderRadius: responsiveHeight(1.1),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceTypeLabel: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1.05),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
    },
    serviceTypeSub: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.85),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
      marginTop: responsiveHeight(0.3),
    },
    timingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: responsiveHeight(2),
    },
    timingCard: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.2,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(1),
      paddingVertical: responsiveHeight(1.2),
      paddingHorizontal: responsiveWidth(0.8),
    },
    timingCardSelectedNow: {
      borderColor: theme.primary,
      backgroundColor: AccentSoft,
    },
    timingCardSelectedLater: {
      borderColor: theme.secondary,
      backgroundColor: '#FFF4E9',
    },
    timingIconWrapNow: {
      width: responsiveHeight(3.4),
      height: responsiveHeight(3.4),
      borderRadius: responsiveHeight(1.7),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(0.8),
    },
    timingIconWrapLater: {
      width: responsiveHeight(3.4),
      height: responsiveHeight(3.4),
      borderRadius: responsiveHeight(1.7),
      backgroundColor: theme.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(0.8),
    },
    timingLabel: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1.15),
      color: theme.fontColorOnBackground,
    },
    timingSub: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground,
    },
    orderTypeConfirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: responsiveHeight(6),
      borderRadius: responsiveHeight(3),
    },
    orderTypeConfirmBtnText: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1.2),
      color: theme.fontColor,
      marginHorizontal: responsiveWidth(1),
    },
    addressOverlayWrap: {
      position: 'relative',
      zIndex: 20,
    },
    addressSuggestionList: {
      position: 'absolute',
      top: 48,
      left: 0,
      right: 0,
      backgroundColor: theme.background,
      borderRadius: 6,
      zIndex: 999,
      elevation: 6,
      maxHeight: responsiveHeight(25),
    },
    skeletonOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.background, // Ensures a solid light background with zero black bleeding
      zIndex: 999,
    },
    errorText: {
      color: Colors.red,
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.04),
      marginLeft: responsiveWidth(0.2),
      marginBottom: responsiveHeight(0.2),
    },
    successText: {
      color: '#2E9E4C',
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1.04),
      marginLeft: responsiveWidth(0.5),
      marginBottom: responsiveHeight(0.2),
    },
    stickyPayNowBar: {
      paddingHorizontal: responsiveWidth(3),
      paddingVertical: responsiveHeight(1),
      backgroundColor: theme.background, // match your screen background
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
  });
};

export default Styles;

