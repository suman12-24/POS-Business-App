import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveWidth, responsiveHeight } from 'react-native-responsive-dimensions';
import Moment from 'moment';
import useTranslation from '../../Hooks/useTranslation';
import { useAppTheme } from '../../Hooks/useAppTheme';


const GREEN = '#22C55E';
const RED = '#EF4444';
const GREY_BORDER = '#EEEDF7';

const getSourceMeta = sourcetype => {
  switch (sourcetype) {
    case 'Uber':
      return { icon: 'bicycle-outline', label: 'Uber Eats' };
    case 'Mobile':
    case 'MobileApp':
    case 'App':
      return { icon: 'phone-portrait-outline', label: 'Mobile App' };
    case 'Web':
    case 'WebApp':
      return { icon: 'globe-outline', label: 'Web App' };
    case 'Waiter':
      return { icon: 'restaurant-outline', label: 'Waiter' };
    case 'POS':
      return { icon: 'receipt-outline', label: 'POS' };
    default:
      return { icon: 'desktop-outline', label: 'POS' };
  }
};

export const ORDER_TABLE_COLS = {
  details: 1.6,
  customer: 2,
  date: 1.8,
  value: 1.2,
  action: 2.1,
  print: 1.2,
};

// Small vertical rule shown between columns. flexShrink: 0 so it never
// gets squeezed out and always keeps its own reserved space in the row.
const ColumnDivider = () => <View style={rowStyles.verticalDivider} />;

export const OrderTableHeader = React.memo(() => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  return (
    <View style={[rowStyles.headerRow, { backgroundColor: theme.background }]}>
      <View style={[rowStyles.headerCell, { flex: ORDER_TABLE_COLS.details }]}>
        <Ionicons name="bag-outline" size={responsiveFontSize(1.3)} color={theme.primary} style={{ marginRight: 10 }} />
        <Text style={[rowStyles.headerText, { color: theme.fontColorOnBackground }]}>{t('ORDER_DETAILS')}</Text>
      </View>
      <ColumnDivider />
      <View style={[rowStyles.headerCell, { flex: ORDER_TABLE_COLS.customer }]}>
        <Ionicons name="person-outline" size={responsiveFontSize(1.3)} color={theme.primary} style={{ marginRight: 10 }} />
        <Text style={[rowStyles.headerText, { color: theme.fontColorOnBackground }]}>{t('CUSTOMER_DETAILS')}</Text>
      </View>
      <ColumnDivider />
      <View style={[rowStyles.headerCell, { flex: ORDER_TABLE_COLS.date }]}>
        <Ionicons name="calendar-outline" size={responsiveFontSize(1.3)} color={theme.primary} style={{ marginRight: 10 }} />
        <Text style={[rowStyles.headerText, { color: theme.fontColorOnBackground }]}>{t('ORDER_DATE')}</Text>
      </View>
      <ColumnDivider />
      <View style={[rowStyles.headerCell, { flex: ORDER_TABLE_COLS.value }]}>
        <Ionicons name="pricetag-outline" size={responsiveFontSize(1.3)} color={theme.primary} style={{ marginRight: 10 }} />
        <Text style={[rowStyles.headerText, { color: theme.fontColorOnBackground }]}>{t('ORDER_VALUE')}</Text>
      </View>
      <ColumnDivider />
      <View style={[rowStyles.headerCell, { flex: ORDER_TABLE_COLS.action }]}>
        <Ionicons name="settings-outline" size={responsiveFontSize(1.3)} color={theme.primary} style={{ marginRight: 10 }} />
        <Text style={[rowStyles.headerText, { color: theme.fontColorOnBackground }]}>{t('ACTION')}</Text>
      </View>
      <ColumnDivider />
      <View style={[rowStyles.headerCell, { flex: ORDER_TABLE_COLS.print }]}>

      </View>
    </View>
  )
});

const OrderCard = ({ item, tabType, onPress, onAccept, onReject, onComplete, onView, onPrint }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const source = getSourceMeta(item.sourcetype);
  
  // Calculated date + estimate time
  const orderDate = (() => {
    if (item.date && Moment(item.date).isValid()) {
      let readyMoment = Moment(item.date);

      if (item.estimate_time) {
        const [offH, offM] = item.estimate_time.split(':').map(v => parseInt(v, 10));
        readyMoment = readyMoment
          .add(offH || 0, 'hours')
          .add(offM || 0, 'minutes');
      }

      return readyMoment.format('DD-MM-YYYY H:mm:ss');
    }

    return '-';
  })();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={rowStyles.row}>
      {/* ---------------- Order Details ---------------- */}
      <View style={{ flex: ORDER_TABLE_COLS.details, alignItems: 'flex-start', alignSelf: 'center', marginLeft: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            backgroundColor: '#F0EFF8',
            width: responsiveWidth(3),
            height: responsiveHeight(5),
            borderRadius: responsiveWidth(0.6),
            marginRight: responsiveWidth(1.2),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="bag-outline" size={responsiveFontSize(1.5)} color={theme.primary} />
          </View>
          <View>
            <Text style={[rowStyles.orderNumber, { color: theme.fontColorOnBackground }]} numberOfLines={1}>
              Order #{item.id}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Ionicons name={source.icon} size={responsiveFontSize(1.15)} color={theme.fontColorOnBackground} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.sourceLabel, { color: theme.fontColorOnBackground }]}>{item.sourcetype}</Text>
            </View>
          </View>
        </View>
      </View>
      <ColumnDivider />
      {/* ---------------- Customer Details ---------------- */}
      <View style={{ flex: ORDER_TABLE_COLS.customer, alignItems: 'flex-start', alignSelf: 'center', marginLeft: 6 }}>
        <View style={rowStyles.detailLine}>
          {item.customer_img ? (
            <Image
              source={{ uri: item.customer_img }}
              style={rowStyles.customerAvatar}
            />
          ) : (
            <Ionicons name="person-outline" size={responsiveFontSize(1.15)} color={theme.primary} style={rowStyles.detailIcon} />
          )}
          <Text style={[rowStyles.detailTextBold, { color: theme.fontColorOnBackground }]} numberOfLines={1}>{item.buyername}</Text>
        </View>
        {item.buyerphone ? (
          <View style={rowStyles.detailLine}>
            <Ionicons name="call-outline" size={responsiveFontSize(1.15)} color={theme.primary} style={rowStyles.detailIcon} />
            <Text style={[rowStyles.detailText, { color: theme.fontColorOnBackground }]} numberOfLines={1}>{item.buyerphone}</Text>
          </View>
        ) : null}
        {item.buyeremail ? (
          <View style={rowStyles.detailLine}>
            <Ionicons name="mail-outline" size={responsiveFontSize(1.15)} color={theme.primary} style={rowStyles.detailIcon} />
            <Text style={[rowStyles.detailText, { color: theme.fontColorOnBackground }]} numberOfLines={1}>{item.buyeremail}</Text>
          </View>
        ) : null}
      </View>

      <ColumnDivider />

      {/* ---------------- Order Date ---------------- */}

      <View style={{ flex: ORDER_TABLE_COLS.date, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center', marginLeft: 6, overflow: 'hidden' }}>
        <Ionicons name="calendar-outline" size={responsiveFontSize(1.15)} color={theme.primary} style={rowStyles.detailIcon} />
        <Text style={[rowStyles.detailText, { color: theme.fontColorOnBackground, flexShrink: 1 }]} numberOfLines={1}>{orderDate}</Text>
      </View>

      <ColumnDivider />

      {/* ---------------- Order Value ---------------- */}
      <View style={{ flex: ORDER_TABLE_COLS.value, flexDirection: 'row', alignItems: 'center', justifyContent: "flex-start", alignSelf: 'center', marginLeft: 6 }}>
        <Text style={[rowStyles.orderValue, { color: theme.fontColorOnBackground }]} numberOfLines={1}>
          {item.currency_symbol}
          {Number(item.total).toFixed(2)}
        </Text>
      </View>

      <ColumnDivider />

      {/* ---------------- Action (Accept / Reject / Complete / Status + View) ---------------- */}
      <View style={{
        flex: ORDER_TABLE_COLS.action, alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: "flex-start",
        alignSelf: 'center', marginLeft: 6
      }}>
        {tabType === 'current' ? (
          <>
            <TouchableOpacity onPress={onAccept} style={[rowStyles.actionBtn, { borderColor: GREEN, marginBottom: 2 }]}>
              <Ionicons name="checkmark-circle-outline" size={responsiveFontSize(1)} color={GREEN} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.actionBtnText, { color: GREEN }]}>{t('ACCEPT')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onReject} style={[rowStyles.actionBtn, { borderColor: RED, marginBottom: 2 }]}>
              <Ionicons name="close-circle-outline" size={responsiveFontSize(1)} color={RED} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.actionBtnText, { color: RED }]}>{t('REJECT')}</Text>
            </TouchableOpacity>
          </>
        ) : tabType === 'complete' ? (
          <>
            <View style={rowStyles.statusLine}>
              <Ionicons name="checkmark-done-circle-outline" size={responsiveFontSize(1)} color={GREEN} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.actionBtnText, { color: GREEN }]}>{t('ORDER_STATUS_COMPLETED_BUTTON')}</Text>
            </View>

            <TouchableOpacity
              onPress={onView || onPress}
              style={[rowStyles.actionBtn, { borderColor: theme.primary, marginBottom: 2 }]}
            >
              <Ionicons name="eye-outline" size={responsiveFontSize(1)} color={theme.primary} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.actionBtnText, { color: theme.primary }]}>{t('VIEW')}</Text>
            </TouchableOpacity>
          </>
        ) : tabType === 'cancel' ? (
          <>
            <View style={rowStyles.statusLine}>
              <Ionicons name="close-circle-outline" size={responsiveFontSize(1)} color={RED} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.actionBtnText, { color: RED }]}>{t('CANCELLED')}</Text>
            </View>

            <TouchableOpacity
              onPress={onView || onPress}
              style={[rowStyles.actionBtn, { borderColor: theme.primary, marginBottom: 2 }]}
            >
              <Ionicons name="eye-outline" size={responsiveFontSize(1)} color={theme.primary} style={{ marginRight: 4 }} />
              <Text style={[rowStyles.actionBtnText, { color: theme.primary }]}>{t('VIEW')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onComplete} style={[rowStyles.actionBtn, { borderColor: theme.primary, marginBottom: 2 }]}>
            <Ionicons name="checkmark-done-circle-outline" size={responsiveFontSize(1)} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[rowStyles.actionBtnText, { color: theme.primary }]}>{t('COMPLETE')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <ColumnDivider />

      {/* ---------------- Print ---------------- */}
      <View style={{ flex: ORDER_TABLE_COLS.print, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
        <TouchableOpacity
          onPress={onPrint}
          style={[rowStyles.printBtn, { borderColor: theme.primary }]}
        >
          <Ionicons name="print-outline" size={responsiveFontSize(1.1)} color={theme.primary} style={{ marginRight: 4 }} />
          <Text style={[rowStyles.actionBtnText, { color: theme.primary }]} numberOfLines={1} ellipsizeMode="tail">{t('PRINT')}</Text>
        </TouchableOpacity>
      </View>

    </TouchableOpacity>
  );
};

const rowStyles = {
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingTop: 25,
    paddingBottom: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: GREY_BORDER,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'flex-start',
    overflow: 'hidden',
  },
  headerText: {
    fontFamily: Inter.semibold,
    fontSize: responsiveFontSize(0.9),
    textAlign: 'center',
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: GREY_BORDER,
  },
  verticalDivider: {
    width: 1.2,
    alignSelf: 'stretch',
    backgroundColor: GREY_BORDER,
    marginHorizontal: 5,
    flexShrink: 0,
  },
  orderNumber: {
    fontFamily: Inter.semibold,
    fontSize: responsiveFontSize(1),
    textAlign: 'center',
  },
  sourceLabel: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(0.8),
    textAlign: 'center',
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailTextBold: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(1),
    flexShrink: 1,
    textAlign: 'center',
  },
  detailText: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(0.8),
    flexShrink: 1,
    textAlign: 'center',
  },
  orderValue: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(1),
    textAlign: 'center',
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 3,
    width: '65%',
    flexShrink: 1,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    flexShrink: 1,
    maxWidth: '100%',
  },
  actionBtnText: {
    fontFamily: Inter.medium,
    fontSize: responsiveFontSize(1),
  },
  customerAvatar: {
    width: responsiveFontSize(1.15),
    height: responsiveFontSize(1.15),
    borderRadius: responsiveFontSize(0.6),
    marginRight: 6,
  },
};

export default React.memo(OrderCard);