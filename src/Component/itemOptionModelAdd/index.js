import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  useWindowDimensions,
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
  Animated,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Styles from './Styles';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import { Images } from '../../Constants/ImageIconContant';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
import { postWithToken, postWithOutToken } from '../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
  RadioButton,
  CheckBox,
} from 'react-native-basic-elements';
import Modal from 'react-native-modal';
import RenderHtml from 'react-native-render-html';

// create a component
const OptionModelAdd = props => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const { baseUrl, siteUrl, userToken, userData, langId, cartDetails } =
    useSelector(state => state.common);

  const [isModalVisible, setModalVisible] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [dish, setDish] = useState(null);
  const [dishTotal, setDishTotal] = useState(null);
  const [CartDish, setCartDish] = useState([]);
  const [indexcart, setindexCart] = useState({});
  const [BackupCart, setBackupCart] = useState(null);
  const [dataItem, setDataItem] = useState(null);
  const [orderType, setOrderType] = useState();
  const [dish_note, setItemNote] = useState('');
  const [edit_product, setEditProduct] = useState(false);

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [productQty, setProductQty] = useState(1);

  const scrollViewRef = useRef(null);
  const optionRefs = useRef({});
  const [error, setError] = useState('');

  const [optionErrors, setOptionErrors] = useState({});

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 170],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const imageHeight = scrollY.interpolate({
    inputRange: [0, 170],
    outputRange: [240, 0],
    extrapolate: 'clamp',
  });

  const toggleModal = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    scrollY.setValue(0);
    setExpandedDesc(false);
    setModalVisible(!isModalVisible);
    setOptionErrors({});
    setError('');
  };

  /*useEffect(() =>{
    
   
  },[props.optionItem])*/

  useFocusEffect(
    React.useCallback(() => {
      if (props.optionItem != undefined) {
        setActiveBusiness(props.activeBusiness);
        setOrderType(props.orderType);
        setDataItem(props.optionItem);
        setSelectedImage(null);

        let dish_value = JSON.parse(JSON.stringify(props.optionItem.dish));

        let image_arr = [];

        if (dish_value.is_img != null && dish_value.is_img != 0) {
          image_arr.push(dish_value.is_img);
        }

        if (dish_value.is_img1 != null && dish_value.is_img1 != 0) {
          image_arr.push(dish_value.is_img1);
        }

        if (dish_value.is_img2 != null && dish_value.is_img2 != 0) {
          image_arr.push(dish_value.is_img2);
        }

        setImages(image_arr);

        console.log('dish item');
        console.log(images);
        console.log(dish_value);

        for (let k = 0; k < dish_value.sets.length; k++) {
          for (let i = 0; i < dish_value.sets[k].options.length; i++) {
            if (dish_value.sets[k].options[i].show === true) {
              for (
                let j = 0;
                j < dish_value.sets[k].options[i].choice.length;
                j++
              ) {
                if (dish_value.sets[k].options[i].choice[j].checked === true) {
                  console.log(dish_value.sets[k].options[i].choice[j].qty);
                }
              }
            }
          }
        }

        if (image_arr.length > 0) {
          setSelectedImage(image_arr[0]);
        }

        setDish(dish_value);
        setItemNote(dish_value.notes);
        console.log(dish_value.notes);
        setDishTotal(props.optionItem.dish.price);
        let CartDish = props.optionItem.CartDish;
        if (CartDish !== undefined && CartDish !== '') {
          setCartDish(CartDish);
        }

        if (props.optionItem.type === 1) {
          setindexCart(props.optionItem.indexCart);
          let indexcart = props.optionItem.indexCart;
          setEditProduct(true);
          let qty = parseInt(
            CartDish[indexcart.index].dish[indexcart.dishindex].data[
              indexcart.dishdataindex
            ].quantity,
            10,
          );
          setProductQty(qty);
          let dishTotal = indexcart.dishTotal / qty;
          setDishTotal(dishTotal);
        }

        setModalVisible(true);
      }
    }, [props.optionItem]),
  );

  const choiceQtyDecrement = (
    setIndex,
    optionIndex,
    choiceIndex,
    choice_id,
  ) => {
    let dish_val = JSON.parse(JSON.stringify(dish));

    if (
      dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex].qty > 0
    ) {
      dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex].qty =
        dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex].qty -
        1;

      let dishTotal_val = dish_val.price;

      for (let k = 0; k < dish_val.sets.length; k++) {
        for (let i = 0; i < dish_val.sets[k].options.length; i++) {
          if (dish_val.sets[k].options[i].show === true) {
            for (
              let j = 0;
              j < dish_val.sets[k].options[i].choice.length;
              j++
            ) {
              if (dish_val.sets[k].options[i].choice[j].checked === true) {
                dishTotal_val =
                  parseFloat(dishTotal_val) +
                  parseFloat(dish_val.sets[k].options[i].choice[j].price) *
                    parseInt(dish_val.sets[k].options[i].choice[j].qty);
                dishTotal_val = parseFloat(dishTotal_val).toFixed(2);

                if (parseInt(dish_val.sets[k].options[i].choice[j].qty) == 0) {
                  dish_val.sets[k].options[i].choice[j].checked = false;
                }
              }
            }
          }
        }
      }

      setDishTotal(dishTotal_val);
      setDish(dish_val);

      console.log('dish_val descripment');
      console.log(dish_val.sets[0].options[0]);
    }
  };

  const choiceQtyIncrement = (
    setIndex,
    optionIndex,
    choiceIndex,
    choice_id,
  ) => {
    let dish_val = JSON.parse(JSON.stringify(dish));
    let trues = 0;

    for (
      let i = 0;
      i < dish_val.sets[setIndex].options[optionIndex].choice.length;
      i++
    ) {
      if (
        dish_val.sets[setIndex].options[optionIndex].choice[i].checked === true
      ) {
        trues =
          trues + dish_val.sets[setIndex].options[optionIndex].choice[i].qty;
      }
    }
    console.log(trues);
    if (trues >= dish_val.sets[setIndex].options[optionIndex].max) {
      showToastMsg(
        'Max number of selection is  ' +
          dish_val.sets[setIndex].options[optionIndex].max,
      );
      return false;
    } else {
      dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex].qty =
        dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex].qty +
        1;
    }

    let dishTotal_val = dish_val.price;

    for (let k = 0; k < dish_val.sets.length; k++) {
      for (let i = 0; i < dish_val.sets[k].options.length; i++) {
        if (dish_val.sets[k].options[i].show === true) {
          for (let j = 0; j < dish_val.sets[k].options[i].choice.length; j++) {
            if (dish_val.sets[k].options[i].choice[j].checked === true) {
              dishTotal_val =
                parseFloat(dishTotal_val) +
                parseFloat(dish_val.sets[k].options[i].choice[j].price) *
                  parseInt(dish_val.sets[k].options[i].choice[j].qty);
              dishTotal_val = parseFloat(dishTotal_val).toFixed(2);
            }
          }
        }
      }
    }

    setDishTotal(dishTotal_val);
    setDish(dish_val);

    console.log('dish_val incurment');
    console.log(dish_val.sets[0].options[0]);
  };

  const checkProductOption = (
    setIndex,
    optionIndex,
    choiceIndex,
    checked_status,
  ) => {
    let dish_val = JSON.parse(JSON.stringify(dish));

    console.log('setIndex:' + setIndex);
    console.log('optionIndex:' + optionIndex);
    console.log('choiceIndex:' + choiceIndex);
    console.log('checked_status:' + checked_status);

    //console.log(dish_val.sets[setIndex].options[optionIndex]);

    if (dish_val.sets[setIndex].options[optionIndex].type == 0) {
      console.log('hello');
      for (
        let i = 0;
        i < dish_val.sets[setIndex].options[optionIndex].choice.length;
        i++
      ) {
        if (checked_status === false && i == choiceIndex) {
          dish_val.sets[setIndex].options[optionIndex].choice[i].checked = true;
          dish_val.sets[setIndex].options[optionIndex].choice[i].qty = 1;
        } else {
          dish_val.sets[setIndex].options[optionIndex].choice[
            i
          ].checked = false;
          dish_val.sets[setIndex].options[optionIndex].choice[i].qty = 0;
        }
      }

      if (checked_status === false) {
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].checked = true;
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].qty = 1;

        setOptionErrors(prev => {
          if (!prev[dish_val.sets[setIndex].options[optionIndex].id])
            return prev;
          const copy = { ...prev };
          delete copy[dish_val.sets[setIndex].options[optionIndex].id];
          return copy;
        });
      } else {
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].checked = false;
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].qty = 0;
      }

      CheckType0(setIndex, optionIndex);
      for (
        let i = 0;
        i < dish_val.sets[setIndex].options[optionIndex].coditions.length;
        i++
      ) {
        if (
          dish_val.sets[setIndex].options[optionIndex].coditions[i].choice ===
          dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex].id
        ) {
          for (let j = 0; j < dish_val.sets[setIndex].options.length; j++) {
            if (
              dish_val.sets[setIndex].options[j].id ===
              dish_val.sets[setIndex].options[optionIndex].coditions[i]
                .rest_op_id
            ) {
              dish_val.sets[setIndex].options[j].show = true;
            }
          }
        }
      }
    }
    if (dish_val.sets[setIndex].options[optionIndex].type == 1) {
      let trues = 0;
      if (
        dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex]
          .checked === true
      ) {
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].checked = false;
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].qty = 0;
      } else {
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].checked = true;
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].qty = 1;

        setOptionErrors(prev => {
          if (!prev[dish_val.sets[setIndex].options[optionIndex].id])
            return prev;
          const copy = { ...prev };
          delete copy[dish_val.sets[setIndex].options[optionIndex].id];
          return copy;
        });
      }
      for (
        let i = 0;
        i < dish_val.sets[setIndex].options[optionIndex].choice.length;
        i++
      ) {
        if (
          dish_val.sets[setIndex].options[optionIndex].choice[i].checked ===
          true
        ) {
          trues++;
        }
      }
      /*if (trues > dish_val.sets[setIndex].options[optionIndex].max) {
        dish_val.sets[setIndex].options[optionIndex].choice[
          choiceIndex
        ].checked = false;

        showToastMsg(
          'Max number of selection is  ' +
            dish_val.sets[setIndex].options[optionIndex].max,
        );
        return false;
      }*/
      for (
        let i = 0;
        i < dish_val.sets[setIndex].options[optionIndex].coditions.length;
        i++
      ) {
        if (
          dish_val.sets[setIndex].options[optionIndex].coditions[i].choice ===
          dish.sets[setIndex].options[optionIndex].choice[choiceIndex].id
        ) {
          if (
            dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex]
              .checked === true
          ) {
            for (let j = 0; j < dish_val.sets[setIndex].options.length; j++) {
              if (
                dish_val.sets[setIndex].options[j].id ===
                dish_val.sets[setIndex].options[optionIndex].coditions[i]
                  .rest_op_id
              ) {
                dish_val.sets[setIndex].options[j].show = true;
              }
            }
          }
        }
      }
      if (
        dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex]
          .checked === false
      ) {
        let rest_op_id = 0;
        for (
          let i = 0;
          i < dish_val.sets[setIndex].options[optionIndex].coditions.length;
          i++
        ) {
          if (
            dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex]
              .id ===
            dish_val.sets[setIndex].options[optionIndex].coditions[i].choice
          ) {
            rest_op_id =
              dish_val.sets[setIndex].options[optionIndex].coditions[i]
                .rest_op_id;
          }
        }
        if (rest_op_id !== 0) {
          let count = 0;
          for (
            let i = 0;
            i < dish_val.sets[setIndex].options[optionIndex].coditions.length;
            i++
          ) {
            if (
              dish_val.sets[setIndex].options[optionIndex].coditions[i]
                .rest_op_id === rest_op_id &&
              dish_val.sets[setIndex].options[optionIndex].coditions[i]
                .choice !==
                dish_val.sets[setIndex].options[optionIndex].choice[choiceIndex]
                  .id
            ) {
              for (
                let j = 0;
                j < dish_val.sets[setIndex].options[optionIndex].choice.length;
                j++
              ) {
                if (
                  dish_val.sets[setIndex].options[optionIndex].choice[j].id ===
                    dish_val.sets[setIndex].options[optionIndex].coditions[i]
                      .choice &&
                  dish_val.sets[setIndex].options[optionIndex].choice[j]
                    .checked === true
                ) {
                  count++;
                }
              }
            }
          }
          if (count === 0) {
            CheckType1(setIndex, optionIndex, choiceIndex, rest_op_id);
          }
        }
      }
    }

    let dishTotal_val = dish_val.price;

    for (let k = 0; k < dish_val.sets.length; k++) {
      for (let i = 0; i < dish_val.sets[k].options.length; i++) {
        if (dish_val.sets[k].options[i].show === true) {
          for (let j = 0; j < dish_val.sets[k].options[i].choice.length; j++) {
            if (dish_val.sets[k].options[i].choice[j].checked === true) {
              console.log(dish_val.sets[k].options[i].choice[j]);
              dishTotal_val =
                parseFloat(dishTotal_val) +
                parseFloat(dish_val.sets[k].options[i].choice[j].price) *
                  parseInt(dish_val.sets[k].options[i].choice[j].qty);
              dishTotal_val = parseFloat(dishTotal_val).toFixed(2);
            }
          }
        }
      }
    }

    setDishTotal(dishTotal_val);
    setDish(dish_val);

    /*console.log('dish_val');
    console.log(dish_val);*/
  };

  const getTotalQtyForOption = (setIndex, optionIndex) => {
    let dish_val = JSON.parse(JSON.stringify(dish));
    let return_value = 0;

    for (
      let j = 0;
      j < dish_val.sets[setIndex].options[optionIndex].choice.length;
      j++
    ) {
      if (
        dish_val.sets[setIndex].options[optionIndex].choice[j].checked === true
      ) {
        return_value += parseInt(
          dish_val.sets[setIndex].options[optionIndex].choice[j].qty,
        );
      }
    }

    return return_value;
  };

  const TotalQtyChoice = (setIndex, optionIndex) => {
    let totalqty = 0;

    let dish_val = JSON.parse(JSON.stringify(dish));

    for (
      let j = 0;
      j < dish_val.sets[setIndex].options[optionIndex].choice.length;
      j++
    ) {
      if (
        dish_val.sets[setIndex].options[optionIndex].choice[j].checked === true
      ) {
        totalqty += parseInt(
          dish_val.sets[setIndex].options[optionIndex].choice[j].qty,
        );
      }
    }

    return totalqty;
  };

  const CheckType1 = (setIndex, optionIndex, choiceIndex, rest_op_id) => {
    let dish_val = JSON.parse(JSON.stringify(dish));
    let temp = 0;
    for (let i = 0; i < dish_val.sets[setIndex].options.length; i++) {
      if (dish_val.sets[setIndex].options[i].id === rest_op_id) {
        dish_val.sets[setIndex].options[i].show = false;
        temp = i;
        for (
          let k = 0;
          k < dish_val.sets[setIndex].options[i].choice.length;
          k++
        ) {
          dish_val.sets[setIndex].options[i].choice[k].checked = false;
        }
        setDish(dish_val);
        CheckType0(setIndex, temp);
      }
    }
  };
  const CheckType0 = (setIndex, optionIndex) => {
    let dish_val = JSON.parse(JSON.stringify(dish));
    let temp = 0;
    if (dish_val.sets[setIndex].options[optionIndex].coditions.length > 0) {
      for (
        let i = 0;
        i < dish_val.sets[setIndex].options[optionIndex].coditions.length;
        i++
      ) {
        for (let j = 0; j < dish_val.sets[setIndex].options.length; j++) {
          if (
            dish_val.sets[setIndex].options[optionIndex].coditions[i]
              .rest_op_id === dish_val.sets[setIndex].options[j].id
          ) {
            dish_val.sets[setIndex].options[j].show = false;
            temp = j;
            for (
              let k = 0;
              k < dish_val.sets[setIndex].options[j].choice.length;
              k++
            ) {
              dish_val.sets[setIndex].options[j].choice[k].checked = false;
            }
            setDish(dish_val);
            CheckType0(setIndex, temp);
          }
        }
      }
    }
  };

  const validateRequiredOptions = dish_val => {
    const errors = {};
    let firstInvalidOptionId = null;

    if (dish_val.sets !== undefined) {
      if (dish_val.sets.length > 0) {
        for (let i = 0; i < dish_val.sets.length; i++) {
          for (let j = 0; j < dish_val.sets[i].options.length; j++) {
            if (dish_val.sets[i].options[j].show === true) {
              if (
                dish_val.sets[i].options[j].required == 1 &&
                dish_val.sets[i].options[j].type == 0
              ) {
                let min = 0;
                for (
                  let k = 0;
                  k < dish_val.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dish_val.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (min == 0) {
                  errors[dish_val.sets[i].options[j].id] = true;
                  if (!firstInvalidOptionId) {
                    firstInvalidOptionId = dish_val.sets[i].options[j].id;
                  }
                }
              } else if (dish_val.sets[i].options[j].type == 1) {
                let min = 0;
                for (
                  let k = 0;
                  k < dish_val.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dish_val.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (dish_val.sets[i].options[j].required == 1 && min == 0) {
                  errors[dish_val.sets[i].options[j].id] = true;
                  if (!firstInvalidOptionId) {
                    firstInvalidOptionId = dish_val.sets[i].options[j].id;
                  }
                } else if (min < dish_val.sets[i].options[j].min) {
                  errors[dish_val.sets[i].options[j].id] = true;
                  if (!firstInvalidOptionId) {
                    firstInvalidOptionId = dish_val.sets[i].options[j].id;
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log('errors');
    console.log(errors);
    console.log(firstInvalidOptionId);

    setOptionErrors(errors);
    return firstInvalidOptionId;
  };

  const addToCart = dish_val => {
    const invalidOptionId = validateRequiredOptions(dish_val);

    if (invalidOptionId) {
      setError('');
      setTimeout(() => {
        /*optionRefs.current[invalidOptionId]?.measure(
          (fx, fy, width, height, px, py) => {
            console.log(py);
            scrollViewRef.current?.scrollTo({
              y: py - 80,
              animated: true,
            });
          },
        );*/
        optionRefs.current[invalidOptionId]?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 80,
              animated: true,
            });
          },
          error => console.log(error),
        );
      }, 300);

      return;
    }

    setOptionErrors({});

    /* if (dish_val.sets !== undefined) {
      if (dish_val.sets.length > 0) {
        for (let i = 0; i < dish_val.sets.length; i++) {
          for (let j = 0; j < dish_val.sets[i].options.length; j++) {
            if (dish_val.sets[i].options[j].show === true) {
              if (dish_val.sets[i].options[j].type === 1) {
                let min = 0;
                for (
                  let k = 0;
                  k < dish_val.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dish_val.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (
                  dish_val.sets[i].options[j].required === true &&
                  min === 0
                ) {
                  Alert.alert(
                    'Warning!',
                    dish_val.sets[i].options[j].name + ' is required',
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                } else if (min < dish_val.sets[i].options[j].min) {
                  Alert.alert(
                    'Warning!',
                    dish_val.sets[i].options[j].name +
                      ' minimum choice is ' +
                      dish_val.sets[i].options[j].min,
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                }
              } else if (
                dish_val.sets[i].options[j].required === true &&
                dish_val.sets[i].options[j].type === 0
              ) {
                let min = 0;
                for (
                  let k = 0;
                  k < dish_val.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dish_val.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (min === 0) {
                  Alert.alert(
                    'Warning!',
                    dish_val.sets[i].options[j].name + ' is required ',
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                }
              }
            }
          }
        }
      }
    }*/

    let business;
    business = {
      id: activeBusiness.id,
      details: activeBusiness,
      dish: new Array(),
    };

    let dish = {
      id: dish_val.id,
      quantity: productQty,
      data: new Array(),
    };
    let activeIngredients = new Array();
    for (const ingre of dish_val.ingredientsarray) {
      /*if (ingre.status === false) {*/
      activeIngredients.push(ingre);
      /*}*/
    }
    let data;
    data = {
      id: dish_val.id,
      name: dish_val.name,
      price: dish_val.price,
      delprice: dish_val.delprice,
      pickprice: dish_val.pickprice,
      notes: dish_note,
      totalprice: dishTotal,
      total: parseFloat(dishTotal * productQty).toFixed(2),
      is_img: dish_val.is_img,
      img: dish_val.img,
      spicy: dish_val.spicy,
      spicyquantity: dish_val.spicyquantity,
      veg: dish_val.veg,
      nonveg: dish_val.nonveg,
      ingredients: dish_val.ingredients,
      ingredientsarray: dish_val.ingredientsarray,
      activeIngredients: activeIngredients,
      activeIngredientsText: activeIngredients.join(', '),
      quantity: productQty,
      sets: new Array(),
      relation: {
        options: new Array(),
        choices: new Array(),
      },
    };

    let optionsarray;
    optionsarray = new Array();
    let choicesarray;
    choicesarray = new Array();
    if (dish_val.sets !== undefined) {
      if (dish_val.sets.length > 0) {
        for (let i = 0; i < dish_val.sets.length; i++) {
          for (let j = 0; j < dish_val.sets[i].options.length; j++) {
            let options;
            options = {
              id: dish_val.sets[i].options[j].id,
              name: dish_val.sets[i].options[j].name,
              choice: new Array(),
              choiceText: '',
            };
            let choiceTextArray;
            choiceTextArray = new Array();
            for (
              let k = 0;
              k < dish_val.sets[i].options[j].choice.length;
              k++
            ) {
              if (dish_val.sets[i].options[j].choice[k].checked === true) {
                let choice;
                choice = {
                  id: dish_val.sets[i].options[j].choice[k].id,
                  name: dish_val.sets[i].options[j].choice[k].name,
                  price: dish_val.sets[i].options[j].choice[k].price,
                  qty: dish_val.sets[i].options[j].choice[k].qty,
                };

                choiceTextArray.push(
                  dish_val.sets[i].options[j].choice[k].name,
                );
                choicesarray.push(choice.id);
                options.choice.push(choice);
              }
            }
            options.choiceText = choiceTextArray.join(', ');
            if (options.choice.length > 0) {
              optionsarray.push(options.id);
              data.sets.push(options);
            }
          }
        }
      }
    }
    if (data.sets.length > 0) {
      data.relation = {
        options: optionsarray,
        choices: choicesarray,
      };
    }

    let cart = JSON.parse(JSON.stringify(props.optionItem.CartDish));

    let parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);

    if (parent_index === -1) {
      cart.push(business);
    }
    parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);
    let index;
    index = CheckAddtoCart(data.id, parent_index, cart);
    if (index === -1) {
      dish.data.push(data);
      cart[parent_index].dish.push(dish);
    } else {
      cart[parent_index].dish[index].quantity =
        parseInt(cart[parent_index].dish[index].quantity, 10) + 1;
      if (data.sets.length === 0 && data.activeIngredients === 0) {
        let index_data;
        index_data = CheckData(cart[parent_index].dish[index].data, data);
        if (index_data === -1) {
          cart[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes = dish_note;
          cart[parent_index].dish[index].data[index_data].quantity =
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            ) + 1;
          cart[parent_index].dish[index].data[index_data].total =
            parseFloat(
              cart[parent_index].dish[index].data[index_data].totalprice,
            ) *
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            );
          cart[parent_index].dish[index].data[index_data].total = parseFloat(
            cart[parent_index].dish[index].data[index_data].total,
          ).toFixed(2);
        }
      } else if (data.sets.length === 0 && data.activeIngredients !== 0) {
        let index_data;
        index_data = CheckDataIngreExist(
          cart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          cart[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes = dish_note;
          cart[parent_index].dish[index].data[index_data].quantity =
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            ) + 1;
          cart[parent_index].dish[index].data[index_data].total =
            parseFloat(
              cart[parent_index].dish[index].data[index_data].totalprice,
            ) *
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            );
          cart[parent_index].dish[index].data[index_data].total = parseFloat(
            cart[parent_index].dish[index].data[index_data].total,
          ).toFixed(2);
        }
      } else if (data.sets.length !== 0 && data.activeIngredients === 0) {
        let index_data;
        index_data = CheckDataSetExist(
          cart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          this.CartDish[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes = dish_note;
          cart[parent_index].dish[index].data[index_data].quantity =
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            ) + 1;
          cart[parent_index].dish[index].data[index_data].total =
            parseFloat(
              cart[parent_index].dish[index].data[index_data].totalprice,
            ) *
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            );
          cart[parent_index].dish[index].data[index_data].total = parseFloat(
            cart[parent_index].dish[index].data[index_data].total,
          ).toFixed(2);
        }
      } else if (data.sets.length !== 0 && data.activeIngredients !== 0) {
        let index_data;
        index_data = CheckDataIngreSetsExist(
          cart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          cart[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes = dish_note;
          cart[parent_index].dish[index].data[index_data].quantity =
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            ) + 1;
          cart[parent_index].dish[index].data[index_data].total =
            parseFloat(
              cart[parent_index].dish[index].data[index_data].totalprice,
            ) *
            parseInt(
              cart[parent_index].dish[index].data[index_data].quantity,
              10,
            );
          cart[parent_index].dish[index].data[index_data].total = parseFloat(
            cart[parent_index].dish[index].data[index_data].total,
          ).toFixed(2);
        }
      }
    }
    let response = {
      cartDish: cart,
      status: true,
    };

    props.updateCartDetails(cart);
    props.setoptionModelAdd(false);
    setModalVisible(false);
  };

  const editTocart = dish_val => {
    const invalidOptionId = validateRequiredOptions(dish_val);

    if (invalidOptionId) {
      setError('');

      setTimeout(() => {
        optionRefs.current[invalidOptionId]?.measure(
          (fx, fy, width, height, px, py) => {
            scrollViewRef.current?.scrollTo({
              y: py - 80,
              animated: true,
            });
          },
        );
      }, 300);

      return;
    }

    setOptionErrors({});

    /*if (dish_val.sets !== undefined) {
      if (dish_val.sets.length > 0) {
        for (let i = 0; i < dish_val.sets.length; i++) {
          for (let j = 0; j < dish_val.sets[i].options.length; j++) {
            if (dish_val.sets[i].options[j].show === true) {
              if (dish_val.sets[i].options[j].type === 1) {
                let min = 0;
                for (
                  let k = 0;
                  k < dish_val.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dish_val.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (
                  dish_val.sets[i].options[j].required === true &&
                  min === 0
                ) {
                  Alert.alert(
                    'Warning!',
                    dish_val.sets[i].options[j].name + ' is required',
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                } else if (min < dish_val.sets[i].options[j].min) {
                  Alert.alert(
                    'Warning!',
                    dish_val.sets[i].options[j].name +
                      ' minimum choice is ' +
                      dish_val.sets[i].options[j].min,
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                }
              } else if (
                dish_val.sets[i].options[j].required === true &&
                dish_val.sets[i].options[j].type === 0
              ) {
                let min = 0;
                for (
                  let k = 0;
                  k < dish_val.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dish_val.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (min === 0) {
                  Alert.alert(
                    'Warning!',
                    dish_val.sets[i].options[j].name + ' is required ',
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                }
              }
            }
          }
        }
      }
    }*/

    let cart = JSON.parse(JSON.stringify(props.optionItem.CartDish));

    let BackupCart =
      cart[indexcart.index].dish[indexcart.dishindex].data[
        indexcart.dishdataindex
      ];
    /*cart[indexcart.index].dish[indexcart.dishindex].quantity =
      cart[indexcart.index].dish[indexcart.dishindex].quantity -
      cart[indexcart.index].dish[indexcart.dishindex].data[
        indexcart.dishdataindex
      ].quantity;
    cart[indexcart.index].dish[indexcart.dishindex].data.splice(
      indexcart.dishdataindex,
      1,
    );
    let dishTotal_val =
      parseFloat(dishTotal) * parseInt(BackupCart.quantity, 10);*/

    cart[indexcart.index].dish[indexcart.dishindex].quantity = productQty;
    cart[indexcart.index].dish[indexcart.dishindex].data.splice(
      indexcart.dishdataindex,
      1,
    );
    cart[indexcart.index].dish[indexcart.dishindex].data.splice(
      indexcart.dishdataindex,
      1,
    );
    let dishTotal_val = parseFloat(dishTotal) * parseInt(productQty, 10);

    setDishTotal(dishTotal_val);
    dishTotal_val = Number(dishTotal_val);
    let activeIngredients;
    activeIngredients = new Array();
    for (const ingre of dish_val.ingredientsarray) {
      /*if (ingre.status === false) {*/
      activeIngredients.push(ingre.name);
      /*}*/
    }
    let data;
    data = {
      id: dish_val.id,
      name: dish_val.name,
      //'description': this.dish.description,
      price: dish_val.price,
      delprice: dish_val.delprice,
      pickprice: dish_val.pickprice,
      notes: dish_note,
      totalprice: dishTotal,
      total: dishTotal_val,
      is_img: dish_val.is_img,
      img: dish_val.img,
      spicy: dish_val.spicy,
      spicyquantity: dish_val.spicyquantity,
      veg: dish_val.veg,
      nonveg: dish_val.nonveg,
      ingredients: dish_val.ingredients,
      ingredientsarray: dish_val.ingredientsarray,
      activeIngredients: activeIngredients,
      activeIngredientsText: activeIngredients.join(', '),
      //quantity: BackupCart.quantity,
      quantity: productQty,
      sets: new Array(),
      relation: {
        options: new Array(),
        choices: new Array(),
      },
    };
    let optionsarray;
    optionsarray = new Array();
    let choicesarray;
    choicesarray = new Array();
    if (dish_val.sets !== undefined) {
      for (let i = 0; i < dish_val.sets.length; i++) {
        for (let j = 0; j < dish_val.sets[i].options.length; j++) {
          let options;
          options = {
            id: dish_val.sets[i].options[j].id,
            name: dish_val.sets[i].options[j].name,
            choice: new Array(),
            choiceText: '',
          };
          let choiceTextArray;
          choiceTextArray = new Array();
          for (let k = 0; k < dish_val.sets[i].options[j].choice.length; k++) {
            if (dish_val.sets[i].options[j].choice[k].checked === true) {
              let choice;
              choice = {
                id: dish_val.sets[i].options[j].choice[k].id,
                name: dish_val.sets[i].options[j].choice[k].name,
                price: dish_val.sets[i].options[j].choice[k].price,
                qty: dish_val.sets[i].options[j].choice[k].qty,
              };
              choiceTextArray.push(dish_val.sets[i].options[j].choice[k].name);
              choicesarray.push(choice.id);
              options.choice.push(choice);
            }
          }
          options.choiceText = choiceTextArray.join(', ');
          if (options.choice.length > 0) {
            optionsarray.push(options.id);
            data.sets.push(options);
          }
        }
      }
    }
    if (data.sets.length > 0) {
      data.relation = {
        options: optionsarray,
        choices: choicesarray,
      };
    }
    let parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);
    let index = CheckAddtoCart(data.id, parent_index, cart);
    if (data.sets.length === 0 && data.activeIngredients === 0) {
      let index_data = CheckData(cart[parent_index].dish[index].data, data);
      if (index_data === -1) {
        cart[parent_index].dish[index].data.push(data);
        cart[parent_index].dish[index].quantity = data.quantity;
      } else {
        cart[parent_index].dish[index].data[index_data].notes = dish_note;
        cart[parent_index].dish[index].data[index_data].quantity =
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          ) + 1;
        cart[parent_index].dish[index].data[index_data].total =
          parseFloat(
            cart[parent_index].dish[index].data[index_data].totalprice,
          ) *
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          );
        cart[parent_index].dish[index].data[index_data].total = parseFloat(
          cart[parent_index].dish[index].data[index_data].total,
        ).toFixed(2);
      }
    } else if (data.sets.length === 0 && data.activeIngredients !== 0) {
      let index_data = CheckDataIngreExist(
        cart[parent_index].dish[index].data,
        data,
      );
      if (index_data === -1) {
        cart[parent_index].dish[index].data.push(data);
        cart[parent_index].dish[index].quantity = data.quantity;
      } else {
        cart[parent_index].dish[index].data[index_data].notes = dish_val.notes;
        cart[parent_index].dish[index].data[index_data].quantity =
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          ) + 1;
        cart[parent_index].dish[index].data[index_data].total =
          parseFloat(
            cart[parent_index].dish[index].data[index_data].totalprice,
          ) *
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          );
        cart[parent_index].dish[index].data[index_data].total = parseFloat(
          cart[parent_index].dish[index].data[index_data].total,
        ).toFixed(2);
      }
    } else if (data.sets.length !== 0 && data.activeIngredients === 0) {
      let index_data = CheckDataSetExist(
        cart[parent_index].dish[index].data,
        data,
      );
      if (index_data === -1) {
        cart[parent_index].dish[index].data.push(data);
        cart[parent_index].dish[index].quantity = data.quantity;
      } else {
        cart[parent_index].dish[index].data[index_data].notes = dish_note;
        cart[parent_index].dish[index].data[index_data].quantity =
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          ) + 1;
        cart[parent_index].dish[index].data[index_data].total =
          parseFloat(
            cart[parent_index].dish[index].data[index_data].totalprice,
          ) *
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          );
        cart[parent_index].dish[index].data[index_data].total = parseFloat(
          cart[parent_index].dish[index].data[index_data].total,
        ).toFixed(2);
      }
    } else if (data.sets.length !== 0 && data.activeIngredients !== 0) {
      let index_data = CheckDataIngreSetsExist(
        cart[parent_index].dish[index].data,
        data,
      );
      if (index_data === -1) {
        cart[parent_index].dish[index].data.push(data);
        cart[parent_index].dish[index].quantity = data.quantity;
      } else {
        cart[parent_index].dish[index].data[index_data].notes = dish_note;
        cart[parent_index].dish[index].data[index_data].quantity =
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          ) + 1;
        cart[parent_index].dish[index].data[index_data].total =
          parseFloat(
            cart[parent_index].dish[index].data[index_data].totalprice,
          ) *
          parseInt(
            cart[parent_index].dish[index].data[index_data].quantity,
            10,
          );
        cart[parent_index].dish[index].data[index_data].total = parseFloat(
          cart[parent_index].dish[index].data[index_data].total,
        ).toFixed(2);
      }
    }
    indexcart.EDITPRODUCTCART = 0;
    let response = {
      cartDish: cart,
      status: true,
    };

    props.updateCartDetails(cart);
    props.setoptionModelAdd(false);
    setModalVisible(false);
  };

  const CheckBusinessAddtoCart = (d, cDish) => {
    let b;
    b = cDish;
    if (b === undefined) {
      return -1;
    }
    for (let c = 0; c < b.length; c++) {
      if (b[c].id === d) {
        return c;
      }
    }
    return -1;
  };
  const CheckAddtoCart = (d, index, cDish) => {
    let b;
    if (cDish[index]) {
      b = cDish[index].dish;
      for (let c = 0; c < b.length; c++) {
        if (b[c].id === d) {
          return c;
        }
      }
    } else {
      return -1;
    }
    return -1;
  };
  const CheckData = (cartdata, data) => {
    if (data.sets.length === 0) {
      for (let i = 0; i < cartdata.length; i++) {
        if (cartdata[i].sets.length === 0) {
          return i;
        }
      }
      return -1;
    }
  };
  const CheckDataSetExist = (cartdata, data) => {
    for (let i = 0; i < cartdata.length; i++) {
      if (cartdata[i].relation) {
        let arrayDiffoptions;
        arrayDiffoptions = arrayDiff(
          cartdata[i].relation.options,
          data.relation.options,
        );
        let arrayDiffchoice;
        arrayDiffchoice = arrayDiff(
          cartdata[i].relation.choices,
          data.relation.choices,
        );
        if (
          arrayDiffoptions.arr1.length === 0 &&
          arrayDiffoptions.arr2.length === 0 &&
          arrayDiffchoice.arr1.length === 0 &&
          arrayDiffchoice.arr2.length === 0
        ) {
          return i;
        }
      }
    }
    return -1;
  };
  const CheckDataIngreExist = (cartdata, data) => {
    for (let i = 0; i < cartdata.length; i++) {
      let arrayDiffIngre;
      arrayDiffIngre = arrayDiff(
        cartdata[i].activeIngredients,
        data.activeIngredients,
      );
      if (
        arrayDiffIngre.arr1.length === 0 &&
        arrayDiffIngre.arr2.length === 0
      ) {
        return i;
      }
    }
    return -1;
  };
  const CheckDataIngreSetsExist = (cartdata, data) => {
    for (let i = 0; i < cartdata.length; i++) {
      if (cartdata[i].relation) {
        let arrayDiffoptions;
        arrayDiffoptions = arrayDiff(
          cartdata[i].relation.options,
          data.relation.options,
        );
        let arrayDiffchoice;
        arrayDiffchoice = arrayDiff(
          cartdata[i].relation.choices,
          data.relation.choices,
        );

        let arrayDiffIngre;
        arrayDiffIngre = arrayDiff(
          cartdata[i].activeIngredients,
          data.activeIngredients,
        );

        if (
          arrayDiffIngre.arr1.length === 0 &&
          arrayDiffIngre.arr2.length === 0 &&
          arrayDiffoptions.arr1.length === 0 &&
          arrayDiffoptions.arr2.length === 0 &&
          arrayDiffchoice.arr1.length === 0 &&
          arrayDiffchoice.arr2.length === 0
        ) {
          return i;
        }
      } else {
        let arrayDiffIngre;
        arrayDiffIngre = arrayDiff(
          cartdata[i].activeIngredients,
          data.activeIngredients,
        );
        if (
          arrayDiffIngre.arr1.length === 0 &&
          arrayDiffIngre.arr2.length === 0
        ) {
          return i;
        }
      }
    }
    return -1;
  };
  const arrayDiff = (arr1, arr2) => {
    let diff;
    diff = {
      arr1: '',
      arr2: '',
      concat: '',
    };

    diff.arr1 = arr1.filter(function (value) {
      if (arr2.indexOf(value) === -1) {
        return value;
      }
    });

    diff.arr2 = arr2.filter(function (value) {
      if (arr1.indexOf(value) === -1) {
        return value;
      }
    });

    diff.concat = diff.arr1.concat(diff.arr2);

    return diff;
  };

  return (
    <>
      {dataItem != null && dish != null ? (
        <Modal
          isVisible={isModalVisible}
          transparent
          animationType="slide"
          style={{ width: '60%', margin: 'auto' }}
        >
          <View style={styles.overlay}>
            <View style={styles.container}>
              {/* ---------------- HEADER ---------------- */}

              <Animated.View
                style={[styles.stickyHeader, { opacity: headerOpacity }]}
              >
                <Text style={styles.stickyTitle}>{dish.name}</Text>
              </Animated.View>

              {/* ---------------- OPTIONS ---------------- */}
              <TouchableOpacity
                style={styles.imageClose}
                onPress={toggleModal}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Feather name="x" size={18} color="#000" />
              </TouchableOpacity>
              <Animated.ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
              >
                {selectedImage != null && (
                  <Animated.View
                    style={{
                      height: imageHeight,
                      opacity: imageOpacity,
                      overflow: 'hidden',
                    }}
                  >
                    <View style={styles.imageBox}>
                      <Image
                        source={{ uri: selectedImage }}
                        style={{ height: 220, width: '100%', borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    </View>
                  </Animated.View>
                )}

                {images.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8, paddingHorizontal: 16 }}
                  >
                    {images.map((img, index) => {
                      const isActive = img === selectedImage;

                      return (
                        <TouchableOpacity
                          key={'image_' + index}
                          onPress={() => setSelectedImage(img)}
                          style={{
                            marginRight: 8,
                            borderRadius: 8,
                            borderWidth: isActive ? 2 : 0,
                            borderColor: Colors.primaryFontColor,
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            source={{ uri: img }}
                            style={{ width: 60, height: 60 }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                <View
                  style={{
                    marginTop: 10,
                    paddingHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.title}>{dish.name}</Text>

                  {dish?.description && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 12, lineHeight: 16 }}>
                        {expandedDesc
                          ? dish?.description
                          : dish?.description.length > 200
                          ? dish?.description.slice(0, 200) + '...'
                          : dish?.description}
                      </Text>

                      {dish?.description.length > 200 && (
                        <TouchableOpacity
                          onPress={() => setExpandedDesc(prev => !prev)}
                        >
                          <Text
                            style={{
                              marginTop: 4,
                              color: Colors.primaryFontColor,
                              fontSize: 12,
                            }}
                          >
                            {expandedDesc ? 'Read less' : 'Read more'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {dish.sets.map((sets, setindex) => {
                  return sets.options.map((option, optionindex) => {
                    const isOptionFulfilled = (() => {
                      const totalQty = getTotalQtyForOption(
                        setindex,
                        optionindex,
                      );
                      return totalQty >= Number(option.min || 1);
                    })();

                    return Number(option.status) === 1 ? (
                      <View
                        ref={ref => (optionRefs.current[option.id] = ref)}
                        style={[
                          styles.optionBlock,
                          optionErrors[option.id] && styles.optionErrorBorder,
                        ]}
                        key={option.id}
                      >
                        <View style={styles.divider} />
                        {/* OPTION HEADER */}
                        <View style={styles.optionHeader}>
                          <View style={styles.optionTitlebox}>
                            <View>
                              <Text style={styles.optionTitle}>
                                {option.name}
                              </Text>
                              {option?.min === 0 ? null : option?.min ===
                                option?.max ? (
                                <Text style={{ fontWeight: 500, fontSize: 10 }}>
                                  {option?.min} Selection
                                </Text>
                              ) : (
                                <Text style={{ fontWeight: 500, fontSize: 10 }}>
                                  {option?.min} Min & {option?.max} Max
                                  Selection
                                </Text>
                              )}
                            </View>

                            {Number(option?.required) === 1 && (
                              <View
                                style={{
                                  gap: 4,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              >
                                <Feather
                                  name={
                                    isOptionFulfilled
                                      ? 'check-circle'
                                      : 'alert-circle'
                                  }
                                  size={14}
                                  color={isOptionFulfilled ? 'green' : '#000'}
                                />
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: isOptionFulfilled ? 'green' : '#000',
                                    fontFamily: Inter.regular,
                                  }}
                                >
                                  Required
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* OPTION Choices BODY */}
                        {option.choice.map((choice, choiceindex) => {
                          /* ---------- RADIO ---------- */
                          if (choice.type == 0) {
                            return (
                              <TouchableOpacity
                                key={'choice_' + choice.id}
                                style={[styles.row, { marginTop: 5 }]}
                                onPress={() => {
                                  checkProductOption(
                                    setindex,
                                    optionindex,
                                    choiceindex,
                                    choice.checked,
                                  );
                                }}
                              >
                                <Text style={styles.choiceText}>
                                  {choice.name} (+{' '}
                                  {activeBusiness.currency_symbol}
                                  {''}
                                  {choice.price})
                                </Text>
                                <View
                                  style={[
                                    styles.radio,
                                    choice.checked === true && {
                                      backgroundColor: Colors.buttonColor,
                                    },
                                  ]}
                                />
                              </TouchableOpacity>
                            );
                          }

                          /* ---------- CHECKBOX + COUNTER ---------- */
                          if (choice.type == 1) {
                            let qty_check = TotalQtyChoice(
                              setindex,
                              optionindex,
                            );
                            const maxReached = qty_check >= Number(option.max);
                            const disableNewSelect = maxReached;

                            return (
                              <View
                                key={'coice_check_' + choice.id}
                                style={[styles.rowBetween, { marginTop: 6 }]}
                              >
                                <TouchableOpacity
                                  style={[
                                    styles.row,
                                    disableNewSelect && { opacity: 0.4 },
                                  ]}
                                  disabled={disableNewSelect}
                                  onPress={() => {
                                    checkProductOption(
                                      setindex,
                                      optionindex,
                                      choiceindex,
                                      choice.checked,
                                    );
                                  }}
                                >
                                  <Text style={styles.choiceText}>
                                    {choice.name} (+
                                    {activeBusiness.currency_symbol}
                                    {''}
                                    {choice.price}){' '}
                                  </Text>
                                </TouchableOpacity>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    justifyContent: 'center',
                                  }}
                                >
                                  <TouchableOpacity
                                    style={[
                                      styles.row,
                                      disableNewSelect && { opacity: 0.4 },
                                    ]}
                                    disabled={disableNewSelect}
                                    onPress={() => {
                                      checkProductOption(
                                        setindex,
                                        optionindex,
                                        choiceindex,
                                        choice.checked,
                                      );
                                    }}
                                  >
                                    <View
                                      style={[
                                        styles.checkbox,
                                        choice.checked === true && {
                                          backgroundColor: Colors.buttonColor,
                                        },
                                      ]}
                                    >
                                      {choice.checked === true && (
                                        <Feather
                                          name="check"
                                          color="#fff"
                                          size={14}
                                        />
                                      )}
                                    </View>
                                  </TouchableOpacity>
                                  {choice.checked === true && (
                                    <View style={styles.qtyBox}>
                                      {/* MINUS */}
                                      <TouchableOpacity
                                        onPress={() => {
                                          choiceQtyDecrement(
                                            setindex,
                                            optionindex,
                                            choiceindex,
                                            choice.id,
                                          );
                                        }}
                                        style={{
                                          backgroundColor: Colors.buttonColor,
                                          paddingHorizontal: 3,
                                          borderRadius: 6,
                                        }}
                                      >
                                        <Text style={styles.qtyBtn}>−</Text>
                                      </TouchableOpacity>

                                      <Text style={styles.qtyText}>
                                        {choice.qty}
                                      </Text>

                                      {/* PLUS */}
                                      <TouchableOpacity
                                        disabled={maxReached}
                                        onPress={() => {
                                          choiceQtyIncrement(
                                            setindex,
                                            optionindex,
                                            choiceindex,
                                            choice.id,
                                          );
                                        }}
                                        style={{
                                          backgroundColor: Colors.buttonColor,
                                          paddingHorizontal: 3,
                                          borderRadius: 6,
                                          opacity: maxReached ? 0.4 : 1,
                                        }}
                                      >
                                        <Text style={styles.qtyBtn}>+</Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </View>
                              </View>
                            );
                          }

                          return null;
                        })}
                      </View>
                    ) : null;
                  });
                })}
              </Animated.ScrollView>

              <TextInput
                placeholder="Add Comment"
                multiline
                textAlignVertical="top"
                onChangeText={text => setComment(text)}
                placeholderTextColor={'#000'}
                style={{
                  height: 90,
                  borderColor: '#ddd',
                  borderWidth: 1,
                  borderRadius: 5,
                  marginVertical: 7,
                  padding: 10,
                  marginHorizontal: 16,
                  fontFamily: Inter.regular,
                  color: '#000',
                }}
              />

              {/* ---------------- FOOTER ---------------- */}
              <View style={styles.footer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    // backgroundColor: colors?.primary,
                    paddingVertical: 6,
                    backgroundColor: '#8e8e8e',
                    borderRadius: 6,
                    width: '30%',
                    justifyContent: 'space-between',
                    paddingHorizontal: 7,
                  }}
                >
                  <TouchableOpacity
                    disabled={productQty === 1}
                    onPress={() => setProductQty(q => Math.max(1, q - 1))}
                    style={[
                      styles.qtyControlBtn,
                      productQty === 1 && { opacity: 0.4 },
                    ]}
                  >
                    <Text style={styles.qtyBtn}>−</Text>
                  </TouchableOpacity>

                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}
                  >
                    {productQty}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setProductQty(q => q + 1)}
                    style={styles.qtyControlBtn}
                  >
                    <Text style={styles.qtyBtn}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    edit_product === false ? addToCart(dish) : editTocart(dish);
                  }}
                >
                  <Text style={styles.addText}>
                    {dataItem.type == 1 ? 'Update' : 'Add'}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {dish?.offerprice && (
                      <Text
                        style={{
                          textDecorationLine: 'line-through',
                          fontFamily: Inter.regular,
                          fontSize: 12,
                          color: '#fff',
                        }}
                      >
                        ${dish?.delprice}
                      </Text>
                    )}

                    <Text
                      style={{
                        fontFamily: Inter.regular,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    >
                      {activeBusiness.currency_symbol}
                      {''}
                      {dishTotal}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
};

export default OptionModelAdd;
