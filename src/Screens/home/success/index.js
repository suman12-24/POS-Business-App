import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Styles from './style';
import { Images } from '../../../Constants/ImageIconContant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import { postWithToken } from '../../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import {
  setCartDetails,
  setCartQuantity,
} from '../../../Store/Reducers/CommonReducer';
import Moment from 'moment';
import { Container } from 'react-native-basic-elements';
import useTranslation from '../../../Hooks/useTranslation';
import { useAppTheme } from '../../../Hooks/useAppTheme';
const OrderSuccess = ({ props, route, navigation }) => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  Moment.locale('en');
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { baseUrl, siteUrl, userToken, userData, post_data, langId } =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const { t } = useTranslation();
  const [order, setOrder] = useState({ isLoading: true, list: [] });
  const activeBusiness = route.params.activeBusiness;
  useFocusEffect(
    React.useCallback(() => {
      fetchOrderData();
      dispatch(setCartDetails([]));
      dispatch(setCartQuantity(0));
    }, [route.params.orderId]),
  );

  const fetchOrderData = () => {
    setLoader(true);
    postWithToken(
      baseUrl,
      'orders/view',
      {
        id: route.params.orderId,
        lang_id: langId,
      },
      userToken,
    )
      .then(response => {
        setLoader(false);
        setOrder({ isLoading: false, list: response.data });
        console.log("Add order data", response.data);
      })
      .catch(error => {
        setLoader(false);
        console.log('Error : ', error);
      });
  };

  // ---- helpers -------------------------------------------------------
  const data = order.list || {};
  const currency = data.currency_symbol || '';
  const paymentMethod =
    data.paymentmethod != null && data.paymentmethod.length > 0
      ? data.paymentmethod[0].payment_method
      : '-';
  // Fallback-safe reads — update key names to match your actual API response.
  const customerName = data.buyername || '-';
  const customerPhone = data.buyerphone || '-';
  const customerEmail = data.buyeremail || '-';
  const deliveryAddress = data.buyerdata?.delievryaddress || '-';
  const deliveryNote = data?.buyerdata?.notes || '-';

  const deliveryDateTime = (() => {
    if (data.delivery_date_time) {
      return data.delivery_date_time;
    }
    if (data.date && Moment(data.date).isValid()) {
      let readyMoment = Moment(data.date);

      if (data.estimate_time) {
        const [offH, offM] = data.estimate_time.split(':').map(v => parseInt(v, 10));
        readyMoment = readyMoment
          .add(offH || 0, 'hours')
          .add(offM || 0, 'minutes');
      }
      return readyMoment.format('DD-MM-YYYY H:mm:ss');
    }
    return '-';
  })();
  const subtotal = data.subtotal ?? data.sub_total ?? data.total ?? null;
  const taxAmount = data.tax_price ?? data.tax_price ?? null;
  const taxPercent = data.tax ?? data.tax ?? null;
  const serviceFee = data?.cartfee?.servicefeeprice ?? null;
  const servicePercent = data?.cartfee?.servicefee ?? data.service_fee ?? null;
  const discountAmount = data.cartfee?.discount ?? data.discount_amount ?? null;
  const discountPercent = data.discount_percent ?? data.discount_percentage ?? null;
  const deliveryFee = data.cartfee?.deliverycost ?? null;

  const orderType = data.order_type ?? null;

  let orderTypeText = '-';

  if (orderType == 2) {
    orderTypeText = "Pickup";
  } else if (orderType == 1) {
    orderTypeText = "Delivery";
  }
  else if (orderType == 3) {
    orderTypeText = "Dine In";
  }
  else if (orderType == 4) {
    orderTypeText = "Catering";
  }
  const money = value =>
    value === null || value === undefined
      ? '-'
      : `${currency}${parseFloat(value).toFixed(2)}`;

  return (
    <Container style={styles.container}>
      <View style={styles.main}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: responsiveHeight(1) }}
          showsVerticalScrollIndicator={false}
        >
          {order.isLoading === false ? (
            <>

              {/* ---------------- Success block ---------------- */}
              <View style={styles.successWrap}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark" size={responsiveFontSize(2.6)} color={theme.fontColor} />
                </View>
                <Text style={styles.successTitle}>{t('CONGRATULATIONS')}!</Text>
                <View style={styles.orderNumberRow}>
                  <Text style={styles.orderNumberLabel}>{t('ORDER_NUMBER')} </Text>
                  <Text style={styles.orderNumberValue}>#{data.id}</Text>
                </View>
                <Text style={styles.successSubtitle}>{t('THANK_YOU_ORDER_RECEIVED')}</Text>
              </View>

              {/* ---------------- Contact & Delivery (side by side) ---------------- */}
              <View style={styles.dualCardRow}>
                <View style={styles.dualCard}>
                  <Text style={styles.plainCardTitle}>{t('CONTACT_DETAILS')}</Text>
                  <View style={styles.deliveryWrap}>
                    <View style={styles.roundIconBadge}>
                      <Ionicons name="person-outline" size={responsiveFontSize(1.4)} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deliveryBoldLabel}>{t('CUSTOMER_DETAILS')}</Text>
                      <Text style={styles.deliveryText}>{customerName}</Text>
                      {customerPhone !== '-' ? (
                        <Text style={styles.deliveryText}>{customerPhone}</Text>
                      ) : null}
                      {customerEmail ? (
                        <Text style={styles.deliveryText}>{customerEmail}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                <View style={styles.dualCard}>
                  <Text style={styles.plainCardTitle}>{t('DELIVERY_DETAILS')}</Text>
                  <View style={styles.deliveryWrap}>
                    <View style={styles.roundIconBadge}>
                      <Ionicons name="location-outline" size={responsiveFontSize(1.4)} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      {orderTypeText !== '-' ? (
                        <>
                          <Text style={styles.deliveryBoldLabel}>{t('ORDER_TYPE')}</Text>
                          <Text style={styles.deliveryText}>{orderTypeText}</Text>
                        </>
                      ) : null}

                      {deliveryAddress !== '-' ? (
                        <>
                          <Text style={styles.deliveryBoldLabel}>
                            {orderType == 2 ? t('PICKUP_ADDRESS') : t('DELIVERY_ADDRESS')}
                          </Text>
                          <Text style={styles.deliveryText}>{deliveryAddress}</Text>
                        </>
                      ) : null}

                      {deliveryDateTime !== '-' ? (
                        <>
                          <Text style={[styles.deliveryBoldLabel, { marginTop: responsiveHeight(0.6) }]}>
                            {orderType == 2 ? t('PICKUP_DATE_TIME') : t('DELIVERY_DATE_TIME')}
                          </Text>
                          <Text style={styles.deliveryText}>{deliveryDateTime}</Text>
                        </>
                      ) : null}

                      {deliveryNote !== '-' ? (
                        <>
                          <Text style={[styles.deliveryBoldLabel, { marginTop: responsiveHeight(0.6) }]}>
                            {t('DELIVERY_NOTE')}
                          </Text>
                          <Text style={styles.deliveryText}>{deliveryNote}</Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
              {/* ---------------- Order Summary (items + totals) ---------------- */}
              <View style={styles.card}>
                <Text style={styles.plainCardTitleWithBorder}>{t('ORDER_SUMMARY')}</Text>

                {data.dishdata && data.dishdata.length > 0
                  ? (() => {
                    const flatDishes = [];
                    data.dishdata.forEach(dishdata => {
                      dishdata.data.forEach(dish => flatDishes.push(dish));
                    });
                    return flatDishes.map((dish, dish_index) => (
                      <React.Fragment key={'dish_' + dish_index}>
                        <View style={styles.itemRow}>
                          {dish.is_img ? (
                            <>
                              <View style={styles.itemThumbWrap}>
                                <Image
                                  source={{ uri: dish.is_img }}
                                  style={styles.itemThumb}
                                  resizeMode="cover"
                                />
                              </View>
                              <View style={styles.qtyBadge}>
                                <Text style={styles.qtyBadgeText}>{dish.quantity}</Text>
                              </View>
                            </>
                          ) : (
                            <View style={styles.qtyBadge}>
                              <Text style={styles.qtyBadgeText}>{dish.quantity}</Text>
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{dish.name}</Text>
                            {dish.activeIngredientsText ? (
                              <Text style={styles.itemDetailText}>{dish.activeIngredientsText}</Text>
                            ) : null}

                            {dish.sets.length > 0
                              ? dish.sets.map((set, set_index) => {
                                return set.choice.length > 0
                                  ? set.choice.map((choice, choice_index) => (
                                    <Text
                                      key={'choice_' + set_index + '_' + choice_index}
                                      style={styles.itemDetailText}
                                      numberOfLines={1}
                                    >
                                      {choice.qty} X {choice.name} -{' '}
                                      {activeBusiness != null ? activeBusiness.currency_symbol : null}
                                      {choice.price}
                                    </Text>
                                  ))
                                  : null;
                              })
                              : null}

                            {dish.notes ? (
                              <View style={styles.noteRow}>
                                <Ionicons
                                  name="pencil"
                                  size={responsiveFontSize(0.9)}
                                  color="#9CA3AF"
                                  style={{ marginRight: 4 }}
                                />
                                <Text style={styles.itemDetailText}>{dish.notes}</Text>
                              </View>
                            ) : null}
                          </View>

                          <Text style={styles.itemPrice}>
                            {currency}
                            {parseFloat(dish.total).toFixed(2)}
                          </Text>
                        </View>
                        {dish_index < flatDishes.length - 1 ? (
                          <View style={styles.itemDivider} />
                        ) : null}
                      </React.Fragment>
                    ));
                  })()
                  : null}

                <View style={[styles.itemDivider, { marginTop: 10, marginBottom: 10 }]} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('SUBTOTAL')}</Text>
                  <Text style={styles.summaryValue}>{money(subtotal)}</Text>
                </View>
                {taxAmount > 0 &&
                  <View style={styles.summaryRow}>
                    <View>
                      <Text style={styles.summaryLabel}>
                        {t('TAX')} {taxPercent ? `(${taxPercent}%)` : ''}
                      </Text>
                      <Text style={styles.summaryLabelNote}>{t('TAX_NOT_INCLUDED')}</Text>
                    </View>
                    <Text style={styles.summaryValue}>{money(taxAmount)}</Text>
                  </View>
                }
                {serviceFee > 0 &&
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {t('SERVICE_FEE')} {servicePercent ? `(${servicePercent}%)` : ''}
                    </Text>
                    <Text style={styles.summaryValue}>{money(serviceFee)}</Text>
                  </View>
                }
                {discountAmount > 0 &&
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {t('ORDER_TEMPLATE_DISCOUNT')} {discountPercent ? `(${discountPercent}%)` : ''}
                    </Text>
                    <Text style={styles.summaryValue}>{money(discountAmount)}</Text>
                  </View>
                }
                {
                  deliveryFee > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{t('DELIEVRY_FEE')}</Text>
                      <Text style={styles.summaryValue}>{money(deliveryFee)}</Text>
                    </View>
                  )
                }

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t('TOTAL_AMOUNT')}</Text>
                  <Text style={styles.totalValue}>{money(data.total)}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.summaryLabel}>{t('PAYMENT_METHOD')} :</Text>
                  <Text style={styles.paymentValue}>{paymentMethod}</Text>
                </View>
              </View>
            </>
          ) : (
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item
                width={responsiveWidth(92)}
                height={120}
                alignSelf="center"
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item
                width={responsiveWidth(92)}
                height={100}
                alignSelf="center"
                marginTop={14}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item
                width={responsiveWidth(92)}
                height={220}
                alignSelf="center"
                marginTop={14}
                borderRadius={10}
              />
            </SkeletonPlaceholder>
          )}
        </ScrollView>

        {/* ---------------- Fixed bottom buttons ---------------- */}
        <View style={styles.footerButtonRow}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => {
              navigation.navigate('MyOrder_Tab', {
                screen: 'MyOrder',
              });
            }}
          >
            <Text style={styles.outlineButtonText}>{t('GO_TO_ORDER_LIST')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.navigate('H');
            }}
          >
            <Text style={styles.buttonText}>{t('CONTINUE_CREATE_ORDER')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

export default OrderSuccess;