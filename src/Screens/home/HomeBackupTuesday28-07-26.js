import React, { useEffect, useState, useRef } from 'react';
import { Text, View, BackHandler, useWindowDimensions, TextInput, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, } from 'react-native';
import Styles from './style';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import { Images } from '../../Constants/ImageIconContant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
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
import { HomeRight, OptionModelAdd } from '../Component/index';
//import EbPrinter from 'react-native-ebprinter';
import messaging from '@react-native-firebase/messaging';
import SoundPlayer from 'react-native-sound-player';
import useTranslation from '../../Hooks/useTranslation';
import ProductCardSkeleton, {
  CategoryRowSkeleton,
  EmptyCartSkeleton,
  SubCategoryRowSkeleton,
} from '../Component/ProductCardSkeleton';
import useOrderTypes from '../../Hooks/useOrderTypes';

const Accent = '#4310bc';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// A business can have more than one active menu (e.g. lunch/dinner), each
// with its own weekly schedule. A day counts as "open" if any menu is open
// that day; its time windows are the union of every open menu's windows.
// This is what lets HomeRight build the preorder date/time pickers off
// activeBusiness.schedule.
const mergeMenuSchedules = menus => {
  const merged = {};
  WEEKDAY_NAMES.forEach(name => {
    merged[name] = { name, status: false, times: [] };
  });

  (menus || []).forEach(menu => {
    (menu.schedule || []).forEach(day => {
      if (!merged[day.name]) return;
      if (day.status) {
        merged[day.name].status = true;
        merged[day.name].times = merged[day.name].times.concat(day.times || []);
      }
    });
  });
  return Object.values(merged);
};

// create a component
const Home = ({ props, route, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  // inner_left is always 66% of the full screen width (see styles.inner_left).
  const innerLeftWidth = windowWidth * 0.66;
  // Tune these two numbers to match your target design:
  // TARGET_CARD_WIDTH = how wide you want a card to look
  // CARD_GAP = the visual gap between cards, in dp
  const TARGET_CARD_WIDTH = 251;
  const CARD_GAP = 14;
  const columns = Math.min(
    5,
    Math.max(
      3,
      Math.round((innerLeftWidth + CARD_GAP) / (TARGET_CARD_WIDTH + CARD_GAP)),
    ),
  );
  const styles = Styles(columns);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, userToken, userData, langId, cartDetails } = useSelector(state => state.common);
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

  const [selected_subcategory, setSelectedSubCategory] = useState(null);

  const [cartQuantity, setcartQuantity] = useState(0);
  const [orderType, setOrderType] = useState(1);
  const [CartDish, setCartDish] = useState({ isLoading: true, list: [] });

  const [optionModelAdd, setoptionModelAdd] = useState(false);
  const [isOrderModel, setNewOrderModel] = useState(false);
  const [notification_data, setNotificationData] = useState(null);
  const [order_data, setOrderData] = useState(null);

  const { getAvailableOrderTypes } = useOrderTypes();
  const [noActiveMenu, setNoActiveMenu] = useState(false);
  const [noActiveMenuSignal, setNoActiveMenuSignal] = useState(0);


  const [expandedQtyDishId, setExpandedQtyDishId] = useState({});
  const qtyCollapseTimers = useRef({});
  const startQtyCollapseTimer = dishId => {
    if (qtyCollapseTimers.current[dishId]) {
      clearTimeout(qtyCollapseTimers.current[dishId]);
    }
    qtyCollapseTimers.current[dishId] = setTimeout(() => {
      setExpandedQtyDishId(prev => ({ ...prev, [dishId]: false }));
      delete qtyCollapseTimers.current[dishId];
    }, 5000);
  };
  useEffect(() => {
    if (userData != null) {
      ActiveBusiness();
    }
  }, [userData]);
  const categoryPillLayouts = useRef({});
  useEffect(() => {
    return () => {
      Object.values(qtyCollapseTimers.current).forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const savedCartRaw = await getData('cartDetails');
        if (savedCartRaw) {
          const savedCart = JSON.parse(savedCartRaw);
          if (Array.isArray(savedCart) && savedCart.length > 0) {
            dispatch(setCartDetails(savedCart));
            setCartDish({ isLoading: false, list: savedCart });

            let cartQty = 0;
            for (const cartDish of savedCart) {
              for (const dish of cartDish.dish) {
                cartQty += dish.quantity;
              }
            }
            setcartQuantity(cartQty);
            dispatch(setCartQuantity(cartQty));
          }
        }
      } catch (e) {
        console.log('Error restoring cart:', e);
      }
    };
    restoreCart();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
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
        if (remoteMessage) {
          navigation.navigate('MyOrder_Tab', {
            screen: 'MyOrder',
            params: {
              id: remoteMessage.data.order_id,
            },
          });
        }
      });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
      };

      const ExitAlert = () => {
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

  // const SoundPlay = () => {
  //   console.log('call sound');
  //   try {
  //     SoundPlayer.playAsset(require('../../assets/sound/newbook.wav'));
  //   } catch (e) {
  //     console.log(`cannot play the sound file`, e);
  //   }
  // };
  const SoundPlay = () => {
    try {
      // Non-blocking invocation
      requestAnimationFrame(() => {
        SoundPlayer.playAsset(require('../../assets/sound/newbook.wav'));
      });
    } catch (e) {
      console.log('Cannot play sound file', e);
    }
  };

  const OpenNewOrderModel = (notification, data) => {
    SoundPlay();
    setNotificationData(notification);
    setOrderData(data);
    setNewOrderModel(true);
    // setTimeout(() => {
    //   setNewOrderModel(true);
    // }, 1000);
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

  const getOrderTypeFromBusinessFlags = business => {
    if (!business) return null;
    const flags = business.business || business;
    if (Number(flags.is_delivery) === 1) return 1;
    if (Number(flags.is_pickup) === 1) return 2;
    if (Number(flags.is_dinein) === 1) return 3;
    if (Number(flags.is_catering) === 1) return 4;
    return null;
  };

  const ActiveBusiness = () => {
    fetchBusinessMenu(2);
  };


  const fetchBusinessMenu = typeToFetch => {
    postWithToken(
      baseUrl,
      'get-business-info',
      { business_id: userData?.business_id, lang_id: langId, type: typeToFetch },
      userToken,
    )
      .then(response => {
        const hasMenu = response.status === true && response?.menu && Object.keys(response.menu).length > 0;

        const businessWithSchedule = {
          ...response.business,
          schedule: mergeMenuSchedules(response.menu),
        };
        setActiveBusiness(businessWithSchedule);
        setOrderType(typeToFetch);

        if (!hasMenu) {
          setNoActiveMenu(true);
          setNoActiveMenuSignal(prev => prev + 1)
          // Alert.alert('Sorry!', 'Not Have Active Menu Now', [
          //   { text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          // ]);
          setCategoryDetails({ isLoading: false, list: [] });
          setCategoryMenu({ isLoading: false, list: null });
          setcategoryDetailsTemp([]);
          setCategoryMenuTemp([]);
          return;
        }

        setNoActiveMenu(false);
        setCategoryDetails({ isLoading: false, list: response.category });
        setcategoryDetailsTemp(response.category);

        if (response.category && response.category.length > 0) {
          const firstCategory = response.category[0];
          setSelectedCategory(firstCategory.id);
          setCategoryMenu({ isLoading: false, list: firstCategory });
          setSelectedSubCategory(null);
        }

        let menu_temp = null;
        response.category.forEach(item => {
          menu_temp = menu_temp == null ? item.dish : [...menu_temp, ...(item.dish || [])];
          if (item.subCat && item.subCat.length > 0) {
            item.subCat.forEach(subitem => {
              menu_temp = menu_temp == null ? subitem.dish : [...menu_temp, ...(subitem.dish || [])];
            });
          }
        });
        setCategoryMenuTemp(menu_temp);
      })
      .catch(error => {
        console.log('Error : ', error);
        setNoActiveMenu(true);
      });
  };
  // const ActiveBusiness = () => {
  //   postWithToken(
  //     baseUrl,
  //     'get-business-info',
  //     { business_id: userData?.business_id, lang_id: langId, type: 1 },
  //     userToken,
  //   )
  //     .then(response => {
  //       if (response.status === true) {

  //         const businessWithSchedule = {
  //           ...response.business,
  //           schedule: mergeMenuSchedules(response.menu),
  //         };
  //         setActiveBusiness(businessWithSchedule);
  //         if (!response?.menu || Object.keys(response.menu).length === 0) {
  //           Alert.alert('Sorry!', 'Not Have Active Menu Now', [
  //             {
  //               text: 'Ok',
  //               onPress: () => console.log('Cancel Pressed'),
  //               style: 'cancel',
  //             },
  //           ]);

  //           setCategoryDetails({ isLoading: false, list: [] });
  //           setCategoryMenu({ isLoading: false, list: null });
  //           setcategoryDetailsTemp([]);
  //           setCategoryMenuTemp([]);
  //           return false;
  //         }
  //         else {
  //           setCategoryDetails({ isLoading: false, list: response.category });
  //           setcategoryDetailsTemp(response.category);
  //           // Automatically pre-select the 1st category
  //           if (response.category && response.category.length > 0) {
  //             const firstCategory = response.category[0];
  //             setSelectedCategory(firstCategory.id);
  //             setCategoryMenu({ isLoading: false, list: firstCategory });
  //             setSelectedSubCategory(null);
  //           }

  //           let menu_temp = null;

  //           response.category.map((item, index) => {
  //             if (menu_temp == null) {
  //               menu_temp = item.dish;
  //             } else {
  //               menu_temp = [...menu_temp, ...(item.dish || [])];
  //             }

  //             if (item.subCat.length > 0) {
  //               item.subCat.map((sutitem, subindex) => {
  //                 if (menu_temp == null) {
  //                   menu_temp = sutitem.dish;
  //                 } else {
  //                   menu_temp = [...menu_temp, ...(sutitem.dish || [])];
  //                 }
  //               });
  //             }
  //           });

  //           setCategoryMenuTemp(menu_temp);
  //         }
  //       }
  //     })
  //     .catch(error => {
  //       console.log('Error : ', error);
  //     });
  // };

  const dineIn = res => {
    postWithOutToken(baseUrl, 'module/product/rest-product-pos', {
      f: 'getproductbybusiness',
      Id: res.id,
      langId: langId,
      type: orderType,
      preorder: preorderDetails,
    })
      .then(response => {
        if (!response?.menu || Object.keys(response.menu).length === 0) {
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
          setCategoryDetails({ isLoading: false, list: response.category });
          setcategoryDetailsTemp(response.category);

          let menu_temp = null;

          response.category.map((item, index) => {
            if (menu_temp == null) {
              menu_temp = item.dish;
            } else {
              menu_temp = [...menu_temp, ...item.dish];
            }

            if (item.subCat && item.subCat.length > 0) {
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
    setSelectedCategory(cat_id);
    setCategoryMenu({ isLoading: false, list: cat });
    setSelectedSubCategory(null);
    scrollToCategoryPill(cat_id);
  };
  const productDetails = item => {
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
    for (const ingre of (dishItem.ingredientsarray || [])) {
      activeIngredients.push(ingre);
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
      setData('cartDetails', JSON.stringify(cart));
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
      setData('cartDetails', JSON.stringify([]));
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

  const getCartQtyForDish = dishId => {
    if (!CartDish.list || CartDish.list.length === 0) return 0;
    let qty = 0;
    for (const business of CartDish.list) {
      for (const d of business.dish) {
        if (d.id === dishId) {
          qty += d.quantity;
        }
      }
    }
    return qty;
  };
  const incrementProductQty = dish => {
    addToCart(dish);
  };
  const incrementSameOptionsQty = dish => {
    if (!activeBusiness) return;
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    const parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);
    if (parent_index === -1) return;

    const index = CheckAddtoCart(dish.id, parent_index, cart);
    if (index === -1) return;

    cart[parent_index].dish[index].quantity =
      parseInt(cart[parent_index].dish[index].quantity, 10) + 1;

    const dataArr = cart[parent_index].dish[index].data;
    if (dataArr.length > 0) {
      const dataIndex = dataArr.length - 1; // increment the most recently added customization
      dataArr[dataIndex].quantity =
        parseInt(dataArr[dataIndex].quantity, 10) + 1;
      dataArr[dataIndex].total = (
        parseFloat(dataArr[dataIndex].totalprice) *
        parseInt(dataArr[dataIndex].quantity, 10)
      ).toFixed(2);
    }

    updateCartDetailsFromChild(cart);
  };

  // "-" on a simple product card — mirrors HomeRight's decrement logic,
  // scoped to the flat product-grid card (no set/ingredient variants here).
  const decrementProductQty = dish => {
    if (!activeBusiness) return;
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    const parent_index = CheckBusinessAddtoCart(activeBusiness.id, cart);
    if (parent_index === -1) return;

    const index = CheckAddtoCart(dish.id, parent_index, cart);
    if (index === -1) return;

    cart[parent_index].dish[index].quantity =
      parseInt(cart[parent_index].dish[index].quantity, 10) - 1;

    const dataArr = cart[parent_index].dish[index].data;
    if (dataArr.length > 0) {
      const dataIndex = dataArr.length - 1; // decrement the most recently added customization
      dataArr[dataIndex].quantity =
        parseInt(dataArr[dataIndex].quantity, 10) - 1;
      dataArr[dataIndex].total = (
        parseFloat(dataArr[dataIndex].totalprice) *
        parseInt(dataArr[dataIndex].quantity, 10)
      ).toFixed(2);

      if (dataArr[dataIndex].quantity <= 0) {
        dataArr.splice(dataIndex, 1);
      }
    }

    if (cart[parent_index].dish[index].data.length === 0) {
      cart[parent_index].dish.splice(index, 1);
    }
    if (cart[parent_index].dish.length === 0) {
      cart.splice(parent_index, 1);
    }

    updateCartDetailsFromChild(cart);
  };

  // Same cart-writing logic as before, just also keeps the stepper expanded
  // and restarts the 2s collapse countdown on every tap. Dishes with sets
  // that are already in the cart bump the existing customization instead of
  // routing through addToCart/the options modal.
  const handleIncrementTap = dish => {
    if (dish.sets && dish.sets.length > 0) {
      incrementSameOptionsQty(dish);
    } else {
      incrementProductQty(dish);
    }
    setExpandedQtyDishId(prev => ({ ...prev, [dish.id]: true }));
    startQtyCollapseTimer(dish.id);
  };

  const handleDecrementTap = dish => {
    decrementProductQty(dish);
    setExpandedQtyDishId(prev => ({ ...prev, [dish.id]: true }));
    startQtyCollapseTimer(dish.id);
  };

  // Tapping the collapsed number badge re-opens the stepper without
  // changing the quantity.
  const handleQtyBadgeTap = dish => {
    setExpandedQtyDishId(prev => ({ ...prev, [dish.id]: true }));
    startQtyCollapseTimer(dish.id);
  };
  const handleOptionModalAdded = (dishId) => {
    setExpandedQtyDishId(prev => ({ ...prev, [dishId]: true }));
    startQtyCollapseTimer(dishId);
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
    setData('cartDetails', JSON.stringify(cart));
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
    EbPrinter.openCashBox();
    setCodeRun('Code Is Run');
  };

  const GetUsbDeviceList = async () => {
    /* left as-is (native printer integration currently disabled) */
  };

  const selectDevice = item => {
    setSelectedUsb(item);
    setvisiblemodal(false);
  };

  const [search_status, setSearchStatus] = useState(false);

  const categoryScrollRef = useRef(null);
  const [categoryScrollX, setCategoryScrollX] = useState(0);
  const [categoryContentWidth, setCategoryContentWidth] = useState(0);
  const [categoryViewWidth, setCategoryViewWidth] = useState(0);

  const scrollCategoriesForward = () => {
    if (!categoryScrollRef.current) {
      return;
    }
    const maxScrollX = Math.max(categoryContentWidth - categoryViewWidth, 0);
    const nextX = Math.min(categoryScrollX + responsiveWidth(40), maxScrollX);
    categoryScrollRef.current.scrollTo({ x: nextX, animated: true });
  };
  const scrollToCategoryPill = catId => {
    const layout = categoryPillLayouts.current[catId];
    if (!layout || !categoryScrollRef.current || categoryViewWidth === 0) {
      return;
    }

    const { x, width } = layout;
    const maxScrollX = Math.max(categoryContentWidth - categoryViewWidth, 0);

    // Center the pill inside the visible scroll window
    let targetX = x + width / 2 - categoryViewWidth / 2;

    targetX = Math.max(0, Math.min(targetX, maxScrollX));

    categoryScrollRef.current.scrollTo({ x: targetX, animated: true });
  };
  function search_category(val) {
    if (val != '') {
      setCategoryMenuSearch({
        isLoading: true,
        list: [],
      });

      const items_one = category_menu_temp.filter(
        item => item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1,
      );

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

  const renderBadgeRow = (dish) => {
    const hasVegMark = dish.veg || dish.nonveg;
    if (!hasVegMark && !dish.spicy && !dish.feature) return null;
    return (
      <View style={styles.productBadgeRow}>
        {hasVegMark ? (
          <View
            style={[
              styles.vegNonVegBox,
              dish.nonveg ? styles.nonVegBox : styles.vegBox,
            ]}
          >
            <View
              style={[
                styles.vegNonVegDot,
                dish.nonveg ? styles.nonVegDot : styles.vegDot,
              ]}
            />
          </View>
        ) : null}
        {dish.spicy ? (
          <Image source={Images.spicy} style={styles.spicyBadge} />
        ) : null}

        {dish.feature ? (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>{t('FEATURED')}</Text>
          </View>
        ) : null}
      </View>
    );
  };
  const renderProductCard = (dish, key, index = 0) => {
    const isLastInRow = index % columns === columns - 1;
    const hasSets = dish.sets && dish.sets.length > 0;
    const qtyInCart = getCartQtyForDish(dish.id);
    const isQtyExpanded = expandedQtyDishId[dish.id] === true;
    const hasImage = !!dish?.is_img;
    const hasBadges = !!(dish.veg || dish.nonveg || dish.spicy || dish.feature);
    return (
      <TouchableOpacity
        key={key}
        onPress={() => {
          productDetailsItem(dish);
        }}
        activeOpacity={hasSets || qtyInCart === 0 ? 0.7 : 1}
        style={[styles.productCard, isLastInRow && styles.productCardLastInRow]}
      >
        {hasImage ? (
          <View style={styles.productImageWrap}>
            <Image source={{ uri: dish.is_img }} style={styles.productImage} resizeMode="cover" />
          </View>
        ) : null}
        <View
          style={[
            styles.productInfo,
            !hasImage && styles.productInfoNoImage,
            !(hasImage && hasBadges) && styles.productInfoCentered,
          ]}
        >
          {hasBadges ? renderBadgeRow(dish) : null}
          <View style={styles.productTextGroup}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.productName]}
            >
              {dish.name}
            </Text>
          </View>
          <View style={styles.productFooterRow}>
            <View style={styles.offerPriceRow}>
              <Text numberOfLines={1} style={styles.productPrice}>
                {activeBusiness.currency_symbol}
                {Number(dish.price).toFixed(2)}
              </Text>
              {dish?.offerprice ? (
                <Text numberOfLines={1} style={styles.productOfferPrice}>
                  {activeBusiness.currency_symbol}
                  {Number(dish.delprice).toFixed(2)}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.productQtyControlWrap}>
          {renderQtyControl(dish, hasSets, qtyInCart, isQtyExpanded)}
        </View>
      </TouchableOpacity>
    );
  };
  const renderQtyControl = (dish, hasSets, qtyInCart, isQtyExpanded) => {
    if (qtyInCart > 0) {
      return isQtyExpanded ? (
        <View style={styles.productQtyStepper}>
          <TouchableOpacity style={styles.productQtyBtn}
            onPress={() => handleDecrementTap(dish)}>
            <Ionicons name="remove" size={responsiveFontSize(1)} color={Accent} />
          </TouchableOpacity>
          <View style={styles.productQtyValueWrap}>
            <Text style={styles.productQtyValue}>{qtyInCart}</Text>
          </View>
          <TouchableOpacity
            style={styles.productQtyBtn}
            onPress={() => handleIncrementTap(dish)}
          >
            <Ionicons name="add" size={responsiveFontSize(1)} color={Accent} />
          </TouchableOpacity>
        </View>
      ) :
        (
          <TouchableOpacity style={styles.productQtyBadge} onPress={() => handleQtyBadgeTap(dish)}>
            <Text style={styles.productQtyBadgeText}>{qtyInCart}</Text>
          </TouchableOpacity>
        );
    }
    return (
      <TouchableOpacity
        style={styles.productAddBtn}
        onPress={() => (hasSets ? productDetails(dish) : handleIncrementTap(dish))}
      >
        <Ionicons name="add" size={responsiveFontSize(0.9)} color="#fff" />
      </TouchableOpacity>
    );
  };
  const renderProductSkeletons = () => (
    <View style={styles.productGrid}>
      {Array.from({ length: 8 }).map((_, index) => {
        const isLastInRow = index % columns === columns - 1;
        return (
          <View
            key={'skeleton_lo_v' + index}
            style={[styles.productCard, isLastInRow && styles.productCardLastInRow]}
          >
            <ProductCardSkeleton key={'skeleton_lo_1' + index} />
          </View>
        );
      })}
    </View>
  );

  const buildFlatDishList = (categoryItem, subCatId = null) => {
    if (categoryItem == null) {
      return [];
    }

    if (subCatId != null) {
      const subCat = (categoryItem.subCat || []).find(
        sc => sc.id === subCatId,
      );
      return subCat ? subCat.dish || [] : [];
    }

    const flat = [];
    (categoryItem.dish || []).forEach(dish => {
      if (dish.subcategory == 0) {
        flat.push(dish);
      }
    });
    (categoryItem.subCat || []).forEach(subCat => {
      (subCat.dish || []).forEach(dish => {
        flat.push(dish);
      });
    });
    return flat;
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
          {/* ---------- search row --------*/}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={responsiveFontSize(1.5)} color={Colors.grey} />
              <TextInput
                style={styles.searchInput}
                placeholder={'Search for products...'}
                placeholderTextColor={Colors.grey}
                onChangeText={text => {
                  search_category(text);
                }}
              />
              <TouchableOpacity style={styles.searchSortBtn}>
                <Feather
                  name="sliders"
                  size={responsiveFontSize(1.5)}
                  color={Colors.grey}
                />
              </TouchableOpacity>
            </View>
          </View>

          {search_status === false ? (
            <>
              {/* ---------- category pills (icon + name) ---------- */}
              <View style={styles.categoryRow}>
                <ScrollView
                  ref={categoryScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                  contentContainerStyle={{ paddingRight: responsiveWidth(3) }} // leave space so pills don't hide under the floating button
                  scrollEventThrottle={16}
                  onScroll={e => {
                    setCategoryScrollX(e.nativeEvent.contentOffset.x);
                  }}
                  onLayout={e => {
                    setCategoryViewWidth(e.nativeEvent.layout.width);
                  }}
                  onContentSizeChange={contentWidth => {
                    setCategoryContentWidth(contentWidth);
                  }}
                >
                  {categoryDetails.isLoading === true ? (
                    <CategoryRowSkeleton count={12} />
                  ) : (
                    categoryDetails.list.map((item, index) => {
                      const isSelected = selected_category == item.id;
                      return (
                        <TouchableOpacity
                          key={'cat_' + index}
                          onPress={() => {
                            openProduct(item.id, item, index);
                          }}
                          onLayout={e => {
                            categoryPillLayouts.current[item.id] = {
                              x: e.nativeEvent.layout.x,
                              width: e.nativeEvent.layout.width,
                            };
                          }}
                          style={[
                            styles.categoryPill,
                            isSelected && styles.categoryPillSelected,
                          ]}
                        >
                          {item.icon ? (
                            <View style={styles.categoryPillImageWrap}>
                              <Image
                                source={{ uri: item.icon }}
                                style={styles.categoryPillImage}
                                resizeMode="contain"
                              />
                            </View>
                          ) : null}
                          <View style={styles.categoryPillTextWrap}>
                            <Text
                              numberOfLines={2}
                              style={[
                                styles.categoryPillText,
                                isSelected && styles.categoryPillTextSelected,
                              ]}
                            >
                              {item.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })

                  )}
                </ScrollView>

                {/* Floating chevron button - overlays on top, position stays fixed */}
                <TouchableOpacity
                  style={styles.categoryNextBtn}
                  onPress={scrollCategoriesForward}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={responsiveFontSize(1.4)}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              </View>

              {/* ---------- subcategory pills (text-only filter chips) ---------- */}
              <View style={[styles.categoryRow, { marginTop: responsiveHeight(2) }]}>
                {category_menu.isLoading === true ? (
                  <SubCategoryRowSkeleton count={4} />
                ) : category_menu.list != null &&
                  category_menu.list.subCat &&
                  category_menu.list.subCat.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={{ paddingRight: responsiveWidth(3) }}
                    scrollEventThrottle={16}
                  >
                    <TouchableOpacity
                      style={[
                        styles.subCategoryPill,
                        selected_subcategory === null &&
                        styles.subCategoryPillSelected,
                      ]}
                      onPress={() => setSelectedSubCategory(null)}
                    >
                      <Text
                        style={[
                          styles.subCategoryPillText,
                          selected_subcategory === null &&
                          styles.subCategoryPillTextSelected,
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {category_menu.list.subCat.map((subCatItem, subCatIndex) => {
                      const isSelected = selected_subcategory === subCatItem.id;
                      return (
                        <TouchableOpacity
                          key={'subcat_' + subCatIndex}
                          style={[
                            styles.subCategoryPill,
                            isSelected && styles.subCategoryPillSelected,
                          ]}
                          onPress={() => setSelectedSubCategory(subCatItem.id)}
                        >
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.subCategoryPillText,
                              isSelected && styles.subCategoryPillTextSelected,
                            ]}
                          >
                            {subCatItem.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : null}
              </View>
              <View
                style={{
                  paddingVertical: responsiveHeight(1.6),
                }}
              >
                <View
                  style={{
                    height: 1.2,
                    backgroundColor: "#D9D6ED",
                    width: "100%",
                  }}
                />
              </View>
              {/* ---------- product grid ---------- */}
              <View style={styles.productScrollRow}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {categoryDetails.isLoading === false &&
                    categoryDetails.list.length > 0 ? (
                    <View style={styles.productGrid}>
                      {category_menu.isLoading === false &&
                        category_menu.list != null
                        ? buildFlatDishList(
                          category_menu.list,
                          selected_subcategory,
                        ).map((dish, dish_index) =>
                          renderProductCard(dish, 'prod_' + dish_index, dish_index),
                        )
                        : null}
                    </View>
                  ) : categoryDetails.isLoading === false &&
                    categoryDetails.list.length == 0 ? (
                    <Text style={styles.noRecordText}>{t('NO_RECORD_FOUND')}</Text>
                  ) : (
                    renderProductSkeletons()
                  )}
                </ScrollView>
              </View>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.productGrid}>
                {category_menu_search.isLoading === false &&
                  category_menu_search.list.length > 0 ? (
                  category_menu_search.list
                    .filter(dish => dish.subcategory == 0)
                    .map((dish, dish_index) =>
                      renderProductCard(dish, 'search_' + dish_index, dish_index),
                    )
                ) : category_menu_search.isLoading === false &&
                  category_menu_search.list.length == 0 ? (
                  <Text style={styles.noRecordText}>{t('NO_RECORD_FOUND')}</Text>
                ) : (
                  renderProductSkeletons()
                )}
              </View>
            </ScrollView>
          )}
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
              updatePreorderDetails={setPreorderDetails}
              noActiveMenu={noActiveMenu}
              noActiveMenuSignal={noActiveMenuSignal}
              onOrderTypeSelected={fetchBusinessMenu}
            />
          ) : categoryDetails.isLoading === true ? (
            <View style={styles.cartPanel}>
              <EmptyCartSkeleton />
            </View>
          ) : (
            <View style={styles.cartPanel}>
              <View style={styles.cartIconCircle}>
                <Ionicons name="cart-outline" size={responsiveFontSize(4)} color={Colors.buttonColor} />
              </View>
              <Text style={styles.cartEmptyTitle}>{t('NO_PRODUCTS_IN_YOUR_CART')}</Text>
              <Text style={styles.cartEmptySubtitle}>{t('ADD_ITEMS_FROM_THE_MENU_TO_GET_STARTTED')}!</Text>
            </View>
          )}
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
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 5,
                    padding: 10,
                  }}
                >
                  <Image
                    source={require('../../assets/images/check.png')}
                    style={styles.check_logo}
                  />
                  <Text
                    style={{
                      fontFamily: Inter.semibold,
                      fontSize: responsiveFontSize(1.8),
                      color: Colors.black,
                    }}
                  >
                    {t('RECEIVED_A_NEW_ORDER')}!
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(1.3),
                      color: Colors.black,
                    }}
                  >
                    {t('ORDERID')}{' '}
                    <Text
                      style={{
                        fontFamily: Inter.regular,
                        fontSize: responsiveFontSize(1.4),
                        color: 'red',
                      }}
                    >
                      #{order_data != null ? order_data.order_id : null}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(1.5),
                      color: Colors.black,
                    }}
                  >
                    {order_data != null ? order_data.order_type : null}
                  </Text>

                  <TouchableOpacity
                    // onPress={() => {
                    //   setNewOrderModel(false);
                    //   SoundPlayer.stop();
                    //   navigation.navigate('MyOrder_Tab', {
                    //     screen: 'OrderDetail',
                    //     params: {
                    //       id: order_data != null ? order_data.order_id : null,
                    //     },
                    //   });
                    // }}
                    onPress={async () => {
                      setNewOrderModel(false);
                      SoundPlayer.stop();

                      const orderId = order_data != null ? order_data.order_id : null;
                      if (!orderId) {
                        Alert.alert('Error', 'No order ID found in notification data.');
                        return;
                      }
                      navigation.navigate('MyOrder_Tab', {
                        screen: 'OrderDetailFromNotification',
                        params: { orderId },
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
                    >{t('OK')}</Text>
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
          onAdded={handleOptionModalAdded}
        />
      ) : null}
    </Container>
  );
};

export default Home;