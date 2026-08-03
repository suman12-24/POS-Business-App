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
      'orders/view',
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



import { StyleSheet } from 'react-native';
import{ Colors} from '../../../Constants/Colors';
import { Calibri } from '../../../Constants/Fonts';
import { responsiveHeight, responsiveWidth, responsiveFontSize} from "react-native-responsive-dimensions";
const Styles = () => {
    return StyleSheet.create({
      container: {flex: 1, backgroundColor: Colors.backgroundColor, position: 'relative'},
      main: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        paddingHorizontal: responsiveWidth(2),
        paddingVertical: responsiveHeight(2),
      },
      button:{
        height: responsiveWidth(4),
        width: responsiveWidth(30),
        backgroundColor: Colors.blue,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: 10,
        
      },
    });
  };
  //export default Styles;


