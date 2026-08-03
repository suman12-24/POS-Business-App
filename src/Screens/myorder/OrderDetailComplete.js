import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Inter } from '../../Constants/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import OrderDetailSkeleton from './OrderDetailSkeleton';
import { getStatusLabelKey, isCancelledByRestaurant } from '../../utility/orderStatus';
import useTranslation from '../../Hooks/useTranslation';
import { useAppTheme } from '../../Hooks/useAppTheme';

const GREY_BORDER = '#E5E7EB';

const OrderDetailComplete = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 600;
  const isCompact = !isTablet && !isLandscape;

  const [loading, setLoading] = useState(false);

  const orderDetails = route.params?.order ?? null;

  if (!orderDetails) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: Inter.medium, color: theme.fontColorOnBackground }}>
          No order selected
        </Text>
      </View>
    );
  }
  if (loading) {
    return <OrderDetailSkeleton variant="complete" />;
  }
  const infoLineStyle = {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(0.95),
    color: theme.fontColorOnBackground,
    marginBottom: 4,
  };

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
  // const taxPercent = orderDetails.tax ?? orderDetails.tax ?? null;
  //const serviceFee = orderDetails.service_fee ?? orderDetails.service_charge ?? null;
  //const servicePercent = orderDetails.service_percent ?? orderDetails.service_percentage ?? null;
  // const deliveryCharge = orderDetails.delivery_charge ?? orderDetails.delivery_fee ?? null;
  const specialOffer = orderDetails.special_offer ?? null;
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
  const money = value =>
    value === null || value === undefined
      ? '-'
      : `${orderDetails.currency_symbol}${value}`;

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
        <TouchableOpacity onPress={() => navigation.navigate('MyOrderComplete')}
          style={{
            backgroundColor: "#EBE9FB", width: 38, height: 36, borderRadius: 10,
            justifyContent: "center", alignItems: "center"
          }}
        >
          <AntDesignIcon name="arrowleft" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 12,
            fontFamily: Inter.semibold,
            fontSize: responsiveFontSize(1.3),
            color: theme.fontColorOnBackground,
          }}
        >
          {t('ORDER')} #{orderDetails.id}
        </Text>
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
          <View style={{ flex: isCompact ? undefined : 2 }}>
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
                  <Text style={[infoLineStyle, { fontFamily: Inter.semibold }]}>
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
            <View style={{
              borderWidth: 1,
              borderColor: GREY_BORDER,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}>
              <Text
                style={{
                  fontFamily: Inter.semibold,
                  fontSize: responsiveFontSize(1.1),
                  color: theme.fontColorOnBackground,
                  marginBottom: 10,
                }}
              >
                Order Summary
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
                        {t('TAX')} {taxPercent ? `(${taxPercent}%)` : ''}
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
                  <Text style={{ fontFamily: Inter.semibold, fontSize: responsiveFontSize(1.05), color: theme.fontColorOnBackground }}>
                    {t('TOTAL_AMOUNT')}
                  </Text>
                  <Text style={{ fontFamily: Inter.semibold, fontSize: responsiveFontSize(1.05), color: theme.fontColorOnBackground }}>
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
          {/* -------- RIGHT: estimated time / archived notes, inside its own card -------- */}
          {(orderDetails.estimate_time || orderDetails.notes) ? (
            <View
              style={{
                flex: isCompact ? undefined : 1,
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: GREY_BORDER,
                borderRadius: 12,
                padding: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {orderDetails.estimate_time ? (
                <View style={{ marginBottom: orderDetails.notes ? 18 : 0 }}>
                  <Text
                    style={{
                      fontFamily: Inter.semibold,
                      fontSize: responsiveFontSize(1.15),
                      color: theme.fontColorOnBackground,
                      marginBottom: 10,
                    }}
                  >
                    {t('ESTIMATED_DELIVERY_TIME')}
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: GREY_BORDER,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Inter.semibold,
                        fontSize: responsiveFontSize(2),
                        color: theme.primary,
                      }}
                    >
                      {orderDetails.estimate_time}
                    </Text>
                  </View>
                </View>
              ) : null}

              {orderDetails.notes ? (
                <View
                  style={
                    orderDetails.estimate_time
                      ? {
                        borderTopWidth: 1,
                        borderTopColor: GREY_BORDER,
                        paddingTop: 14,
                      }
                      : null
                  }
                >
                  <Text
                    style={{
                      fontFamily: Inter.semibold,
                      fontSize: responsiveFontSize(1.15),
                      color: theme.fontColorOnBackground,
                      marginBottom: 8,
                    }}
                  >
                    {t('ARCHIVED_NOTES')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(0.95),
                      color: theme.fontColorOnBackground,
                      lineHeight: 18,
                    }}
                  >
                    {orderDetails.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailComplete;