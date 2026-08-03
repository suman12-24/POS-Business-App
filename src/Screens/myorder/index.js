import React, { useState } from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Styles from './style';
import { Inter } from '../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';
import { postWithToken, postWithOutToken } from '../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
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
import { useNavigation, useRoute } from '@react-navigation/native';

import Loader from '../../Component/loader';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import OrderCardSkeleton from '../../Component/OrderCardSkeleton';

=======
import { useNavigation } from '@react-navigation/native';
import useTranslation from '../../Hooks/useTranslation';
import Loader from '../Component/loader';
import OrderCardSkeleton from '../Component/OrderCardSkeleton';
import OrderCard, { OrderTableHeader } from '../Component/OrderCard';
import { useAppTheme } from '../../Hooks/useAppTheme';
import EbPrinter, { FontSize, AlignmentType } from 'react-native-ebprinter';
import SelectUsbPrinter from '../Component/selectusbprinter';
>>>>>>> development
// create a component
const MyOrder = () => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  Moment.locale('en');
  const navigation = useNavigation();
  const { baseUrl, userToken, langId, UsbPrinter } = useSelector(state => state.common);
  const { t } = useTranslation();
  // ---- RESPONSIVE HELPERS -------------------------------------------------
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const isLandscape = winWidth > winHeight;
  const shortSide = Math.min(winWidth, winHeight);
  const isTablet = shortSide >= 600;
  const isCompact = !isTablet && !isLandscape;
  // --------------------------------------------------------------------------

  const [viewloader, setLoader] = useState(false);
  const [orderlist, setOrderList] = useState({
    isLoading: true,
    list: [],
  });
  const [viewmoreloader, setMoreLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [printer_type, setPrinterType] = useState([]);
  const [printer_model, setPrinterVisiblemodal] = useState(false);

<<<<<<< HEAD
  useFocusEffect(
    React.useCallback(() => {
      //PrinterType();
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      console.log('route');
      console.log(route);
      if (route.params != undefined) {
        getOrderById(route.params.id);
      }
    }, [route.params]),
  );


  const getOrderById = order_id => {
    postWithToken(
      baseUrl,
      'web-business/orders/view',
      {
        userId: userData.id,
        lang_id: langId,
        id: order_id,
      },
      userToken,
    )
      .then(response => {
        console.log('order by id call');

        //console.log(response);

        if (response.status === true) {
          openDetails(response.data);
        }
      })
      .catch(error => {
        console.log('Error : ', error);
      });
=======
  const printer_model_close = () => {
    setPrinterVisiblemodal(false);
>>>>>>> development
  };
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
  useFocusEffect(
    React.useCallback(() => {
      getOrderList();
      PrinterType();
    }, []),
  );

  const fetchOrderData = id => {
    setLoader(true); //31714
    /*Alert.alert('Start API Call', id, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);*/
    postWithOutToken(baseUrl, 'module/order/rest-order-pos', {
      f: 'fetchbyorder',
      orderId: id,
      langId: langId,
    })
      .then(response => {
        //console.log(response);
        setLoader(false);

<<<<<<< HEAD
       
=======
        let strbname = 'ABC Restaurant';

        let OrderDate = response.date;
        OrderDate = OrderDate.toString();

        let Bname = response.bname;
        Bname = Bname.toString();

        let OrderNo = response.id;
        OrderNo = OrderNo.toString();

        //cost part
        let subtotal = response.subtotal;
        subtotal = subtotal.toString();

        let deliverycost = response.deliverycost;
        deliverycost = deliverycost.toString();

        let tax = response.tax_price;
        tax = tax.toString();

        let servicefee = response.servicefee;
        servicefee = servicefee.toString();

        let servicefee_price = response.servicefee_price;
        servicefee_price = servicefee_price.toString();

        let discount = response.discount;
        discount = discount.toString();

        let tips = response.tips;
        tips = tips.toString();

        let total = response.total;
        total = total.toString();

        //cost part
        //buyer details
        let buyername =
          response.buyerdata.name + ' ' + response.buyerdata.last_name;
        buyername = buyername.toString();
        let buyeremail = response.buyerdata.email;
        buyeremail = buyeremail.toString();

        let buyercel = response.buyerdata.cel;
        buyercel = buyercel.replace(/[^a-zA-Z0-9]/g, '');
        buyercel = buyercel.toString();

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

        let order_number_date = '#' + OrderNo + '   ' + OrderDate;
        EbPrinter.selectUsbPrinter(0, UsbPrinter);
        EbPrinter.drawCustom(
          0,
          'B&M Private Pty Ltd',
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          strbname.toString(),
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          '402/18 Cypress Avenue,',
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          'Surfers Paradise, QLD 4217',
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          'PH 07 5593 3112',
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          'ABN 40 603 844 426',
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          order_number_date,
          FontSize.Medium,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawOneLine(0, FontSize.MediumBold);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(0, buyername, FontSize.Big, AlignmentType.Center);
        EbPrinter.drawNewLine(0);
        if (buyeremail != '') {
          EbPrinter.drawCustom(
            0,
            buyeremail,
            FontSize.Big,
            AlignmentType.Center,
          );
          EbPrinter.drawNewLine(0);
        }

        if (buyercel != '') {
          EbPrinter.drawCustom(0, buyercel, FontSize.Big, AlignmentType.Center);
          EbPrinter.drawNewLine(0);
        }

        EbPrinter.drawOneLine(0, FontSize.MediumBold);

        response.dishdata.map((dishdata, dishdata_index) => {
          dishdata.data.map((dish, dish_index) => {
            EbPrinter.drawNewLine(0);
            var dish_name_x = dish.quantity + ' X ' + dish.name;
            var dish_price = dish.total;
            EbPrinter.drawLeftRight(
              0,
              dish_name_x.toString(),
              FontSize.Default,
              dish_price.toString(),
              FontSize.Default,
            );

            if (dish.sets.length > 0) {
              dish.sets.map((set, set_index) => {
                var dish_set_str = set.name + ' - ' + set.choiceText;
                EbPrinter.drawCustom(
                  0,
                  dish_set_str.toString(),
                  FontSize.Default,
                  AlignmentType.Left,
                );
              });
            }

            EbPrinter.drawNewLine(0);

            if (
              dish?.free != undefined &&
              Object.keys(dish?.free).length !== 0
            ) {
              dish.free.data.map((freedish, freedish_index) => {
                EbPrinter.drawNewLine(0);
                var free_dish_name_x =
                  freedish.quantity + ' X ' + freedish.name;
                var free_dish_price = freedish.total;
                EbPrinter.drawLeftRight(
                  0,
                  free_dish_name_x.toString(),
                  FontSize.Default,
                  free_dish_price.toString(),
                  FontSize.Default,
                );

                if (freedish.sets.length > 0) {
                  freedish.sets.map((set, set_index) => {
                    var free_dish_set_str = set.name + ' - ' + set.choiceText;
                    EbPrinter.drawCustom(
                      0,
                      free_dish_set_str.toString(),
                      FontSize.Default,
                      AlignmentType.Left,
                    );
                  });
                }
                EbPrinter.drawNewLine(0);
              });
            }
          });
        });

        EbPrinter.drawOneLine(0, FontSize.MediumBold);
        EbPrinter.drawLeftRight(
          0,
          'Discount :',
          FontSize.Default,
          discount,
          FontSize.Default,
        );
        EbPrinter.drawLeftRight(
          0,
          'Tax :',
          FontSize.Default,
          tax,
          FontSize.Default,
        );
        EbPrinter.drawLeftRight(
          0,
          'Service Fee :',
          FontSize.Default,
          servicefee_price,
          FontSize.Default,
        );
        EbPrinter.drawLeftRight(
          0,
          'TOTAL :',
          FontSize.Default,
          total,
          FontSize.Default,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawOneLine(0, FontSize.MediumBold);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);

        EbPrinter.drawCustom(
          0,
          'THANK YOU FOR VISITING',
          FontSize.Big,
          AlignmentType.Center,
        );
        EbPrinter.drawNewLine(0);
        EbPrinter.drawCustom(
          0,
          'OPEN 7 DAYS',
          FontSize.Big,
          AlignmentType.Center,
        );

        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);
        EbPrinter.drawNewLine(0);

        EbPrinter.printText(0, true);

        printer_type.map((item, index) => {
          if (item.code == 'WIFI') {
            item.arr.map((wifi_ip, wifi_index) => {
              let wifi_index_index = parseInt(wifi_index + 1);
              setTimeout(() => {
                var device_index = parseInt(wifi_index) + parseInt(1);

                let wifi_ip_address = wifi_ip.ip_address;
                wifi_ip_address = wifi_ip_address.toString();
                wifi_ip_port = parseInt(wifi_ip.port);

                EbPrinter.selectNetworkPrinter(
                  device_index,
                  wifi_ip_address,
                  wifi_ip_port,
                );
                EbPrinter.drawCustom(
                  device_index,
                  'B&M Private Pty Ltd',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  strbname.toString(),
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  '402/18 Cypress Avenue,',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  'Surfers Paradise, QLD 4217',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  'PH 07 5593 3112',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  'ABN 40 603 844 426',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  order_number_date,
                  FontSize.Medium,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawOneLine(device_index, FontSize.MediumBold);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  buyername,
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                if (buyeremail != '') {
                  EbPrinter.drawCustom(
                    device_index,
                    buyeremail,
                    FontSize.Big,
                    AlignmentType.Center,
                  );
                  EbPrinter.drawNewLine(device_index);
                }

                if (buyercel != '') {
                  EbPrinter.drawCustom(
                    device_index,
                    buyercel,
                    FontSize.Big,
                    AlignmentType.Center,
                  );
                  EbPrinter.drawNewLine(device_index);
                }

                EbPrinter.drawOneLine(device_index, FontSize.MediumBold);

                response.dishdata.map((dishdata, dishdata_index) => {
                  dishdata.data.map((dish, dish_index) => {
                    EbPrinter.drawNewLine(device_index);
                    var dish_name_x = dish.quantity + ' X ' + dish.name;
                    var dish_price = dish.total;
                    EbPrinter.drawLeftRight(
                      device_index,
                      dish_name_x.toString(),
                      FontSize.Default,
                      dish_price.toString(),
                      FontSize.Default,
                    );

                    if (dish.sets.length > 0) {
                      dish.sets.map((set, set_index) => {
                        var dish_set_str = set.name + ' - ' + set.choiceText;
                        EbPrinter.drawCustom(
                          device_index,
                          dish_set_str.toString(),
                          FontSize.Default,
                          AlignmentType.Left,
                        );
                      });
                    }

                    EbPrinter.drawNewLine(device_index);

                    if (
                      dish?.free != undefined &&
                      Object.keys(dish?.free).length !== 0
                    ) {
                      dish.free.data.map((freedish, freedish_index) => {
                        EbPrinter.drawNewLine(device_index);
                        var free_dish_name_x =
                          freedish.quantity + ' X ' + freedish.name;
                        var free_dish_price = freedish.total;
                        EbPrinter.drawLeftRight(
                          device_index,
                          free_dish_name_x.toString(),
                          FontSize.Default,
                          free_dish_price.toString(),
                          FontSize.Default,
                        );

                        if (freedish.sets.length > 0) {
                          freedish.sets.map((set, set_index) => {
                            var free_dish_set_str =
                              set.name + ' - ' + set.choiceText;
                            EbPrinter.drawCustom(
                              device_index,
                              free_dish_set_str.toString(),
                              FontSize.Default,
                              AlignmentType.Left,
                            );
                          });
                        }
                        EbPrinter.drawNewLine(device_index);
                      });
                    }
                  });
                });
                EbPrinter.drawOneLine(device_index, FontSize.MediumBold);
                EbPrinter.drawLeftRight(
                  device_index,
                  'Discount :',
                  FontSize.Default,
                  discount,
                  FontSize.Default,
                );
                EbPrinter.drawLeftRight(
                  device_index,
                  'Tax :',
                  FontSize.Default,
                  tax,
                  FontSize.Default,
                );
                EbPrinter.drawLeftRight(
                  device_index,
                  'Service Fee :',
                  FontSize.Default,
                  servicefee_price,
                  FontSize.Default,
                );
                EbPrinter.drawLeftRight(
                  device_index,
                  'TOTAL :',
                  FontSize.Default,
                  total,
                  FontSize.Default,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawOneLine(0, FontSize.MediumBold);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);

                EbPrinter.drawCustom(
                  device_index,
                  'THANK YOU FOR VISITING',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawCustom(
                  device_index,
                  'OPEN 7 DAYS',
                  FontSize.Big,
                  AlignmentType.Center,
                );

                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);
                EbPrinter.drawNewLine(device_index);

                EbPrinter.printText(device_index, true);
              }, wifi_index_index * 2000); // Delays each by 5s, 10s, 30s...
            });
          } else if (item.code == 'NET') {
            item.arr.map((net_ip, net_index) => {
              let net_index_index = parseInt(net_index + 1);
              setTimeout(() => {
                var device_index_net = parseInt(net_index) + parseInt(15);
                let net_ip_address = net_ip.ip_address;
                net_ip_address = net_ip_address.toString();
                net_ip_port = parseInt(net_ip.port);

                EbPrinter.selectNetworkPrinter(device_index_net, net_ip_port);

                EbPrinter.drawCustom(
                  device_index_net,
                  'B&M Private Pty Ltd',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  strbname.toString(),
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  '402/18 Cypress Avenue,',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  'Surfers Paradise, QLD 4217',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  'PH 07 5593 3112',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  'ABN 40 603 844 426',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  order_number_date,
                  FontSize.Medium,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawOneLine(device_index_net, FontSize.MediumBold);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  buyername,
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                if (buyeremail != '') {
                  EbPrinter.drawCustom(
                    device_index_net,
                    buyeremail,
                    FontSize.Big,
                    AlignmentType.Center,
                  );
                  EbPrinter.drawNewLine(device_index_net);
                }

                if (buyercel != '') {
                  EbPrinter.drawCustom(
                    device_index_net,
                    buyercel,
                    FontSize.Big,
                    AlignmentType.Center,
                  );
                  EbPrinter.drawNewLine(device_index_net);
                }

                EbPrinter.drawOneLine(device_index_net, FontSize.MediumBold);

                response.dishdata.map((dishdata, dishdata_index) => {
                  dishdata.data.map((dish, dish_index) => {
                    EbPrinter.drawNewLine(device_index_net);
                    var dish_name_x = dish.quantity + ' X ' + dish.name;
                    var dish_price = dish.total;
                    EbPrinter.drawLeftRight(
                      device_index_net,
                      dish_name_x.toString(),
                      FontSize.Default,
                      dish_price.toString(),
                      FontSize.Default,
                    );

                    if (dish.sets.length > 0) {
                      dish.sets.map((set, set_index) => {
                        var dish_set_str = set.name + ' - ' + set.choiceText;
                        EbPrinter.drawCustom(
                          device_index_net,
                          dish_set_str.toString(),
                          FontSize.Default,
                          AlignmentType.Left,
                        );
                      });
                    }

                    EbPrinter.drawNewLine(device_index_net);

                    if (
                      dish?.free != undefined &&
                      Object.keys(dish?.free).length !== 0
                    ) {
                      dish.free.data.map((freedish, freedish_index) => {
                        EbPrinter.drawNewLine(device_index_net);
                        var free_dish_name_x =
                          freedish.quantity + ' X ' + freedish.name;
                        var free_dish_price = freedish.total;
                        EbPrinter.drawLeftRight(
                          device_index_net,
                          free_dish_name_x.toString(),
                          FontSize.Default,
                          free_dish_price.toString(),
                          FontSize.Default,
                        );

                        if (freedish.sets.length > 0) {
                          freedish.sets.map((set, set_index) => {
                            var free_dish_set_str =
                              set.name + ' - ' + set.choiceText;
                            EbPrinter.drawCustom(
                              device_index_net,
                              free_dish_set_str.toString(),
                              FontSize.Default,
                              AlignmentType.Left,
                            );
                          });
                        }
                        EbPrinter.drawNewLine(device_index_net);
                      });
                    }
                  });
                });
                EbPrinter.drawOneLine(device_index_net, FontSize.MediumBold);
                EbPrinter.drawLeftRight(
                  device_index_net,
                  'Discount :',
                  FontSize.Default,
                  discount,
                  FontSize.Default,
                );
                EbPrinter.drawLeftRight(
                  device_index_net,
                  'Tax :',
                  FontSize.Default,
                  tax,
                  FontSize.Default,
                );
                EbPrinter.drawLeftRight(
                  device_index_net,
                  'Service Fee :',
                  FontSize.Default,
                  servicefee_price,
                  FontSize.Default,
                );
                EbPrinter.drawLeftRight(
                  device_index_net,
                  'TOTAL :',
                  FontSize.Default,
                  total,
                  FontSize.Default,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawOneLine(0, FontSize.MediumBold);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);

                EbPrinter.drawCustom(
                  device_index_net,
                  'THANK YOU FOR VISITING',
                  FontSize.Big,
                  AlignmentType.Center,
                );
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawCustom(
                  device_index_net,
                  'OPEN 7 DAYS',
                  FontSize.Big,
                  AlignmentType.Center,
                );

                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);
                EbPrinter.drawNewLine(device_index_net);

                EbPrinter.printText(device_index_net, true);
              }, net_index_index * 2000); // Delays each by 5s, 10s, 30s...
            });
          }
        });

        //setvisiblemodal(true);
>>>>>>> development
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const getOrderList = () => {
    const nextPage = 1;
    let search_status = [0];
    postWithToken(
      baseUrl,
      'orders/list',
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
            console.log('response.data', response.data);
            setCurrentPage(nextPage);
            setOrderList({ isLoading: false, list: response.data });
          } else {
            setOrderList({ isLoading: false, list: [] });
          }
        } else {
          setOrderList({ isLoading: false, list: [] });
        }
      })
      .catch(error => {
        setLoader(false);
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    if (viewmoreloader) return;
    setMoreLoader(true);
    const nextPage = currentPage + 1;
    let search_status = [0];
    postWithToken(
      baseUrl,
      'orders/list',
      {
        lang_id: langId,
        pageNo: nextPage,
        status: search_status,
      },
      userToken,
    )
      .then(response => {
        setMoreLoader(false);
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList({
            isLoading: false,
            list: [...orderlist.list, ...response.data],
          });
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
    return viewmoreloader === true ? (
      <View>
        {Array.from({ length: 4 }).map((_, index) => (
          <OrderCardSkeleton key={'skeleton_lo' + index} />
        ))}
      </View>
    ) : null;
  };

  // Tapping a row opens the full order detail screen.
  const openOrderDetail = item => {
    navigation.navigate('OrderDetail', { order: item });
  };

  // ---- Row actions ---------------------------------------------------
  // Wire these up to your real accept/reject/complete/print endpoints —
  // left as simple confirmations for now so the UI is fully working.
  const handleAccept = item => {
    // Alert.alert('Accept Order', `Accept order #${item.id}?`, [
    //   { text: 'Cancel', style: 'cancel' },
    //   { text: 'Accept', onPress: () => console.log('Accept order', item.id) },
    // ]);
    navigation.navigate('OrderDetail', { order: item });
  };

  const handleReject = item => {
    // Alert.alert('Reject Order', `Reject order #${item.id}?`, [
    //   { text: 'Cancel', style: 'cancel' },
    //   { text: 'Reject', style: 'destructive', onPress: () => console.log('Reject order', item.id) },
    // ]);
    navigation.navigate('OrderDetail', { order: item });
  };

  const handlePrint = item => {

  };

  return (
    <View style={styles.container}>
      {viewloader === true ? <Loader /> : null}
      {printer_model === true && (
        <SelectUsbPrinter printer_model_close={printer_model_close} />
      )}
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
            showsVerticalScrollIndicator={false}
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
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <OrderCard
                item={item}
                tabType="current"
                onPress={() => openOrderDetail(item)}
                onAccept={() => handleAccept(item)}
                onReject={() => handleReject(item)}
                //onComplete={() => handleComplete(item)}
                onPrint={() => {
                  UsbPrinter === null
                    ? setPrinterVisiblemodal(true)
                    : fetchOrderData(item.id);
                }}
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
        isVisible={isModalVisible_accept}
        style={{ width: '60%', margin: 'auto' }}
      >
        <View style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleModal_Accept}
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
            {viewloadermodel === true ? <Loader /> : null}
            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: responsiveFontSize(1.5),
                  color: Colors.black,
                  fontFamily: Inter.medium,
                }}
              >
                Order Accept
              </Text>
            </View>

            <ScrollView>
              {/*<View
                style={{
                  width: responsiveWidth(55),
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  height: 45,
                  marginBottom: responsiveHeight(4),
                  marginTop: responsiveHeight(4),
                }}
              >
                <Picker
                  style={{ marginTop: -5, color: color_theme_selected }}
                  selectionColor={'#555'}
                  placeholder="Order Delivery Time (In Minutes)"
                  selectedValue={accept_delivery_time}
                  dropdownIconColor={color_theme_selected}
                  onValueChange={(itemValue, itemIndex) => {
                    setAcceptDeliveryTime(itemValue);
                  }}
                >
                  <Picker.Item
                    key={'set_'}
                    style={{ color: color_theme }}
                    label="Order Delivery Time (In Minutes)"
                    value="0"
                  />
                  {minutes_list.length > 0
                    ? minutes_list.map((item, index) => {
                        return (
                          <Picker.Item
                            key={'set_' + index}
                            style={{ color: color_theme }}
                            label={item.time}
                            value={item.time}
                          />
                        );
                      })
                    : null}
                </Picker>
              </View>*/}

              <View
                style={{
                  width: responsiveWidth(55),
                  marginBottom: responsiveHeight(4),
                  marginTop: responsiveHeight(4),
                }}
              >
                <DropdownComponent />
              </View>

              <View
                style={{
                  width: responsiveWidth(55),
                  marginBottom: responsiveHeight(8),
                }}
              >
                <TextInput
                  multiline={true}
                  placeholder={'Notes'}
                  numberOfLines={10}
                  onChangeText={text => {
                    setAcceptNote(text);
                  }}
                  value={accept_note}
                  style={{
                    color: Colors.black,
                    borderWidth: 1,
                    borderRadius: 5,
                    height: responsiveHeight(20),
                    width: responsiveWidth(55),
                    textAlignVertical: 'top',
                    borderColor: Colors.grey,
                    backgroundColor: Colors.white,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    viewloadermodel === false
                      ? AcceptOrder(actionOrderId)
                      : null;
                  }}
                  style={styles.button_accept_model}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: responsiveFontSize(1.4),
                      color: Colors.white,
                      fontFamily: Inter.medium,
                    }}
                  >
                    Accept
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        supportedOrientations={['landscape']}
        isVisible={isModalVisible_reject}
        style={{ width: '60%', margin: 'auto' }}
      >
        <View style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleModal_Reject}
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
            {viewloadermodel === true ? <Loader /> : null}

            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: responsiveFontSize(1.5),
                  color: Colors.black,
                  fontFamily: Inter.medium,
                }}
              >
                Order Reject
              </Text>
            </View>

            <ScrollView>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: responsiveHeight(2),
                  marginTop: responsiveHeight(4),
                }}
              >
                <TextInput
                  multiline={true}
                  placeholder={'Notes'}
                  numberOfLines={10}
                  onChangeText={text => {
                    setRejectNote(text);
                  }}
                  value={reject_note}
                  style={{
                    color: Colors.black,
                    borderWidth: 1,
                    borderRadius: 5,
                    height: responsiveHeight(20),
                    width: responsiveWidth(55),
                    textAlignVertical: 'top',
                    borderColor: Colors.grey,
                    backgroundColor: Colors.white,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    viewloadermodel === false
                      ? RejectOrder(actionOrderId)
                      : null;
                  }}
                  style={styles.button_reject_model}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: responsiveFontSize(1.1),
                      color: Colors.white,
                      fontFamily: Inter.medium,
                    }}
                  >
                    Reject
                  </Text>
                </TouchableOpacity>
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
=======
    </View>
>>>>>>> development
  );
};

export default MyOrder;