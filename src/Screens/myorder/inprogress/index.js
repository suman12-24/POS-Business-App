import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import Styles from './style';
import { Inter } from '../../../Constants/Fonts';
import { responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';
import { postWithToken } from '../../../Service/service';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Moment from 'moment';
<<<<<<< HEAD
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import {
  Container,
  Icon,
  AppTextInput,
  CheckBox,
} from 'react-native-basic-elements';
// create a component
import OrderCardSkeleton from '../../../Component/OrderCardSkeleton';

import Loader from '../../../Component/loader';

const MyOrderInprogress = ({ props, route, navigation }) => {
  const styles = Styles();
=======
import useTranslation from '../../../Hooks/useTranslation';
import Loader from '../../Component/loader';
import OrderCardSkeleton from '../../Component/OrderCardSkeleton';
import OrderCard, { OrderTableHeader } from '../../Component/OrderCard';
import { useAppTheme } from '../../../Hooks/useAppTheme';
const MyOrderInprogress = () => {
  const theme = useAppTheme();
  const styles = Styles(theme);
>>>>>>> development
  Moment.locale('en');
  const navigation = useNavigation();
  const { baseUrl, userToken, langId } = useSelector(state => state.common);
  const { t } = useTranslation();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const isLandscape = winWidth > winHeight;
  const shortSide = Math.min(winWidth, winHeight);
  const isTablet = shortSide >= 600;
  const isCompact = !isTablet && !isLandscape;
  const [viewloader, setLoader] = useState(false);
  const [orderlist, setOrderList] = useState({ isLoading: true, list: [] });
  const [viewmoreloader, setMoreLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      getOrderList();
    }, []),
  );

<<<<<<< HEAD
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
        // console.log(response);
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

=======
>>>>>>> development
  const getOrderList = () => {
    const nextPage = 1;
    let search_status = [1, 2, 3, 9, 10, 11, 12];
    postWithToken(
      baseUrl,
      'orders/list',
      { lang_id: langId, pageNo: nextPage, status: search_status },
      userToken,
    )
      .then(response => {
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList({ isLoading: false, list: response.data });
        } else {
          setOrderList({ isLoading: false, list: [] });
        }
      })
      .catch(error => {
        setLoader(false);
        setOrderList({ isLoading: false, list: [] });
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    if (viewmoreloader) return;
    setMoreLoader(true);
    const nextPage = currentPage + 1;
    let search_status = [1, 2, 3, 9, 10, 11, 12];
    postWithToken(
      baseUrl,
      'orders/list',
      { lang_id: langId, pageNo: nextPage, status: search_status },
      userToken,
    )
      .then(response => {
        setMoreLoader(false);
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList({ isLoading: false, list: [...orderlist.list, ...response.data] });
        } else {
          setOrderList({ isLoading: false, list: orderlist.list });
        }
      })
      .catch(error => {
        setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  // Tapping a card now opens the detail screen. Complete Order lives there.
  const openOrderDetail = item => {
    navigation.navigate('OrderDetailInprogress', { order: item });
  };
  const handleComplete = (item) => {
    navigation.navigate('OrderDetailInprogress', { order: item });
  }
  return (
    <View style={styles.container}>
      {viewloader === true ? <Loader /> : null}

      <View style={styles.main}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.primary,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrder')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.background,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.semibold,
              }}
            >
              {t('CURRENT')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderInprogress')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.primary,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColor,
                fontFamily: Inter.medium,
              }}
            >
              {t('INPROGRESS')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderComplete')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.background,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.semibold,
              }}
            >
              {t('COMPLETE')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderCancel')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.background,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.semibold,
              }}
            >
              {t('CANCELLED')}
            </Text>
          </TouchableOpacity>
        </View>

        {orderlist.isLoading === false && orderlist.list.length > 0 ? (
          <FlatList
            data={orderlist.list}
            numColumns={1}
            contentContainerStyle={{
              paddingBottom: responsiveHeight(10),
            }}
            ListHeaderComponent={OrderTableHeader}
            stickyHeaderIndices={[0]}
            ListFooterComponent={
              viewmoreloader ? (
                <View>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <OrderCardSkeleton key={'skeleton_lo' + index} />
                  ))}
                </View>
              ) : null
            }
            onMomentumScrollEnd={getOrderListRefresh}
            onEndReachedThreshold={0.1}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <OrderCard
                item={item}
                tabType="inprogress"
                onPress={() => openOrderDetail(item)}
                //onAccept={() => handleAccept(item)}
                // onReject={() => handleReject(item)}
                onComplete={() => handleComplete(item)}
                onPrint={() => handlePrint(item)}
              />
            )}
          />
        ) : orderlist.isLoading === false && orderlist.list.length == 0 ? (
          <View>
            <Text
              style={{
                marginTop: responsiveHeight(30),
                alignSelf: 'center',
                fontFamily: Inter.bold,
                fontSize: 18,
                color: theme.cancelButton,
              }}
            >
              {t('NO_RECORD_FOUND')}{' '}
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
<<<<<<< HEAD

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

      <Modal
        supportedOrientations={['landscape']}
        transparent={true}
        visible={cnfModal}
        animationType="slide"
        onRequestClose={() => setCnfModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <View style={styles.warningmodal}>
            <Text
              style={{ ...styles.warningh_txt, color: Colors.primaryFontColor }}
            >
              {'Warning!'}
            </Text>
            <Text
              style={{
                ...styles.subwarningh_txt,
                color: Colors.primaryFontColor,
              }}
            >
              {'Are you sure you want to complete this Order'}
            </Text>
            <View style={{ ...styles.button_view, width: '95%' }}>
              <TouchableOpacity
                onPress={() => {
                  CloseConfimModel(false);
                }}
                style={{ ...styles.modalbutton, backgroundColor: '#e74c3c' }}
              >
                <Text style={styles.mbtton_txt}>{'No'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  CompleteAction(action_order_id, action_order_index);
                }}
                style={{
                  ...styles.modalbutton,
                  backgroundColor: Colors.buttonColor,
                }}
              >
                <Text style={styles.mbtton_txt}>{'Yes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
=======
    </View>
>>>>>>> development
  );
};

export default MyOrderInprogress;