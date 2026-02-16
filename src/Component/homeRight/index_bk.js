import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import Styles from './Styles';
import {Colors} from '../../Constants/Colors';
import {Inter} from '../../Constants/Fonts';
import {Images} from '../../Constants/ImageIconContant';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useDispatch, useSelector} from 'react-redux';
import {
  setCartDetails,
  setCartQuantity,
} from '../../Store/Reducers/CommonReducer';
import {showToastMsg, getData, setData} from '../../Service/localStorage';
import {postWithOutToken} from '../../Service/service';
import {useFocusEffect} from '@react-navigation/native';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
  RadioButton,
  CheckBox,
} from 'react-native-basic-elements';
import {useNavigation} from '@react-navigation/native';

// create a component
const HomeRight = props => {
  const styles = Styles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {baseUrl, siteUrl, userToken, userData, langId, cartDetails} =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [CartDish, setCartDish] = useState({isLoading: true, list: []});
  const [cartQuantity, setcartQuantity] = useState(0);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [orderType, setOrderType] = useState(0);

  const [CartSubTotal, setCartSubTotal] = useState(0.0);
  const [PendingMinimumFee, setPendingMinimumFee] = useState(0.0);
  const [PendingFreeDelivery, setPendingFreeDelivery] = useState(false);
  const [PendingFreeDeliveryValue, setPendingFreeDeliveryValue] = useState('');

  const [preorderDetails, setPreorderDetails] = useState(null);

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

  const [paymentMethod, setPaymentMethod] = useState({
    isLoading: true,
    list: [],
  });
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {}, []);

  useFocusEffect(
    React.useCallback(() => {
      if (props.cartDish != undefined) {
        setCategoryDetails(props.categoryDetails);
        setActiveBusiness(props.activeBusiness);
        setOrderType(props.orderType);
        setCartDish({isLoading: false, list: props.cartDish.list});
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

  const FetchPaymentMothod = (bid, orderType_val) => {
    postWithOutToken(baseUrl, 'module/business/rest-business', {
      f: 'checkpayment',
      langId: langId,
      bid: bid,
    })
      .then(response => {
        let paymentResponse = response;
        let payment_arr = [];
        for (let j = 0; j < paymentResponse.length; j++) {
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
            paymentc.displayName = response[j].displayName;
            paymentc.active = false;
            paymentc.credential = paymentResponse[j].credential;

            if (paymentc.id === '1') {
              payment_arr.push(paymentc);
            }
          }
        }

        setPaymentMethod({isLoading: false, list: payment_arr});
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

    console.log(
      parseInt(cart[index].dish[dishindex].data[dishdataindex].quantity, 10),
    );

    console.log(
      parseFloat(cart[index].dish[dishindex].data[dishdataindex].total).toFixed(
        2,
      ),
    );
    console.log(
      parseFloat(cart[index].dish[dishindex].data[dishdataindex].totalprice) *
        parseInt(cart[index].dish[dishindex].data[dishdataindex].quantity),
    );

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

      postWithOutToken(baseUrl, 'module/business/rest-business.php', {
        f: 'checkoffer',
        bid: activeBusiness_val.id,
        price: CartSubTotal_val,
        orderType: orderType,
      })
        .then(response => {
          let offerResponse = response;
          if (offerResponse.status === true) {
            discountInfo.discounttype = 'offer';

            setDiscountInfo(discountInfo);

            if (offerResponse.d_type === '1') {
              let discount = offerResponse.price;
              setDiscount(discount);
              CalDiscount(cart, discount, CartSubTotal_val);
            } else {
              let percent = Number(offerResponse.percent) * 0.01;
              let discount = parseFloat(CartSubTotal_val) * percent;
              discount = parseFloat(discount).toFixed(2);
              setDiscount(discount);
              CalDiscount(cart, discount, CartSubTotal_val);
            }
          } else {
            CalDiscount(cart, discount, CartSubTotal_val);
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }
  };

  const CalDiscount = (cart_val, discount_val, CartSubTotal_val) => {
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
      let firstOffer = 0.0;
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
      }
      cart_val[i].details.delivery = 0.0;
      if (activeBusiness.freedeliverystatus === '1') {
        if (
          parseFloat(SubTotal) >= parseFloat(activeBusiness.freedeliveryvalue)
        ) {
          cart_val[i].details.delivery = 0.0;
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
      if (cart_val[i].details.taxtype === '0') {
        total =
          parseFloat(CartSubTotal_val) -
          parseFloat(discount_val) +
          parseFloat(0) +
          parseFloat(taxprice) +
          parseFloat(servicefeeprice) +
          parseFloat(tips);
        total = parseFloat(total).toFixed(2);
      } else {
        total =
          parseFloat(CartSubTotal_val) -
          parseFloat(discount_val) +
          parseFloat(0) +
          parseFloat(servicefeeprice) +
          parseFloat(tips);
        total = parseFloat(total).toFixed(2);
      }
      if (activeBusiness.requiredminimumstatus === '1') {
        total = parseFloat(total) + parseFloat(extraminimum);
        total = parseFloat(total).toFixed(2);
      }
      if (
        activeBusiness.firstorderstatus === '1' &&
        activeBusiness.ordercountstatus
      ) {
        total = parseFloat(total) - parseFloat(firstOffer);
        total = parseFloat(total).toFixed(2);
      }
      let fee;
      fee = {
        id: cart_val[i].id,
        name: cart_val[i].details.name,
        subtotal: SubTotal,
        tax: cart_val[i].details.tax,
        taxtype: cart_val[i].details.taxtype,
        taxprice: taxprice,
        deliverycost: 0.0,
        extraminimum: extraminimum,
        firstoffer: firstOffer,
        servicefee: cart_val[i].details.servicefee,
        servicefeeprice: servicefeeprice,
        discount: parseFloat(discount_val).toFixed(2),
        tips: tips,
        total: total,
      };

      cartFee.push(fee);
    }

    setCartFee(cartFee);
  };

  const SelectPayment = val => {
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

    setPaymentMethod({isLoading: false, list: payment_arr});
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

    if (buyerDetails.email.search(/\S/) == -1) {
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
    }

    if (buyerDetails.cel.search(/\S/) == -1) {
      showToastMsg('Please enter mobile number');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    return flg;
  };

  const CheckallDetails = () => {
    let flg = true;
    if (paymentId == '') {
      showToastMsg('Please Select Payment Method');
      return false;
    } else {
      placeOrder();
    }
  };

  const placeOrder = () => {
    let location = JSON.parse(activeBusiness.location);
    let Search = {
      lat: location.latitud,
      lng: location.longitud,
      search_address: activeBusiness.address,
      order_type: orderType,
    };

    let postData = {
      f: 'react_placeorder',
      langId: 1,
      userId: buyerDetails.id,
      CartDish: JSON.stringify(CartDish.list),
      cartFee: JSON.stringify(cartFee),
      BuyerDetails: JSON.stringify(buyerDetails),
      deliveryDetails: JSON.stringify({
        minimum: activeBusiness.minimumfee,
        delivery: 0.0,
      }),
      Search: JSON.stringify(Search),
      paymentMethod: JSON.stringify(paymentMethod.list),
      rewardWallet: JSON.stringify({}),
      sourcetype: 'App',
      sourcetypename: JSON.stringify({}),
      discountInfo: JSON.stringify(discountInfo),
      txnId: '',
      extraJson: JSON.stringify({}),
    };

    //console.log(postData);

    /*setBuyerDetails({id: 0, preorder: false, name: "", last_name: "", email: "", cel: "", specialaddress: "", delievryaddress: "", notes: ""});
        setDiscountInfo({discounttext: '', discounttype: '', discountid: ''});
        setDiscount(0.00);
        setTips(0.00);
        setCartFee([]);

        setPaymentMethod({isLoading: true, list: []});
        setPaymentId("");

    navigation.navigate('OrderSuccess', {orderId: '31714'})***/

    setLoader(true);

    postWithOutToken(baseUrl, 'module/place/rest-place', postData)
      .then(response => {
        setLoader(false);
        console.log(response);
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
        setDiscountInfo({discounttext: '', discounttype: '', discountid: ''});
        setDiscount(0.0);
        setTips(0.0);
        setCartFee([]);

        setPaymentMethod({isLoading: true, list: []});
        setPaymentId('');

        navigation.navigate('OrderSuccess', {orderId: response[0]});
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const setBuyerInfo = (val, type) => {
    if (type == 'name') {
      setBuyerDetails({...buyerDetails, name: val});
    } else if (type == 'last_name') {
      setBuyerDetails({...buyerDetails, last_name: val});
    } else if (type == 'email') {
      setBuyerDetails({...buyerDetails, email: val});
    } else if (type == 'cel') {
      setBuyerDetails({...buyerDetails, cel: val});
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
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
          }}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : null}
      {CartDish.isLoading === false && CartDish.list.length > 0 ? (
        <View
          style={{
            borderColor: Colors.blue,
            borderWidth: 1.5,
            borderRadius: 15,
            paddingHorizontal: responsiveWidth(1),
            paddingVertical: responsiveHeight(2),
          }}>
          {/*<View  style={{marginTop: responsiveHeight(0.5), display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.black}}>Sanjeev Kumar Saha</Text>
                                <TouchableOpacity >
                                  <Icon name="edit" type="AntDesign" size={25} color={Colors.black} />
                                </TouchableOpacity>

                              </View>*/}

          <View style={{marginTop: responsiveHeight(0.5), display: 'flex'}}>
            <AppTextInput
              inputStyle={{paddingLeft: 10}}
              onChangeText={text => {
                setBuyerInfo(text, 'name');
              }}
              value={buyerDetails.name}
              placeholder="First Name"
              leftIcon={{name: 'user', type: 'AntDesign', color: Colors.black}}
              inputContainerStyle={{
                borderColor: Colors.grey,
                marginBottom: responsiveHeight(1),
              }}
            />
          </View>

          <View style={{marginTop: responsiveHeight(0.5), display: 'flex'}}>
            <AppTextInput
              inputStyle={{paddingLeft: 10}}
              onChangeText={text => {
                setBuyerInfo(text, 'last_name');
              }}
              value={buyerDetails.last_name}
              placeholder="Last Name"
              leftIcon={{name: 'user', type: 'AntDesign', color: Colors.black}}
              inputContainerStyle={{
                borderColor: Colors.grey,
                marginBottom: responsiveHeight(1),
              }}
            />
          </View>

          <View style={{marginTop: responsiveHeight(0.5), display: 'flex'}}>
            <AppTextInput
              inputStyle={{paddingLeft: 10}}
              onChangeText={text => {
                setBuyerInfo(text, 'email');
              }}
              value={buyerDetails.email}
              placeholder="Email"
              leftIcon={{name: 'mail', type: 'AntDesign', color: Colors.black}}
              inputContainerStyle={{
                borderColor: Colors.grey,
                marginBottom: responsiveHeight(1),
              }}
            />
          </View>

          <View style={{marginTop: responsiveHeight(0.5), display: 'flex'}}>
            <AppTextInput
              inputStyle={{paddingLeft: 10}}
              onChangeText={text => {
                setBuyerInfo(text, 'cel');
              }}
              value={buyerDetails.cel}
              placeholder="Mobile"
              leftIcon={{name: 'phone', type: 'AntDesign', color: Colors.black}}
              inputContainerStyle={{
                borderColor: Colors.grey,
                marginBottom: responsiveHeight(1),
              }}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

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
                    }}>
                    <View
                      style={{
                        marginTop: responsiveHeight(0.5),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{width: responsiveWidth(15)}}>
                        <Text
                          style={{
                            fontFamily: Inter.regular,
                            fontSize: responsiveFontSize(1),
                            color: Colors.black,
                          }}>
                          {dish.name}
                        </Text>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            addTocartDecrement(cartindex, dishindex, dataindex);
                          }}>
                          <Icon
                            name="minuscircleo"
                            type="AntDesign"
                            size={responsiveWidth(2)}
                            color={Colors.blue}
                          />
                        </TouchableOpacity>
                        <Text
                          style={{
                            fontFamily: Inter.regular,
                            fontSize: responsiveFontSize(1),
                            color: Colors.black,
                            marginHorizontal: responsiveWidth(0.5),
                          }}>
                          {dish.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            addTocartIncrement(cartindex, dishindex, dataindex);
                          }}>
                          <Icon
                            name="pluscircleo"
                            type="AntDesign"
                            size={responsiveWidth(2)}
                            color={Colors.blue}
                          />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: Inter.regular,
                            fontSize: responsiveFontSize(1),
                            color: Colors.green,
                          }}>
                          {activeBusiness != null
                            ? activeBusiness.currency_symbol
                            : null}
                          {dish.total}
                        </Text>
                        {dish.sets.length > 0 ? (
                          <TouchableOpacity
                            onPress={() => {
                              editOptions(cartindex, dishindex, dataindex);
                            }}>
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
                    {dish.activeIngredients.length > 0 ? (
                      <View>
                        <Text
                          style={{
                            fontFamily: Inter.bold,
                            fontSize: responsiveFontSize(1),
                            color: Colors.blue,
                          }}>
                          Ingredients
                        </Text>

                        {dish.activeIngredients.map((ingre, ingre_index) => {
                          return (
                            <View
                              key={'ing_' + ingre_index}
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Icon
                                name="dot-single"
                                type="Entypo"
                                size={25}
                                color={Colors.blue}
                              />
                              <Text
                                style={{
                                  fontFamily: Inter.regular,
                                  fontSize: responsiveFontSize(1),
                                  color: Colors.black,
                                }}>
                                {ingre}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : null}

                    {dish.sets.length > 0
                      ? dish.sets.map((set, set_index) => {
                          return (
                            <View key={'set_' + set_index}>
                              <Text
                                style={{
                                  fontFamily: Inter.bold,
                                  fontSize: responsiveFontSize(1),
                                  color: Colors.blue,
                                }}>
                                {set.name}
                              </Text>
                              {set.choice.length > 0
                                ? set.choice.map((choice, choice_index) => {
                                    return (
                                      <View
                                        key={'choice_' + choice_index}
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                        }}>
                                        <Icon
                                          name="dot-single"
                                          type="Entypo"
                                          size={25}
                                          color={Colors.blue}
                                        />
                                        <Text
                                          style={{
                                            fontFamily: Inter.regular,
                                            fontSize: responsiveFontSize(1),
                                            color: Colors.black,
                                          }}>
                                          {choice.name}{' '}
                                          {choice.price > 0 ? (
                                            <Text>
                                              {activeBusiness != null
                                                ? activeBusiness.currency_symbol
                                                : null}
                                              {choice.price}
                                            </Text>
                                          ) : null}
                                        </Text>
                                      </View>
                                    );
                                  })
                                : null}
                            </View>
                          );
                        })
                      : null}
                  </View>
                );
              });
            });
          })}

          {PendingMinimumFee > 0.0 ? null : (
            <>
              <View
                style={{
                  backgroundColor: Colors.blue,
                  borderRadius: 10,
                  paddingHorizontal: responsiveWidth(1),
                  paddingVertical: responsiveHeight(1),
                  marginVertical: responsiveHeight(1),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
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
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily: Inter.bold,
                      fontSize: responsiveFontSize(1),
                      color: Colors.white,
                    }}>
                    Sub Total{' '}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.bold,
                      fontSize: responsiveFontSize(1),
                      color: Colors.white,
                    }}>
                    {activeBusiness.currency_symbol}
                    {CartSubTotal}
                  </Text>
                </View>

                {/*} <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={{fontFamily: Inter.bold, fontSize: responsiveFontSize(1), color: Colors.white}}>Discount </Text>
                                            <Text style={{fontFamily: Inter.bold, fontSize: responsiveFontSize(1), color: Colors.white}}>0%</Text>
                                        </View>

                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={{fontFamily: Inter.bold, fontSize: responsiveFontSize(1), color: Colors.white}}>Total </Text>
                                            <Text style={{fontFamily: Inter.bold, fontSize: responsiveFontSize(1), color: Colors.white}}>$ 67.00 </Text>
                                        </View>*/}

                {cartFee.map((cartfee, index) => {
                  return (
                    <View key={'carefee_' + index}>
                      {cartfee.discount > 0 ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color: Colors.white,
                            }}>
                            Discount{' '}
                          </Text>
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color: Colors.white,
                            }}>
                            {activeBusiness.currency_symbol}
                            {cartfee.discount}
                          </Text>
                        </View>
                      ) : null}

                      {cartfee.taxprice > 0 ? (
                        <>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text
                              style={{
                                fontFamily: Inter.bold,
                                fontSize: responsiveFontSize(1),
                                color: Colors.white,
                              }}>
                              Tax ({cartfee.tax}%)
                            </Text>
                            <Text
                              style={{
                                fontFamily: Inter.bold,
                                fontSize: responsiveFontSize(1),
                                color: Colors.white,
                              }}>
                              {activeBusiness.currency_symbol}
                              {cartfee.taxprice}
                            </Text>
                          </View>

                          <View
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
                          </View>
                        </>
                      ) : null}
                      {cartfee.servicefeeprice > 0 ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color: Colors.white,
                            }}>
                            Service Fee ({cartfee.servicefee}%)
                          </Text>
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color: Colors.white,
                            }}>
                            {activeBusiness.currency_symbol}
                            {cartfee.servicefeeprice}
                          </Text>
                        </View>
                      ) : null}

                      {cartfee.tips > 0 ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color: Colors.white,
                            }}>
                            Tips{' '}
                          </Text>
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color: Colors.white,
                            }}>
                            {activeBusiness.currency_symbol}
                            {cartfee.tips}
                          </Text>
                        </View>
                      ) : null}

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            fontFamily: Inter.bold,
                            fontSize: responsiveFontSize(1),
                            color: Colors.white,
                          }}>
                          Total{' '}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Inter.bold,
                            fontSize: responsiveFontSize(1),
                            color: Colors.white,
                          }}>
                          {activeBusiness.currency_symbol}
                          {cartfee.total}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={{marginVertical: responsiveHeight(2)}}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
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
                            key={'pay_' + index}>
                            <RadioButton
                              selected={item.active}
                              onChange={() => {
                                SelectPayment(item);
                              }}
                              size={22}
                              style={[styles.radioButton, {}]}
                              activeColor={Colors.blue}
                              inactiveColor={Colors.blue}
                            />
                            <Text
                              style={{
                                marginLeft: responsiveWidth(1),
                                fontFamily: Inter.bold,
                                fontSize: responsiveFontSize(1),
                                color: Colors.black,
                                textTransform: 'capitalize',
                              }}>
                              {item.displayName}
                            </Text>
                          </View>
                        );
                      })
                    : null}
                </View>
              </View>
            </>
          )}

          <View style={{paddingBottom: responsiveHeight(1)}}>
            {PendingMinimumFee > 0.0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: responsiveHeight(1),
                }}>
                <Text
                  style={{
                    fontFamily: Inter.medium,
                    fontSize: responsiveFontSize(1.2),
                    color: Colors.red,
                  }}>
                  minimum price need to add {activeBusiness.currency_symbol}
                  {PendingMinimumFee}
                </Text>
              </View>
            ) : null}
            {PendingMinimumFee <= 0.0 ? (
              <TouchableOpacity
                style={styles.button}
                onPress={viewloader === false ? CheckallDetails : null}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#fff',
                    fontFamily: Inter.medium,
                  }}>
                  Pay Now
                </Text>
              </TouchableOpacity>
            ) : PendingMinimumFee > 0.0 ? (
              <TouchableOpacity style={styles.button}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#fff',
                    fontFamily: Inter.medium,
                  }}>
                  {'Minumum Order'}:{activeBusiness.currency_symbol}
                  {activeBusiness.minimumfee}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default HomeRight;

{
  /*<View style={{borderColor: Colors.grey, borderWidth: 1, borderRadius: 10, paddingHorizontal: responsiveWidth(0.5), marginVertical: responsiveHeight(1)}}>
                                <View style={{marginTop: responsiveHeight(0.5), display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <View style={{width: responsiveWidth(15)}}>
                                    <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.black}}>Single Pack –save up to $8.90</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <TouchableOpacity >
                                          <Icon name="minuscircleo" type="AntDesign" size={25} color={Colors.blue} />
                                        </TouchableOpacity>
                                          <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.black, marginHorizontal: responsiveWidth(0.5)}}>3</Text>
                                        <TouchableOpacity >
                                          <Icon name="pluscircleo" type="AntDesign" size={25} color={Colors.blue} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'center'}}>
                                      <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.green}}>$125.00</Text>
                                      <TouchableOpacity >
                                        <Icon name="edit" type="AntDesign" size={25} color={Colors.black} />
                                      </TouchableOpacity>
                                    </View>
                                </View>
                                <View  >
                                  <Text style={{fontFamily: Inter.bold, fontSize: responsiveFontSize(1), color: Colors.blue}}>How Spicy?</Text>
                                  <View  style={{display: 'flex', flexDirection:'row', alignItems: 'center'}}>
                                    <Icon name="dot-single" type="Entypo" size={25} color={Colors.blue} />
                                    <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.black}}>Med</Text>
                                  </View>
                                </View>

                                <View>
                                  <Text style={{fontFamily: Inter.bold, fontSize: responsiveFontSize(1), color: Colors.blue}}>Choose Rice Dishes</Text>
                                  <View style={{display: 'flex', flexDirection:'row', alignItems: 'center'}}>
                                    <Icon name="dot-single" type="Entypo" size={25} color={Colors.blue} />
                                    <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.black}}>Rice Dishes $3.00</Text>
                                  </View>
                                  <View style={{display: 'flex', flexDirection:'row', alignItems: 'center'}}>
                                    <Icon name="dot-single" type="Entypo" size={25} color={Colors.blue} />
                                    <Text style={{fontFamily: Inter.regular, fontSize: responsiveFontSize(1), color: Colors.black}}>Coconut Rice $4.00</Text>
                                  </View>
                                </View>


                              </View>*/
}
