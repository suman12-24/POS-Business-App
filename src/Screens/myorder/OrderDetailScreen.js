import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TextInput,
  Animated,
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
import { printOrderReceipt } from '../../utility/printReceipt';

const MIN_MINUTES = 10;
const MAX_MINUTES = 60;
const STEP_MINUTES = 10;
const DEFAULT_MINUTES = 10;

const GREY_BORDER = '#E5E7EB';
const SKELETON_BASE = '#E9E9F2';

const formatMinutesLabel = mins => `${mins} minute${mins === 1 ? '' : 's'}`;

const formatMinutesForApi = mins => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// ---- Reusable pulsing skeleton block ----
const SkeletonBlock = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: SKELETON_BASE,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ---- Skeleton for the payment method cards while fetching ----
const PaymentOptionsSkeleton = () => (
  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 20 }}>
    {[0, 1, 2].map(i => (
      <View
        key={i}
        style={{
          width: 110,
          paddingVertical: 18,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: GREY_BORDER,
          borderRadius: 14,
        }}
      >
        <SkeletonBlock width={30} height={30} borderRadius={15} style={{ marginBottom: 10 }} />
        <SkeletonBlock width={54} height={12} borderRadius={4} />
      </View>
    ))}
  </View>
);

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

  // ---- Payment method edit ----
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({ isLoading: false, list: [] });
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [paymentMethodOverride, setPaymentMethodOverride] = useState(null); // { id, payment_method } once changed
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const printToKitchenPrinters = async () => {
    try {
      const res = await postWithToken(
        baseUrl,
        'get-printer-details',
        { lang_id: langId },
        userToken,
      );
      if (res?.status !== true || !res.data) return;

      const ip1 = res.data.printer_kitchen_ip_address;
      const ip2 = res.data.printer_kitchen_ip_address_2;

      const result = await printOrderReceipt({
        response: orderDetails,
        usbPrinter: null, // WiFi only
        wifiPrinter: ip1 ? { ip: String(ip1) } : null,
        wifiPrinter2: ip2 ? { ip: String(ip2) } : null,
      });

      if (result?.errors?.length) {
        console.log('Kitchen print errors:', result.errors);
      }
    } catch (e) {
      console.log('Error printing kitchen tickets:', e);
    }
  };

const confirmAcceptWithTime = () => {
  if (!orderDetails) return;

  setTimeModalVisible(false);
  setLoading(true);

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
    .then(async () => {
      setMinutes(draftMinutes);
      await printToKitchenPrinters(); // both WiFi printers print here
      setLoading(false);
      navigation.goBack();
    })
    .catch(error => {
      setLoading(false);
      console.log('Error : ', error);
    });
};


  const FetchPaymentMothod = (bid, orderType_val) => {
    postWithToken(
      baseUrl,
      'get-business-payment-methods',
      {
        lang_id: langId,
      },
      userToken,
    )
      .then(response => {
        let paymentResponse = response.data;
        let payment_arr = [];
        for (let j = 0; j < paymentResponse.length; j++) {
          let pflag = false;
          if (orderType_val == 1 && paymentResponse[j].is_delivery == 1) {
            pflag = true;
          } else if (orderType_val == 2 && paymentResponse[j].is_pickup == 1) {
            pflag = true;
          } else if (orderType_val == 3) {
            pflag = true;
          }

          if (pflag) {
            let paymentc = new Object();
            paymentc.id = paymentResponse[j].pid;
            paymentc.name = paymentResponse[j].name;
            paymentc.payment_method = paymentResponse[j].payment_method;
            paymentc.active = false;
            paymentc.credential = paymentResponse[j].credential;

            if (paymentc.id == 1 || paymentc.id == 2) {
              payment_arr.push(paymentc);
            }
          }
        }

        setPaymentMethod({ isLoading: false, list: payment_arr });

        // Pre-select whichever method the order is currently using.
        const current = paymentMethodOverride ?? orderDetails?.paymentmethod?.[0] ?? null;
        const matched =
          payment_arr.find(p => p.id == current?.id) ??
          payment_arr.find(p => p.payment_method === current?.payment_method);
        setSelectedPaymentId(matched ? matched.id : null);
      })
      .catch(error => {
        setPaymentMethod({ isLoading: false, list: [] });
        console.log('Error : ', error);
      });
  };

  const openPaymentModal = () => {
    if (!orderDetails) return;
    setPaymentMethod({ isLoading: true, list: [] });
    setPaymentModalVisible(true);
    FetchPaymentMothod(orderDetails.bid, orderDetails.order_type);
  };
  const closePaymentModal = () => setPaymentModalVisible(false);

  const submitPaymentMethodChange = () => {
    if (!orderDetails || !selectedPaymentId) return;
    const selected = paymentMethod.list.find(p => p.id === selectedPaymentId);
    if (!selected) return;

    setPaymentUpdating(true);

    const paymentMethodPayload = [
      {
        id: selected.id,
        name: selected.name,
        payment_method: selected.payment_method,
        active: true,
        credential: selected.credential ?? 'null',
      },
    ];

    postWithToken(
      baseUrl,
      'change-order-payment-method',
      {
        order_id: orderDetails.id,
        payment_id: selected.id,
        paymentmethod: paymentMethodPayload,
      },
      userToken,
    )
      .then(() => {
        setPaymentUpdating(false);
        setPaymentModalVisible(false);
        setPaymentMethodOverride({
          id: selected.id,
          name: selected.name,
          payment_method: selected.payment_method,
          active: true,
          credential: selected.credential ?? 'null',
        });
      })
      .catch(error => {
        setPaymentUpdating(false);
        console.log('Error updating payment method: ', error);
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
  const currentPaymentMethodLabel =
    paymentMethodOverride?.payment_method ??
    (orderDetails.paymentmethod?.length > 0
      ? orderDetails.paymentmethod[0].payment_method
      : '-');
  const subtotal = orderDetails.subtotal ?? orderDetails.sub_total ?? orderDetails.total;

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
                  {t('PAYMENT_INFORMATION')}: {currentPaymentMethodLabel}
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
                    {t('ADDRESS')}: {buyerDetails.delievryaddress}
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
                                      color: theme.fontColorOnBackground,
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
                                        color: theme.fontColorOnBackground,
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
                              color: theme.fontColorOnBackground,
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
                                color: theme.fontColorOnBackground,
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

                {/* ---- Payment method row with edit icon moved here ---- */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                    {t('PAYMENT_METHOD')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: Inter.regular,
                        fontSize: responsiveFontSize(0.95),
                        color: theme.fontColorOnBackground,
                        marginRight: 6,
                      }}
                    >
                      {currentPaymentMethodLabel}
                    </Text>
                    <TouchableOpacity
                      onPress={openPaymentModal}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <AntDesignIcon name="edit" size={responsiveFontSize(0.95)} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
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
                  backgroundColor: theme.secondary,
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
                backgroundColor: draftMinutes >= MAX_MINUTES ? '#ccc' : theme.primary,
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
              backgroundColor: theme.primary,
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

      {/* -------- PAYMENT METHOD EDIT MODAL (redesigned) -------- */}
      <Modal Modal
        isVisible={isPaymentModalVisible}
        onBackdropPress={closePaymentModal}
        supportedOrientations={['portrait', 'landscape']}
        style={{ width: isCompact ? '90%' : isTablet ? '40%' : '55%', margin: 'auto' }}
      >
        <View style={{ backgroundColor: theme.fontColor, borderRadius: 14, padding: 20 }}>
          {/* ---- Title ---- */}
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontFamily: Inter.bold, fontSize: responsiveFontSize(1.5), textAlign: 'center' }}>
              <Text style={{ color: theme.primary }}>{t('CHANGE_THE_PAYMENT')} </Text>
              <Text style={{ color: theme.secondary }}>{t('METHOD')}</Text>
            </Text>
            <View
              style={{
                width: 46,
                height: 3,
                borderRadius: 2,
                backgroundColor: theme.primary,
                marginTop: 8,
              }}
            />
            <Text
              style={{
                fontFamily: Inter.regular,
                fontSize: responsiveFontSize(0.95),
                color: '#9CA0AB',
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              {t('CHOOSE_A_PAYMENT_OPTION_FOR_THIS_ORDER')}
            </Text>
          </View>

          {/* ---- Options ---- */}
          {paymentMethod.isLoading ? (
            <PaymentOptionsSkeleton />
          ) : paymentMethod.list.length === 0 ? (
            <Text
              style={{
                textAlign: 'center',
                fontFamily: Inter.regular,
                color: theme.fontColorOnBackground,
                paddingVertical: 10,
                marginTop: 10,
              }}
            >
              {t('NO_PAYMENT_METHODS_FOUND')}
            </Text>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 14,
                marginTop: 20,
                flexWrap: 'wrap',
              }}
            >
              {paymentMethod.list.map(pm => {
                const isSelected = pm.id === selectedPaymentId;
                const isCash = /cash|cod/i.test(pm.payment_method || pm.name || '');

                return (
                  <TouchableOpacity
                    key={pm.id}
                    onPress={() => setSelectedPaymentId(pm.id)}
                    activeOpacity={0.8}
                    style={{
                      width: 110,
                      paddingVertical: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1.5,
                      borderColor: isSelected ? theme.primary : GREY_BORDER,
                      backgroundColor: isSelected ? '#F3F2FE' : theme.fontColor,
                      borderRadius: 14,
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: theme.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: theme.fontColor,
                        }}
                      >
                        <Ionicons name="checkmark" size={14} color={theme.fontColor} />
                      </View>
                    )}

                    <Ionicons
                      name={isCash ? 'cash-outline' : 'card-outline'}
                      size={30}
                      color={theme.primary}
                      style={{ marginBottom: 8 }}
                    />

                    <Text
                      style={{
                        fontFamily: Inter.semibold,
                        fontSize: responsiveFontSize(1),
                        color: theme.fontColorOnBackground,
                      }}
                    >
                      {pm.name || pm.payment_method}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity onPress={closePaymentModal} style={{ alignSelf: 'center', marginTop: 18 }}>
            <Text style={{ color: theme.fontColorOnBackground, fontFamily: Inter.medium }}>{t('CONFIRM_CANCEL')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={submitPaymentMethodChange}
            disabled={!selectedPaymentId || paymentMethod.isLoading || paymentUpdating}
            style={{
              marginTop: 16,
              backgroundColor: selectedPaymentId && !paymentMethod.isLoading && !paymentUpdating ? theme.primary : '#ccc',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {paymentUpdating ? (
              <SkeletonBlock width={70} height={14} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />
            ) : (
              <Text style={{ color: theme.fontColor, fontFamily: Inter.bold, fontSize: responsiveFontSize(1.2) }}>
                {t('SAVE')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal >
    </View >
  );
};

export default OrderDetailScreen;