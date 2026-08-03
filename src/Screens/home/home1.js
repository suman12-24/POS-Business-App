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
  FlatList,
} from 'react-native';
import Styles from './style';
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
  setNewOrderNotification,
  setNewOrderData,
  setNewOrder,
  saveOrderId,
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
import { HomeRight, OptionModelAdd } from '../../Component';
//import EbPrinter from 'react-native-ebprinter';
import messaging from '@react-native-firebase/messaging';
import SoundPlayer from 'react-native-sound-player';
import ProductCardSkeleton from '../../Component/ProductCardSkeleton';

// create a component
const Home = ({ props, route, navigation }) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, userToken, userData, langId, cartDetails } =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [selected_category, setSelectedCategory] = useState(null);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [preorderDetails, setPreorderDetails] = useState({
    preorder: false,
    preorderDate: '',
    preorderTime: '',
    preorderMenu: 0,
  });

  const [categoryDetails, setCategoryDetails] = useState({
    isLoading: true,
    list: [],
  });
  const [categoryDetails_temp, setcategoryDetailsTemp] = useState([]);
  const [category_menu, setCategoryMenu] = useState({
    isLoading: true,
    list: null,
  });

  const [category_menu_temp, setCategoryMenuTemp] = useState([]);
  const [category_menu_temp_subcat, setCategoryMenuTempSubCat] = useState([]);

  const [category_menu_search, setCategoryMenuSearch] = useState({
    isLoading: true,
    list: [],
  });

  const [cartQuantity, setcartQuantity] = useState(0);
  const [orderType, setOrderType] = useState(1);
  const [CartDish, setCartDish] = useState({ isLoading: true, list: [] });

  const [optionModelAdd, setoptionModelAdd] = useState(false);
  const [isOrderModel, setNewOrderModel] = useState(false);
  const [notification_data, setNotificationData] = useState(null);
  const [order_data, setOrderData] = useState(null);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      /* Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
      );*/
      dispatch(setNewOrder(1));
      dispatch(setNewOrderNotification(remoteMessage.notification));
      dispatch(setNewOrderData(remoteMessage.data));
      OpenNewOrderModel(remoteMessage.notification, remoteMessage.data);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Handle notifications when the app is opened from the background
    messaging().onNotificationOpenedApp(remoteMessage => {
      //console.log('[FCMService] OnNotificationOpenedApp', remoteMessage);

      //Alert.alert('OnNotificationOpenedApp', JSON.stringify(remoteMessage));
      if (remoteMessage) {
        navigation.navigate('MyOrder_Tab', {
          screen: 'MyOrder',
          params: {
            id: remoteMessage.data.order_id,
          },
        });
      }
    });

    // Handle notifications when the app is launched from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        //console.log('[FCMService] getInitialNotification', remoteMessage);
        //Alert.alert('getInitialNotification', JSON.stringify(remoteMessage));
        if (remoteMessage) {
          navigation.navigate('MyOrder_Tab', {
            screen: 'MyOrder',
            params: {
              id: remoteMessage.data.order_id,
            },
          });

          //dispatch(saveOrderId(remoteMessage.data.order_id));
        }
      });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
      };

      const ExitAlert = () => {
        /*Alert.alert('Jatayu Supplier', 'do you want to close app?', [
              {
                text: 'No',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => {
                  backAction();
                },
              },
            ]);*/
        backAction();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        ExitAlert,
      );

      return () => backHandler.remove();
    }, []),
  );

  const SoundPlay = () => {
    console.log('call sound');
    try {
      // or play file from folder
      SoundPlayer.playAsset(require('../../assets/sound/newbook.wav'));
    } catch (e) {
      console.log(`cannot play the sound file`, e);
    }
  };

  const OpenNewOrderModel = (notification, data) => {
    console.log('data notification');
    console.log(notification);

    SoundPlay();

    console.log(data);
    setNotificationData(notification);
    setOrderData(data);

    setTimeout(() => {
      console.log('model open');
      setNewOrderModel(true);
    }, 1000);
  };

  useFocusEffect(
    React.useCallback(() => {
      setCartDish({ isLoading: true, list: cartDetails });
      setcartQuantity(cartQuantity);
    }, [cartDetails, cartQuantity]),
  );

  useEffect(() => {
    if (userData != null) {
      ActiveBusiness();
    }
  }, [userData]);

  /*const ActiveBusiness = () => {
    postWithOutToken(baseUrl, 'module/business/rest-business-pos', {
      f: 'react_getbusinessid',
      langId: langId,
      uid: userData.id,
    })
      .then(response => {
        //console.log(response);
        setActiveBusiness(response);
        dineIn(response);
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };*/

  const ActiveBusiness = () => {
    postWithToken(
      baseUrl,
      'get-business-info',
      { lang_id: langId, type: 1 },
      userToken,
    )
      .then(response => {
        //console.log(response.business);
        // console.log(response.category[0]);
        //setActiveBusiness(response);
        //dineIn(response);

        if (response.status === true) {
          setActiveBusiness(response.business);
          if (Object.keys(response.menu).length === 0) {
            Alert.alert('Sorry!', 'Not Have Active Menu Now', [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ]);
            setCategoryDetails({ isLoading: false, list: [] });
            setCategoryMenu({ isLoading: false, list: null });
            setcategoryDetailsTemp([]);
            setCategoryMenuTemp([]);
            return false;
          } else {
            //console.log(response.category[0]);
            setCategoryDetails({ isLoading: false, list: response.category });
            setcategoryDetailsTemp(response.category);

            let menu_temp = null;

            response.category.map((item, index) => {
              if (menu_temp == null) {
                menu_temp = item.dish;
              } else {
                menu_temp = [...menu_temp, ...item.dish];
              }

              if (item.subCat.length > 0) {
                //menu_temp.concat(item.subCat.dish);

                item.subCat.map((sutitem, subindex) => {
                  if (menu_temp == null) {
                    menu_temp = sutitem.dish;
                  } else {
                    menu_temp = [...menu_temp, ...sutitem.dish];
                  }
                });
              }
              //console.log(item);
            });

            //console.log('Menu Temp');
            //console.log(menu_temp);

            setCategoryMenuTemp(menu_temp);
          }
        }
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const dineIn = res => {
    postWithOutToken(baseUrl, 'module/product/rest-product-pos', {
      f: 'getproductbybusiness',
      Id: res.id,
      langId: langId,
      type: orderType,
      preorder: preorderDetails,
    })
      .then(response => {
        if (Object.keys(response.menu).length === 0) {
          Alert.alert('Sorry!', 'Not Have Active Menu Now', [
            {
              text: 'Ok',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
          ]);
          setCategoryDetails({ isLoading: false, list: [] });
          setCategoryMenu({ isLoading: false, list: null });
          setcategoryDetailsTemp([]);
          setCategoryMenuTemp([]);
          return false;
        } else {
          //console.log(response.category[0]);
          setCategoryDetails({ isLoading: false, list: response.category });
          setcategoryDetailsTemp(response.category);

          let menu_temp = null;

          response.category.map((item, index) => {
            if (menu_temp == null) {
              menu_temp = item.dish;
            } else {
              menu_temp = [...menu_temp, ...item.dish];
            }

            if (item.subCat.length > 0) {
              //menu_temp.concat(item.subCat.dish);

              if (menu_temp == null) {
                menu_temp = item.dish;
              } else {
                menu_temp = [...menu_temp, ...item.subCat.dish];
              }
            }
          });

          setCategoryMenuTemp(menu_temp);
        }
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const openProduct = (cat_id, cat, cat_index) => {
    console.log('on click category');
    console.log(cat_id);
    console.log(cat);

    setSelectedCategory(cat_id);
    setCategoryMenu({ isLoading: false, list: cat });
  };

  const productDetails = item => {
    /*if (item.sets.length > 0 || item.ingredientsarray.length > 0) {*/
    /*for (const ingre of item.ingredientsarray) {
        ingre.status = true;
      }*/
    if (item.sets.length > 0) {
      productDetailsItem(item);
    } else {
      let cartDish = cartDetails;
      if (cartDish !== undefined && cartDish.length > 0) {
        setCartDish({ isLoading: true, list: cartDish });
      }
      addToCart(item);
    }
  };

  const productDetailsEdit = (item, indexcart) => {
    let itemDish;
    itemDish = JSON.stringify(item);

    let dataItem;
    dataItem = {
      dish: JSON.parse(itemDish),
      CartDish: cartDetails,
      indexCart: indexcart,
      type: 1,
    };

    setOptionItem(dataItem);
    setoptionModelAdd(true);
  };

  const [optionItem, setOptionItem] = useState(null);

  const productDetailsItem = async item => {
    let itemDish;
    itemDish = JSON.stringify(item);
    if (item.sets !== undefined) {
      if (item.sets.length > 0) {
        for (let i = 0; i < item.sets.length; i++) {
          for (let j = 0; j < item.sets[i].options.length; j++) {
            for (let k = 0; k < item.sets[i].options[j].choice.length; k++) {
              item.sets[i].options[j].choice[k].qty = 1;
              item.sets[i].options[j].choice[k].checked = false;
            }
          }
        }
      }
    }

    itemDish = JSON.stringify(item);

    let dataItem;
    dataItem = {
      dish: JSON.parse(itemDish),
      CartDish: cartDetails,
      type: 0,
    };

    setOptionItem(dataItem);
    setoptionModelAdd(true);
  };
  const addToCart = dishItem => {
    if (dishItem.sets !== undefined) {
      if (dishItem.sets.length > 0) {
        for (let i = 0; i < dishItem.sets.length; i++) {
          for (let j = 0; j < dishItem.sets[i].options.length; j++) {
            if (dishItem.sets[i].options[j].show === true) {
              if (dishItem.sets[i].options[j].type === 1) {
                let min = 0;

                for (
                  let k = 0;
                  k < dishItem.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dishItem.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (
                  dishItem.sets[i].options[j].required === true &&
                  min === 0
                ) {
                  Alert.alert(
                    'Warning!',
                    dishItem.sets[i].options[j].name + ' is required',
                    [
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                    ],
                  );

                  return false;
                } else if (min < dishItem.sets[i].options[j].min) {
                  Alert.alert(
                    'Warning!',
                    dishItem.sets[i].options[j].name +
                      ' minimum choice is ' +
                      dishItem.sets[i].options[j].min,
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
                dishItem.sets[i].options[j].required === true &&
                dishItem.sets[i].options[j].type === 0
              ) {
                let min = 0;
                for (
                  let k = 0;
                  k < dishItem.sets[i].options[j].choice.length;
                  k++
                ) {
                  if (dishItem.sets[i].options[j].choice[k].checked === true) {
                    min++;
                  }
                }
                if (min === 0) {
                  Alert.alert(
                    'Warning!',
                    dishItem.sets[i].options[j].name + ' is required ',
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
    }
    let dishTotal;
    dishTotal = dishItem.price;
    let business;
    business = {
      id: activeBusiness.id,
      details: activeBusiness,
      dish: new Array(),
    };

    let dish;
    dish = {
      id: dishItem.id,
      quantity: 1,
      data: new Array(),
    };
    let activeIngredients;
    activeIngredients = new Array();
    for (const ingre of dishItem.ingredientsarray) {
      /*if (ingre.status === false) {*/
      activeIngredients.push(ingre);
      /*}*/
    }

    let data;
    data = {
      id: dishItem.id,
      name: dishItem.name,
      price: dishItem.price,
      delprice: dishItem.delprice,
      pickprice: dishItem.pickprice,
      notes: dishItem.notes,
      totalprice: dishTotal,
      total: dishTotal,
      is_img: dishItem.is_img,
      img: dishItem.img,
      spicy: dishItem.spicy,
      spicyquantity: dishItem.spicyquantity,
      veg: dishItem.veg,
      nonveg: dishItem.nonveg,
      ingredients: dishItem.ingredients,
      ingredientsarray: dishItem.ingredientsarray,
      activeIngredients: activeIngredients,
      activeIngredientsText: activeIngredients.join(', '),
      quantity: 1,
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
    if (dishItem.sets !== undefined) {
      if (dishItem.sets.length > 0) {
        for (let i = 0; i < dishItem.sets.length; i++) {
          for (let j = 0; j < dishItem.sets[i].options.length; j++) {
            let options;
            options = {
              id: dishItem.sets[i].options[j].id,
              name: dishItem.sets[i].options[j].name,
              choice: new Array(),
            };

            for (
              let k = 0;
              k < dishItem.sets[i].options[j].choice.length;
              k++
            ) {
              if (dishItem.sets[i].options[j].choice[k].checked === true) {
                let choice;
                choice = {
                  id: dishItem.sets[i].options[j].choice[k].id,
                  name: dishItem.sets[i].options[j].choice[k].name,
                  price: dishItem.sets[i].options[j].choice[k].price,
                };
                choicesarray.push(choice.id);
                options.choice.push(choice);
              }
            }
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

    let cart = JSON.parse(JSON.stringify(CartDish.list));

    let parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);

    if (parent_index === -1) {
      cart.push(business);
    }
    parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);

    let index = CheckAddtoCart(data.id, parent_index, cart);

    if (index === -1) {
      dish.data.push(data);
      cart[parent_index].dish.push(dish);
    } else {
      cart[parent_index].dish[index].quantity =
        parseInt(cart[parent_index].dish[index].quantity, 10) + 1;
      if (data.sets.length === 0 && data.activeIngredients.length === 0) {
        let index_data = CheckData(cart[parent_index].dish[index].data, data);

        if (index_data === -1) {
          cart[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes =
            dishItem.notes;
          cart[parent_index].dish[index].data[index_data].quantity = parseInt(
            cart[parent_index].dish[index].data[index_data].quantity + 1,
          );
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
      } else if (
        data.sets.length === 0 &&
        data.activeIngredients.length !== 0
      ) {
        let index_data;
        index_data = CheckDataIngreExist(
          cart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          cart[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes =
            dishItem.notes;
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
      } else if (
        data.sets.length !== 0 &&
        data.activeIngredients.length === 0
      ) {
        let index_data;
        index_data = CheckDataSetExist(
          cart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          cart[parent_index].dish[index].data.push(data);
        } else {
          cart[parent_index].dish[index].data[index_data].notes =
            dishItem.notes;
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
          cart[parent_index].dish[index].data[index_data].notes =
            dishItem.notes;
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
    if (cart.length > 0) {
      setCartDish({ isLoading: false, list: cart });
      dispatch(setCartDetails(cart));

      showToastMsg('Item added successfully.');
      let cartQty = 0;
      for (const cartDish of cart) {
        for (const dish of cartDish.dish) {
          cartQty += dish.quantity;
        }
      }
      setcartQuantity(cartQty);
      dispatch(setCartQuantity(cartQty));
    } else {
      setCartQuantity(0);
    }
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

  const updateCartDetailsFromChild = cart => {
    setCartDish({ isLoading: false, list: cart });
    dispatch(setCartDetails(cart));

    let cartQty = 0;
    for (const cartDish of cart) {
      for (const dish of cartDish.dish) {
        cartQty += dish.quantity;
      }
    }
    setcartQuantity(cartQty);
    dispatch(setCartQuantity(cartQty));
  };

  const [CodeRun, setCodeRun] = useState('');
  const [visiblemodal, setvisiblemodal] = useState(false);
  const [printerlist, setPrinterList] = useState([]);
  const [SelectedUsb, setSelectedUsb] = useState(null);

  const OpenCashDrawer = async () => {
    console.log('openCashBox');
    EbPrinter.openCashBox();
    setCodeRun('Code Is Run');
  };

  const GetUsbDeviceList = async () => {
    /*const usbdevicelist = await EbPrinter.getUsbDeviceList();

    if (usbdevicelist) {
      setPrinterList(usbdevicelist);
      //setPrinterList(['Devin', 'Dan']);
      setvisiblemodal(true);
    }
    console.log(usbdevicelist);*/
  };

  const selectDevice = item => {
    setSelectedUsb(item);
    //EbPrinter.selectUsbPrinter(item);
    setvisiblemodal(false);
  };

  const [search_status, setSearchStatus] = useState(false);

  function search_category(val) {
    /*if (val != '') {
      const items = categoryDetails_temp.filter(
        item => item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1,
      );

      setCategoryDetails({isLoading: false, list: items});
    } else {
      setCategoryDetails({
        isLoading: false,
        list: categoryDetails_temp,
      });
    }*/

    if (val != '') {
      setCategoryMenuSearch({
        isLoading: true,
        list: [],
      });

      /*const items_one = [];

      category_menu_temp.map((item, item_index) => {
        items_one.push(
          item.filter(product => {
            product.name.toLowerCase().indexOf(val.toLowerCase()) !== -1;
          }),
        );
      });*/

      /*const items_one = category_menu_temp.filter(obj => {
        // Use .some() to check if ANY item in the 'tags' sub-array matches the condition
        return obj.some(
          tag => tag.name.toLowerCase().indexOf(val.toLowerCase()) !== -1,
        );
      });*/
      console.log('Search');
      console.log(category_menu_temp);

      const items_one = category_menu_temp.filter(
        item => item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1,
      );

      /*const items_two = category_menu_temp_subcat.filter(obj => {
        // Use .some() to check if ANY item in the 'tags' sub-array matches the condition
        return obj.some(
          tag => tag.name.toLowerCase().indexOf(val.toLowerCase()) !== -1,
        );
      });*/

      setSearchStatus(true);

      setCategoryMenuSearch({ isLoading: false, list: items_one });
    } else {
      setSearchStatus(false);
      setCategoryMenuSearch({
        isLoading: false,
        list: [],
      });
    }
  }

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
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : null}

      <Modal supportedOrientations={['landscape']} animationType="slide" transparent={true} visible={visiblemodal}>
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

      <View style={styles.main}>
        <View style={styles.inner_left}>
          {/*<View>
            {SelectedUsb == null ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => GetUsbDeviceList()}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#fff',
                    fontFamily: Inter.medium,
                  }}>
                  Select Usb Device
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => OpenCashDrawer()}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#fff',
                    fontFamily: Inter.medium,
                  }}>
                  Open Cash Box
                </Text>
              </TouchableOpacity>
            )}
          </View>*/}

          <AppTextInput
            inputStyle={{ paddingLeft: 10 }}
            onChangeText={text => {
              search_category(text);
            }}
            placeholder={'Search Here'}
            leftIcon={{
              name: 'search',
              type: 'Feather',
              color: Colors.black,
            }}
            inputContainerStyle={{
              borderColor: Colors.grey,
              marginBottom: responsiveHeight(1),
            }}
          />

          {search_status === false ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {categoryDetails.isLoading === false &&
              categoryDetails.list.length > 0 ? (
                <>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}
                  >
                    {categoryDetails.list.map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={'cat_' + index}
                          onPress={() => {
                            openProduct(item.id, item, index);
                          }}
                          style={{
                            paddingHorizontal: responsiveWidth(0.5),
                            paddingVertical: responsiveHeight(0.5),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderColor: Colors.buttonColor,
                            borderWidth: 1.5,
                            backgroundColor:
                              selected_category == item.id
                                ? Colors.white
                                : Colors.primary,
                            height: responsiveHeight(12),
                            borderRadius: 10,
                            marginHorizontal: responsiveWidth(0.5),
                            marginVertical: responsiveHeight(1),
                            width: responsiveWidth(14.5),
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: Inter.bold,
                              fontSize: responsiveFontSize(1),
                              color:
                                selected_category == item.id
                                  ? Colors.primaryFontColor
                                  : Colors.white,
                            }}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginBottom: responsiveHeight(25),
                    }}
                  >
                    {category_menu.isLoading === false &&
                    category_menu.list != null
                      ? category_menu.list.dish.map((dish, dish_index) => {
                          return dish.subcategory == 0 ? (
                            <TouchableOpacity
                              key={'dish_' + dish_index}
                              onPress={() => {
                                productDetails(dish);
                              }}
                              style={{
                                paddingHorizontal: responsiveWidth(0.5),
                                paddingVertical: responsiveHeight(0.5),
                                display: 'flex',
                                borderColor: Colors.buttonColor,
                                borderWidth: 1.5,
                                backgroundColor: Colors.white,
                                height: responsiveHeight(12),
                                borderRadius: 10,
                                marginHorizontal: responsiveWidth(0.5),
                                marginVertical: responsiveHeight(1),
                                width: responsiveWidth(14.5),
                              }}
                            >
                              <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={{
                                  fontFamily: Inter.regular,
                                  fontSize: responsiveFontSize(1),
                                  color: Colors.black,
                                  height: responsiveHeight(5.4),
                                }}
                              >
                                {dish.name}
                              </Text>
                              <View
                                style={{
                                  marginTop: responsiveHeight(0.5),
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View>
                                  <Text
                                    style={{
                                      fontFamily: Inter.regular,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.primaryFontColor,
                                    }}
                                  >
                                    {activeBusiness.currency_symbol}
                                    {dish.price}
                                  </Text>
                                </View>
                                <View>
                                  <Icon
                                    name="pluscircle"
                                    type="AntDesign"
                                    size={responsiveWidth(2)}
                                    color={Colors.primaryFontColor}
                                  />
                                </View>
                              </View>
                            </TouchableOpacity>
                          ) : null;
                        })
                      : null}
                    {category_menu.isLoading === false &&
                    category_menu.list != null
                      ? category_menu.list.subCat.map((subCat, subindex) => {
                          return subCat.dish.map((dish, dish_index) => {
                            console.log(dish.name);
                            return (
                              <TouchableOpacity
                                key={'sub_' + dish_index}
                                onPress={() => {
                                  productDetails(dish);
                                }}
                                style={{
                                  paddingHorizontal: responsiveWidth(0.5),
                                  paddingVertical: responsiveHeight(0.5),
                                  display: 'flex',
                                  borderColor: Colors.buttonColor,
                                  borderWidth: 1.5,
                                  backgroundColor: Colors.white,
                                  height: responsiveHeight(12),
                                  borderRadius: 10,
                                  marginHorizontal: responsiveWidth(0.5),
                                  marginVertical: responsiveHeight(1),
                                  width: responsiveWidth(14.5),
                                }}
                              >
                                <Text
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                  style={{
                                    fontFamily: Inter.regular,
                                    fontSize: responsiveFontSize(1),
                                    color: Colors.black,
                                    height: responsiveHeight(5.4),
                                  }}
                                >
                                  {dish.name}
                                </Text>
                                <View
                                  style={{
                                    marginTop: responsiveHeight(0.5),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <View>
                                    <Text
                                      style={{
                                        fontFamily: Inter.regular,
                                        fontSize: responsiveFontSize(1),
                                        color: Colors.primaryFontColor,
                                      }}
                                    >
                                      {activeBusiness.currency_symbol}
                                      {dish.price}
                                    </Text>
                                  </View>
                                  <View>
                                    <Icon
                                      name="pluscircle"
                                      type="AntDesign"
                                      size={responsiveWidth(2)}
                                      color={Colors.primaryFontColor}
                                    />
                                  </View>
                                </View>
                              </TouchableOpacity>
                            );
                          });
                        })
                      : null}
                  </View>
                </>
              ) : categoryDetails.isLoading === false &&
                categoryDetails.list.length == 0 ? (
                <View>
                  <Text
                    style={{
                      marginTop: responsiveHeight(10),
                      alignSelf: 'center',
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(2),
                      color: Colors.red,
                    }}
                  >
                    No Record Found
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  {Array.from({ length: 8 }).map((_, index) => (
                    <View
                      key={'skeleton_lo_v' + index}
                      style={{
                        paddingHorizontal: responsiveWidth(0.5),
                        paddingVertical: responsiveHeight(0.5),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: Colors.grey,
                        borderWidth: 1.5,
                        backgroundColor: Colors.white,
                        height: responsiveHeight(12),
                        borderRadius: 10,
                        marginHorizontal: responsiveWidth(0.5),
                        marginVertical: responsiveHeight(1),
                        width: responsiveWidth(14.5),
                      }}
                    >
                      <ProductCardSkeleton key={'skeleton_lo_1' + index} />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : search_status === true ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: responsiveHeight(25),
                }}
              >
                {category_menu_search.isLoading === false &&
                category_menu_search.list.length > 0 ? (
                  category_menu_search.list.map((dish, dish_index) => {
                    console.log('in');
                    console.log(dish.subcategory);

                    return dish.subcategory == 0 ? (
                      <TouchableOpacity
                        key={'dish_' + dish_index}
                        onPress={() => {
                          productDetails(dish);
                        }}
                        style={{
                          paddingHorizontal: responsiveWidth(0.5),
                          paddingVertical: responsiveHeight(0.5),
                          display: 'flex',
                          borderColor: Colors.buttonColor,
                          borderWidth: 1.5,
                          backgroundColor: Colors.white,
                          height: responsiveHeight(12),
                          borderRadius: 10,
                          marginHorizontal: responsiveWidth(0.5),
                          marginVertical: responsiveHeight(1),
                          width: responsiveWidth(14.5),
                        }}
                      >
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={{
                            fontFamily: Inter.regular,
                            fontSize: responsiveFontSize(1),
                            color: Colors.black,
                            height: responsiveHeight(5.4),
                          }}
                        >
                          {dish.name}
                        </Text>
                        <View
                          style={{
                            marginTop: responsiveHeight(0.5),
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontFamily: Inter.regular,
                                fontSize: responsiveFontSize(1),
                                color: Colors.primaryFontColor,
                              }}
                            >
                              {activeBusiness.currency_symbol}
                              {dish.price}
                            </Text>
                          </View>
                          <View>
                            <Icon
                              name="pluscircle"
                              type="AntDesign"
                              size={responsiveWidth(2)}
                              color={Colors.primaryFontColor}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : null;
                  })
                ) : category_menu_search.isLoading === false &&
                  category_menu_search.list.length == 0 ? (
                  <View>
                    <Text
                      style={{
                        marginTop: responsiveHeight(10),
                        alignSelf: 'center',
                        fontFamily: Inter.regular,
                        fontSize: responsiveFontSize(2),
                        color: Colors.red,
                      }}
                    >
                      No Record Found
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, index) => (
                      <View
                        key={'skeleton_lo_v' + index}
                        style={{
                          paddingHorizontal: responsiveWidth(0.5),
                          paddingVertical: responsiveHeight(0.5),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: Colors.buttonColor,
                          borderWidth: 1.5,
                          backgroundColor: Colors.white,
                          height: responsiveHeight(12),
                          borderRadius: 10,
                          marginHorizontal: responsiveWidth(0.5),
                          marginVertical: responsiveHeight(1),
                          width: responsiveWidth(14.5),
                        }}
                      >
                        <ProductCardSkeleton key={'skeleton_lo_1' + index} />
                      </View>
                    ))}
                  </View>
                )}
                {/*category_menu.isLoading === false && category_menu.list != null
                  ? category_menu.list.map((item, item_index) => {
                      return item.subCat.map((subCat, subindex) => {
                        return subCat.dish.map((dish, dish_index) => {
                          console.log(dish.name);
                          return (
                            <TouchableOpacity
                              key={'sub_' + dish_index}
                              onPress={() => {
                                productDetails(dish);
                              }}
                              style={{
                                paddingHorizontal: responsiveWidth(0.5),
                                paddingVertical: responsiveHeight(0.5),
                                display: 'flex',
                                borderColor: Colors.blue,
                                borderWidth: 1.5,
                                backgroundColor: Colors.white,
                                height: responsiveHeight(12),
                                borderRadius: 10,
                                marginHorizontal: responsiveWidth(0.5),
                                marginVertical: responsiveHeight(1),
                                width: responsiveWidth(14.5),
                              }}>
                              <Text
                                style={{
                                  fontFamily: Inter.regular,
                                  fontSize: responsiveFontSize(1),
                                  color: Colors.black,
                                }}>
                                {dish.name}
                              </Text>
                              <View
                                style={{
                                  marginTop: responsiveHeight(0.5),
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}>
                                <View>
                                  <Text
                                    style={{
                                      fontFamily: Inter.regular,
                                      fontSize: responsiveFontSize(1),
                                      color: Colors.green,
                                    }}>
                                    {activeBusiness.currency_symbol}
                                    {dish.price} {'sub'}
                                  </Text>
                                </View>
                                <View>
                                  <Icon
                                    name="pluscircle"
                                    type="AntDesign"
                                    size={responsiveWidth(2)}
                                    color={Colors.green}
                                  />
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        });
                      });
                    })
                  : null*/}
              </View>
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.inner_right}>
          {activeBusiness != null ? (
            <HomeRight
              preorderDetails={preorderDetails}
              categoryDetails={categoryDetails}
              orderType={orderType}
              cartDish={CartDish}
              cartQty={cartQuantity}
              activeBusiness={activeBusiness}
              updateCartDetails={updateCartDetailsFromChild}
              productDetailsEdit={productDetailsEdit}
            />
          ) : null}
        </View>

        <Modal
          supportedOrientations={['landscape']}
          transparent={true}
          visible={isOrderModel}
          animationType="slide"
          onRequestClose={() => {
            setNewOrderModel(false);
          }}
        >
          <View style={{ ...styles.upload_modal_main }}>
            <View style={styles.upload_modal_inner_modalView}>
              <View
                style={[
                  styles.upload_modal_view,
                  { flexDirection: 'column', display: 'flex' },
                ]}
              >
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 10,
                    padding: 30,
                  }}
                >
                  <Image
                    source={require('../../assets/images/check.png')}
                    style={styles.check_logo}
                  />
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(2.5),
                      color: Colors.black,
                    }}
                  >
                    Received a New Order!
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(2),
                      color: Colors.black,
                    }}
                  >
                    Order ID{' '}
                    <Text
                      style={{
                        fontFamily: Inter.regular,
                        fontSize: responsiveFontSize(2.2),
                        color: 'red',
                      }}
                    >
                      #{order_data != null ? order_data.order_id : null}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(2),
                      color: Colors.black,
                    }}
                  >
                    {order_data != null ? order_data.order_type : null}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setNewOrderModel(false);
                      SoundPlayer.stop();

                      navigation.navigate('MyOrder_Tab', {
                        screen: 'MyOrder',
                        params: {
                          id: order_data != null ? order_data.order_id : null,
                        },
                      });
                    }}
                    style={{
                      ...styles.button_sty,
                      backgroundColor: Colors.buttonColor,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.button_txt,
                        color: '#fff',
                      }}
                    >
                      OK
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {optionModelAdd === true ? (
        <OptionModelAdd
          optionItem={optionItem}
          activeBusiness={activeBusiness}
          orderType={orderType}
          setoptionModelAdd={setoptionModelAdd}
          cartQty={cartQuantity}
          updateCartDetails={updateCartDetailsFromChild}
        />
      ) : null}
    </Container>
  );
};

export default Home;
