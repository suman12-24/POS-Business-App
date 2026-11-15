import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Modal,
  FlatList,
  Alert,
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
  setUsbPrinterValue
} from '../../../Store/Reducers/CommonReducer';
import Moment from 'moment';
import { Container } from 'react-native-basic-elements';
import useTranslation from '../../../Hooks/useTranslation';
import { useAppTheme } from '../../../Hooks/useAppTheme';
import EbPrinter from 'react-native-ebprinter';
import SelectUsbPrinter from '../../Component/selectusbprinter';
import { setData } from '../../../Service/localStorage';
import { printOrderReceipt } from '../../../utility/printReceipt'; // adjust path to match your folder

// Fixed device slots — EbPrinter can hold a USB connection and a
// network connection at the same time, each addressed by its own index.
const PRINTER_INDEX = { usb: 0, wifi: 1 };
const WIFI_PRINTER_DEFAULT_PORT = 9100;
// Now mostly a backstop — the native selectNetworkPrinter call itself is
// capped at 4s (see EbPrinterModule.java), so this JS-level timeout should
// rarely if ever trigger. Kept slightly above the native cap so the native
// timeout/rejection has a chance to surface first.
const WIFI_PRINT_TIMEOUT_MS = 5000;

// Races a promise against a timeout. If the timeout wins, we move on —
// but we still attach a handler to the original promise so that if it
// settles later, it doesn't surface as an unhandled promise rejection.
const withTimeout = (promise, ms, onTimeout) => {
  let settled = false;
  const timeout = new Promise(resolve => {
    setTimeout(() => {
      if (!settled) {
        if (onTimeout) onTimeout();
        resolve('timeout');
      }
    }, ms);
  });
  promise
    .then(() => { settled = true; })
    .catch(e => {
      settled = true;
      console.log('Late-settling promise after timeout:', e);
    });
  return Promise.race([promise, timeout]);
};

const OrderSuccess = ({ props, route, navigation }) => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  Moment.locale('en');
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { baseUrl, siteUrl, userToken, userData, post_data, langId, UsbPrinter } =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const { t } = useTranslation();
  const [order, setOrder] = useState({ isLoading: true, list: [] });
  const [visiblemodal, setvisiblemodal] = useState(false);
  const [printerlist, setPrinterList] = useState([]);
  const [SelectedUsb, setSelectedUsb] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [printWifiLoading, setPrintWifiLoading] = useState(false); // NEW
  const [wifiPrinter, setWifiPrinter] = useState({ ip: null, port: WIFI_PRINTER_DEFAULT_PORT });
  const activeBusiness = route.params.activeBusiness;

  useFocusEffect(
    React.useCallback(() => {
      fetchOrderData();
      dispatch(setCartDetails([]));
      dispatch(setCartQuantity(0));
    }, [route.params.orderId]),
  );

  const [printerConfig, setPrinterConfig] = useState({
    loaded: false,
    counterAutoEnabled: false,
    counterCopies: 1,
    kitchenAutoEnabled: false,
    kitchenCopies: 1,
  });
  const hasAutoPrintedRef = React.useRef(false);

  useEffect(() => {
    fetchPrinterConfig();
  }, []);

  // ---- Printer config (counter/USB + kitchen/WiFi) ---------------------
  const fetchPrinterConfig = () => {
    postWithToken(baseUrl, 'get-printer-details', { lang_id: langId }, userToken)
      .then(response => {
        if (response.status === true && response.data) {
          const d = response.data;
          if (d.printer_kitchen_ip_address) {
            setWifiPrinter({
              ip: String(d.printer_kitchen_ip_address),
              port: WIFI_PRINTER_DEFAULT_PORT, // bump this if you later save a port field
            });
          }
          setPrinterConfig({
            loaded: true,
            counterAutoEnabled: Number(d.printer_counter_auto_enable) === 1,
            counterCopies: parseInt(d.printer_counter_print_copy, 10) || 1,
            kitchenAutoEnabled: Number(d.printer_kitchen_auto_enable) === 1,
            kitchenCopies: parseInt(d.printer_kitchen_print_copy, 10) || 1,
          });
        } else {
          setPrinterConfig(prev => ({ ...prev, loaded: true }));
        }
      })
      .catch(error => {
        console.log('Error fetching printer config:', error);
        setPrinterConfig(prev => ({ ...prev, loaded: true }));
      });
  };

  const showPrinterAlert = (title, message) => {
    Alert.alert(
      title || t('PRINTER_ERROR') || 'Printer Error',
      message || t('SOMETHING_WENT_WRONG_WITH_THE_PRINTER') || 'Something went wrong with the printer. Please check the connection and try again.',
    );
  };

  const getUsbDeviceList = async () => {
    try {
      if (!EbPrinter || typeof EbPrinter.getUsbDeviceList !== 'function') {
        throw new Error('Printer module unavailable.');
      }
      const usbdevicelist = await EbPrinter.getUsbDeviceList(PRINTER_INDEX.usb);
      if (usbdevicelist && usbdevicelist.length > 0) {
        setPrinterList(usbdevicelist);
        setvisiblemodal(true);
      } else {
        showPrinterAlert(
          t('NO_PRINTER_FOUND') || 'No Printer Found',
          t('NO_USB_PRINTER_DETECTED') || 'No USB printer devices were detected. Please connect a printer and try again.',
        );
      }
    } catch (e) {
      console.log('Error fetching USB device list:', e);
      showPrinterAlert(
        t('PRINTER_LIST_ERROR') || 'Printer List Error',
        (e && e.message) || 'Unable to fetch the list of USB printers.',
      );
    }
  };

  const selectDevice = async item => {
    try {
      setSelectedUsb(item);
      dispatch(setUsbPrinterValue(item));
      setData('UsbPrinterValue', JSON.stringify(item));
      setvisiblemodal(false);
      await printUsbCopies(printerConfig.counterCopies || 1);
    } catch (e) {
      console.log('Error selecting USB printer:', e);
      setvisiblemodal(false);
      showPrinterAlert(t('PRINTER_SELECT_ERROR') || 'Printer Selection Error', e?.message);
    }
  };

  // ---- USB (counter) copies — prints ONLY the USB receipt ---------------
  const printUsbCopies = async copies => {
    if (UsbPrinter == null) {
      showPrinterAlert(
        t('USB_PRINTER_NOT_CONNECTED') || 'USB Printer Not Connected',
        t('CONNECT_USB_PRINTER_IN_SETTINGS') ||
        'Connect a USB printer in Printer Settings to enable automatic counter receipt printing.',
      );
      return;
    }
    for (let i = 0; i < copies; i++) {
      const { usb } = await printOrderReceipt({ response: data, usbPrinter: UsbPrinter });
      if (!usb) {
        showPrinterAlert(t('USB_PRINT_ERROR') || 'USB Print Error');
        break; // avoid hammering a printer that's already failing
      }
    }
  };

  // ---- WiFi (kitchen) copies — prints ONLY the WiFi/kitchen receipt -----
  // CHANGED: stops immediately on the first failed/timed-out copy instead
  // of burning through the remaining `copies` count, and reports back how
  // many copies actually succeeded plus why it stopped, so callers (manual
  // button vs auto-print) can react appropriately.
  const printWifiCopies = async copies => {
    if (!wifiPrinter.ip) {
      return { attempted: 0, ok: 0, reason: 'not_configured' };
    }

    let successCount = 0;
    for (let i = 0; i < copies; i++) {
      const result = await withTimeout(
        printOrderReceipt({ response: data, wifiPrinter }),
        WIFI_PRINT_TIMEOUT_MS,
        () => console.log('WiFi print timed out — skipping remaining copies'),
      );

      if (result === 'timeout') {
        return { attempted: i + 1, ok: successCount, reason: 'timeout' };
      }
      if (result?.wifi) {
        successCount++;
      } else {
        return { attempted: i + 1, ok: successCount, reason: 'failed' };
      }
    }
    return { attempted: copies, ok: successCount, reason: 'complete' };
  };

  // ---- Auto-print: fires BOTH USB and WiFi independently, each for its
  // own configured number of copies, when their respective flags are on.
  const autoPrintReceipts = async () => {
    if (printerConfig.counterAutoEnabled) {
      await printUsbCopies(printerConfig.counterCopies);
    }
    if (printerConfig.kitchenAutoEnabled) {
      await printWifiCopies(printerConfig.kitchenCopies);
    }
  };

  // Fires once, only when arriving here right after placing an order
  // (HomeRight.js passes autoPrint: true), and only after both the order
  // data and the printer config have finished loading.
  useEffect(() => {
    if (
      route.params?.autoPrint &&
      !hasAutoPrintedRef.current &&
      !order.isLoading &&
      printerConfig.loaded
    ) {
      hasAutoPrintedRef.current = true;
      autoPrintReceipts();
    }
  }, [route.params?.autoPrint, order.isLoading, printerConfig.loaded]);

  // ---- Manual "Print Receipt" button — USB (counter) ONLY, never WiFi ---
  const handlePrintButton = async () => {
    if (order.isLoading) return;
    setPrintLoading(true);
    try {
      if (UsbPrinter == null) {
        await getUsbDeviceList(); // opens picker; selectDevice() prints after pick
      } else {
        await printUsbCopies(printerConfig.counterCopies || 1);
      }
    } catch (e) {
      console.log('Print button error:', e);
      showPrinterAlert(t('PRINT_ERROR') || 'Print Error', e?.message);
    } finally {
      setPrintLoading(false);
    }
  };

  // ---- NEW: Manual "Print Kitchen Receipt" button — WiFi ONLY -----------
  const handlePrintWifiButton = async () => {
    if (order.isLoading) return;

    if (!wifiPrinter.ip) {
      showPrinterAlert(
        t('WIFI_PRINTER_NOT_CONFIGURED') || 'Kitchen Printer Not Configured',
        t('CONFIGURE_KITCHEN_PRINTER_IP') ||
          'Add a kitchen printer IP address in Printer Settings to enable WiFi printing.',
      );
      return;
    }

    setPrintWifiLoading(true);
    try {
      // Manual reprint: just one copy, regardless of the auto-print copy count.
      const result = await printWifiCopies(1);
      if (result.ok === 0) {
        showPrinterAlert(
          t('WIFI_PRINT_ERROR') || 'Kitchen Print Error',
          result.reason === 'timeout'
            ? (t('WIFI_PRINTER_UNREACHABLE') || `Could not reach the printer at ${wifiPrinter.ip}. Check it's powered on and on the same network.`)
            : (t('SOMETHING_WENT_WRONG_WITH_THE_PRINTER') || 'Something went wrong printing the kitchen receipt.'),
        );
      }
    } catch (e) {
      console.log('WiFi print button error:', e);
      showPrinterAlert(t('PRINT_ERROR') || 'Print Error', e?.message);
    } finally {
      setPrintWifiLoading(false);
    }
  };

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
          <Modal animationType="slide" transparent={true} visible={visiblemodal}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <TouchableOpacity
                onPress={() => setvisiblemodal(false)}
                style={{ position: 'absolute', right: responsiveWidth(4), top: responsiveHeight(6) }}>
                <Ionicons name="close-circle-outline" size={responsiveFontSize(2)} color={theme.fontColorOnBackground} />
              </TouchableOpacity>
              <View style={{ height: responsiveHeight(35), width: responsiveWidth(80), backgroundColor: theme.background, borderRadius: 10 }}>
                <FlatList
                  data={printerlist}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ddd', paddingHorizontal: 14 }}
                      onPress={() => selectDevice(item)}>
                      <Text style={{ fontSize: responsiveFontSize(1.8), color: theme.primary }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
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
        <View style={[styles.footerButtonRow, { flexWrap: 'wrap' }]}>
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
          <TouchableOpacity
            style={[styles.outlineButton, printLoading && { opacity: 0.6 }, { marginLeft: 10 }]}
            disabled={printLoading}
            onPress={handlePrintButton}
          >
            <Text style={styles.outlineButtonText}>
              {printLoading ? t('PRINTING') || 'Printing…' : t('PRINT_RECEIPT') || 'Print Receipt'}
            </Text>
          </TouchableOpacity>

          {/* NEW: manual kitchen/WiFi receipt */}
          <TouchableOpacity
            style={[styles.outlineButton, printWifiLoading && { opacity: 0.6 }, { marginLeft: 10 }]}
            disabled={printWifiLoading}
            onPress={handlePrintWifiButton}
          >
            <Text style={styles.outlineButtonText}>
              {printWifiLoading
                ? t('PRINTING') || 'Printing…'
                : t('PRINT_KITCHEN_RECEIPT') || 'Print Kitchen Receipt'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>


  );
};

export default OrderSuccess;