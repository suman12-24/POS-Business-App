import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  BackHandler,
  Dimensions,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  NativeModules,
  NativeEventEmitter,
  FlatList,
  useColorScheme,
  Keyboard,
} from 'react-native';

import Styles from './Styles';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import { Images } from '../../Constants/ImageIconContant';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCartDetails,
  setCartQuantity,
} from '../../Store/Reducers/CommonReducer';
import { showToastMsg, getData, setData } from '../../Service/localStorage';
import { postWithOutToken, postWithToken } from '../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
  RadioButton,
  CheckBox,
} from 'react-native-basic-elements';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Element } from 'react-native-render-html';
import { Picker } from '@react-native-picker/picker';
import Loader from '../../Component/loader';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Menu } from 'react-native-paper';

// create a component
const HomeRight = props => {
  const styles = Styles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { baseUrl, siteUrl, userToken, userData, langId, cartDetails } =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [CartDish, setCartDish] = useState({ isLoading: true, list: [] });
  const [cartQuantity, setcartQuantity] = useState(0);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [orderType, setOrderType] = useState(0);

  const [CartSubTotal, setCartSubTotal] = useState(0.0);
  const [PendingMinimumFee, setPendingMinimumFee] = useState(0.0);
  const [PendingFreeDelivery, setPendingFreeDelivery] = useState(false);
  const [PendingFreeDeliveryValue, setPendingFreeDeliveryValue] = useState('');

  const [preorderDetails, setPreorderDetails] = useState(null);

  const [discount_code, setDiscountCode] = useState('');

  const [printers, setPrinters] = useState(null);
  const [currentPrinter, setCurrentPrinter] = useState(null);
  const [buyerDetails, setBuyerDetails] = useState({
    id: 0,
    preorder: false,
    name: '',
    last_name: '',
    email: '',
    cel: '',
    specialaddress: '',
    delievryaddress: '',
    notes: '',
  });
  const [discountInfo, setDiscountInfo] = useState({
    discounttext: '',
    discounttype: '',
    discountid: '',
  });
  const [discount, setDiscount] = useState(0.0);
  const [tips, setTips] = useState(0.0);
  const [cartFee, setCartFee] = useState([]);
  const [ipAddressPrinter, setipaddresprinter] = useState();
  //const [visiblemodal, setvisiblemodal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({
    isLoading: true,
    list: [],
  });
  const [paymentId, setPaymentId] = useState('');
  const [paymentIndex, setPaymentIndex] = useState('');

  const [paircode, setPaircode] = useState('');
  const [displaypaircode, setDisplayPairCode] = useState(false);

  const [selectedTime, setSelectedTime] = useState('');
  /*const timeOptions = [
    { label: '10 min', val: '00:10' },
    { label: '20 min', val: '00:20' },
    { label: '30 min', val: '00:30' },
    { label: '40 min', val: '00:40' },
    { label: '50 min', val: '00:50' },
  ];*/

  const timeOptions = [
    { label: '10 min', value: '00:10' },
    { label: '20 min', value: '00:20' },
    { label: '30 min', value: '00:30' },
    { label: '40 min', value: '00:40' },
    { label: '50 min', value: '00:50' },
  ];

  const [color_theme, setColorTheme] = useState('#000000');
  const [color_theme_selected, setColorThemeSelected] = useState('#000000');

  const [update_action_status, setUpdateActionStatus] = useState(false);

  useEffect(() => {
    if (colorScheme == 'dark') {
      setColorTheme('#ffffff');
      setColorThemeSelected('#000000');
    }
  }, []);

  
  useFocusEffect(
    React.useCallback(() => {
      if (props.cartDish != undefined) {
        setCategoryDetails(props.categoryDetails);
        setActiveBusiness(props.activeBusiness);
        setOrderType(props.orderType);
        setCartDish({ isLoading: false, list: props.cartDish.list });
        setPreorderDetails(props.preorderDetails);
        FetchPaymentMothod(props.activeBusiness.id, props.orderType);
        let cartQty = 0;
        for (const cartDish of props.cartDish.list) {
          for (const dish of cartDish.dish) {
            cartQty += dish.quantity;
          }
        }
        setcartQuantity(cartQty);
        dispatch(setCartQuantity(cartQty));
        calCartTotal(props.cartDish.list, props.activeBusiness);
      }
    }, [props.cartDish]),
  );

  const userlistdata = [
    { id: '1', name: 'one', cel: '8017841960' },
    { id: '2', name: 'two', cel: '8087841960' },
    { id: '3', name: 'two', cel: '8097841960' },
    { id: '4', name: 'two', cel: '8067841960' },
    { id: '5', name: 'two', cel: '8077841960' },
    { id: '6', name: 'two', cel: '8027841960' },
    { id: '7', name: 'two', cel: '8037841960' },
    { id: '8', name: 'two', cel: '8047841960' },
    { id: '9', name: 'two', cel: '8057841960' },
  ];

  const [userlist, setUserList] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const updateUserData = userIndex => {
    let userval = userlist[userIndex];
    setBuyerDetails({
      ...buyerDetails,
      name: userval.name,
      last_name: userval.last_name,
      cel: userval.cel,
    });
    setMenuVisible(false);
  };

  const FetchUserByPhone = mobilenumber => {
    //console.log(mobilenumber.length);
    if (mobilenumber.length > 0) {
      if (mobilenumber.length >= 3) {
        postWithToken(
          baseUrl,
          'web-business/get-customer-details',
          {
            lang_id: langId,
            search_phone: mobilenumber,
          },
          userToken,
        )
          .then(response => {
            //console.log(response);

            if (response.status === true) {
              setMenuVisible(true);
              setUserList(response.data);
            } else {
              setUserList([]);
              setMenuVisible(false);
            }
          })
          .catch(error => {
            console.log('Error : ', error);
            setMenuVisible(false);
          });
      } else {
        setMenuVisible(false);
      }
    } else {
      setUserList([]);
      setMenuVisible(false);
    }
  };

  const DropdownComponent = () => {
    const [value, setValue] = useState(selectedTime ? selectedTime : null);

    // Update value when selectedtablenumber prop changes
    useEffect(() => {
      if (selectedTime) {
        setValue(selectedTime);
      }
    }, [selectedTime]);

    const renderItem = item => {
      // Check if the current item's value exists in the tableNumbers array
      const isTableBooked = timeOptions.includes(item.value);
      // Check if this item is currently selected
      const isSelected = item.value === value;

      return (
        <View style={[styles.item, isSelected && styles.selectedItem]}>
          <Text style={[styles.textItem, isSelected && styles.selectedText]}>
            {item.label}
          </Text>
          <View style={styles.iconContainer}>
            {isTableBooked && (
              <AntDesignIcon
                style={styles.icon}
                color={Colors.primaryFontColor}
                name="Safety"
                size={20}
              />
            )}
            {isSelected && (
              <AntDesignIcon
                style={styles.icon}
                color={Colors.primaryFontColor}
                name="checkcircle"
                size={20}
              />
            )}
          </View>
        </View>
      );
    };

    return (
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={timeOptions}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select Estimate Time"
        searchPlaceholder="Search..."
        value={value}
        onChange={item => {
          setSelectedTime(item.value);
        }}
        renderLeftIcon={() => (
          <AntDesignIcon
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
        renderItem={renderItem}
      />
    );
  };

  const FetchPaymentMothod = (bid, orderType_val) => {
    postWithToken(
      baseUrl,
      'web-business/get-business-payment-methods',
      {
        lang_id: langId,
      },
      userToken,
    )
      .then(response => {
        console.log(response);
        let paymentResponse = response.data;
        let payment_arr = [];
        for (let j = 0; j < paymentResponse.length; j++) {
          console.log(paymentResponse[j].payment_method);
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

            if (paymentc.id == 1) {
              payment_arr.push(paymentc);
            } /*else if (paymentc.id === '2') {
              payment_arr.push(paymentc);
            }*/
          }
        }

        console.log(payment_arr);

        setPaymentMethod({ isLoading: false, list: payment_arr });
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const dishCheck = id => {
    for (let k = 0; k < categoryDetails.list.length; k++) {
      for (let l = 0; l < categoryDetails.list[k].dish.length; l++) {
        if (categoryDetails.list[k].dish[l].id === id) {
          return l;
        }
      }
    }
    return -1;
  };
  const catCheck = id => {
    for (let k = 0; k < categoryDetails.list.length; k++) {
      for (let l = 0; l < categoryDetails.list[k].dish.length; l++) {
        if (categoryDetails.list[k].dish[l].id === id) {
          return k;
        }
      }
    }
    return -1;
  };

  const editOptions = (index, dishindex, dishdataindex) => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));

    indexcart = {
      index: index,
      dishindex: dishindex,
      dishdataindex: dishdataindex,
      EDITPRODUCTCART: 1,
      dishTotal: 0,
    };
    let cindex = dishCheck(cart[index].dish[dishindex].id);
    let catindex = catCheck(cart[index].dish[dishindex].id);

    let dish = categoryDetails.list[catindex].dish[cindex];
    indexcart.dishTotal = cart[index].dish[dishindex].data[dishdataindex].total;

    if (dish.sets !== undefined) {
      for (let i = 0; i < dish.sets.length; i++) {
        for (let j = 0; j < dish.sets[i].options.length; j++) {
          for (let k = 0; k < dish.sets[i].options[j].choice.length; k++) {
            let a;
            a = cart[index].dish[dishindex].data[
              dishdataindex
            ].relation.choices.indexOf(dish.sets[i].options[j].choice[k].id);
            if (a !== -1) {
              dish.sets[i].options[j].choice[k].checked = true;
              if (dish.sets[i].options[j].show === false) {
                dish.sets[i].options[j].show = true;
              }

              for (
                let v = 0;
                v < cart[index].dish[dishindex].data[dishdataindex].sets.length;
                v++
              ) {
                for (
                  let c = 0;
                  c <
                  cart[index].dish[dishindex].data[dishdataindex].sets[v].choice
                    .length;
                  c++
                ) {
                  let b = cart[index].dish[dishindex].data[
                    dishdataindex
                  ].relation.choices.indexOf(
                    cart[index].dish[dishindex].data[dishdataindex].sets[v]
                      .choice[c].id,
                  );
                  if (b !== -1) {
                    if (
                      dish.sets[i].options[j].choice[k].id ==
                      cart[index].dish[dishindex].data[dishdataindex].sets[v]
                        .choice[c].id
                    ) {
                      dish.sets[i].options[j].choice[k].qty =
                        cart[index].dish[dishindex].data[dishdataindex].sets[
                          v
                        ].choice[c].qty;
                      console.log('choice');
                      console.log(
                        cart[index].dish[dishindex].data[dishdataindex].sets[v]
                          .choice[c].qty,
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    dish.notes = cart[index].dish[dishindex].data[dishdataindex].notes;
    dish.ingredientsarray =
      cart[index].dish[dishindex].data[dishdataindex].ingredientsarray;
    if (cart[index].dish[dishindex].data[dishdataindex].activeIngredients) {
      dish.activeIngredients =
        cart[index].dish[dishindex].data[dishdataindex].activeIngredients;
    }
    dish.spicyquantity =
      cart[index].dish[dishindex].data[dishdataindex].spicyquantity;

    props.productDetailsEdit(dish, indexcart);
  };

  const addTocartIncrement = (index, dishindex, dishdataindex) => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    cart[index].dish[dishindex].quantity =
      parseInt(cart[index].dish[dishindex].quantity) + 1;
    cart[index].dish[dishindex].data[dishdataindex].quantity =
      parseInt(cart[index].dish[dishindex].data[dishdataindex].quantity) + 1;
    cart[index].dish[dishindex].data[dishdataindex].total =
      parseFloat(cart[index].dish[dishindex].data[dishdataindex].totalprice) *
      parseInt(cart[index].dish[dishindex].data[dishdataindex].quantity);
    cart[index].dish[dishindex].data[dishdataindex].total = parseFloat(
      cart[index].dish[dishindex].data[dishdataindex].total,
    ).toFixed(2);
    props.updateCartDetails(cart);
    calCartTotal(cart, props.activeBusiness);
  };
  const addTocartDecrement = (index, dishindex, dishdataindex) => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));

    cart[index].dish[dishindex].quantity =
      parseInt(cart[index].dish[dishindex].quantity) - 1;
    cart[index].dish[dishindex].data[dishdataindex].quantity =
      parseInt(cart[index].dish[dishindex].data[dishdataindex].quantity) - 1;
    cart[index].dish[dishindex].data[dishdataindex].total =
      parseFloat(cart[index].dish[dishindex].data[dishdataindex].totalprice) *
      parseInt(cart[index].dish[dishindex].data[dishdataindex].quantity);
    cart[index].dish[dishindex].data[dishdataindex].total = parseFloat(
      cart[index].dish[dishindex].data[dishdataindex].total,
    ).toFixed(2);
    if (cart[index].dish[dishindex].data[dishdataindex].quantity === 0) {
      cart[index].dish[dishindex].data.splice(dishdataindex, 1);
      if (cart[index].dish[dishindex].data.length === 0) {
        cart[index].dish.splice(dishindex, 1);
      }
      if (cart[index].dish.length === 0) {
        cart.splice(index, 1);
      }
    }

    if (cart.length == 0) {
      setBuyerDetails({
        id: 0,
        preorder: false,
        name: '',
        last_name: '',
        email: '',
        cel: '',
        specialaddress: '',
        delievryaddress: '',
        notes: '',
      });
      setCartFee([]);
    }

    props.updateCartDetails(cart);
    calCartTotal(cart, props.activeBusiness);
  };

  const calCartTotal = (cart, activeBusiness_val) => {
    let CartSubTotal_val = 0.0;
    for (let i = 0; i < cart.length; i++) {
      for (let j = 0; j < cart[i].dish.length; j++) {
        for (let k = 0; k < cart[i].dish[j].data.length; k++) {
          if (cart[i].dish[j].data[k].total) {
            CartSubTotal_val =
              parseFloat(CartSubTotal_val) +
              parseFloat(cart[i].dish[j].data[k].total);
            CartSubTotal_val = parseFloat(CartSubTotal_val).toFixed(2);
          }
        }
      }
    }

    setCartSubTotal(CartSubTotal_val);

    let PendingMinimumFee_val = activeBusiness_val.minimumfeeback;
    if (cart.length > 0) {
      if (cart[0].id === activeBusiness_val.id) {
        if (PendingMinimumFee_val > 0) {
          if (cart.length === 0) {
            PendingMinimumFee_val =
              parseFloat(PendingMinimumFee_val) - parseFloat(CartSubTotal_val);
            PendingMinimumFee_val = parseFloat(PendingMinimumFee_val).toFixed(
              2,
            );
          } else {
            if (cart[0].id === activeBusiness_val.id) {
              PendingMinimumFee_val =
                parseFloat(PendingMinimumFee_val) -
                parseFloat(CartSubTotal_val);
              PendingMinimumFee_val = parseFloat(PendingMinimumFee_val).toFixed(
                2,
              );
            }
          }

          setPendingMinimumFee(PendingMinimumFee_val);
        }
        if (activeBusiness_val.freedeliverystatus === '1') {
          if (
            parseFloat(CartSubTotal_val) >=
            parseFloat(activeBusiness_val.freedeliveryvalue)
          ) {
            setPendingFreeDelivery(true);
            setPendingFreeDeliveryValue(0.0);
          } else {
            setPendingFreeDelivery(false);
            let PendingFreeDeliveryValue_val =
              parseFloat(activeBusiness_val.freedeliveryvalue) -
              parseFloat(CartSubTotal_val);
            PendingFreeDeliveryValue_val = parseFloat(
              PendingFreeDeliveryValue_val,
            ).toFixed(2);
            setPendingFreeDeliveryValue(PendingFreeDeliveryValue_val);
          }
        }
      }

      postWithToken(
        baseUrl,
        'web-business/check-offer',
        {
          business_id: activeBusiness_val.id,
          total: CartSubTotal_val,
          orderType: orderType,
          lang_id: langId,
        },
        userToken,
      )
        .then(response => {
          let offerResponse = response;
          console.log('checkoffer');
          console.log(offerResponse);
          if (offerResponse.status === true) {
            discountInfo.discounttype = 'offer';

            setDiscountInfo(discountInfo);

            if (offerResponse.data[0].d_type == '1') {
              let discount = offerResponse.data[0].price;
              setDiscount(discount);
              CalDiscountAuto(cart, discount, CartSubTotal_val);
            } else {
              let percent = Number(offerResponse.data[0].percent) * 0.01;
              let discount = parseFloat(CartSubTotal_val) * percent;
              discount = parseFloat(discount).toFixed(2);
              setDiscount(discount);
              CalDiscountAuto(cart, discount, CartSubTotal_val, offerResponse);
            }
          } else {
            discountInfo.discounttype = '';

            setDiscountInfo(discountInfo);
            CalDiscountAuto(cart, 0, CartSubTotal_val, 0);
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }
  };

  const CalDiscountAuto = (
    cart_val,
    discount_val,
    CartSubTotal_val,
    json_val,
  ) => {
    let cartFee = new Array();
    let SubTotal = 0.0;

    for (let i = 0; i < cart_val.length; i++) {
      for (let j = 0; j < cart_val[i].dish.length; j++) {
        for (let k = 0; k < cart_val[i].dish[j].data.length; k++) {
          if (cart_val[i].dish[j].data[k].total) {
            SubTotal =
              parseFloat(SubTotal) +
              parseFloat(cart_val[i].dish[j].data[k].total);
            SubTotal = parseFloat(SubTotal).toFixed(2);
          }
        }
      }
      /*let firstOffer = 0.0;
      if (
        activeBusiness.firstorderstatus === '1' &&
        activeBusiness.ordercountstatus
      ) {
        if (
          parseFloat(SubTotal) >= parseFloat(activeBusiness.firstordervalue)
        ) {
          firstOffer =
            parseFloat(SubTotal) * activeBusiness.firstorderoffer * 0.01;
          firstOffer = parseFloat(firstOffer).toFixed(2);
        }
      }*/

      /*console.log(cart_val[i].details);
      console.log('check delivery');
      return false;*/

      /* cart_val[i].details.delivery = 0.0;
      if (activeBusiness.freedeliverystatus === '1') {
        if (
          parseFloat(SubTotal) >= parseFloat(activeBusiness.freedeliveryvalue)
        ) {
          cart_val[i].details.delivery = 0.0;
        }
      }*/
      let extraminimum = 0.0;
      if (activeBusiness.requiredminimumstatus === '1') {
        if (parseFloat(SubTotal) < parseFloat(activeBusiness.minimumfee)) {
          extraminimum =
            parseFloat(activeBusiness.minimumfee) - parseFloat(SubTotal);
          extraminimum = parseFloat(extraminimum).toFixed(2);
        }
      }
      let subtotal = parseFloat(SubTotal) - parseFloat(discount_val);
      subtotal = parseFloat(subtotal).toFixed(2);
      let taxprice =
        parseFloat(subtotal) * Number(cart_val[i].details.tax * 0.01);
      taxprice = parseFloat(taxprice).toFixed(2);
      let servicefeeprice = parseFloat(subtotal) + parseFloat(0);
      servicefeeprice = servicefeeprice * cart_val[i].details.servicefee * 0.01;
      servicefeeprice = parseFloat(servicefeeprice).toFixed(2);
      let total;
      /*if (cart_val[i].details.taxtype === '0') {*/
      total =
        parseFloat(CartSubTotal_val) -
        parseFloat(discount_val) +
        parseFloat(0) +
        parseFloat(taxprice) +
        parseFloat(servicefeeprice) +
        parseFloat(tips);
      total = parseFloat(total).toFixed(2);
      /*} else {
        taxprice = 0.0;
        total =
          parseFloat(CartSubTotal_val) -
          parseFloat(discount_val) +
          parseFloat(0) +
          parseFloat(servicefeeprice) +
          parseFloat(tips);
        total = parseFloat(total).toFixed(2);
      }*/
      /*if (activeBusiness.requiredminimumstatus === '1') {
        total = parseFloat(total) + parseFloat(extraminimum);
        total = parseFloat(total).toFixed(2);
      }*/
      /*if (
        activeBusiness.firstorderstatus === '1' &&
        activeBusiness.ordercountstatus
      ) {
        total = parseFloat(total) - parseFloat(firstOffer);
        total = parseFloat(total).toFixed(2);
      }*/
      let fee;
      fee = {
        id: cart_val[i].id,
        name: cart_val[i].details.name,
        subtotal: Number(SubTotal),
        tax: Number(cart_val[i].details.tax),
        taxtype: cart_val[i].details.taxtype,
        taxprice: Number(taxprice),
        deliverycost: 0.0,
        extraminimum: extraminimum,
        firstoffer: json_val,
        servicefee: Number(cart_val[i].details.servicefee),
        servicefeeprice: Number(servicefeeprice),
        discount: 0,
        tips: Number(tips),
        total: total,
        autodiscount: json_val != 0 ? Number(discount_val) : 0,
      };

      cartFee.push(fee);
    }

    console.log('cartFee line 797');

    console.log(cartFee);

    setCartFee(cartFee);
  };

  const CalDiscountCode = (cart_val, discount_val, CartSubTotal_val) => {
    let cartFee = new Array();
    let SubTotal = 0.0;

    for (let i = 0; i < cart_val.length; i++) {
      for (let j = 0; j < cart_val[i].dish.length; j++) {
        for (let k = 0; k < cart_val[i].dish[j].data.length; k++) {
          if (cart_val[i].dish[j].data[k].total) {
            SubTotal =
              parseFloat(SubTotal) +
              parseFloat(cart_val[i].dish[j].data[k].total);
            SubTotal = parseFloat(SubTotal).toFixed(2);
          }
        }
      }
      
      let extraminimum = 0.0;
      if (activeBusiness.requiredminimumstatus === '1') {
        if (parseFloat(SubTotal) < parseFloat(activeBusiness.minimumfee)) {
          extraminimum =
            parseFloat(activeBusiness.minimumfee) - parseFloat(SubTotal);
          extraminimum = parseFloat(extraminimum).toFixed(2);
        }
      }
      let subtotal = parseFloat(SubTotal) - parseFloat(discount_val);
      subtotal = parseFloat(subtotal).toFixed(2);
      let taxprice =
        parseFloat(subtotal) * Number(cart_val[i].details.tax * 0.01);
      taxprice = parseFloat(taxprice).toFixed(2);
      let servicefeeprice = parseFloat(subtotal) + parseFloat(0);
      servicefeeprice = servicefeeprice * cart_val[i].details.servicefee * 0.01;
      servicefeeprice = parseFloat(servicefeeprice).toFixed(2);
      let total;
      /*if (cart_val[i].details.taxtype === '0') {*/
      total =
        parseFloat(CartSubTotal_val) -
        parseFloat(discount_val) +
        parseFloat(0) +
        parseFloat(taxprice) +
        parseFloat(servicefeeprice) +
        parseFloat(tips);
      total = parseFloat(total).toFixed(2);
      /*} else {
        taxprice = 0.0;
        total =
          parseFloat(CartSubTotal_val) -
          parseFloat(discount_val) +
          parseFloat(0) +
          parseFloat(servicefeeprice) +
          parseFloat(tips);
        total = parseFloat(total).toFixed(2);
      }*/
      /*if (activeBusiness.requiredminimumstatus === '1') {
        total = parseFloat(total) + parseFloat(extraminimum);
        total = parseFloat(total).toFixed(2);
      }*/
      /*if (
        activeBusiness.firstorderstatus === '1' &&
        activeBusiness.ordercountstatus
      ) {
        total = parseFloat(total) - parseFloat(firstOffer);
        total = parseFloat(total).toFixed(2);
      }*/

      let fee;
      fee = {
        id: cart_val[i].id,
        name: cart_val[i].details.name,
        subtotal: Number(SubTotal),
        tax: Number(cart_val[i].details.tax),
        taxtype: cart_val[i].details.taxtype,
        taxprice: Number(taxprice),
        deliverycost: 0.0,
        extraminimum: extraminimum,
        firstoffer: 0,
        servicefee: Number(cart_val[i].details.servicefee),
        servicefeeprice: Number(servicefeeprice),
        discount: Number(discount_val),
        tips: Number(tips),
        total: Number(total),
        autodiscount: 0,
      };

      cartFee.push(fee);
    }

    console.log('cartFee line 910');

    setCartFee(cartFee);
  };

  const CheckDiscount = () => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    if (discount_code.search(/\S/) == -1) {
      showToastMsg('Please enter discount code');
      if (flg == true) {
        flg = false;
      }
      return false;
    } else {
      setLoader(true);
      setUpdateActionStatus(true);
      postWithToken(
        baseUrl,
        'web-business/check-discount-code',
        {
          discount_code: discount_code,
          business_id: activeBusiness.id,
          total_amount: CartSubTotal,
          lang_id: langId,
        },
        userToken,
      )
        .then(response => {
          setUpdateActionStatus(false);
          let offerResponse = response;
          //console.log('checkoffer');
          console.log(offerResponse);
          setLoader(false);
          if (offerResponse.status === true) {
            discountInfo.discounttype = 'code';

            setDiscountInfo(discountInfo);

            if (offerResponse.data.d_type === '1') {
              let discount = offerResponse.price;
              setDiscount(discount);
              CalDiscountCode(cart, discount, CartSubTotal);
            } else {
              let percent = Number(offerResponse.data.percent) * 0.01;
              let discount = parseFloat(CartSubTotal) * percent;
              discount = parseFloat(discount).toFixed(2);
              setDiscount(discount);
              CalDiscountCode(cart, discount, CartSubTotal);
            }

            showToastMsg('Discount Applied');
          } else {
            discountInfo.discounttype = '';

            setDiscountInfo(discountInfo);
            showToastMsg('Discount Code Not Valid');
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }
  };

  const SelectPayment = async val => {
    /*if (val.id == 1) {
      const usbdevicelist = await EbPrinter.getUsbDeviceList();

      if (usbdevicelist) {
        EbPrinter.selectUsbPrinter(usbdevicelist[0]);
      }
    }*/

    if (!checkValidation()) {
      return false;
    }
    setPaymentId(val.id);

    let payment_arr = JSON.parse(JSON.stringify(paymentMethod.list));

    for (let i = 0; i < payment_arr.length; i++) {
      if (payment_arr[i].id == val.id) {
        payment_arr[i].active = true;
      } else {
        payment_arr[i].active = false;
      }
    }

    if (val.id == 2) {
      setDisplayPairCode(true);
    } else {
      setDisplayPairCode(false);
    }

    setPaymentMethod({ isLoading: false, list: payment_arr });
  };

  const [CodeRun, setCodeRun] = useState('');
  const [visiblemodal, setvisiblemodal] = useState(false);
  const [printerlist, setPrinterList] = useState([]);
  const [SelectedUsb, setSelectedUsb] = useState(null);

  const OpenCashDrawer = async () => {
    console.log('openCashBox');
    //EbPrinter.openCashBox();
    setCodeRun('Code Is Run');
  };

  const GetUsbDeviceList = async () => {
    /*const usbdevicelist = await EbPrinter.getUsbDeviceList();

    if (usbdevicelist) {
      setPrinterList(usbdevicelist);
      //setPrinterList(['Devin', 'Dan']);
      setvisiblemodal(true);
    }
    console.log(usbdevicelist);

    //setPrinterList(['Devin', 'Dan']);
    //setvisiblemodal(true);*/
  };

  const selectDevice = item => {
    setSelectedUsb(item);
    //EbPrinter.selectUsbPrinter(item);
    setvisiblemodal(false);
    placeOrder();
  };

  const checkValidation = () => {
    let flg = true;

    if (buyerDetails.name.search(/\S/) == -1) {
      showToastMsg('Please enter first name');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (buyerDetails.last_name.search(/\S/) == -1) {
      showToastMsg('Please enter last name');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    /*if (buyerDetails.email.search(/\S/) == -1) {
      showToastMsg('Please enter email');
      if (flg == true) {
        flg = false;
      }
      return false;
    } else if (buyerDetails.email.search(/\S/) != -1) {
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
      if (reg.test(buyerDetails.email) === false) {
        showToastMsg('Please enter valid email Id');
        if (flg == true) {
          flg = false;
        }
        return false;
      }
    }*/

    if (buyerDetails.cel.search(/\S/) == -1) {
      showToastMsg('Please enter mobile number');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (selectedTime == '') {
      showToastMsg('Please select Estimate Time');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    return flg;
  };

  const CheckallDetails = () => {
    /*setBuyerDetails({
      id: 0,
      preorder: false,
      name: '',
      last_name: '',
      email: '',
      cel: '',
      specialaddress: '',
      delievryaddress: '',
      notes: '',
    });
    setDiscountInfo({discounttext: '', discounttype: '', discountid: ''});
    setDiscount(0.0);
    setTips(0.0);
    setCartFee([]);

    setPaymentMethod({isLoading: true, list: []});
    setPaymentId('');

    navigation.navigate('OrderSuccess', {orderId: '31714'});

    return false;*/

    let flg = true;
    if (paymentId == '') {
      showToastMsg('Please Select Payment Method');
      return false;
    } else {
      if (paymentId == 2) {
        if (paircode.search(/\S/) == -1) {
          showToastMsg('Please Enter Terminal PairCode');
          if (flg == true) {
            flg = false;
          }
          return false;
        }
      }

      if (paymentId == 2) {
        linkly_pinpad_request();
      } else {
        //GetUsbDeviceList();
        placeOrder();
      }
    }
  };

  const linkly_pinpad_request = () => {
    let postData = {
      f: 'linkly_pinpad_request',
      username: '562408408001',
      password: 'DHUAL68WG9AYB74I',
      paircode: paircode,
    };

    setLoader(true);

    postWithOutToken(baseUrl, 'module/payment/rest-payment', postData)
      .then(response => {
        setLoader(false);
        console.log(response);
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const placeOrder = () => {
    /*let location = JSON.parse(activeBusiness.location);
    let Search = {
      lat: location.latitud,
      lng: location.longitud,
      search_address: activeBusiness.address,
      order_type: orderType,
    };*/

    let Search = {
      lat: activeBusiness.latitud,
      lng: activeBusiness.longitud,
      search_address: activeBusiness.address,
      order_type: 4,
    };

    let tax = 0;
    let taxtype = 0;
    let tax_price = 0;
    let total = 0;
    let firstoffer = 0;

    for (let f = 0; f < cartFee.length; f++) {
      tax = cartFee[f].tax;
      taxtype = cartFee[f].taxtype;
      tax_price = cartFee[f].taxprice;
      total = cartFee[f].total;
      firstoffer = cartFee[f].firstoffer;
    }

    let postData = {
      langId: 1,
      bid: activeBusiness.id,
      city: activeBusiness.city,
      userId: buyerDetails.id,
      cartdish: CartDish.list,
      cartfee: cartFee[0],
      buyerdata: buyerDetails,
      deliverydetails: [
        {
          id: '0',
          name: '',
          delivery: '0',
          minimum: activeBusiness.minimumfee,
        },
      ],
      search: Search,
      paymentmethod: [paymentMethod.list[paymentIndex]],
      rewardWallet: {},
      sourcetype: 'Pos App',
      sourcetypename: {},
      discount_info: discountInfo,
      firstoffer: firstoffer,
      txnId: '',
      extraJson: {},
      estimate_time: selectedTime,
      buyername: buyerDetails.name + ' ' + buyerDetails.last_name,
      buyeremail: buyerDetails.email,
      buyerphone: buyerDetails.cel,
      buyercomments: '',
      subtotal: CartSubTotal,
      order_type: 4,
      payment_id: paymentId,
      tax: tax,
      taxtype: taxtype,
      tax_price: tax_price,
      dishdata: CartDish.list[0].dish,
      total: total,
    };

    /*console.log(CartDish.list[0].dish);
    return false;*/

    /*console.log(postData);

    return false;*/

    /*setBuyerDetails({
      id: 0,
      preorder: false,
      name: '',
      last_name: '',
      email: '',
      cel: '',
      specialaddress: '',
      delievryaddress: '',
      notes: '',
    });
    setDiscountInfo({discounttext: '', discounttype: '', discountid: ''});
    setDiscount(0.0);
    setTips(0.0);
    setCartFee([]);
    setSelectedTime('');
    

    setPaymentMethod({isLoading: true, list: []});
    setPaymentId('');
    setPaymentIndex('');
    setCartDish({isLoading: true, list: []});

    navigation.navigate('OrderSuccess', {orderId: '194'});

    return false;*/

    setLoader(true);
    setUpdateActionStatus(true);

    postWithToken(baseUrl, 'web-business/order-placed', postData, userToken)
      .then(response => {
        /*if (paymentId == 1) {
          OpenCashDrawer();
        }*/

        setLoader(false);
        setUpdateActionStatus(false);
        //console.log(response);
        setSelectedTime('');
        setBuyerDetails({
          id: 0,
          preorder: false,
          name: '',
          last_name: '',
          email: '',
          cel: '',
          specialaddress: '',
          delievryaddress: '',
          notes: '',
        });
        setDiscountInfo({ discounttext: '', discounttype: '', discountid: '' });
        setDiscount(0.0);
        setTips(0.0);
        setCartFee([]);

        setPaymentMethod({ isLoading: true, list: [] });
        setPaymentId('');
        setPaymentIndex('');
        setDiscountCode('');
        setCartDish({ isLoading: true, list: [] });

        navigation.navigate('OrderSuccess', { orderId: response.data.id });
      })
      .catch(error => {
        setLoader(false);
        console.log('Error : ', error);
      });
  };

  const setBuyerInfo = (val, type) => {
    if (type == 'name') {
      setBuyerDetails({ ...buyerDetails, name: val });
    } else if (type == 'last_name') {
      setBuyerDetails({ ...buyerDetails, last_name: val });
    } else if (type == 'email') {
      setBuyerDetails({ ...buyerDetails, email: val });
    } else if (type == 'cel') {
      setBuyerDetails({ ...buyerDetails, cel: val });
    }
  };

  return (
    <>
      <SafeAreaProvider>
        <SafeAreaView>
         
          <Modal
            supportedOrientations={['landscape']}
            animationType="slide"
            transparent={true}
            visible={visiblemodal}
          >
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
                  height: responsiveHeight(35),
                  width: responsiveWidth(35),
                  backgroundColor: '#ffffff',
                  borderRadius: 5,
                }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: Colors.backgroundColor,
                      position: 'relative',
                    }}
                  >
                    <View style={{}}>
                      <FlatList
                        data={printerlist}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{
                              paddingVertical: 10,
                              borderBottomWidth: 1,
                              borderColor: '#ddd',
                              paddingHorizontal: 10,
                            }}
                            onPress={() => selectDevice(item)}
                          >
                            <Text
                              style={{
                                fontSize: responsiveFontSize(1.8),
                                color: Colors.blue,
                              }}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'always'}
          >
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
                <ActivityIndicator size="large" color={Colors.blue} />
              </View>
            ) : null*/}
            {viewloader === true ? <Loader /> : null}
            {CartDish.isLoading === false && CartDish.list.length > 0 ? (
              <View
                style={{
                  borderColor: Colors.primary,
                  borderWidth: 1.5,
                  borderRadius: 15,
                  paddingHorizontal: responsiveWidth(1),
                  paddingVertical: responsiveHeight(2),
                  minHeight: responsiveHeight(80),
                }}
              >
                <View
                  style={{ marginTop: responsiveHeight(0.5), display: 'flex' }}
                >
                  <AppTextInput
                    inputStyle={{ paddingLeft: 10 }}
                    onChangeText={text => {
                      setBuyerInfo(text, 'name');
                    }}
                    value={buyerDetails.name}
                    placeholder="First Name"
                    leftIcon={{
                      name: 'user',
                      type: 'AntDesign',
                      color: Colors.black,
                    }}
                    inputContainerStyle={{
                      borderColor: Colors.grey,
                      marginBottom: responsiveHeight(1),
                      height: responsiveWidth(4),
                    }}
                  />
                </View>

                <View
                  style={{ marginTop: responsiveHeight(0.5), display: 'flex' }}
                >
                  <AppTextInput
                    inputStyle={{ paddingLeft: 10 }}
                    onChangeText={text => {
                      setBuyerInfo(text, 'last_name');
                    }}
                    value={buyerDetails.last_name}
                    placeholder="Last Name"
                    leftIcon={{
                      name: 'user',
                      type: 'AntDesign',
                      color: Colors.black,
                    }}
                    inputContainerStyle={{
                      borderColor: Colors.grey,
                      marginBottom: responsiveHeight(1),
                      height: responsiveWidth(4),
                    }}
                  />
                </View>

                {/*<View
                  style={{marginTop: responsiveHeight(0.5), display: 'flex'}}>
                  <AppTextInput
                    inputStyle={{paddingLeft: 10}}
                    onChangeText={text => {
                      setBuyerInfo(text, 'email');
                    }}
                    value={buyerDetails.email}
                    placeholder="Email"
                    leftIcon={{
                      name: 'mail',
                      type: 'AntDesign',
                      color: Colors.black,
                    }}
                    inputContainerStyle={{
                      borderColor: Colors.grey,
                      marginBottom: responsiveHeight(1),
                    }}
                  />
                </View>*/}

                <View
                  style={{
                    marginTop: responsiveHeight(0.5),
                    display: 'flex',
                    position: 'relative',
                  }}
                >
                  <AppTextInput
                    inputStyle={{ paddingLeft: 10 }}
                    onChangeText={text => {
                      setBuyerInfo(text, 'cel');
                      FetchUserByPhone(text);
                    }}
                    value={buyerDetails.cel}
                    placeholder="Mobile"
                    leftIcon={{
                      name: 'phone',
                      type: 'AntDesign',
                      color: Colors.black,
                    }}
                    inputContainerStyle={{
                      borderColor: Colors.grey,
                      marginBottom: responsiveHeight(1),
                      height: responsiveWidth(4),
                    }}
                    keyboardType="numeric"
                    maxLength={15}
                  />

                  {menuVisible && userlist.length > 0 && (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        flexDirection: 'column',
                        borderColor: Colors.grey,
                        marginTop: responsiveHeight(-1.8),
                        maxHeight: responsiveHeight(25),
                        overflow: 'hidden',
                        position: 'absolute',
                        top: '100%',
                        zIndex: 999,
                        width: '100%',
                      }}
                    >
                      <ScrollView keyboardShouldPersistTaps={'always'}>
                        {userlist.map((item, index) => (
                          <TouchableOpacity
                            key={'cel_t' + index}
                            onPress={() => {
                              console.log('Button Pressed!');
                              Keyboard.dismiss();
                              updateUserData(index);
                              setMenuVisible(false);
                            }}
                          >
                            <Menu.Item
                              key={'cel_' + index}
                              style={[{ width: '100%' }]}
                              title={item.cel}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {discountInfo.discounttype !== 'offer' ? (
                  <View
                    style={{
                      marginTop: responsiveHeight(0.5),
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                  >
                    <View
                      style={{ width: '65%', marginRight: responsiveWidth(1) }}
                    >
                      <AppTextInput
                        inputStyle={{ paddingLeft: 10 }}
                        onChangeText={text => {
                          setDiscountCode(text);
                        }}
                        value={discount_code}
                        placeholder={'Discount Coupon'}
                        leftIcon={{
                          name: 'ticket',
                          type: 'Entypo',
                          color: Colors.black,
                        }}
                        inputContainerStyle={{
                          borderColor: Colors.grey,
                          marginBottom: responsiveHeight(1),
                          height: responsiveWidth(4),
                        }}
                      />
                    </View>
                    <View
                      style={{
                        width: '33%',
                        marginTop: responsiveHeight(0.7),
                      }}
                    >
                      {update_action_status === true ? (
                        <View style={styles.applybutton_disable}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: responsiveFontSize(1.4),
                              color: '#000',
                              fontFamily: Inter.medium,
                            }}
                          >
                            {'APPLY'}
                          </Text>
                        </View>
                      ) : CartDish.list.length > 0 ? (
                        <TouchableOpacity
                          style={styles.applybutton}
                          onPress={() => {
                            CheckDiscount();
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: responsiveFontSize(1.4),
                              color: '#fff',
                              fontFamily: Inter.medium,
                            }}
                          >
                            {'APPLY'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.applybutton_disable}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: responsiveFontSize(1.4),
                              color: '#000',
                              fontFamily: Inter.medium,
                            }}
                          >
                            {'APPLY'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : null}

                {/*<View
                  style={{
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: Colors.grey,
                    borderRadius: 10,
                    marginVertical: responsiveHeight(1.5),
                  }}
                >
                  <Picker
                    selectedValue={selectedTime}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedTime(itemValue)
                    }
                    style={{
                      backgroundColor: Colors.white,
                      color: color_theme_selected,
                    }}
                    dropdownIconColor={color_theme_selected}
                  >
                    <Picker.Item
                      style={{
                        color: color_theme,
                        fontFamily: Inter.regular,
                        fontSize: responsiveFontSize(1.5),
                      }}
                      key={'01'}
                      label={'Select Estimate Time'}
                      value={''}
                    />
                    {timeOptions.map((item, index) => {
                      return (
                        <Picker.Item
                          key={index}
                          style={{
                            color: color_theme,
                            fontFamily: Inter.regular,
                            fontSize: responsiveFontSize(1.5),
                          }}
                          label={item.label}
                          value={item.val}
                        />
                      );
                    })}
                  </Picker>
                </View>*/}

                <View
                  style={{
                    marginBottom: responsiveHeight(2),
                  }}
                >
                  <DropdownComponent />
                </View>

                {CartDish.isLoading === false && CartDish.list.length > 0 ? (
                  <>
                    {CartDish.list.map((cartdish, cartindex) => {
                      return cartdish.dish.map((cdish, dishindex) => {
                        return cdish.data.map((dish, dataindex) => {
                          return (
                            <View
                              key={'cdish_' + dataindex}
                              style={{
                                borderColor: Colors.grey,
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: responsiveWidth(0.5),
                                marginVertical: responsiveHeight(1),
                              }}
                            >
                              <View
                                style={{
                                  marginTop: responsiveHeight(0.5),
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View style={{ width: responsiveWidth(15) }}>
                                  <Text
                                    style={{
                                      fontFamily: Inter.regular,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.black,
                                    }}
                                  >
                                    {dish.name}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      addTocartDecrement(
                                        cartindex,
                                        dishindex,
                                        dataindex,
                                      );
                                    }}
                                  >
                                    <Icon
                                      name="minuscircleo"
                                      type="AntDesign"
                                      size={responsiveWidth(2)}
                                      color={Colors.primaryFontColor}
                                    />
                                  </TouchableOpacity>
                                  <Text
                                    style={{
                                      fontFamily: Inter.regular,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.black,
                                      marginHorizontal: responsiveWidth(0.5),
                                    }}
                                  >
                                    {dish.quantity}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => {
                                      addTocartIncrement(
                                        cartindex,
                                        dishindex,
                                        dataindex,
                                      );
                                    }}
                                  >
                                    <Icon
                                      name="pluscircleo"
                                      type="AntDesign"
                                      size={responsiveWidth(2)}
                                      color={Colors.primaryFontColor}
                                    />
                                  </TouchableOpacity>
                                </View>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: Inter.regular,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.buttonColor,
                                    }}
                                  >
                                    {activeBusiness != null
                                      ? activeBusiness.currency_symbol
                                      : null}
                                    {dish.total}
                                  </Text>
                                  {dish.sets.length > 0 ? (
                                    <TouchableOpacity
                                      onPress={() => {
                                        editOptions(
                                          cartindex,
                                          dishindex,
                                          dataindex,
                                        );
                                      }}
                                    >
                                      <Icon
                                        name="edit"
                                        type="AntDesign"
                                        size={responsiveWidth(2)}
                                        color={Colors.black}
                                      />
                                    </TouchableOpacity>
                                  ) : null}
                                </View>
                              </View>

                              {dish.sets.length > 0
                                ? dish.sets.map((set, set_index) => {
                                    return (
                                      <View key={'set_' + set_index}>
                                        <Text
                                          style={{
                                            fontFamily: Inter.bold,
                                            fontSize: responsiveFontSize(1),
                                            color: Colors.primaryFontColor,
                                          }}
                                        >
                                          {set.name}
                                        </Text>
                                        {set.choice.length > 0
                                          ? set.choice.map(
                                              (choice, choice_index) => {
                                                console.log(choice);
                                                return (
                                                  <View
                                                    key={
                                                      'choice_' + choice_index
                                                    }
                                                    style={{
                                                      display: 'flex',
                                                      flexDirection: 'row',
                                                      alignItems: 'center',
                                                    }}
                                                  >
                                                    <Icon
                                                      name="dot-single"
                                                      type="Entypo"
                                                      size={25}
                                                      color={
                                                        Colors.primaryFontColor
                                                      }
                                                    />
                                                    <Text
                                                      style={{
                                                        fontFamily:
                                                          Inter.regular,
                                                        fontSize:
                                                          responsiveFontSize(1),
                                                        color: Colors.black,
                                                      }}
                                                    >
                                                      {choice.name}
                                                      {' x '}
                                                      {choice.qty}
                                                      {
                                                        /*choice.price > 0 ? (*/
                                                        <Text>
                                                          {' - '}
                                                          {activeBusiness !=
                                                          null
                                                            ? activeBusiness.currency_symbol
                                                            : null}
                                                          {choice.price}
                                                        </Text>
                                                        /*) : null*/
                                                      }
                                                    </Text>
                                                  </View>
                                                );
                                              },
                                            )
                                          : null}
                                      </View>
                                    );
                                  })
                                : null}

                              {dish.activeIngredients.length > 0 ? (
                                <View>
                                  {/*<Text
                                style={{
                                  fontFamily: Inter.bold,
                                  fontSize: responsiveFontSize(1),
                                  color: Colors.blue,
                                }}>
                                Ingredients
                              </Text>*/}

                                  {dish.activeIngredients.map(
                                    (ingre, ingre_index) => {
                                      return (
                                        <View
                                          key={'ing_' + ingre_index}
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                          }}
                                        >
                                          <Icon
                                            name="dot-single"
                                            type="Entypo"
                                            size={25}
                                            color={Colors.primaryFontColor}
                                          />
                                          {/*<Icon
                                        name="plus"
                                        type="AntDesign"
                                        size={responsiveWidth(3)}
                                        color={Colors.grey}
                                      />*/}
                                          <Text
                                            style={{
                                              fontFamily: Inter.regular,
                                              fontSize: responsiveFontSize(1),
                                              color: Colors.black,
                                            }}
                                          >
                                            {ingre}
                                          </Text>
                                        </View>
                                      );
                                    },
                                  )}
                                </View>
                              ) : null}
                            </View>
                          );
                        });
                      });
                    })}

                    {PendingMinimumFee > 0.0 ? null : (
                      <>
                        <View
                          style={{
                            backgroundColor: Colors.primary,
                            borderRadius: 10,
                            paddingHorizontal: responsiveWidth(1),
                            paddingVertical: responsiveHeight(1),
                            marginVertical: responsiveHeight(1),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            {/*<Text
                          style={{
                            fontFamily: Inter.bold,
                            fontSize: responsiveFontSize(1),
                            color: Colors.white,
                          }}>
                          Total Item{' '}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Inter.bold,
                            fontSize: responsiveFontSize(1),
                            color: Colors.white,
                          }}>
                          {cartQuantity}
                        </Text>*/}
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: Inter.bold,
                                fontSize: responsiveFontSize(1),
                                color: Colors.white,
                              }}
                            >
                              Sub Total{' '}
                            </Text>
                            <Text
                              style={{
                                fontFamily: Inter.bold,
                                fontSize: responsiveFontSize(1),
                                color: Colors.white,
                              }}
                            >
                              {activeBusiness.currency_symbol}
                              {CartSubTotal}
                            </Text>
                          </View>

                          {cartFee.map((cartfee, index) => {
                            //console.log(cartfee?.firstoffer?.data);
                            return (
                              <View key={'carefee_' + index}>
                                {cartfee.taxprice > 0 ? (
                                  <>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontFamily: Inter.bold,
                                          fontSize: responsiveFontSize(1),
                                          color: Colors.white,
                                        }}
                                      >
                                        Tax ({cartfee.tax}%)
                                      </Text>
                                      <Text
                                        style={{
                                          fontFamily: Inter.bold,
                                          fontSize: responsiveFontSize(1),
                                          color: Colors.white,
                                        }}
                                      >
                                        {activeBusiness.currency_symbol}
                                        {parseFloat(cartfee.taxprice).toFixed(
                                          2,
                                        )}
                                      </Text>
                                    </View>

                                    {/*<View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}>
                                  {cartfee.taxtype == '1' ? (
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.red,
                                      }}>
                                      Tax Included on Price
                                    </Text>
                                  ) : cartfee.taxtype == '0' ? (
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.red,
                                      }}>
                                      Tax not Included with Price
                                    </Text>
                                  ) : null}
                                </View>*/}
                                  </>
                                ) : null}
                                {cartfee.servicefeeprice > 0 ? (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.white,
                                      }}
                                    >
                                      Service Fee ({cartfee.servicefee}%)
                                    </Text>
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.white,
                                      }}
                                    >
                                      {activeBusiness.currency_symbol}
                                      {parseFloat(
                                        cartfee.servicefeeprice,
                                      ).toFixed(2)}
                                    </Text>
                                  </View>
                                ) : null}

                                {cartfee.tips > 0 ? (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.white,
                                      }}
                                    >
                                      Tips{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.white,
                                      }}
                                    >
                                      {activeBusiness.currency_symbol}
                                      {parseFloat(cartfee.tips).toFixed(2)}
                                    </Text>
                                  </View>
                                ) : null}

                                {cartfee.discount > 0 ? (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.white,
                                      }}
                                    >
                                      Discount{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.red,
                                      }}
                                    >
                                      {'-'}
                                      {activeBusiness.currency_symbol}
                                      {parseFloat(cartfee.discount).toFixed(2)}
                                    </Text>
                                  </View>
                                ) : null}

                                {cartfee?.autodiscount > 0 ? (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.white,
                                      }}
                                    >
                                      {cartfee?.firstoffer?.message}(
                                      {cartfee?.firstoffer?.data[0]?.distext}){' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontFamily: Inter.bold,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.red,
                                      }}
                                    >
                                      {'-'}
                                      {activeBusiness.currency_symbol}
                                      {parseFloat(cartfee.autodiscount).toFixed(
                                        2,
                                      )}
                                    </Text>
                                  </View>
                                ) : null}

                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: Inter.bold,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.white,
                                    }}
                                  >
                                    Total{' '}
                                  </Text>
                                  <Text
                                    style={{
                                      fontFamily: Inter.bold,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.white,
                                    }}
                                  >
                                    {activeBusiness.currency_symbol}
                                    {parseFloat(cartfee.total).toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {displaypaircode === true ? (
                          <View
                            style={{
                              marginTop: responsiveHeight(0.5),
                              display: 'flex',
                            }}
                          >
                            <AppTextInput
                              inputStyle={{ paddingLeft: 10 }}
                              onChangeText={text => {
                                setPaircode(text);
                              }}
                              value={paircode}
                              placeholder="Terminal PairCode"
                              leftIcon={{
                                name: 'code-working',
                                type: 'Ionicons',
                                color: Colors.black,
                              }}
                              inputContainerStyle={{
                                borderColor: Colors.grey,
                                marginBottom: responsiveHeight(1),
                              }}
                              keyboardType="numeric"
                              maxLength={10}
                            />
                          </View>
                        ) : null}

                        <View style={{ marginVertical: responsiveHeight(2) }}>
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            {paymentMethod.isLoading === false &&
                            paymentMethod.list.length > 0
                              ? paymentMethod.list.map((item, index) => {
                                  return (
                                    <View
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: responsiveWidth(1),
                                      }}
                                      key={'pay_' + index}
                                    >
                                      <RadioButton
                                        selected={item.active}
                                        onChange={() => {
                                          SelectPayment(item);
                                          setPaymentIndex(index);
                                        }}
                                        size={22}
                                        style={[styles.radioButton, {}]}
                                        activeColor={Colors.primaryFontColor}
                                        inactiveColor={Colors.primaryFontColor}
                                      />
                                      <Text
                                        style={{
                                          marginLeft: responsiveWidth(1),
                                          fontFamily: Inter.bold,
                                          fontSize: responsiveFontSize(1),
                                          color: Colors.black,
                                          textTransform: 'capitalize',
                                        }}
                                      >
                                        {item.payment_method}
                                      </Text>
                                    </View>
                                  );
                                })
                              : null}
                          </View>
                        </View>
                      </>
                    )}

                    <View
                      style={{
                        paddingBottom: responsiveHeight(1),
                        marginBottom: responsiveHeight(20),
                      }}
                    >
                      {PendingMinimumFee > 0.0 ? (
                        <View
                          style={{
                            alignItems: 'center',
                            paddingVertical: responsiveHeight(1),
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: Inter.medium,
                              fontSize: responsiveFontSize(1.2),
                              color: Colors.red,
                            }}
                          >
                            minimum price need to add{' '}
                            {activeBusiness.currency_symbol}
                            {PendingMinimumFee}
                          </Text>
                        </View>
                      ) : null}
                      {PendingMinimumFee <= 0.0 ? (
                        update_action_status === true ? (
                          <TouchableOpacity style={styles.button_disable}>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                fontSize: responsiveFontSize(1.5),
                                color: '#000',
                                fontFamily: Inter.medium,
                              }}
                            >
                              Pay Now
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                              CheckallDetails();
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
                              Pay Now
                            </Text>
                          </TouchableOpacity>
                        )
                      ) : PendingMinimumFee > 0.0 ? (
                        <TouchableOpacity style={styles.button}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: responsiveFontSize(1.5),
                              color: '#fff',
                              fontFamily: Inter.medium,
                            }}
                          >
                            {'Minumum Order'}:{activeBusiness.currency_symbol}
                            {activeBusiness.minimumfee}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </>
                ) : (
                  <>
                    {/*<View
                      style={{
                        borderColor: Colors.grey,
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingHorizontal: responsiveWidth(0.5),
                        marginVertical: responsiveHeight(1),
                        height: responsiveHeight(15),
                      }}
                    ></View>
                    <View
                      style={{
                        backgroundColor: Colors.blue,
                        borderRadius: 10,
                        paddingHorizontal: responsiveWidth(1),
                        paddingVertical: responsiveHeight(1),
                        marginVertical: responsiveHeight(1),
                        height: responsiveHeight(15),
                      }}
                    ></View>*/}
                  </>
                )}
              </View>
            ) : (
              <View
                style={{
                  borderColor: Colors.primary,
                  borderWidth: 1.5,
                  borderRadius: 15,
                  paddingHorizontal: responsiveWidth(1),
                  paddingVertical: responsiveHeight(2),
                  minHeight: responsiveHeight(80),
                }}
              >
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Icon
                      name="cart-outline"
                      type="Ionicons"
                      size={responsiveFontSize(5)}
                      color={Colors.primaryFontColor}
                    />
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: Inter.bold,
                        fontSize: responsiveFontSize(1.5),
                        color: '#000',
                      }}
                    >
                      No Products in your cart
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
};

export default HomeRight;
