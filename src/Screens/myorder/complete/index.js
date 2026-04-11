import React, { useEffect, useState } from 'react';
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
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import { Images } from '../../../Constants/ImageIconContant';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData } from '../../../Service/localStorage';
import { postWithToken, postWithOutToken } from '../../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import Moment from 'moment';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import {
  Container,
  Icon,
  AppTextInput,
  CheckBox,
} from 'react-native-basic-elements';
import OrderCardSkeleton from '../../../Component/OrderCardSkeleton';

import Loader from '../../../Component/loader';

// create a component
const MyOrderComplete = ({ props, route, navigation }) => {
  const styles = Styles();
  Moment.locale('en');
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { baseUrl, siteUrl, userToken, userData, post_data, langId } =
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
        //console.log(response);
        setLoader(false);

        
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
    let search_status = [4, 5];
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
        if (response.status == true) {
          if (response.data.length > 0) {
            setCurrentPage(nextPage);
            setOrderList({
              isLoading: false,
              list: response.data,
            });
          } else {
            setOrderList({ isLoading: false, list: [] });
          }
        } else {
          setOrderList({ isLoading: false, list: [] });
        }
      })
      .catch(error => {
        //setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    setMoreLoader(true);
    let search_status = [4, 5];
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
        if (response.status == true) {
          if (response.data.length > 0) {
            setCurrentPage(nextPage);
            setOrderList({
              isLoading: false,
              list: [...orderlist.list, ...response.data],
            });
          } else {
            setOrderList({ isLoading: false, list: orderlist.list });
          }
        } else {
          setOrderList({ isLoading: false, list: orderlist.list });
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
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderCardSkeleton key={'skeleton_lo' + index} />
            ))}
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
    if (val == '1') {
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
    if (val === 8) {
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
    if (val === 0) {
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
            borderBottomColor: Colors.primaryFontColor,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MyOrder');
            }}
            style={[
              styles.tab_button,
              {
                borderColor: Colors.primaryFontColor,
                borderWidth: 1,
                backgroundColor: Colors.white,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.primaryFontColor,
                fontFamily: Inter.medium,
              }}
            >
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
                borderColor: Colors.primaryFontColor,
                borderWidth: 1,
                backgroundColor: Colors.white,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.primaryFontColor,
                fontFamily: Inter.medium,
              }}
            >
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
                borderColor: Colors.primaryFontColor,
                borderWidth: 1,
                backgroundColor: Colors.primaryFontColor,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.white,
                fontFamily: Inter.medium,
              }}
            >
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
            renderItem={({ item, index }) => {
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
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        openDetails(item);
                      }}
                      style={{
                        flexDirection: 'column',
                        display: 'flex',
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.3),
                          color: Colors.black,
                        }}
                      >
                        Order Id: #{item.id}
                        {'    '}
                        <Text
                          style={{
                            fontFamily: Inter.medium,
                            fontSize: responsiveFontSize(1.3),
                            color: Colors.red,
                            marginLeft: responsiveWidth(10),
                          }}
                        >
                          {item.sourcetype == 'Uber' ? 'UberEats' : null}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.3),
                          color: Colors.black,
                          marginBottom: responsiveHeight(0.5),
                        }}
                      >
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
                        }}
                      >
                        {item.date}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        display: 'flex',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.3),
                          color: Colors.black,
                        }}
                      >
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
                      }}
                    >
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
              }}
            >
              No Record Found{' '}
            </Text>
          </View>
        ) : (
          <View>
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderCardSkeleton key={'skeleton_lo_1' + index} />
            ))}
          </View>
        )}
      </View>

      <Modal
        supportedOrientations={['landscape']}
        isVisible={isModalVisible}
        style={{ width: '80%', margin: 'auto' }}
      >
        <View style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleModal}
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
              backgroundColor: Colors.white,
              borderRadius: 20,
              paddingHorizontal: responsiveWidth(2),
              paddingVertical: responsiveHeight(2),
            }}
          >
            <ScrollView>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: responsiveHeight(2),
                  marginTop: responsiveHeight(4),
                }}
              >
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Inter.bold,
                      fontSize: responsiveFontSize(1.5),
                      color: Colors.black,
                    }}
                  >
                    Order ID : #{orderDetails != null ? orderDetails.id : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
                    Order Date and Time :{' '}
                    {orderDetails != null ? orderDetails.date : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
                    Estimated Delivery Time :{' '}
                    {orderDetails != null ? orderDetails.estimate_time : null}{' '}
                  </Text>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View>
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.2),
                          color: Colors.black,
                        }}
                      >
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
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Inter.medium,
                          fontSize: responsiveFontSize(1.2),
                          color: Colors.white,
                        }}
                      >
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
                    }}
                  >
                    Order Type :
                    {orderDetails != null
                      ? orderDetails.order_type == 1
                        ? ' Delivery'
                        : orderDetails.order_type == 2
                        ? ' Pickup'
                        : orderDetails.order_type == 3
                        ? ' Dinein'
                        : orderDetails.order_type == 4
                        ? ' POS'
                        : null
                      : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
                    Grand Total :{' '}
                    {orderDetails != null ? orderDetails.currency_symbol : null}
                    {orderDetails != null ? orderDetails.total : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
                    Payment Information :{' '}
                    {orderDetails != null
                      ? orderDetails.paymentmethod != null &&
                        orderDetails.paymentmethod.length > 0
                        ? orderDetails.paymentmethod[0].payment_method
                        : null
                      : null}
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
                    Name :{' '}
                    {orderDetails != null ? orderDetails.business.name : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
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
                    }}
                  >
                    City :{' '}
                    {orderDetails != null ? orderDetails.business.city : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
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
                    }}
                  >
                    Phone Number :{' '}
                    {orderDetails != null ? orderDetails.business.phone : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.2),
                      color: Colors.black,
                    }}
                  >
                    Mobile Number:{' '}
                    {orderDetails != null ? orderDetails.business.mobile : null}
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
                    }}
                  >
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
                              }}
                            >
                              {/*dish.activeIngredientsText*/}
                              {dish.ingredientsarray.length > 0
                                ? dish.ingredientsarray.map(
                                    (ingred, ing_index) => {
                                      return ing_index != 0
                                        ? ', ' + ingred
                                        : ingred;
                                    },
                                  )
                                : null}
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
                              }}
                            >
                              {dish.sets.length > 0
                                ? dish.sets.map((set, set_index) => {
                                    return (
                                      <Text
                                        key={'set_' + set_index}
                                        style={{
                                          fontFamily: Inter.regular,
                                          color: '#000',
                                        }}
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
                              }}
                            >
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

export default MyOrderComplete;
