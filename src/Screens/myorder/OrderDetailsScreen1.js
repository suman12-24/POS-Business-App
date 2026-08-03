import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { postWithToken } from '../../Service/service';
import { Inter } from '../../Constants/Fonts';
import {
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import OrderDetailSkeleton from './OrderDetailSkeleton';
import useTranslation from '../../Hooks/useTranslation';
import { getStatusLabelKey, isCancelledByRestaurant } from '../../utility/orderStatus';
import { useAppTheme } from '../../Hooks/useAppTheme';

const MIN_MINUTES = 10;
const MAX_MINUTES = 60;
const STEP_MINUTES = 10;
const DEFAULT_MINUTES = 10;

const ORANGE = '#F5851F';
const GREY_TEXT = '#000';
const GREY_BORDER = '#E5E7EB';

const formatMinutesLabel = mins => `${mins} minute${mins === 1 ? '' : 's'}`;

const formatMinutesForApi = mins => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const OrderDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { baseUrl, userToken, langId } = useSelector(state => state.common);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 600;
  const isCompact = !isTablet && !isLandscape;
  const orderDetails = route.params?.order ?? null;
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(DEFAULT_MINUTES);
  const [loading, setLoading] = useState(false);

  const openTimeModal = () => {
    setDraftMinutes(minutes);
    setTimeModalVisible(true);
  };
  const closeTimeModal = () => setTimeModalVisible(false);
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const openRejectModal = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };
  const closeRejectModal = () => setRejectModalVisible(false);
  const decrementDraft = () =>
    setDraftMinutes(m => Math.max(MIN_MINUTES, m - STEP_MINUTES));
  const incrementDraft = () =>
    setDraftMinutes(m => Math.min(MAX_MINUTES, m + STEP_MINUTES));

  const confirmAcceptWithTime = () => {
    if (!orderDetails) return;

    setTimeModalVisible(false);     // ← add this line here
    setLoading(true);               // this was already here

    postWithToken(
      baseUrl,
      'orders/status-change',
      {
        id: orderDetails.id,
        estimate_time: formatMinutesForApi(draftMinutes),
        notes: '',
        status: 1,
        lang_id: langId,
      },
      userToken,
    )
      .then(() => {
        setLoading(false);
        setMinutes(draftMinutes);
        navigation.goBack();
        // navigation.navigate('OrderDetailInprogress', {
        //   order: {
        //     ...orderDetails,
        //     status: 1, // update status to accepted/in-progress
        //     estimate_time: formatMinutesForApi(draftMinutes),
        //   },
        // });
      })
      .catch(error => {
        setLoading(false);
        console.log('Error : ', error);
      });
  };

  const confirmReject = () => {
    if (!orderDetails) return;
    if (!rejectReason.trim()) return;

    setRejectModalVisible(false);
    setLoading(true);

    postWithToken(
      baseUrl,
      'orders/status-change',
      {
        id: orderDetails.id,
        notes: rejectReason.trim(),
        status: 6, // 6 = Cancelled by Restaurant
        lang_id: langId,
      },
      userToken,
    )
      .then(() => {
        setLoading(false);
        navigation.goBack();
        // Navigate to the registered OrderCancelDetails screen
        // navigation.navigate('OrderCancelDetails', {
        //   order: {
        //     ...orderDetails,
        //     status: 6, // Updated to Cancelled status
        //     notes: rejectReason.trim(),
        //   },
        // });
      })
      .catch(error => {
        setLoading(false);
        console.log('Error rejecting order: ', error);
      });
  };
  if (!orderDetails) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: Inter.medium, color: theme.fontColorOnBackground }}>{t('NO_ORDER_FOUND')}</Text>
      </View>
    );
  }

  // Full-screen skeleton REPLACES content while loading, instead of
  // stacking above it.
  if (loading) {
    return <OrderDetailSkeleton variant="accept-reject" />;
  }

  const infoLineStyle = {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(0.95),
    color: theme.fontColorOnBackground,
    marginBottom: 4,
  };

  const showActionsPanel = !isCancelledByRestaurant(orderDetails.status);

  const orderTypeLabel =
    orderDetails.order_type == 1
      ? 'Delivery'
      : orderDetails.order_type == 2
        ? 'Pickup'
        : orderDetails.order_type == 3
          ? 'Dinein'
          : orderDetails.order_type == 4
            ? 'POS'
            : '';
  const paymentMethod =
    orderDetails.paymentmethod?.length > 0
      ? orderDetails.paymentmethod[0].payment_method
      : '-';
  const subtotal = orderDetails.subtotal ?? orderDetails.sub_total ?? orderDetails.total;
  //const taxAmount = orderDetails.tax_price ?? orderDetails.tax_price ?? null;
  //const taxPercent = orderDetails.tax ?? orderDetails.tax ?? null;
  // const serviceFee = orderDetails.service_fee ?? orderDetails.service_charge ?? null;
  // const servicePercent = orderDetails.service_percent ?? orderDetails.service_percentage ?? null;
  // const deliveryCharge = orderDetails.delivery_charge ?? orderDetails.delivery_fee ?? null;

  const cartfeeObj = JSON.parse(orderDetails?.cartfee);

  const taxAmount = cartfeeObj?.taxprice ?? null;

  const taxPercent = cartfeeObj?.tax ?? null;

  const serviceFee = cartfeeObj?.servicefeeprice ?? null;

  const servicePercent = cartfeeObj?.servicefee ?? null;

  const discountFee = cartfeeObj?.discount ?? null;

  const deliveryFee = cartfeeObj?.deliverycost ?? null;

  const buyerDetails = JSON.parse(orderDetails?.buyerdata)

  const formatTwoDecimals = val => {
    const num = Number(val);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 14,
          paddingVertical: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('MyOrder')}
          style={{
            backgroundColor: "#EBE9FB", width: 38, height: 36, borderRadius: 10,
            justifyContent: "center", alignItems: "center"
          }}
        >
          <AntDesignIcon name="arrowleft" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 15,
            fontFamily: Inter.semibold,
            fontSize: responsiveFontSize(1.3),
            color: theme.fontColorOnBackground,
          }}
        >{t('ORDER')} #{orderDetails.id}</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flexDirection: isCompact ? 'column' : 'row',
            padding: isCompact ? 10 : 14,
            gap: 14,
          }}
        >
          {/* -------- LEFT: all order details -------- */}
          <View style={{ flex: isCompact ? undefined : showActionsPanel ? 2 : 1 }}>
            {/* ---- Two side-by-side info cards ---- */}
            <View
              style={{
                flexDirection: isCompact ? 'column' : 'row',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1, borderWidth: 1, borderColor: GREY_BORDER, borderRadius: 8, padding: 10 }}>
                <Text style={infoLineStyle}>{t('ORDER_DATE_AND_TIME')}: {orderDetails.date}</Text>
                <Text style={infoLineStyle}>{t('UPDATE_ORDER_STATUS')}: {t(getStatusLabelKey(orderDetails.status))}</Text>
                <Text style={infoLineStyle}>{t('ORDER_TYPE')}: {orderTypeLabel}</Text>
                <Text style={infoLineStyle}>
                  {t('GRAND_TOTAL')}: {orderDetails.currency_symbol}{orderDetails.total}
                </Text>
                <Text style={[infoLineStyle, { marginBottom: 0 }]}>
                  {t('PAYMENT_INFORMATION')}: {paymentMethod}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: GREY_BORDER,
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                {(buyerDetails?.name || buyerDetails?.last_name) && (
                  <Text style={[infoLineStyle, { fontFamily: Inter.bold }]}>
                    {buyerDetails?.name} {buyerDetails?.last_name}
                  </Text>
                )}

                {buyerDetails?.delievryaddress && (
                  <Text style={infoLineStyle}>
                    {t('APP_ADDRESS')}: {buyerDetails.delievryaddress}
                  </Text>
                )}

                {buyerDetails?.cel && (
                  <Text style={infoLineStyle}>
                    {t('PHONE_NUMBER')}: {buyerDetails.cel}
                  </Text>
                )}

                {buyerDetails?.email && (
                  <Text style={infoLineStyle}>
                    {t('EMAIL')}: {buyerDetails.email}
                  </Text>
                )}

                {buyerDetails?.notes && (
                  <Text style={[infoLineStyle, { marginBottom: 0 }]}>
                    {t('DELIVERY_NOTE')}: {buyerDetails.notes}
                  </Text>
                )}
              </View>
            </View>

            {/* ---- Item list ---- */}
            <View
              style={{
                borderWidth: 1,
                borderColor: GREY_BORDER,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: Inter.semibold,
                  fontSize: responsiveFontSize(1.1),
                  color: theme.fontColorOnBackground,
                  marginBottom: 10,
                }}
              >
                {t('ORDER_SUMMARY')}
              </Text>
              <View>
                {orderDetails.dishdata?.map((item, groupIndex) =>
                  item.data.map((dish, dishIndex, arr) => {
                    const isLastDish =
                      groupIndex === orderDetails.dishdata.length - 1 &&
                      dishIndex === arr.length - 1;

                    return (
                      <View key={`${groupIndex}_${dishIndex}`} style={{
                        marginBottom: 6,
                        paddingBottom: 6,
                        borderBottomWidth: isLastDish ? 0 : 1,
                        borderBottomColor: GREY_BORDER,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          {dish.is_img ? (
                            <View
                              style={{
                                width: responsiveWidth(3),
                                height: responsiveWidth(3),
                                marginRight: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                backgroundColor: '#F3F2FE',
                                borderRadius: responsiveWidth(0.5),
                              }}
                            >
                              <Image
                                source={{ uri: dish.is_img }}
                                style={{ width: '100%', height: '100%' }}
                              />
                            </View>
                          ) : null}

                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            {/* Quantity badge — sized to actually fit the number */}
                            <View
                              style={{
                                minWidth: responsiveWidth(1.8),
                                height: responsiveWidth(1.8),
                                paddingHorizontal: 4,
                                backgroundColor: theme.primary,
                                borderRadius: responsiveWidth(0.5),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: Inter.medium,
                                  fontSize: responsiveFontSize(0.8),
                                  textAlign: 'center',
                                  color: theme.fontColor,
                                }}
                              >
                                {dish.quantity}
                              </Text>
                            </View>
                            <Text
                              style={{
                                marginLeft: responsiveWidth(1),
                                flex: 1,
                                fontFamily: Inter.medium,
                                fontSize: responsiveFontSize(1.1),
                                color: theme.fontColorOnBackground,
                              }}
                            >
                              {dish.name}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontFamily: Inter.medium,
                              fontSize: responsiveFontSize(1),
                              color: theme.fontColorOnBackground,
                            }}
                          >
                            {orderDetails.currency_symbol}
                            {Number(dish.total).toFixed(2)}
                          </Text>
                        </View>

                        {/* ---- Choice / Sets ---- */}
                        {dish.sets?.length > 0
                          ? dish.sets.map((set, setIndex) => {
                            return set.choice.length > 0
                              ? set.choice.map((choice, choice_index) => (
                                <View
                                  key={'choice_' + setIndex + '_' + choice_index}
                                  style={{
                                    flexDirection: 'row',
                                    flex: 1,
                                    marginTop: 1,
                                    marginLeft: responsiveWidth(7.5),
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: Inter.regular,
                                      fontSize: responsiveFontSize(0.9),
                                      lineHeight: responsiveFontSize(1.1),
                                      color: GREY_TEXT,
                                    }}
                                  >
                                    {choice.qty} X {choice.name} -{' '}
                                  </Text>
                                  {choice.price != null ? (
                                    <Text
                                      style={{
                                        fontFamily: Inter.regular,
                                        fontSize: responsiveFontSize(0.9),
                                        lineHeight: responsiveFontSize(1.1),
                                        color: GREY_TEXT,
                                      }}
                                    >
                                      {orderDetails.currency_symbol}{choice.price}
                                    </Text>
                                  ) : null}
                                </View>
                              ))
                              : null;
                          })
                          : null}

                        {/* ---- Ingredients ---- */}
                        {dish.ingredientsarray?.length > 0 ? (
                          <Text
                            style={{
                              width: '70%',
                              fontFamily: Inter.regular,
                              fontSize: responsiveFontSize(0.9),
                              lineHeight: responsiveFontSize(1.1),
                              color: GREY_TEXT,
                              marginLeft: responsiveWidth(7.5),
                              marginTop: 1,
                            }}
                          >
                            {dish.ingredientsarray.join(', ')}
                          </Text>
                        ) : null}

                        {/* ---- Product Note with Pencil Icon ---- */}
                        {dish.notes ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: responsiveWidth(7.5),
                              marginTop: 2,
                            }}
                          >
                            <AntDesignIcon
                              name="edit"
                              size={responsiveFontSize(0.95)}
                              color={theme.primary}
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: Inter.regular,
                                fontSize: responsiveFontSize(0.9),
                                lineHeight: responsiveFontSize(1.1),
                                color: GREY_TEXT,
                              }}
                            >
                              {dish.notes}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                    );
                  }),
                )}
              </View>

              {/* ---- Summary ---- */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: GREY_BORDER,
                  borderStyle: 'solid',
                  marginTop: 12,
                  paddingTop: 10,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                    {t('SUBTOTAL')}
                  </Text>
                  <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                    {orderDetails.currency_symbol}{formatTwoDecimals(subtotal)}
                  </Text>
                </View>
                {taxAmount > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                        {t('ORDER_TEMPLATE_TAX')} {taxPercent ? `(${taxPercent}%)` : ''}
                      </Text>
                      <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.8), color: theme.fontColorOnBackground }}>
                        {t('TAX_NOT_INCLUDED')}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                      {orderDetails.currency_symbol}{formatTwoDecimals(taxAmount)}
                    </Text>
                  </View>
                )}
                {serviceFee > 0 &&
                  (<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                      {t('SERVICE_FEE')} {servicePercent ? `(${servicePercent}%)` : ''}
                    </Text>
                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                      {orderDetails.currency_symbol}{formatTwoDecimals(serviceFee)}
                    </Text>
                  </View>)
                }
                {
                  discountFee > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                        {t('ORDER_TEMPLATE_DISCOUNT')}
                      </Text>
                      <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                        {orderDetails.currency_symbol}-{formatTwoDecimals(discountFee)}
                      </Text>
                    </View>
                  )
                }
                {
                  deliveryFee > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                        {t('DELIEVRY_FEE')}
                      </Text>
                      <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                        {orderDetails.currency_symbol}{formatTwoDecimals(deliveryFee)}
                      </Text>
                    </View>
                  )
                }
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontFamily: Inter.bold, fontSize: responsiveFontSize(1.05), color: theme.fontColorOnBackground }}>
                    {t('TOTAL_AMOUNT')}
                  </Text>
                  <Text style={{ fontFamily: Inter.bold, fontSize: responsiveFontSize(1.05), color: theme.fontColorOnBackground }}>
                    {orderDetails.currency_symbol} {formatTwoDecimals(orderDetails.total)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                    {t('PAYMENT_METHOD')}
                  </Text>
                  <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                    {paymentMethod}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* -------- RIGHT: accept time / actions -------- */}
          {showActionsPanel && (
            <View
              style={{
                flex: isCompact ? undefined : 1,
                backgroundColor: theme.fontColor,
                alignSelf: isCompact ? undefined : 'flex-start',
                borderWidth: 0.1,
                borderColor: GREY_BORDER,
                borderRadius: 12,
                padding: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                borderColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontFamily: Inter.bold,
                  fontSize: responsiveFontSize(1.15),
                  color: theme.fontColorOnBackground,
                  marginBottom: 14,
                }}
              >
                {t('ORDER_ACCEPT_TIME')}
              </Text>

              <TouchableOpacity
                onPress={openTimeModal}
                style={{
                  width: '45%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: GREY_BORDER,
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontFamily: Inter.bold, fontSize: responsiveFontSize(1.3), color: theme.primary }}>
                  {formatMinutesLabel(minutes)}
                </Text>
                <AntDesignIcon name="edit" size={16} color={theme.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openTimeModal}
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: theme.fontColor, fontFamily: Inter.bold, fontSize: responsiveFontSize(1.05) }}>
                  {t('ACCEPT')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openRejectModal}
                style={{
                  marginTop: 10,
                  backgroundColor: ORANGE,
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.fontColor, fontFamily: Inter.bold, fontSize: responsiveFontSize(1.05) }}>
                  {t('REJECT')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView >

      {/* -------- TIME EDIT MODAL -------- */}
      <Modal Modal
        isVisible={isTimeModalVisible}
        onBackdropPress={closeTimeModal}
        supportedOrientations={['portrait', 'landscape']}
        style={{ width: isCompact ? '90%' : isTablet ? '40%' : '55%', margin: 'auto' }}
      >
        <View style={{ backgroundColor: theme.fontColor, borderRadius: 14, padding: 20 }}>
          <Text
            style={{
              fontFamily: Inter.bold,
              fontSize: responsiveFontSize(1.4),
              color: theme.fontColorOnBackground,
              textAlign: 'center',
              marginBottom: 18,
            }}
          >
            {t('EDIT_DELIVERY_TIME')}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <TouchableOpacity
              onPress={decrementDraft}
              disabled={draftMinutes <= MIN_MINUTES}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: draftMinutes <= MIN_MINUTES ? '#ccc' : theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}

            >
              <Text style={{ fontSize: 18, color: theme.fontColor, fontFamily: Inter.bold }}>-</Text>
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: Inter.bold,
                fontSize: responsiveFontSize(2),
                color: theme.fontColorOnBackground,
                minWidth: 110,
                textAlign: 'center',
              }}
            >
              {formatMinutesLabel(draftMinutes)}
            </Text>

            <TouchableOpacity
              onPress={incrementDraft}
              disabled={draftMinutes >= MAX_MINUTES}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: draftMinutes >= MAX_MINUTES ? '#ccc' :theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, color: theme.fontColor, fontFamily: Inter.bold }}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={closeTimeModal} style={{ alignSelf: 'center', marginTop: 14 }}>
            <Text style={{ color: theme.fontColorOnBackground, fontFamily: Inter.medium }}>{t('CONFIRM_CANCEL')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmAcceptWithTime}
            style={{
              marginTop: 16,
              backgroundColor:theme.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.fontColor, fontFamily: Inter.bold, fontSize: responsiveFontSize(1.2) }}>
              {t('ACCEPT')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal >
      {/* -------- REJECT REASON MODAL -------- */}
      <Modal Modal
        isVisible={isRejectModalVisible}
        onBackdropPress={closeRejectModal}
        supportedOrientations={['portrait', 'landscape']}
        style={{ width: isCompact ? '90%' : isTablet ? '40%' : '55%', margin: 'auto' }}
      >
        <View style={{ backgroundColor: theme.fontColor, borderRadius: 14, padding: 20 }}>
          <Text
            style={{
              fontFamily: Inter.bold,
              fontSize: responsiveFontSize(1.4),
              color: theme.fontColorOnBackground,
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            {t('REASON_FOR_REJECTION')}
          </Text>

          <TextInput
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder={t('ENTER_A_REASON_FOR_REJECTING_THIS_ORDER')}
            placeholderTextColor={theme.fontColorOnBackground}
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: GREY_BORDER,
              borderRadius: 8,
              padding: 10,
              minHeight: 90,
              textAlignVertical: 'top',
              fontFamily: Inter.regular,
              fontSize: responsiveFontSize(1),
              color: theme.fontColorOnBackground,
            }}
          />

          <TouchableOpacity onPress={closeRejectModal} style={{ alignSelf: 'center', marginTop: 14 }}>
            <Text style={{ color: theme.fontColorOnBackground, fontFamily: Inter.medium }}>{t('CONFIRM_CANCEL')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmReject}
            disabled={!rejectReason.trim()}
            style={{
              marginTop: 16,
              backgroundColor: rejectReason.trim() ? theme.secondary : '#ccc',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.fontColor, fontFamily: Inter.semibold, fontSize: responsiveFontSize(1.2) }}>
              {t('CONFIRM_REJECT')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal >
    </View >
  );
};

export default OrderDetailScreen;

