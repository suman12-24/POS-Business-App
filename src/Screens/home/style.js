import { StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import {responsiveHeight,responsiveWidth,responsiveFontSize} from 'react-native-responsive-dimensions';

const AccentSoft = '#EDE9FE';
const BorderSoft = '#EEEAFB';

const Styles = (theme, columns = 3) => {

  const gapPercent = 1.5;
  const cardWidthPercent = (100 - gapPercent * (columns - 1)) / columns;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      position: 'relative',
    },
    main: {
      display: 'flex',
      width: '100%',
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: responsiveWidth(2),
    },
    inner_left: {
      display: 'flex',
      width: '66%',
    },
    inner_right: {
      display: 'flex',
      width: '32.5%',
      marginLeft: responsiveWidth(1.5),
    },

    /* ---------- search row ---------- */
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: responsiveHeight(2.2),
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: responsiveHeight(7.5),
      borderWidth: 1,
      borderColor: '#E3E3EA',
      borderRadius: responsiveWidth(1.5), // full pill shape, matches mock
      paddingHorizontal: responsiveWidth(1.8),
      backgroundColor: theme.background,
    },
    searchInput: {
      flex: 1,
      marginLeft: responsiveWidth(1),
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      height: '100%',
      padding: 0,
    },
    searchSortBtn: {
      marginLeft: responsiveWidth(1),
      paddingLeft: responsiveWidth(1.2),
    },

    /* ---------- category pills (row 1: icon + name) ---------- */
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative', // needed so the button can be absolutely positioned relative to this row
    },
    categoryScroll: {
      width: '100%', // full width instead of flex:1 sharing space with the button
    },
    categoryPill: {
      width: responsiveWidth(15),
      minHeight: responsiveHeight(8),
      paddingHorizontal: responsiveWidth(1.2),
      paddingVertical: responsiveHeight(0.9),
      borderRadius: responsiveWidth(0.8),
      borderWidth: 1,
      borderColor: '#D9D6ED',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginRight: responsiveWidth(1),
      flexDirection: 'row',
      backgroundColor: theme.background,
      elevation: 2
    },
    categoryPillSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryPillImageWrap: {
      width: responsiveWidth(3),
      height: responsiveWidth(3),
      borderRadius: responsiveWidth(1.5),
      overflow: 'hidden',
      backgroundColor: '#F5F5FA',
      marginRight: responsiveWidth(0.8),
      flexShrink: 0,
    },
    categoryPillImage: {
      width: '100%',
      height: '100%',
    },
    categoryPillTextWrap: {
      flex: 1,
    },
    categoryPillText: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      flexShrink: 1,
    },
    categoryPillTextSelected: {
      color: theme.fontColor,
    },
    // Floating "scroll for more" chevron — pinned to the right, doesn't move.
    categoryNextBtn: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: [{ translateY: -responsiveHeight(2.25) }], // half of button height, to vertically center
      width: responsiveHeight(4.5),
      height: responsiveHeight(4.5),
      borderRadius: responsiveHeight(1),
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: '#E3E3EA',
      elevation: 4,
      shadowColor: '#000', // optional, helps it visually "float" above content on iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },

    /* ---------- subcategory pills (row 2: text-only filter chips) ---------- */
    subCategoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: responsiveHeight(1.4),
      marginBottom: responsiveHeight(1.6),
    },
    subCategoryPill: {
      paddingHorizontal: responsiveWidth(1.6),
      height: responsiveHeight(5.2),
      borderRadius: responsiveHeight(2.6), // stadium/pill shape
      borderWidth: 1,
      borderColor: '#E3E3EA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: responsiveWidth(1),
      backgroundColor: theme.background,
    },
    subCategoryPillSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    subCategoryPillText: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(1.3),
      color: theme.fontColorOnBackground,
    },
    subCategoryPillTextSelected: {
      color: '#FFFFFF',
    },

    /* ---------- product grid ---------- */
    productScrollRow: {
      flex: 1,
      flexDirection: 'row',
      top: responsiveHeight(1.5),
    },
    productGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
    productCard: {
      width: `${cardWidthPercent}%`,
      height: responsiveHeight(10.5),
      flexDirection: 'row',
      alignItems: 'stretch',
      borderWidth: 0.8,
      borderColor: '#D4D0EC',
      borderRadius: responsiveWidth(1),
      paddingVertical: 0,
      paddingHorizontal: 0,
      marginRight: `${gapPercent}%`,
      marginBottom: responsiveHeight(2.5),
      backgroundColor: theme.background,
      overflow: 'hidden',
      elevation: 1,
    },
    productCardLastInRow: {
      marginRight: 0,
    },
    productImageWrap: {
      //width: responsiveWidth(6),
      width: responsiveWidth(7.5),
      height: '100%',
      borderTopRightRadius: responsiveWidth(1),
      borderBottomRightRadius: responsiveWidth(1),
      overflow: 'hidden',
      backgroundColor: '#F5F5FA',
      flexShrink: 0,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    productInfo: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      justifyContent: 'center',
      paddingVertical: responsiveHeight(0.1),
      paddingRight: responsiveWidth(0.5),
      paddingLeft: responsiveWidth(0.5),
    },
    productInfoCentered: {
      justifyContent: 'center',
    },
    productTextGroup: {
    },
    productName: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(0.95),
      color: theme.fontColorOnBackground,
    },
    productFooterRow: {
      width: '100%',
    },
    offerPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    productQtyControlWrap: {
      position: 'absolute',
      right: responsiveWidth(0.8),
      bottom: responsiveHeight(0.4),
    },
    productPrice: {
      fontFamily: Inter.medium,
      fontSize: responsiveFontSize(0.9),
      color: theme.fontColorOnBackground                   // purple/indigo, matches mock — not black
    },
    productAddBtn: {
      width: responsiveWidth(1.8),
      height: responsiveWidth(1.8),
      borderRadius: responsiveWidth(0.9),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      right: responsiveWidth(-0.5),
    },
    productQtyStepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: responsiveWidth(1),
      height: responsiveHeight(2.6),
      overflow: 'hidden',
      right: responsiveWidth(-0.2),
      //bottom: responsiveHeight(-1.5),
    },
    productQtyBtn: {
      paddingHorizontal: responsiveWidth(0.1),
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    productQtyValueWrap: {
      height: '100%',
      minWidth: responsiveWidth(1),
      paddingHorizontal: responsiveWidth(0.2),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.primary,
    },
    productQtyValue: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.8),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
      //bottom: responsiveHeight(0.5),
    },
    noRecordText: {
      marginTop: responsiveHeight(10),
      alignSelf: 'center',
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(2),
      color: Colors.red,
    },

    /* ---------- cart / right panel ---------- */
    cartPanel: {
      flex: 1,
      borderWidth: 1,
      borderColor: BorderSoft,
      borderRadius: responsiveWidth(2),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: responsiveWidth(1),
    },
    cartIconCircle: {
      width: responsiveWidth(6),
      height: responsiveWidth(6),
      borderRadius: responsiveWidth(3),
      backgroundColor: AccentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: responsiveHeight(2),
    },
    cartEmptyTitle: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      marginBottom: responsiveHeight(0.8),
      textAlign: 'center',
    },
    cartEmptySubtitle: {
      fontFamily: Inter.semibold,
      fontSize: responsiveFontSize(0.8),
      color: theme.fontColorOnBackground,
      textAlign: 'center',
    },

    /* ---------- existing styles kept for other parts of this screen ---------- */
    radioButton: {},
    checkbox: {
      alignSelf: 'center',
    },
    add_button: {
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: responsiveWidth(0.6),
    },
    /*upload model*/
    upload_modal_main: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    upload_modal_inner_modalView: {
      width: responsiveWidth(50),
      height: responsiveHeight(50),
      padding: responsiveWidth(2),
      backgroundColor: 'white',
      borderRadius: responsiveWidth(2),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: responsiveWidth(2),
      paddingTop: responsiveHeight(1),
      justifyContent: 'center',   // vertical centering
      alignItems: 'center',       // horizontal centering
    },
    upload_modal_view: {
      width: '100%',
      flexDirection: 'column',    // was 'row' — stacks logo/text properly
      justifyContent: 'center',
      alignItems: 'center',
    },
    check_logo: {
      height: responsiveWidth(6),
      width: responsiveWidth(6),
    },
    button_sty: {
      width: responsiveWidth(15),
      height: responsiveHeight(8),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: responsiveWidth(0.6),
      alignSelf: 'center',
      marginTop: responsiveHeight(2),
      marginBottom: responsiveHeight(1),
    },
    button_txt: {
      textAlign: 'center',
      fontSize: responsiveFontSize(1.5),
      fontFamily: Inter.regular,
    },

    productQtyBadge: {
      width: responsiveWidth(1.4),
      height: responsiveWidth(1.4),
      minWidth: 22,
      minHeight: 22,
      borderRadius: 999,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      right: responsiveWidth(-0.5),
    },
    productQtyBadgeText: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.8),
      color: theme.fontColor,
      textAlign: 'center',
    },
    productNoImageRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    productNoImageControl: {
      //  bottom: responsiveHeight(-1.5),
      flexShrink: 0,
      //marginLeft: responsiveWidth(-1),
    },
    productOfferPrice: {
      marginLeft: responsiveWidth(0.2),
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.85),
      color: theme.fontColorOnBackground,
      textDecorationLine: 'line-through',
    },
    productOfferPriceNoImage: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(1),
      color: theme.fontColorOnBackground,
      textDecorationLine: 'line-through',
      marginBottom: responsiveHeight(0.6),
    },
    productInfoNoImage: {
      paddingLeft: responsiveWidth(0.5),
      justifyContent: "center"
    },
    productBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: responsiveHeight(-0.8),
      marginBottom: responsiveHeight(0.1),
    },
    vegNonVegBox: {
      width: responsiveWidth(1),
      height: responsiveWidth(1),
      borderWidth: 1,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: responsiveWidth(0.6),
    },
    vegBox: {
      borderColor: '#0F8A0F',
    },
    nonVegBox: {
      borderColor: '#C11B1B',
    },
    vegNonVegDot: {
      width: '50%',
      height: '50%',
      borderRadius: 999,
    },
    vegDot: {
      backgroundColor: '#0F8A0F',
    },
    nonVegDot: {
      backgroundColor: '#C11B1B',
    },
    spicyBadge: {
      height: responsiveWidth(1),
      width: responsiveWidth(1),
    },
    featuredBadge: {
      backgroundColor: '#1DA34E',
      borderTopLeftRadius: responsiveWidth(0.6),
      borderBottomRightRadius: responsiveWidth(0.6),
      paddingHorizontal: responsiveWidth(0.5),
      paddingVertical: responsiveHeight(0.2),
      marginLeft: responsiveWidth(0.5),
    },
    featuredBadgeText: {
      fontFamily: Inter.regular,
      fontSize: responsiveFontSize(0.6),
      color:theme.fontColor,
    },
  });


};
export default Styles;

