import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import Styles from './style';
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import { Images } from '../../../Constants/ImageIconContant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData } from '../../../Service/localStorage';
import { postWithOutToken, postWithToken } from '../../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import {
  setCartDetails,
  setCartQuantity,
} from '../../../Store/Reducers/CommonReducer';
import Moment from 'moment';
import {
  Container,
  Icon,
  AppTextInput,
  CheckBox,
} from 'react-native-basic-elements';
import { PermissionsAndroid } from 'react-native';

import {
  USBPrinter,
  NetPrinter,
  BLEPrinter,
} from 'react-native-thermal-receipt-printer';
import NetInfo from '@react-native-community/netinfo';
import Thermalpriter from '../../../Component/prnterConnect';

// create a component
const OrderSuccess = ({ props, route, navigation }) => {
  const styles = Styles();
  Moment.locale('en');
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { baseUrl, siteUrl, userToken, userData, post_data, langId } =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [color_theme, setColorTheme] = useState('#000000');
  const [color_theme_selected, setColorThemeSelected] = useState('#000000');

  const [order, setOrder] = useState({ isLoading: true, list: [] });

  const [ipAddressPrinter, setipaddresprinter] = useState();
  const [visiblemodal, setvisiblemodal] = useState(false);
  const [printers, setPrinters] = useState();

  const USBPrinterModule = NativeModules?.USBPrinter || {};
  USBPrinterModule.addListener = USBPrinterModule.addListener || (() => {});
  USBPrinterModule.removeListeners =
    USBPrinterModule.removeListeners || (() => {});

  const USBPrinterEmitter = new NativeEventEmitter(USBPrinterModule);

  const [tcp_string, setTcpString] = useState(null);
  const [bill_string, setBillString] = useState(null);

  const [printer_type, setPrinterType] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      //PrinterType();
    }, []),
  );

  useEffect(() => {
    /*async function WifiPermission() {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission is required for WiFi connections',
          message:
            'This app needs location permission as this is required  ' +
            'to scan for wifi networks.',
          buttonNegative: 'DENY',
          buttonPositive: 'ALLOW',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // You can now use react-native-wifi-reborn
      } else {
        // Permission denied
      }
    }
    WifiPermission();*/
  }, []);

  useEffect(() => {
    /*const fetchIPAddress = async () => {
      try {
        const state = await NetInfo.fetch();
        if (state.details && state.details.ipAddress) {
          setipaddresprinter(state.details.ipAddress);
        }
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };

    fetchIPAddress();*/
  }, []);

  const PrinterType = () => {
    /*postWithOutToken(baseUrl, 'module/common/rest-common', {
      f: 'printer_type',
    })
      .then(response => {
        console.log(response);
        setPrinterType(response);
      })
      .catch(error => {
        console.log('Error : ', error);
      });*/
  };

  const Print_printer = () => {
    if (PRINTER_OPTION == 'USBPRINTER') {
      // console.log('usb print')
      USBPrinter.printBill('<C>sample text</C>\n', { beep: true })
        .then(() => {
          return USBPrinter.closeConn();
        })
        .then(() => setPrinters(null));
    } else {
      // console.log('net print')
      NetPrinter.printBill('<C>sample text</C>')
        .then(() => {
          return NetPrinter.closeConn();
        })
        .then(() => setPrinters(null));
    }
  };
  const initializePrinters = async PRINTER_OPTION => {
    if (PRINTER_OPTION == 'USBPRINTER') {
      console.log('usb printrere');
      try {
        if (Platform.OS === 'android') {
          // Initialize the USBPrinter
          USBPrinter.init()
            .then(() => {
              // Get the list of connected printers
              return USBPrinter.getDeviceList();
            })
            .then(devices => {
              // Update the state with the list of printers

              // Check if there are any printers available
              if (devices.length > 0) {
                Alert.alert(
                  'USB Device Connected',
                  `Device Name: ${devices[0].device_name}`,
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () =>
                        USBPrinter.connectPrinter(
                          devices[0].vendor_id,
                          devices[0].product_id,
                        ).then(() => setPrinters('USBPRINTER')),
                    },
                  ],
                );
              } else {
                Alert.alert('No devices found');
              }
            })
            .then(() => {
              setvisiblemodal(false);
            })
            .catch(error => {
              // Handle errors during initialization or fetching device list
              console.error('Error:', error);
              Alert.alert('Error', 'Failed to initialize or find printers.');
            });
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } else {
      LANPrinterConnected(ipAddressPrinter);
    }
  };

  // conncted via lan port..
  const LANPrinterConnected = ipaddress => {
    console.log(ipaddress, 'ipadders connted');
    try {
      if (Platform.OS === 'android') {
        NetPrinter.init().then(np => {
          NetPrinter.connectPrinter(ipaddress, 9100)
            .then(printer => setPrinters('LANPRINTER'))
            .finally(() => {
              setvisiblemodal(false);
              console.log(printers, 'cokfdsfk');
            })
            .catch(error => console.warn('Connection Error:', error));
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error('Unexpected Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  const _connectPrinter = printer =>
    USBPrinter.connectPrinter(printer.vendorID, printer.productId).then(() =>
      setCurrentPrinter(printer),
    );

  useFocusEffect(
    React.useCallback(() => {
      fetchOrderData();

      dispatch(setCartDetails([]));
      dispatch(setCartQuantity(0));
    }, [route.params.orderId]),
  );

  useEffect(() => {
    if (colorScheme == 'dark') {
      setColorTheme('#ffffff');
      setColorThemeSelected('#000000');
    }
  }, []);

  /*const OpenCashDrawer = async () => {
    try {
      const result = await Pax.openDrawer();
      console.log('Open Drawer Result:' + result);
    } catch (error) {
      console.error('Unable to open Cash Drawer.');
    }
  };*/

  const fetchOrderData = () => {
    setLoader(true); //31714
    postWithToken(
      baseUrl,
      'web-business/orders/view',
      {
        id: route.params.orderId,
        lang_id: langId,
      },
      userToken,
    )
      .then(response => {
        //console.log(response);
        setLoader(false);

        setOrder({ isLoading: false, list: response.data });

        /*let OrderDate = response.date;
        let Bname = response.bname;
        let OrderNo = response.id;

        //cost part
        let subtotal = response.subtotal;
        let deliverycost = response.deliverycost;
        let tax = response.tax_price;
        let servicefee = response.servicefee;
        let servicefee_price = response.servicefee_price;
        let discount = response.discount;
        let tips = response.tips;
        let total = response.total;
        //cost part
        //buyer details
        let buyername = response.buyerdata.name;
        let buyeradd = response.buyerdata.delievryaddress;
        if (
          response.buyerdata.specialaddress != '' &&
          response.buyerdata.specialaddress != null
        ) {
          buyeradd = response.buyerdata.specialaddress;
        }
        let buyercel = response.buyerdata.cel;
        //buyer details
        let ordertype = response.order_type;
        let ordtype_txt = '';

        if (ordertype == 1) {
          ordtype_txt = 'delivery';
        } else if (ordertype == 2) {
          ordtype_txt = 'pickup';
        } else if (ordertype == 3) {
          ordtype_txt = 'dinein';
        }

        let dish_str = '';

        response.dishdata.map((dishdata, dishdata_index) => {
          dishdata.data.map((dish, dish_index) => {
            dish_str +=
              '[L]\n' +
              '[L]<b>' +
              dish.quantity +
              ' X ' +
              dish.name +
              '</b> [R]' +
              dish.total +
              'e\n';
            if (dish.sets.length > 0) {
              dish.sets.map((set, set_index) => {
                dish_str += '[L]' + set.name + ' - ' + set.choiceText + '\n';
              });
            }

            dish_str += '[L]\n';
          });
        });

        let text =
          '[C]<b>Welcome</b>\n' +
          '[L]\n' +
          '[C]================================\n' +
          '[L]\n' +
          "[L]<font size='big'>" +
          Bname +
          '</font>\n' +
          "[L]<font size='tall'>" +
          OrderDate +
          '</font>\n' +
          "[L]<font size='tall'>" +
          ordtype_txt +
          '</font>\n' +
          '[C]--------------------------------\n' +
          '[L]\n' +
          "[C]<u><font size='big'>Order No: " +
          OrderNo +
          '</font></u>\n' +
          '[L]\n' +
          '[C]--------------------------------\n' +
          '[L]\n' +
          dish_str +
          '[C]--------------------------------\n';

        if (discount > 0) {
          text += '[R]Discount :[R]' + discount + 'e\n';
        }

        if (tax > 0) {
          text += '[R]Tax :[R]' + tax + 'e\n';
        }

        if (servicefee_price > 0) {
          text += '[R]Service Fee :[R]' + servicefee_price + 'e\n';
        }

        text +=
          '[R]TOTAL :[R]' +
          total +
          'e\n' +
          '[L]\n' +
          '[C]--------------------------------\n' +
          '[L]\n' +
          "[L]<font size='tall'>Customer :</font>\n" +
          '[L]' +
          buyername +
          '\n' +
          '[L]' +
          buyeradd +
          '\n' +
          '[L]Mobile : ' +
          buyercel +
          '\n' +
          '[L]\n' +
          '[C]--------------------------------\n' +
          '[C]<b>Thanks!</b>\n' +
          '[L]\n' +
          '[L]\n' +
          '[L]\n' +
          '[L]\n' +
          '[L]\n';

        setTcpString(text);
        //console.log(text);

        let bill_dish_str = '';

        response.dishdata.map((dishdata, dishdata_index) => {
          dishdata.data.map((dish, dish_index) => {
            bill_dish_str +=
              '\n' +
              '<M>' +
              dish.quantity +
              ' X ' +
              dish.name +
              ' ' +
              dish.total +
              '</M>\n';
            if (dish.sets.length > 0) {
              dish.sets.map((set, set_index) => {
                bill_dish_str +=
                  '<M>' + set.name + ' - ' + set.choiceText + '</M>\n';
              });
            }

            bill_dish_str += '\n';
          });
        });

        let bill_text =
          '<CD>Welcome</CD>\n' +
          '\n' +
          '<C>================================</C>\n' +
          '\n' +
          '<CD>' +
          Bname +
          '</CD>\n' +
          '<CM>' +
          OrderDate +
          '</CM>\n' +
          '<CM>' +
          ordtype_txt +
          '</CM>>\n' +
          '<C>--------------------------------</C>\n' +
          '\n' +
          '<CD>Order No: ' +
          OrderNo +
          '</CD>\n' +
          '\n' +
          '<C>--------------------------------</C>\n' +
          '\n' +
          bill_dish_str +
          '<C>--------------------------------</C>\n';

        if (discount > 0) {
          bill_text += '<M>Discount : ' + discount + '</M>\n';
        }

        if (tax > 0) {
          bill_text += '<M>Tax : ' + tax + '</M>\n';
        }

        if (servicefee_price > 0) {
          bill_text += '<M>Service Fee : ' + servicefee_price + 'e\n';
        }

        bill_text +=
          '<B>TOTAL : ' +
          total +
          '</B>\n' +
          '\n' +
          '<C>--------------------------------</C>\n' +
          '\n' +
          '<D>Customer :</D>\n' +
          '<M>' +
          buyername +
          '</M>\n' +
          '<M>' +
          buyeradd +
          '</M>\n' +
          '<M>Mobile : ' +
          buyercel +
          '</M>\n' +
          '\n' +
          '<C>--------------------------------</C>\n' +
          '<CD>Thanks!</CD>\n' +
          '\n' +
          '\n' +
          '\n' +
          '\n' +
          '\n';
        setBillString(bill_text);
        //console.log(bill_text);*/
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const close_model = () => {
    console.log('close model');
    setvisiblemodal(false);
  };

  return (
    <Container style={styles.container}>
      {viewloader === true ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : null}

      <Modal animationType="slide" transparent={true} visible={visiblemodal}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'relative',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setvisiblemodal(false);
            }}
            style={{
              position: 'absolute',
              right: responsiveWidth(1),
              top: responsiveHeight(1.5),
              zIndex: 1,
            }}
          >
            <Icon
              name="closecircleo"
              type="AntDesign"
              size={30}
              color={Colors.red}
            />
          </TouchableOpacity>
          <View
            style={{
              height: 78,
              width: 300,
              backgroundColor: '#ffffff',
              borderRadius: 5,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Thermalpriter
                Tcp_string={tcp_string}
                Bill_string={bill_string}
                close_model={close_model}
                printer_type={printer_type}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.main}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: responsiveWidth(6),
                height: responsiveWidth(6),
                overflow: 'hidden',
                margin: 'auto',
                marginTop: responsiveHeight(2),
              }}
            >
              <Image
                source={Images.successtick}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: responsiveHeight(1),
                marginTop: responsiveHeight(2),
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontFamily: Inter.bold,
                  fontSize: responsiveFontSize(1.5),
                }}
              >
                Congratulations
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: responsiveHeight(3),
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontFamily: Inter.regular,
                  fontSize: responsiveFontSize(1.2),
                }}
              >
                Thank you. Your Order has submitted successfully
              </Text>
            </View>
          </View>

          <View>
            {order.isLoading === false ? (
              <>
                <View style={{ marginBottom: responsiveHeight(4) }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: responsiveHeight(1),
                      backgroundColor: Colors.black,
                      borderTopStartRadius: 10,
                      borderTopEndRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '30%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'ORDER NUMBER'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '20%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'DATE'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '25%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'TOTAL'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '25%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'Payment Method'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        padding: 15,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '30%',
                        fontFamily: Inter.regular,
                        color: '#000',
                        fontSize: responsiveFontSize(1),
                      }}
                    >
                      {'#'}
                      {order.list.id}
                    </Text>
                    <Text
                      style={{
                        padding: 15,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '20%',
                        fontFamily: Inter.regular,
                        color: '#000',
                        fontSize: responsiveFontSize(1),
                      }}
                    >
                      {order.list.date}
                    </Text>
                    <Text
                      style={{
                        padding: 15,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '25%',
                        fontFamily: Inter.regular,
                        color: '#000',
                        fontSize: responsiveFontSize(1),
                      }}
                    >
                      {order.list.currency_symbol}
                      {order.list.total}
                    </Text>
                    <Text
                      style={{
                        padding: 15,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '25%',
                        fontFamily: Inter.regular,
                        color: '#000',
                        fontSize: responsiveFontSize(1),
                      }}
                    >
                      {order.list.paymentmethod != null &&
                      order.list.paymentmethod.length > 0
                        ? order.list.paymentmethod[0].payment_method
                        : null}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: responsiveHeight(4) }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: responsiveHeight(1),
                      backgroundColor: Colors.black,
                      borderTopStartRadius: 10,
                      borderTopEndRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '30%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'Item Name'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '10%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'Qty'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '25%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'Ingredients'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '25%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'Options'}
                    </Text>
                    <Text
                      style={{
                        padding: 10,
                        borderWidth: 0.5,
                        height: '100%',
                        width: '10%',
                        fontFamily: Inter.bold,
                        color: '#fff',
                        fontSize: responsiveFontSize(1.1),
                      }}
                    >
                      {'Price'}
                    </Text>
                  </View>

                  {order.list.dishdata.length > 0
                    ? order.list.dishdata.map((dishdata, dishdata_index) => {
                        return dishdata.data.map((dish, dish_index) => {
                          return (
                            <View
                              key={'dish_' + dish_index}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  padding: 15,
                                  borderWidth: 0.5,
                                  height: '100%',
                                  width: '30%',
                                  fontFamily: Inter.regular,
                                  color: '#000',
                                  fontSize: responsiveFontSize(1),
                                }}
                              >
                                {dish.name}
                              </Text>
                              <Text
                                style={{
                                  padding: 15,
                                  borderWidth: 0.5,
                                  height: '100%',
                                  width: '10%',
                                  fontFamily: Inter.regular,
                                  color: '#000',
                                  fontSize: responsiveFontSize(1),
                                }}
                              >
                                {dish.quantity}
                              </Text>
                              <Text
                                style={{
                                  padding: 15,
                                  borderWidth: 0.5,
                                  height: '100%',
                                  width: '25%',
                                  fontFamily: Inter.regular,
                                  color: '#000',
                                  fontSize: responsiveFontSize(1),
                                }}
                              >
                                {dish.activeIngredientsText}
                              </Text>
                              <View
                                style={{
                                  padding: 15,
                                  borderWidth: 0.5,
                                  height: '100%',
                                  width: '25%',
                                }}
                              >
                                {dish.sets.length > 0
                                  ? dish.sets.map((set, set_index) => {
                                      return (
                                        <Text
                                          style={{
                                            fontFamily: Inter.regular,
                                            color: '#000',
                                            fontSize: responsiveFontSize(1),
                                          }}
                                          key={'set_' + set_index}
                                        >
                                          {set.name} - {set.choiceText}
                                        </Text>
                                      );
                                    })
                                  : null}
                              </View>
                              <Text
                                style={{
                                  padding: 15,
                                  borderWidth: 0.5,
                                  height: '100%',
                                  width: '10%',
                                  fontFamily: Inter.regular,
                                  color: '#000',
                                  fontSize: responsiveFontSize(1),
                                }}
                              >
                                {order.list.currency_symbol}
                                {parseFloat(dish.total).toFixed(2)}
                              </Text>
                            </View>
                          );
                        });
                      })
                    : null}
                </View>
              </>
            ) : (
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item
                  width={responsiveWidth(92)}
                  height={160}
                  alignSelf="center"
                  borderRadius={10}
                />
                <SkeletonPlaceholder.Item
                  width={responsiveWidth(92)}
                  height={40}
                  alignSelf="center"
                  marginTop={20}
                  borderRadius={10}
                />
                <SkeletonPlaceholder.Item
                  width={responsiveWidth(92)}
                  height={40}
                  alignSelf="center"
                  marginTop={20}
                  borderRadius={10}
                />
                <SkeletonPlaceholder.Item
                  width={responsiveWidth(92)}
                  height={40}
                  alignSelf="center"
                  marginTop={20}
                  borderRadius={10}
                />
                <SkeletonPlaceholder.Item
                  width={responsiveWidth(92)}
                  height={40}
                  alignSelf="center"
                  marginTop={20}
                  borderRadius={10}
                />
              </SkeletonPlaceholder>
            )}

            {/*<TouchableOpacity
              onPress={() => {
                setvisiblemodal(true);
              }}
              style={{
                marginVertical: responsiveHeight(6),
                flexDirection: 'row',
                alignItems: 'center',
                height: responsiveHeight(10),
                width: '25%',
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#01b629',
                marginTop: 15,
                borderRadius: 5,
                marginBottom: 20,
              }}>
              <Icon
                style={{}}
                type="AntDesign"
                name="printer"
                color={'#fff'}
                size={responsiveWidth(4)}
              />
            </TouchableOpacity>*/}

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                navigation.navigate('H');
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: responsiveFontSize(1.5),
                  color: '#fff',
                  fontFamily: Inter.medium,
                }}
              >
                Continue to Create Order
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Container>

    // <SkeletonPlaceholder >
    //   <SkeletonPlaceholder.Item width={responsiveWidth(92)} height={160} alignSelf='center' borderRadius={10} />
    //   <SkeletonPlaceholder.Item width={responsiveWidth(92)} height={40} alignSelf='center' marginTop={20} borderRadius={10} />
    //   <SkeletonPlaceholder.Item width={responsiveWidth(92)} height={40} alignSelf='center' marginTop={20} borderRadius={10} />
    //   <SkeletonPlaceholder.Item width={responsiveWidth(92)} height={40} alignSelf='center' marginTop={20} borderRadius={10} />
    //   <SkeletonPlaceholder.Item width={responsiveWidth(92)} height={40} alignSelf='center' marginTop={20} borderRadius={10} />

    // </SkeletonPlaceholder>
  );
};

export default OrderSuccess;
