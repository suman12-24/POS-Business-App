import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TextInput,
  ScrollView,
  useColorScheme,
  Image,
  Pressable,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import Styles from './style';
import {Colors} from '../../../Constants/Colors';
import {Inter} from '../../../Constants/Fonts';
import {Images} from '../../../Constants/ImageIconContant';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useDispatch, useSelector} from 'react-redux';
import {showToastMsg, getData, setData} from '../../../Service/localStorage';
import {postWithToken, postWithOutToken} from '../../../Service/service';
import {useFocusEffect} from '@react-navigation/native';
import Moment from 'moment';
import Modal from 'react-native-modal';
import {Picker} from '@react-native-picker/picker';
import {
  Container,
  Icon,
  AppTextInput,
  CheckBox,
} from 'react-native-basic-elements';
// create a component

import NetInfo from '@react-native-community/netinfo';
import Thermalpriter from '../../../Component/prnterConnect';
import Loader from '../../../Component/loader';

const MyOrderInprogress = ({props, route, navigation}) => {
  const styles = Styles();
  Moment.locale('en');
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const {baseUrl, siteUrl, userToken, userData, post_data, langId} =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [color_theme, setColorTheme] = useState('#000000');
  const [color_theme_selected, setColorThemeSelected] = useState('#000000');
  const [orderlist, setOrderList] = useState({
    isLoading: true,
    list: [],
  });
  const [viewmoreloader, setMoreLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useFocusEffect(
    React.useCallback(() => {
      getOrderList();
    }, []),
  );

  useEffect(() => {
    if (colorScheme == 'dark') {
      setColorTheme('#ffffff');
      setColorThemeSelected('#000000');
    }
  }, []);

  /*printer code */

  const [ipAddressPrinter, setipaddresprinter] = useState();
  const [visiblemodal, setvisiblemodal] = useState(false);
  const [printers, setPrinters] = useState();

  const [tcp_string, setTcpString] = useState(null);
  const [bill_string, setBillString] = useState(null);

  const [printer_type, setPrinterType] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      //PrinterType();
    }, []),
  );

  useEffect(() => {
    /* async function WifiPermission() {
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
    postWithOutToken(baseUrl, 'module/common/rest-common', {
      f: 'printer_type',
    })
      .then(response => {
        console.log(response);
        setPrinterType(response);
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const fetchOrderData = id => {
    setLoader(true); //31714
    postWithOutToken(baseUrl, 'web-business/orders/view', {
      lang_id: langId,
      id: id,
    })
      .then(response => {
        // console.log(response);
        setLoader(false);

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
        //console.log(bill_text);

        setvisiblemodal(true);*/
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const close_model = () => {
    console.log('close model');
    setvisiblemodal(false);
  };

  /*printer coce */

  const getOrderList = () => {
    //setMoreLoader(true);
    let search_status = [1, 2, 3, 9, 10, 11, 12];
    const nextPage = 1;
    postWithToken(
      baseUrl,
      'web-business/orders/list',
      {
        lang_id: langId,
        pageNo: nextPage,
        status: search_status,
      },
      userToken,
    )
      .then(response => {
        //setMoreLoader(false);

        if (response.status == true) {
          if (response.data.length > 0) {
            setCurrentPage(nextPage);
            setOrderList({
              isLoading: false,
              list: response.data,
            });
          } else {
            setOrderList({isLoading: false, list: []});
          }
        } else {
          setOrderList({isLoading: false, list: []});
        }
      })
      .catch(error => {
        //setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    setMoreLoader(true);
    let search_status = [1, 2, 3, 9, 10, 11, 12];
    const nextPage = currentPage + 1;
    postWithToken(
      baseUrl,
      'web-business/orders/list',
      {
        lang_id: langId,
        pageNo: nextPage,
        status: search_status,
      },
      userToken,
    )
      .then(response => {
        setMoreLoader(false);
        //console.log(response);
        if (response.status == true) {
          if (response.data.length > 0) {
            setCurrentPage(nextPage);
            setOrderList({
              isLoading: false,
              list: [...orderlist.list, ...response.data],
            });
          } else {
            setOrderList({isLoading: false, list: orderlist.list});
          }
        } else {
          setOrderList({isLoading: false, list: orderlist.list});
        }
      })
      .catch(error => {
        setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  const renderLoader = () => {
    return (
      <>
        {viewmoreloader === true ? (
          <View>
            <SkeletonPlaceholder borderRadius={4}>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
            </SkeletonPlaceholder>
          </View>
        ) : null}
      </>
    );
  };

  const openDetails = item => {
    setOrderDetails(item);
    toggleModal();
  };

  const displayVal = val => {
    if (val == 0) {
      return 'Pending';
    }
    if (val == 1) {
      return 'Accepted By Restaurant';
    }
    if (val == 2) {
      return 'Accepted by Driver';
    }
    if (val == 3) {
      return 'Delivery Complete by Driver';
    }
    if (val == 4) {
      return 'Completed by Resturant';
    }
    if (val == 5) {
      return 'Complete';
    }
    if (val == 6) {
      return 'Cancelled by Resturant';
    }
    if (val == 7) {
      return 'Rejected by Driver';
    }
    if (val == 8) {
      return 'Cancelled';
    }
    if (val == 9) {
      return 'Pickup Complete by Driver';
    }
    if (val == 10) {
      return 'Pickup Complete from user by Driver';
    }
    if (val == 11) {
      return 'Delivery Complete to Business by Driver';
    }
    if (val == 12) {
      return 'Verified by Resturant';
    }
  };

  const displayValColor = val => {
    if (val == 0) {
      return '#ee4336';
    }
    if (val == 1) {
      return '#e6b90e';
    }
    if (val == 2) {
      return '#e6b90e';
    }
    if (val == 3) {
      return '#4ac112';
    }
    if (val == 4) {
      return '#4ac112';
    }
    if (val == 5) {
      return '#4ac112';
    }
    if (val == 6) {
      return '#888';
    }
    if (val == 7) {
      return '#888';
    }
    if (val == 8) {
      return '#888';
    }
    if (val == 9) {
      return '#4ac112';
    }
    if (val == 10) {
      return '#e6b90e';
    }
    if (val == 11) {
      return '#e6b90e';
    }
    if (val == 12) {
      return '#4ac112';
    }
  };

  const CompleteOrder = (id, index) => {
    Alert.alert('Warning!', 'Are you sure you want to complete this Order', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          CompleteAction(id, index);
        },
      },
    ]);
  };

  const CompleteAction = (order_id, index) => {
    console.log(order_id, index);
    setLoader(true);
    console.log(order_id);
    postWithToken(
      baseUrl,
      'web-business/orders/status-change',
      {
        id: order_id,
        status: 4,
        lang_id: langId,
      },
      userToken,
    )
      .then(response => {
        setLoader(false);

        orderlist.list.splice(index, 1);

        setTimeout(() => {
          setOrderList({isLoading: false, list: orderlist.list});
        }, 1000);
      })
      .catch(error => {
        setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  return (
    <Container style={styles.container}>
      {/*viewloader === true ? (
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
          }}>
          <ActivityIndicator size="large" color={Colors.activityIndicator} />
        </View>
      ) : null*/}

      {viewloader === true ? <Loader /> : null}

      <View style={styles.main}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 10,
            borderBottomWidth: 1.5,
            borderBottomColor: Colors.blue,
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MyOrder');
            }}
            style={[
              styles.tab_button,
              {
                borderColor: Colors.blue,
                borderWidth: 1,
                backgroundColor: Colors.white,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.blue,
                fontFamily: Inter.medium,
              }}>
              Current
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPressIn={() => {
              navigation.navigate('MyOrderInprogress');
            }}
            style={[
              styles.tab_button,
              {
                borderColor: Colors.blue,
                borderWidth: 1,
                backgroundColor: Colors.blue,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.white,
                fontFamily: Inter.medium,
              }}>
              Inprogress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPressIn={() => {
              navigation.navigate('MyOrderComplete');
            }}
            style={[
              styles.tab_button,
              {
                borderColor: Colors.blue,
                borderWidth: 1,
                backgroundColor: Colors.white,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.blue,
                fontFamily: Inter.medium,
              }}>
              Complete
            </Text>
          </TouchableOpacity>
        </View>

        {orderlist.isLoading === false && orderlist.list.length > 0 ? (
          <FlatList
            data={orderlist.list}
            contentContainerStyle={{
              marginHorizontal: 10,
              paddingBottom: responsiveHeight(10),
            }}
            ListFooterComponent={renderLoader}
            onMomentumScrollEnd={() => {
              getOrderListRefresh();
            }}
            onEndReachedThreshold={0.1}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => {
              return (
                <View key={index}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 20,
                      paddingTop: responsiveHeight(2),
                      borderBottomColor: Colors.grey,
                      borderBottomWidth: 1,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        openDetails(item);
                      }}
                      style={{
                        flexDirection: 'column',
                        display: 'flex',
                        flex: 1,
                      }}>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.3),
                          color: Colors.black,
                        }}>
                        Order Id: #{item.id}
                        {'    '}
                        <Text
                          style={{
                            fontFamily: Inter.medium,
                            fontSize: responsiveFontSize(1.3),
                            color: Colors.red,
                            marginLeft: responsiveWidth(10),
                          }}>
                          {item.sourcetype == 'Uber' ? 'UberEats' : null}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.3),
                          color: Colors.black,
                          marginBottom: responsiveHeight(0.5),
                        }}>
                        {item.buyername}
                      </Text>

                      {/*item.is_img == 1 ? (
                        <View
                          style={{
                            width: responsiveWidth(6),
                            height: responsiveWidth(4),
                            overflow: 'hidden',
                          }}>
                          <Image
                            source={{uri: item.img}}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </View>
                      ) : (
                        <View
                          style={{
                            width: responsiveWidth(6),
                            height: responsiveWidth(4),
                            overflow: 'hidden',
                          }}>
                          <Image
                            source={Images.profile}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </View>
                      )*/}

                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1),
                          color: Colors.black,
                          marginTop: responsiveHeight(0.5),
                        }}>
                        {item.date}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        display: 'flex',
                      }}>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.3),
                          color: Colors.black,
                        }}>
                        {item.currency_symbol}
                        {item.total}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        display: 'flex',
                        gap: 20,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          CompleteOrder(item.id, index);
                        }}
                        style={styles.button_Complete}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: responsiveFontSize(1.1),
                            color: Colors.white,
                            fontFamily: Inter.medium,
                          }}>
                          Complete Order
                        </Text>
                      </TouchableOpacity>
                      {/*<TouchableOpacity
                        onPress={() => {
                          fetchOrderData(item.id);
                        }}
                        style={styles.button_accept}>
                        <Icon
                          style={{}}
                          type="AntDesign"
                          name="printer"
                          color={'#fff'}
                          size={responsiveWidth(4)}
                        />
                      </TouchableOpacity>*/}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        ) : orderlist.isLoading === false && orderlist.list.length == 0 ? (
          <View>
            <Text
              style={{
                marginTop: responsiveHeight(30),
                alignSelf: 'center',
                fontFamily: Inter.bold,
                fontSize: 18,
                color: Colors.red,
              }}>
              No Record Found{' '}
            </Text>
          </View>
        ) : (
          <View>
            <SkeletonPlaceholder borderRadius={4}>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}>
                <View
                  style={{height: responsiveHeight(15), borderRadius: 10}}
                />
              </View>
            </SkeletonPlaceholder>
          </View>
        )}
      </View>

      <Modal isVisible={isModalVisible} style={{width: '80%', margin: 'auto'}}>
        <View style={{flex: 1, position: 'relative'}}>
          <TouchableOpacity
            onPress={toggleModal}
            style={{
              position: 'absolute',
              right: responsiveWidth(1),
              top: responsiveHeight(1.5),
              zIndex: 1,
            }}>
            <Icon
              name="closecircleo"
              type="AntDesign"
              size={30}
              color={Colors.red}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 20,
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(2),
            }}>
            <ScrollView>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: responsiveHeight(2),
                  marginTop: responsiveHeight(4),
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    gap: 10,
                  }}>
                  <Text
                    style={{
                      fontFamily: Inter.bold,
                      fontSize: responsiveFontSize(1.5),
                      color: Colors.black,
                    }}>
                    Order ID : #{orderDetails != null ? orderDetails.id : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Order Date and Time :{' '}
                    {orderDetails != null ? orderDetails.date : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Estimated Delivery Time :{' '}
                    {orderDetails != null
                      ? orderDetails.estimatedelivery
                      : null}{' '}
                  </Text>
                  <View style={{display: 'flex', flexDirection: 'row'}}>
                    <View>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.2),
                          color: Colors.black,
                        }}>
                        Order Status :
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor:
                          orderDetails != null
                            ? displayValColor(orderDetails.status)
                            : '',
                        borderRadius: 5,
                        paddingHorizontal: responsiveWidth(1),
                      }}>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.2),
                          color: Colors.white,
                        }}>
                        {orderDetails != null
                          ? displayVal(orderDetails.status)
                          : null}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Order Type :
                    {orderDetails != null
                      ? orderDetails.order_type == 1
                        ? ' Delivery'
                        : orderDetails.order_type == 2
                        ? ' Pickup'
                        : orderDetails.order_type == 3
                        ? ' Dinein'
                        : null
                      : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Grand Total :{' '}
                    {orderDetails != null ? orderDetails.currency_symbol : null}
                    {orderDetails != null ? orderDetails.total : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Payment Information :{' '}
                    {orderDetails != null ? orderDetails.paymentname : null}
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    gap: 10,
                  }}>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Name :{' '}
                    {orderDetails != null ? orderDetails.business.name : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Address:{' '}
                    {orderDetails != null
                      ? orderDetails.business.address
                      : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    City :{' '}
                    {orderDetails != null ? orderDetails.business.city : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Country:{' '}
                    {orderDetails != null
                      ? orderDetails.business.country
                      : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Phone Number :{' '}
                    {orderDetails != null ? orderDetails.business.phone : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}>
                    Mobile Number:{' '}
                    {orderDetails != null ? orderDetails.business.mobile : null}
                  </Text>
                </View>
              </View>

              <View style={{marginBottom: responsiveHeight(4)}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: responsiveHeight(1),
                    backgroundColor: Colors.black,
                    borderTopStartRadius: 10,
                    borderTopEndRadius: 10,
                  }}>
                  <Text
                    style={{
                      padding: 10,
                      borderWidth: 0.5,
                      height: '100%',
                      width: '30%',
                      fontFamily: Inter.bold,
                      color: '#fff',
                    }}>
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
                    }}>
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
                    }}>
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
                    }}>
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
                    }}>
                    {'Price'}
                  </Text>
                </View>

                {orderDetails != null
                  ? orderDetails.dishdata.map((item, index) => {
                      return item.data.map((dish, dish_index) => {
                        return (
                          <View
                            key={dish_index}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                padding: 15,
                                borderWidth: 0.5,
                                height: '100%',
                                width: '30%',
                                fontFamily: Inter.regular,
                                color: '#000',
                              }}>
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
                              }}>
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
                              }}>
                              {dish.activeIngredientsText}
                            </Text>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 15,
                                borderWidth: 0.5,
                                height: '100%',
                                width: '25%',
                                fontFamily: Inter.regular,
                                color: '#000',
                              }}>
                              {dish.sets.length > 0
                                ? dish.sets.map((set, set_index) => {
                                    return (
                                      <Text
                                        key={'set_' + set_index}
                                        style={{
                                          fontFamily: Inter.regular,
                                          color: '#000',
                                        }}>
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
                              }}>
                              {orderDetails != null
                                ? orderDetails.currency_symbol
                                : null}
                              {dish.total}
                            </Text>
                          </View>
                        );
                      });
                    })
                  : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={visiblemodal}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
          <TouchableOpacity
            onPress={() => {
              setvisiblemodal(false);
            }}
            style={{
              position: 'absolute',
              right: responsiveWidth(1),
              top: responsiveHeight(1.5),
              zIndex: 1,
            }}>
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
            }}>
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

export default MyOrderInprogress;
