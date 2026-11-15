import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  useWindowDimensions, Text, View, BackHandler, TextInput, ScrollView,
  Image, TouchableOpacity, Alert, ActivityIndicator, FlatList, Keyboard,
} from 'react-native';
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
  setUsbPrinterValue,
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
import EbPrinter from 'react-native-ebprinter';
import messaging from '@react-native-firebase/messaging';
import SoundPlayer from 'react-native-sound-player';
import useTranslation from '../../Hooks/useTranslation';
import ProductCardSkeleton, {
  CategoryRowSkeleton,
  EmptyCartSkeleton,
  SubCategoryRowSkeleton,
} from '../Component/ProductCardSkeleton';
import useOrderTypes from '../../Hooks/useOrderTypes';
import { useAppTheme } from '../../Hooks/useAppTheme';
import SelectUsbPrinter from '../Component/selectusbprinter';
import OfferDealSection from './OfferDealSection';
import {
  syncBogoPricingInCart,
  tagLastDataEntryForDish,
  emptyBogoFields,
  sameBogoGroup,
} from '../../utility/bogoUtils';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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
// Resolves a name that may be a plain string, a JSON string, or an object
// keyed by language id, e.g. {"1":"Vegetarian- Entree","5":"..."}
const getLocalizedName = (name, langId) => {
  if (name == null) return '';
  let value = name;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try {
        value = JSON.parse(trimmed);
      } catch (e) {
        return value; // not JSON, plain text
      }
    } else {
      return value;
    }
  }

  if (typeof value === 'object') {
    const picked =
      value[langId] ??
      value[String(langId)] ??
      value['1'] ??
      Object.values(value).find(v => !!v);
    return picked != null ? String(picked) : '';
  }

  return String(value);
};

const OFFER_CATEGORY_ID = '__deal_offer_category__';

// Lazy loading: number of products fetched per page.
const PAGE_SIZE = 10;

// VERIFY: which order type maps to which price columns.
const PRICE_KEYS = {
  1: { regular: 'delprice', offer: 'offerprice' },
  2: { regular: 'dineinprice', offer: 'dineinofferprice' },
  3: { regular: 'pickprice', offer: 'pofferprice' },
};

/* ------------------------------------------------------------------ */
/*  Memoized product card (replaces renderBadgeRow / renderProductCard  */
/*  / renderQtyControl). Only re-renders when its own props change.     */
/* ------------------------------------------------------------------ */
const ProductCard = React.memo(function ProductCard({
  dish,
  index,
  columns,
  qtyInCart,
  isQtyExpanded,
  currencySymbol,
  styles,
  theme,
  t,
  onOpen,
  onIncrement,
  onDecrement,
  onBadgeTap,
  onQuickAdd,
}) {
  const isLastInRow = index % columns === columns - 1;
  const hasSets = dish.sets && dish.sets.length > 0;
  const hasImage = !!dish?.is_img;
  const hasVegMark = dish.veg || dish.nonveg;
  const hasBadges = !!(
    dish.veg ||
    dish.nonveg ||
    dish.spicy ||
    dish.feature ||
    dish.isDealDish
  );

  const renderBadgeRow = () => (
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

      {dish.isDealDish ? (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>
            {dish.dealOfferMeta?.discount
              ? `${dish.dealOfferMeta.discount}% OFF`
              : t('DEAL') || 'DEAL'}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderQtyControl = () => {
    if (qtyInCart > 0) {
      return isQtyExpanded ? (
        <View style={styles.productQtyStepper}>
          <TouchableOpacity
            style={styles.productQtyBtn}
            onPress={() => onDecrement(dish)}
          >
            <Ionicons
              name="remove"
              size={responsiveFontSize(1)}
              color={theme.primary}
            />
          </TouchableOpacity>
          <View style={styles.productQtyValueWrap}>
            <Text style={styles.productQtyValue}>{qtyInCart}</Text>
          </View>
          <TouchableOpacity
            style={styles.productQtyBtn}
            onPress={() => onIncrement(dish)}
          >
            <Ionicons
              name="add"
              size={responsiveFontSize(1)}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.productQtyBadge}
          onPress={() => onBadgeTap(dish)}
        >
          <Text style={styles.productQtyBadgeText}>{qtyInCart}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.productAddBtn}
        onPress={() => onQuickAdd(dish)}
      >
        <Ionicons name="add" size={responsiveFontSize(0.9)} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => onOpen(dish)}
      activeOpacity={hasSets || qtyInCart === 0 ? 0.7 : 1}
      style={[styles.productCard, isLastInRow && styles.productCardLastInRow]}
    >
      {hasImage ? (
        <View style={styles.productImageWrap}>
          <Image
            source={{ uri: dish.is_img }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View
        style={[
          styles.productInfo,
          !hasImage && styles.productInfoNoImage,
          !(hasImage && hasBadges) && styles.productInfoCentered,
        ]}
      >
        {hasBadges ? renderBadgeRow() : null}
        <View style={styles.productTextGroup}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.productName}
          >
            {dish.name}
          </Text>
        </View>
        <View style={styles.productFooterRow}>
          <View style={styles.offerPriceRow}>
            <Text numberOfLines={1} style={styles.productPrice}>
              {currencySymbol}
              {Number(dish.price).toFixed(2)}
            </Text>
            {dish?.offerprice ? (
              <Text numberOfLines={1} style={styles.productOfferPrice}>
                {currencySymbol}
                {Number(dish.delprice).toFixed(2)}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.productQtyControlWrap}>{renderQtyControl()}</View>
    </TouchableOpacity>
  );
});

const Home = ({ props, route, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const innerLeftWidth = windowWidth * 0.66;
  const TARGET_CARD_WIDTH = 251;
  const CARD_GAP = 14;
  const columns = Math.min(
    5,
    Math.max(
      3,
      Math.round((innerLeftWidth + CARD_GAP) / (TARGET_CARD_WIDTH + CARD_GAP)),
    ),
  );
  const theme = useAppTheme();
  const styles = useMemo(() => Styles(theme, columns), [theme, columns]);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const baseUrl = useSelector(s => s.common.baseUrl);
  const userToken = useSelector(s => s.common.userToken);
  const userData = useSelector(s => s.common.userData);
  const langId = useSelector(s => s.common.langId);
  const cartDetails = useSelector(s => s.common.cartDetails);
  const UsbPrinter = useSelector(s => s.common.UsbPrinter);
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

  const [category_menu, setCategoryMenu] = useState({
    isLoading: true,
    list: null,
  });

  const [category_menu_search, setCategoryMenuSearch] = useState({
    isLoading: true,
    list: [],
  });

  const [selected_subcategory, setSelectedSubCategory] = useState(null);

  // Lazy-loaded products for the currently selected category/subcategory.
  const [dishState, setDishState] = useState({
    list: [],
    page: 0,
    loaded: 0,
    hasMore: true,
    isLoading: true,
    isLoadingMore: false,
  });
  const dishRequestId = useRef(0);
  const dishListRef = useRef([]);
  dishListRef.current = dishState.list;
  // Cache of already-loaded products per order type + category/subcategory:
  // { [key]: { list, page, loaded, hasMore } }. Returning to a category
  // restores it instantly (no API call) and keeps its pagination position.
  const dishCache = useRef({});
  const pendingInfoType = useRef(null);
  const getDishKey = () =>
    `${orderType}_${selected_subcategory ?? selected_category}`;

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

  const offerSectionRef = useRef(null);
  const [pendingOfferDish, setPendingOfferDish] = useState(null);
  const [dealOffer, setDealOffer] = useState({ dishes: [], offerMeta: null });
  const [redeemedDealIds, setRedeemedDealIds] = useState([]);
  const userSelectedCategoryRef = useRef(false);

  // holds the BOGO group id/discount/offer name for a companion
  // dish that's mid-configuration in OptionModelAdd. Consumed the moment
  // that dish's cart update comes back through updateCartDetailsFromChild.
  const pendingBogoCompanionRef = useRef(null);

  const firstPositivePrice = (...values) => {
    for (const v of values) {
      const n = Number(v);
      if (!isNaN(n) && n > 0) return n;
    }
    return 0;
  };

  // Maps the raw get-deal-dish-list / get-buy-one-get-one-dish-list /
  // get-business-dishes option shape (option_name, choices, choice_name,
  // min_sel, max_sel, is_condition, choice.condition) onto the shape
  // OptionModelAdd.js expects (name, choice, min, max, type, show,
  // coditions).
  const mapDealOptionsToOptionModel = rawOptions => {
    if (!Array.isArray(rawOptions)) return [];
    return rawOptions
      .filter(o => o && Array.isArray(o.choices))
      .map(o => {
        const optType = Number(o.choices[0]?.type ?? 0);
        const max = Number(o.max_sel) || 0;
        return {
          id: o.id,
          name: o.option_name,
          // required: 1 = selection mandatory, 0 = optional
          required: Number(o.required) || 0,
          status: o.status,
          min: Number(o.min_sel) || 0,
          // 0 = unlimited. Use 999, not Infinity (JSON.stringify turns Infinity into null).
          max: optType === 1 && max === 0 ? 999 : max,
          type: optType,
          // Conditional options start hidden until a parent choice reveals them.
          show: !o.is_condition,
          coditions: o.choices.flatMap(c =>
            (c.condition || []).map(restId => ({
              choice: c.id,
              rest_op_id: restId,
            })),
          ),
          choice: o.choices.map(c => ({
            id: c.id,
            name: c.choice_name,
            price: Number(c.price) || 0,
            type: Number(c.type) || 0,
            checked: false,
            qty: 1, // API `qty` is stock, not selection count, so ignore it
          })),
        };
      });
  };

  const normalizeDealDish = dish => {
    let sets = dish.sets;
    if (!sets || sets.length === 0) {
      const mappedOptions = mapDealOptionsToOptionModel(dish.options);
      sets = mappedOptions.length > 0
        ? [{ id: 'deal_options', name: '', options: mappedOptions }]
        : [];
    }
    return {
      ...dish,
      sets,
      price: firstPositivePrice(
        dish.price,
        dish.offerprice,
        dish.pofferprice,
        dish.delprice,
      ),
      is_img: dish.is_img || dish.url || null,
      ingredientsarray: dish.ingredientsarray || [],
    };
  };

  const tagOfferDish = (dish, offerMeta) => {
    if (!dish || !dish.is_offer) return dish;
    return {
      ...dish,
      isDealDish: true,
      dealOfferMeta: offerMeta || dish.dealOfferMeta || null,
    };
  };

  // Normalizes a dish coming from get-business-dishes into the shape the
  // product grid / cart / option modal expect.
  const normalizeMenuDish = (dish, type, offerMeta) => {
    const keys = PRICE_KEYS[type] || PRICE_KEYS[1];
    const regular = Number(dish[keys.regular]) || Number(dish.delprice) || 0;
    const offer = Number(dish[keys.offer]) || 0;
    const hasOffer = offer > 0 && offer < regular;
    const base = normalizeDealDish(dish); // maps options -> sets, url -> is_img
    return tagOfferDish(
      {
        ...base,
        subcategory: 0,
        price: hasOffer ? offer : regular,
        delprice: regular,
        offerprice: hasOffer ? offer : 0,
      },
      offerMeta,
    );
  };

  const handleDealDishesLoaded = (dishes, offerMeta) => {
    const normalized = (dishes || []).map(dish => ({
      ...normalizeDealDish(dish),
      isDealDish: true,
      dealOfferMeta: offerMeta,
    }));
    setDealOffer({ dishes: normalized, offerMeta: offerMeta || null });
  };

  const handleRedeemedIdsChange = ids => {
    setRedeemedDealIds(ids || []);
  };

  const offerCategory = useMemo(() => {
    if (!dealOffer.dishes || dealOffer.dishes.length === 0) return null;
    return {
      id: OFFER_CATEGORY_ID,
      name: dealOffer.offerMeta?.offer_name || null,
      icon: null,
      isOfferCategory: true,
      dish: dealOffer.dishes,
      subCat: [],
    };
  }, [dealOffer]);

  const displayedCategoryList = useMemo(() => {
    const base = categoryDetails.list || [];
    return offerCategory ? [offerCategory, ...base] : base;
  }, [categoryDetails.list, offerCategory]);

  useEffect(() => {
    if (userSelectedCategoryRef.current) return;
    if (categoryDetails.isLoading) return;
    if (!displayedCategoryList || displayedCategoryList.length === 0) return;

    const firstItem = displayedCategoryList[0];
    setSelectedCategory(prev => (prev === firstItem.id ? prev : firstItem.id));
    setCategoryMenu(prev =>
      prev.list === firstItem ? prev : { isLoading: false, list: firstItem },
    );
    setSelectedSubCategory(null);
  }, [displayedCategoryList, categoryDetails.isLoading]);

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
    if (userData != null && userToken && baseUrl) {
      ActiveBusiness();
    }
  }, [userData, userToken, baseUrl]);

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
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        navigation.navigate('MyOrder_Tab', {
          screen: 'OrderDetailFromNotification',
          params: { orderId: remoteMessage.data.order_id },
        });
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          navigation.navigate('MyOrder_Tab', {
            screen: 'OrderDetailFromNotification',
            params: { orderId: remoteMessage.data.order_id },
          });
        }
      });
  }, []);

  useEffect(() => {
    const sub = SoundPlayer.addEventListener('FinishedPlaying', ({ success }) => {
      if (success && isRingingRef.current) {
        playOrderSound();
      }
    });

    return () => {
      sub.remove();
      stopRinging();
    };
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

  const isRingingRef = useRef(false);

  const playOrderSound = () => {
    try {
      SoundPlayer.playAsset(require('../../assets/sound/orders_up.mp3'));
    } catch (e) {
      console.log('Cannot play sound file', e);
    }
  };

  const SoundPlay = () => {
    isRingingRef.current = true;
    requestAnimationFrame(playOrderSound);
  };

  const stopRinging = () => {
    isRingingRef.current = false;
    try {
      SoundPlayer.stop();
    } catch (e) {
      console.log('Cannot stop sound', e);
    }
  };

  const OpenNewOrderModel = (notification, data) => {
    SoundPlay();
    setNotificationData(notification);
    setOrderData(data);
    setNewOrderModel(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      setCartDish({ isLoading: true, list: cartDetails });
      setcartQuantity(cartQuantity);
    }, [cartDetails, cartQuantity]),
  );

  const ActiveBusiness = () => {
    fetchBusinessMenu(2);
  };

  /* ------------------------------------------------------------------ */
  /*  Menu loading: business info + categories + paginated dishes        */
  /* ------------------------------------------------------------------ */

  // Shared "nothing to show" state.
  const setEmptyMenu = () => {
    setNoActiveMenu(true);
    setNoActiveMenuSignal(prev => prev + 1);
    setCategoryDetails({ isLoading: false, list: [] });
    setCategoryMenu({ isLoading: false, list: null });
    setDishState(prev => ({
      ...prev,
      list: [],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
    }));
  };

  // Categories + subcategories (get-business-categories).
  const fetchCategories = async typeToFetch => {
    const cacheKey = `categories_v2_${userData?.business_id}_${typeToFetch}_${langId}`;

    let hasCache = false;
    try {
      const raw = await getData(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached) && cached.length > 0) {
          hasCache = true;
          setNoActiveMenu(false);
          setCategoryDetails({ isLoading: false, list: cached });
        }
      }
    } catch (e) { }
    if (!hasCache) setCategoryDetails({ isLoading: true, list: [] });

    postWithToken(
      baseUrl,
      'get-business-categories',
      { business_id: userData?.business_id, lang_id: langId, type: typeToFetch },
      userToken,
    )
      .then(res => {
        const list = (res?.data || [])
          .map(c => ({
            id: c.id,
            name: getLocalizedName(c.name, langId),
            icon: c.icon,
            image: c.image,
            rank: c.rank,
            dishCount: c.category_dishes_count,
            subCat: (c.childrenCategories || []).map(sc => ({
              id: sc.id,
              name: getLocalizedName(sc.name, langId),
              icon: sc.icon,
            })),
          }))
          .filter(c => c.dishCount > 0 || c.subCat.length > 0);

        if (res?.status !== true || list.length === 0) {
          setEmptyMenu();
          return;
        }
        setNoActiveMenu(false);
        setCategoryDetails({ isLoading: false, list });
        setData(cacheKey, JSON.stringify(list));
      })
      .catch(e => {
        console.log('Error categories:', e);
        if (!hasCache) setEmptyMenu();
      });
  };

  // Business info + schedule (get-business-info) — no longer used for
  // categories / dishes.
  // Business info + schedule (get-business-info). Started only AFTER the
  // categories and the first products page have loaded (see effect below),
  // so this heavy call doesn't compete with them on the server.
  const fetchBusinessInfo = typeToFetch => {
    const tInfo = Date.now();
    postWithToken(
      baseUrl,
      'get-business-info',
      {
        business_id: userData?.business_id,
        lang_id: langId,
        type: typeToFetch,
      },
      userToken,
    )
      .then(response => {
        console.log('[PERF] get-business-info', Date.now() - tInfo, 'ms');
        setActiveBusiness({
          ...response.business,
          schedule: mergeMenuSchedules(response.menu),
          offer: response.offer || null,
        });
      })
      .catch(error => {
        console.log('Error : ', error);
        setNoActiveMenu(true);
      });
  };

  const fetchBusinessMenu = typeToFetch => {
    userSelectedCategoryRef.current = false;
    dishCache.current = {}; // fresh menu load -> drop cached products
    setOrderType(typeToFetch);
    fetchCategories(typeToFetch);
    fetchBusinessInfo(typeToFetch);
  };

  // Paginated dishes (get-business-dishes). pageToLoad === 1 resets the list.
  const loadDishes = pageToLoad => {
    const categoryId = selected_subcategory ?? selected_category;
    if (!categoryId || categoryId === OFFER_CATEGORY_ID) return;

    const isFirst = pageToLoad === 1;
    const cacheKey = getDishKey();
    const tDish = Date.now();
    const reqId = isFirst ? ++dishRequestId.current : dishRequestId.current;

    setDishState(prev =>
      isFirst
        ? {
          list: [],
          page: 0,
          loaded: 0,
          hasMore: true,
          isLoading: true,
          isLoadingMore: false,
        }
        : { ...prev, isLoadingMore: true },
    );

    postWithToken(
      baseUrl,
      'get-business-dishes',
      {
        business_id: userData?.business_id,
        lang_id: langId,
        type: orderType,
        category_id: categoryId,
        pageNo: pageToLoad,
        perPage: PAGE_SIZE,
      },
      userToken,
    )
      .then(res => {
        console.log('[PERF] get-business-dishes page', pageToLoad, Date.now() - tDish, 'ms');
        const raw = res?.data || [];
        const incoming = raw
          .filter(d => Number(d.menu_status) === 1)
          .map(d => normalizeMenuDish(d, orderType, res.offer));
        const total = Number(res?.total_count) || 0;

        // The cache is the source of truth for what's loaded per category,
        // so it is always updated, even if the user already switched away.
        const prevEntry = isFirst ? null : dishCache.current[cacheKey];
        const loaded = (prevEntry?.loaded || 0) + raw.length;
        const entry = {
          list: [...(prevEntry?.list || []), ...incoming],
          page: pageToLoad,
          loaded,
          hasMore: raw.length >= PAGE_SIZE && (total ? loaded < total : true),
        };
        dishCache.current[cacheKey] = entry;

        if (reqId !== dishRequestId.current) return; // stale for the screen
        setDishState({ ...entry, isLoading: false, isLoadingMore: false });
      })
      .catch(e => {
        console.log('Error dishes:', e);
        if (reqId !== dishRequestId.current) return;
        setDishState(prev => ({
          ...prev,
          isLoading: false,
          isLoadingMore: false,
          hasMore: false,
        }));
      });
  };

  // Reload page 1 whenever the category / subcategory / order type changes.
  useEffect(() => {
    if (!baseUrl || !userToken || !userData) return;
    if (!selected_category) return;
    if (selected_category === OFFER_CATEGORY_ID) {
      dishRequestId.current++;
      setDishState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
      }));
      return;
    }
    // Already loaded before? Restore instantly, no API call.
    const cached = dishCache.current[getDishKey()];
    if (cached) {
      dishRequestId.current++; // ignore any in-flight response for another category
      setDishState({ ...cached, isLoading: false, isLoadingMore: false });
      return;
    }
    loadDishes(1);
  }, [selected_category, selected_subcategory, orderType]);



  // Load the next page when the user scrolls near the end of the grid.
  const onEndReached = () => {
    if (search_status || category_menu.list?.isOfferCategory) return;
    if (dishState.isLoading || dishState.isLoadingMore || !dishState.hasMore) {
      return;
    }
    loadDishes(dishState.page + 1);
  };

  const openProduct = (cat_id, cat, cat_index) => {
    userSelectedCategoryRef.current = true;
    subCatLayouts.current = {};
    subCatScrollX.current = 0;
    setSelectedCategory(cat_id);
    setCategoryMenu({ isLoading: false, list: cat });
    setSelectedSubCategory(null);
    if (cat && Array.isArray(cat.subCat) && cat.subCat.length > 0) {
      scrollToProducts();
    }
  };

  const productDetails = item => {
    if (item.sets && item.sets.length > 0) {
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
    let itemDish = JSON.stringify(item);
    let dataItem = {
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
    if (!activeBusiness) {
      showToastMsg('Loading, please wait...');
      return;
    }
    if (item.isDealDish) {
      setPendingOfferDish(item);
    }

    if (item.sets !== undefined && Array.isArray(item.sets)) {
      if (item.sets.length > 0) {
        for (let i = 0; i < item.sets.length; i++) {
          const options = item.sets[i]?.options;
          if (!Array.isArray(options)) continue;
          for (let j = 0; j < options.length; j++) {
            const choices = options[j]?.choice;
            if (!Array.isArray(choices)) continue;
            for (let k = 0; k < choices.length; k++) {
              choices[k].qty = 1;
              choices[k].checked = false;
            }
          }
        }
      }
    }

    let itemDish = JSON.stringify(item);
    let dataItem = {
      dish: JSON.parse(itemDish),
      CartDish: cartDetails,
      type: 0,
    };

    setOptionItem(dataItem);
    setoptionModelAdd(true);
  };

  const addDishToCartArray = (cart, dishItem) => {
    if (dishItem.sets !== undefined && dishItem.sets.length > 0) {
      for (let i = 0; i < dishItem.sets.length; i++) {
        const options = dishItem.sets[i]?.options;
        if (!Array.isArray(options)) continue;
        for (let j = 0; j < options.length; j++) {
          const choices = options[j]?.choice;
          if (options[j].show === true) {
            if (Number(options[j].type) === 1) {
              let min = 0;
              if (Array.isArray(choices)) {
                for (let k = 0; k < choices.length; k++) {
                  if (choices[k].checked === true) min++;
                }
              }
              if (Number(options[j].required) === 1 && min === 0) {
                Alert.alert('Warning!', options[j].name + ' is required');
                return false;
              } else if (min < options[j].min) {
                Alert.alert(
                  'Warning!',
                  options[j].name + ' minimum choice is ' + options[j].min,
                );
                return false;
              }
            } else if (
              Number(options[j].required) === 1 &&
              Number(options[j].type) === 0
            ) {
              let min = 0;
              if (Array.isArray(choices)) {
                for (let k = 0; k < choices.length; k++) {
                  if (choices[k].checked === true) min++;
                }
              }
              if (min === 0) {
                Alert.alert('Warning!', options[j].name + ' is required ');
                return false;
              }
            }
          }
        }
      }
    }

    let dishTotal = dishItem.price;
    let business = {
      id: activeBusiness.id,
      details: activeBusiness,
      dish: new Array(),
    };
    let dish = { id: dishItem.id, quantity: 1, data: new Array() };
    let activeIngredients = new Array();
    for (const ingre of dishItem.ingredientsarray || []) {
      activeIngredients.push(ingre);
    }

    let data = {
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
      relation: { options: new Array(), choices: new Array() },
      isDealDish: dishItem.isDealDish || false,
      dealOfferMeta: dishItem.dealOfferMeta || null,
      isFreeReward: dishItem.isFreeReward || false,
      offerBadge: dishItem.offerBadge || null,
      // BOGO: carry the group id through if this dish was tagged as a
      // BOGO main/companion before being added (see handleFreeItemChosen
      // and any options-first flow that mints bogo_group_id up front).
      // The rest start empty — is_bogo_free/price are only ever decided
      // by syncBogoPricingInCart, never set directly here.
      ...emptyBogoFields(),
      bogo_group_id: dishItem.bogo_group_id || null,
      is_bogo_main: dishItem.is_bogo_main || false,
    };

    let optionsarray = new Array();
    let choicesarray = new Array();
    if (dishItem.sets !== undefined && dishItem.sets.length > 0) {
      for (let i = 0; i < dishItem.sets.length; i++) {
        const rawOptions = dishItem.sets[i]?.options;
        if (!Array.isArray(rawOptions)) continue;
        for (let j = 0; j < rawOptions.length; j++) {
          let options = {
            id: rawOptions[j].id,
            name: rawOptions[j].name,
            choice: new Array(),
          };
          const choices = rawOptions[j]?.choice;
          if (Array.isArray(choices)) {
            for (let k = 0; k < choices.length; k++) {
              if (choices[k].checked === true) {
                let choice = {
                  id: choices[k].id,
                  name: choices[k].name,
                  price: choices[k].price,
                };
                choicesarray.push(choice.id);
                options.choice.push(choice);
              }
            }
          }
          if (options.choice.length > 0) {
            optionsarray.push(options.id);
            data.sets.push(options);
          }
        }
      }
    }
    if (data.sets.length > 0) {
      data.relation = { options: optionsarray, choices: choicesarray };
    }

    let newCart = JSON.parse(JSON.stringify(cart));
    let parent_index = CheckBusinessAddtoCart(activeBusiness.id, newCart);
    if (parent_index === -1) newCart.push(business);
    parent_index = CheckBusinessAddtoCart(activeBusiness.id, newCart);

    let index = CheckAddtoCart(data.id, parent_index, newCart);

    if (index === -1) {
      dish.data.push(data);
      newCart[parent_index].dish.push(dish);
    } else {
      newCart[parent_index].dish[index].quantity =
        parseInt(newCart[parent_index].dish[index].quantity, 10) + 1;

      if (data.sets.length === 0 && data.activeIngredients.length === 0) {
        let index_data = CheckData(
          newCart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          newCart[parent_index].dish[index].data.push(data);
        } else {
          const d = newCart[parent_index].dish[index].data[index_data];
          d.notes = dishItem.notes;
          d.quantity = parseInt(d.quantity, 10) + 1;
          d.total = (
            parseFloat(d.totalprice) * parseInt(d.quantity, 10)
          ).toFixed(2);
        }
      } else if (
        data.sets.length === 0 &&
        data.activeIngredients.length !== 0
      ) {
        let index_data = CheckDataIngreExist(
          newCart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          newCart[parent_index].dish[index].data.push(data);
        } else {
          const d = newCart[parent_index].dish[index].data[index_data];
          d.notes = dishItem.notes;
          d.quantity = parseInt(d.quantity, 10) + 1;
          d.total = (
            parseFloat(d.totalprice) * parseInt(d.quantity, 10)
          ).toFixed(2);
        }
      } else if (
        data.sets.length !== 0 &&
        data.activeIngredients.length === 0
      ) {
        let index_data = CheckDataSetExist(
          newCart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          newCart[parent_index].dish[index].data.push(data);
        } else {
          const d = newCart[parent_index].dish[index].data[index_data];
          d.notes = dishItem.notes;
          d.quantity = parseInt(d.quantity, 10) + 1;
          d.total = (
            parseFloat(d.totalprice) * parseInt(d.quantity, 10)
          ).toFixed(2);
        }
      } else {
        let index_data = CheckDataIngreSetsExist(
          newCart[parent_index].dish[index].data,
          data,
        );
        if (index_data === -1) {
          newCart[parent_index].dish[index].data.push(data);
        } else {
          const d = newCart[parent_index].dish[index].data[index_data];
          d.notes = dishItem.notes;
          d.quantity = parseInt(d.quantity, 10) + 1;
          d.total = (
            parseFloat(d.totalprice) * parseInt(d.quantity, 10)
          ).toFixed(2);
        }
      }
    }

    return newCart;
  };

  const commitCart = cart => {
    if (cart.length > 0) {
      setCartDish({ isLoading: false, list: cart });
      dispatch(setCartDetails(cart));
      setData('cartDetails', JSON.stringify(cart));
      showToastMsg('Item added successfully.');
      let cartQty = 0;
      for (const cartDish of cart) {
        for (const dish of cartDish.dish) cartQty += dish.quantity;
      }
      setcartQuantity(cartQty);
      dispatch(setCartQuantity(cartQty));
    } else {
      setCartQuantity(0);
      setData('cartDetails', JSON.stringify([]));
    }
  };

  const addToCart = dishItem => {
    if (!activeBusiness) {
      showToastMsg('Loading, please wait...');
      return false;
    }
    const cart = JSON.parse(JSON.stringify(CartDish.list || []));
    const result = addDishToCartArray(cart, dishItem);
    if (result === false) return false;
    commitCart(result);
  };

  const CheckBusinessAddtoCart = (d, cDish) => {
    let b = cDish;
    if (b === undefined) return -1;
    for (let c = 0; c < b.length; c++) {
      if (b[c].id === d) return c;
    }
    return -1;
  };

  const CheckAddtoCart = (d, index, cDish) => {
    let b;
    if (cDish[index]) {
      b = cDish[index].dish;
      for (let c = 0; c < b.length; c++) {
        if (b[c].id === d) return c;
      }
    }
    return -1;
  };

  const CheckData = (cartdata, data) => {
    if (data.sets.length === 0) {
      for (let i = 0; i < cartdata.length; i++) {
        // BOGO guard: never merge a BOGO row into a pre-existing plain
        // row, and never merge two independent BOGO rounds together —
        // only merge when both sides share the same bogo_group_id
        // (including both being null, i.e. two ordinary lines).
        if (cartdata[i].sets.length === 0 && sameBogoGroup(cartdata[i], data)) {
          return i;
        }
      }
      return -1;
    }
  };

  const CheckDataSetExist = (cartdata, data) => {
    for (let i = 0; i < cartdata.length; i++) {
      if (cartdata[i].relation && sameBogoGroup(cartdata[i], data)) {
        let arrayDiffoptions = arrayDiff(
          cartdata[i].relation.options,
          data.relation.options,
        );
        let arrayDiffchoice = arrayDiff(
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
      if (!sameBogoGroup(cartdata[i], data)) continue;
      let arrayDiffIngre = arrayDiff(
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
      if (!sameBogoGroup(cartdata[i], data)) continue;
      if (cartdata[i].relation) {
        let arrayDiffoptions = arrayDiff(
          cartdata[i].relation.options,
          data.relation.options,
        );
        let arrayDiffchoice = arrayDiff(
          cartdata[i].relation.choices,
          data.relation.choices,
        );
        let arrayDiffIngre = arrayDiff(
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
        let arrayDiffIngre = arrayDiff(
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

  // Quantity per dish id, computed once per cart change instead of
  // looping the whole cart for every product card on every render.
  const cartQtyMap = useMemo(() => {
    const map = {};
    for (const business of CartDish.list || []) {
      for (const d of business.dish) {
        map[d.id] = (map[d.id] || 0) + Number(d.quantity);
      }
    }
    return map;
  }, [CartDish.list]);

  const getCartQtyForDish = dishId => cartQtyMap[dishId] || 0;

  const incrementProductQty = dish => {
    addToCart(dish);
  };

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
      const dataIndex = dataArr.length - 1;
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

  const handleIncrementTap = dish => {
    const hasSets = dish.sets && dish.sets.length > 0;

    if (hasSets) {
      // Dish has options -> always open the options modal so the user
      // can choose options again (works for deal and non-deal dishes).
      // For deal dishes, productDetailsItem sets pendingOfferDish, and
      // handleOptionModalAdded reopens the companion picker afterwards.
      productDetailsItem(dish);
    } else if (dish.isDealDish) {
      // No options on the deal dish itself — add straight to cart,
      // then open the companion picker directly.
      incrementProductQty(dish);
      offerSectionRef.current?.openFreeItemModal(dish);
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

  const handleQtyBadgeTap = dish => {
    setExpandedQtyDishId(prev => ({ ...prev, [dish.id]: true }));
    startQtyCollapseTimer(dish.id);
  };

  const handleOptionModalAdded = dishId => {
    setExpandedQtyDishId(prev => ({ ...prev, [dishId]: true }));
    startQtyCollapseTimer(dishId);

    if (pendingOfferDish && pendingOfferDish.id === dishId) {
      offerSectionRef.current?.openFreeItemModal(pendingOfferDish);
      setPendingOfferDish(null);
    }
  };

  // ---- Stable handlers so memoized ProductCards don't re-render needlessly.
  // handlersRef always points at the latest handler versions, while the
  // useCallback wrappers below keep the same identity between renders.
  const handlersRef = useRef({});
  handlersRef.current = {
    handleIncrementTap,
    handleDecrementTap,
    handleQtyBadgeTap,
    productDetailsItem,
    productDetails,
  };
  const onIncrement = useCallback(
    d => handlersRef.current.handleIncrementTap(d),
    [],
  );
  const onDecrement = useCallback(
    d => handlersRef.current.handleDecrementTap(d),
    [],
  );
  const onBadgeTap = useCallback(
    d => handlersRef.current.handleQtyBadgeTap(d),
    [],
  );
  const onOpen = useCallback(
    d => handlersRef.current.productDetailsItem(d),
    [],
  );
  const onQuickAdd = useCallback(d => {
    const h = handlersRef.current;
    const hasSets = d.sets && d.sets.length > 0;
    if (d.isDealDish && hasSets) {
      // Deal dish with its own options — open its options modal;
      // handleOptionModalAdded reopens the companion picker afterwards.
      h.productDetailsItem(d);
    } else if (!d.isDealDish && hasSets) {
      // Regular (non-deal) dish with options.
      h.productDetails(d);
    } else {
      // No options — add directly (deal dishes also open companion picker).
      h.handleIncrementTap(d);
    }
  }, []);

  const renderItem = useCallback(
    ({ item: dish, index }) => (
      <ProductCard
        dish={dish}
        index={index}
        columns={columns}
        qtyInCart={cartQtyMap[dish.id] || 0}
        isQtyExpanded={expandedQtyDishId[dish.id] === true}
        currencySymbol={activeBusiness?.currency_symbol}
        styles={styles}
        theme={theme}
        t={t}
        onOpen={onOpen}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onBadgeTap={onBadgeTap}
        onQuickAdd={onQuickAdd}
      />
    ),
    [
      columns,
      cartQtyMap,
      expandedQtyDishId,
      activeBusiness?.currency_symbol,
      styles,
      theme,
      t,
    ],
  );

  // BOGO: replaces the old applyOfferDiscountToCartArray /
  // getCartDishUnitPriceFromArray pair. Instead of guessing up front
  // which of the two dishes is cheaper and hard-coding that one as the
  // discounted line, we now:
  //   1. tag the offer dish's existing line + every newly-added
  //      companion line with a shared bogo_group_id, then
  //   2. let syncBogoPricingInCart — the SAME single source of truth
  //      used everywhere else BOGO pricing is decided — pick whichever
  //      line actually has the lowest list price and discount only that
  //      one. This also means picking a second, cheaper companion (when
  //      maximum_item_select > 1) re-evaluates the winner correctly
  //      instead of leaving a stale discount on the wrong line.
  const handleFreeItemChosen = (offerDish, selections, offerMeta) => {
    if (!activeBusiness || !selections || selections.length === 0) return;

    let cart = JSON.parse(JSON.stringify(CartDish.list || []));
    const discount = Number(offerMeta?.discount ?? 0);
    const bogoGroupId = `bogo-${offerDish.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    // Tag the offer dish's most-recently-added line as this group's main.
    cart = tagLastDataEntryForDish(cart, activeBusiness.id, offerDish.id, {
      bogo_group_id: bogoGroupId,
      is_bogo_main: true,
    });

    // Add every chosen companion as a brand-new row, tagged into the
    // same group. addDishToCartArray/CheckData* only merge rows that
    // share a bogo_group_id (see sameBogoGroup), so this always creates
    // fresh lines rather than bumping qty on an unrelated existing row.
    selections.forEach(({ dish: freeDish, quantity }) => {
      const normalizedFreeDish = normalizeDealDish(freeDish);
      const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
      const listPrice = Number(
        freeDish.offerprice ?? freeDish.delprice ?? freeDish.price ?? 0,
      );
      const payload = {
        ...normalizedFreeDish,
        price: listPrice,
        delprice: listPrice,
        isDealDish: true,
        bogo_group_id: bogoGroupId,
      };
      for (let i = 0; i < qtyToAdd; i++) {
        const result = addDishToCartArray(cart, payload);
        if (result !== false) cart = result;
      }
    });

    // Single source of truth decides who actually gets the discount.
    cart = syncBogoPricingInCart(
      cart,
      bogoGroupId,
      discount,
      offerMeta?.offer_name,
    );

    commitCart(cart);
  };

  // Companion dish HAS real options, so instead of adding it
  // directly (like handleFreeItemChosen does for option-less companions),
  // we tag the main line now, stash what syncBogoPricingInCart will need
  // once the companion actually lands in the cart, and open OptionModelAdd
  // for the companion. The companion's own cart line gets created by
  // OptionModelAdd.addToCart (it already carries bogo_group_id through —
  // see emptyBogoFields() usage there); updateCartDetailsFromChild runs
  // the pricing sync the instant that line comes back.
  const handleConfigureFreeDish = (offerDish, freeDish, offerMeta) => {
    if (!activeBusiness || !offerDish || !freeDish) return;

    let cart = JSON.parse(JSON.stringify(CartDish.list || []));
    const bogoGroupId = `bogo-${offerDish.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    cart = tagLastDataEntryForDish(cart, activeBusiness.id, offerDish.id, {
      bogo_group_id: bogoGroupId,
      is_bogo_main: true,
    });
    updateCartDetailsFromChild(cart);

    pendingBogoCompanionRef.current = {
      groupId: bogoGroupId,
      discount: Number(offerMeta?.discount ?? 0),
      offerName: offerMeta?.offer_name,
    };

    const normalizedFreeDish = normalizeDealDish(freeDish);
    const listPrice = Number(
      freeDish.offerprice ?? freeDish.delprice ?? freeDish.price ?? 0,
    );

    setOptionItem({
      dish: {
        ...normalizedFreeDish,
        price: listPrice,
        delprice: listPrice,
        isDealDish: true,
        bogo_group_id: bogoGroupId,
        is_bogo_main: false,
      },
      CartDish: cart,
      type: 0,
    });
    setoptionModelAdd(true);
  };

  const arrayDiff = (arr1, arr2) => {
    let diff = { arr1: '', arr2: '', concat: '' };
    diff.arr1 = arr1.filter(v => arr2.indexOf(v) === -1);
    diff.arr2 = arr2.filter(v => arr1.indexOf(v) === -1);
    diff.concat = diff.arr1.concat(diff.arr2);
    return diff;
  };

  // If a BOGO companion configuration is pending (see
  // handleConfigureFreeDish above), run the single-source-of-truth
  // pricing sync on the incoming cart before committing it, using the
  // freshly-built cart array itself rather than reading back from
  // React/Redux state (which could still be stale at this exact point).
  const updateCartDetailsFromChild = cart => {
    if (pendingBogoCompanionRef.current) {
      const { groupId, discount, offerName } = pendingBogoCompanionRef.current;
      pendingBogoCompanionRef.current = null;
      cart = syncBogoPricingInCart(cart, groupId, discount, offerName);
    }
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

  const [visiblemodal, setvisiblemodal] = useState(false);
  const [cashDrawerLoading, setCashDrawerLoading] = useState(false);

  const printer_model_close = () => {
    setvisiblemodal(false);
  };

  const OpenCashDrawer = async () => {
    if (cashDrawerLoading) return;
    setCashDrawerLoading(true);
    try {
      if (!EbPrinter || typeof EbPrinter.openCashBox !== 'function') {
        throw new Error('Printer module unavailable.');
      }
      EbPrinter.selectUsbPrinter(0, UsbPrinter);
      EbPrinter.openCashBox(0);
    } catch (e) {
      console.log('Error opening cash drawer:', e);
      Alert.alert(
        t('CASH_DRAWER_ERROR') || 'Cash Drawer Error',
        (e && e.message) || 'Unable to open the cash drawer.',
      );
    } finally {
      setCashDrawerLoading(false);
    }
  };

  const handleCashDrawerPress = () => {
    if (UsbPrinter == null) {
      setvisiblemodal(true);
    } else {
      OpenCashDrawer();
    }
  };

  const [search_status, setSearchStatus] = useState(false);
  const hasSubCategories = category_menu.list != null && category_menu.list.subCat && category_menu.list.subCat.length > 0;
  const mainScrollRef = useRef(null);
  // NOTE: now stores the height of the FlatList header (everything above
  // the product grid), i.e. the Y offset where products start.
  const productSectionY = useRef(0);
  const scrollViewHeight = useRef(0);
  const scrollOffsetY = useRef(0);
  const contentHeight = useRef(0);
  const scrollToProducts = () => {
    if (!mainScrollRef.current) return;

    const targetY = Math.max(productSectionY.current - responsiveHeight(1), 0);
    const viewportTop = scrollOffsetY.current;
    const viewportBottom = scrollOffsetY.current + scrollViewHeight.current;

    // Case 1: everything fits on screen already — nothing to scroll to.
    if (contentHeight.current <= scrollViewHeight.current) return;

    // Case 2: the target section is already visible within the current viewport — no need to scroll.
    if (targetY >= viewportTop && targetY <= viewportBottom) return;

    mainScrollRef.current.scrollToOffset({ offset: targetY, animated: true });
  };
  const subCatScrollRef = useRef(null);
  const subCatLayouts = useRef({});        // { [key]: { x, width } }
  const subCatViewportWidth = useRef(0);
  const subCatContentWidth = useRef(0);
  const subCatScrollX = useRef(0);
  const SUBCAT_EDGE_PAD = 60;

  const scrollSubCatIntoView = key => {
    const layout = subCatLayouts.current[key];
    const vw = subCatViewportWidth.current;
    if (!layout || !subCatScrollRef.current || !vw) return;

    const x = subCatScrollX.current;
    const nearRight = layout.x + layout.width > x + vw - SUBCAT_EDGE_PAD;
    const nearLeft = layout.x < x + SUBCAT_EDGE_PAD;
    if (!nearLeft && !nearRight) return; // pill is comfortably visible

    const maxX = Math.max(subCatContentWidth.current - vw, 0);
    // Center the tapped pill so the next/previous pills show on both sides
    const targetX = Math.min(
      Math.max(layout.x - (vw - layout.width) / 2, 0),
      maxX,
    );
    subCatScrollRef.current.scrollTo({ x: targetX, animated: true });
  };

  const handleSubCategoryPress = id => {
    setSelectedSubCategory(id);
    scrollSubCatIntoView(id === null ? 'all' : id);
  };

  const [searchText, setSearchText] = useState('');
  const searchTimer = useRef(null);

  const onSearchChange = text => {
    setSearchText(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => search_category(text), 250);
  };

  const clearSearch = () => {
    clearTimeout(searchTimer.current);
    setSearchText('');
    setSearchStatus(false);
    setCategoryMenuSearch({ isLoading: false, list: [] });
    Keyboard.dismiss();
  };

  // Back to the initial page: no search, "All" subcategory, scrolled to top
  const resetToInitial = () => {
    clearSearch();
    setSelectedSubCategory(null);
    subCatScrollRef.current?.scrollTo({ x: 0, animated: false });
    mainScrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  const resetToInitialRef = useRef(resetToInitial);
  resetToInitialRef.current = resetToInitial;

  // Tapping the "Create Order" tab while already on it
  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) return;
    const unsubscribe = parent.addListener('tabPress', e => {
      if (String(e.target || '').startsWith('Home') && navigation.isFocused()) {
        resetToInitialRef.current();
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Leaving this tab (e.g. to My Order) and coming back
  useFocusEffect(
    React.useCallback(() => {
      return () => clearSearch();
    }, []),
  );



  // NOTE: search covers the dishes loaded so far (lazy loading) plus deal dishes.
  function search_category(val) {
    if (val != '') {
      const searchPool = [
        ...(dishListRef.current || []),
        ...(dealOffer.dishes || []),
      ];
      const items_one = searchPool.filter(
        item => item.name.toLowerCase().indexOf(val.toLowerCase()) !== -1,
      );
      setSearchStatus(true);
      setCategoryMenuSearch({ isLoading: false, list: items_one });
    } else {
      setSearchStatus(false);
      setCategoryMenuSearch({ isLoading: false, list: [] });
    }
  }

  const renderProductSkeletons = () => (
    <View style={styles.productGrid}>
      {Array.from({ length: 8 }).map((_, index) => {
        const isLastInRow = index % columns === columns - 1;
        return (
          <View
            key={'skeleton_lo_v' + index}
            style={[
              styles.productCard,
              isLastInRow && styles.productCardLastInRow,
            ]}
          >
            <ProductCardSkeleton key={'skeleton_lo_1' + index} />
          </View>
        );
      })}
    </View>
  );

  // Dishes for the selected category/subcategory. Offer category uses the
  // deal dishes; everything else comes from the lazy-loaded dishState.
  const currentDishes = useMemo(() => {
    if (category_menu.isLoading || category_menu.list == null) return [];
    if (category_menu.list.isOfferCategory) {
      return category_menu.list.dish || [];
    }
    return dishState.list;
  }, [category_menu, dishState.list]);

  const searchDishes = useMemo(
    () =>
      (category_menu_search.list || []).filter(
        d => d.subcategory == 0 || d.isDealDish,
      ),
    [category_menu_search.list],
  );

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
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : null}

      {visiblemodal === true && (
        <SelectUsbPrinter printer_model_close={printer_model_close} />
      )}

      <View style={styles.main}>
        <View style={styles.inner_left}>
          {/* ---------- search row --------*/}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather
                name="search"
                size={responsiveFontSize(1.5)}
                color={theme.fontColorOnBackground}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={'Search for products...'}
                placeholderTextColor={theme.fontColorOnBackground}
                value={searchText}
                onChangeText={onSearchChange}
              />
              <TouchableOpacity style={styles.searchSortBtn}>
                <Feather
                  name="sliders"
                  size={responsiveFontSize(1.5)}
                  color={theme.fontColorOnBackground}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------- virtualized product list (header + grid) ---------- */}
          <FlatList
            key={`grid-${columns}`}
            ref={mainScrollRef}
            data={search_status ? searchDishes : currentDishes}
            renderItem={renderItem}
            keyExtractor={(d, i) => `${d.id}_${i}`}
            numColumns={columns}
            columnWrapperStyle={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}
            ListHeaderComponent={
              search_status ? null : (
                <View
                  onLayout={e => {
                    productSectionY.current = e.nativeEvent.layout.height;
                  }}
                >
                  <OfferDealSection
                    ref={offerSectionRef}
                    activeBusiness={activeBusiness}
                    orderType={orderType}
                    onDealDishesLoaded={handleDealDishesLoaded}
                    onRedeemedIdsChange={handleRedeemedIdsChange}
                    onFreeItemChosen={handleFreeItemChosen}
                    onConfigureFreeDish={handleConfigureFreeDish}
                  />

                  {/* ---------- open cash drawer button ---------- */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.primary,
                      borderRadius: 8,
                      paddingVertical: responsiveHeight(1.3),
                      marginBottom: responsiveHeight(2.2),
                      opacity: cashDrawerLoading ? 0.6 : 1,
                    }}
                    disabled={cashDrawerLoading}
                    onPress={handleCashDrawerPress}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={responsiveFontSize(1.6)}
                      color={theme.fontColor}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontFamily: Inter.semibold,
                        fontSize: responsiveFontSize(1.4),
                        color: theme.fontColor,
                      }}
                    >
                      {cashDrawerLoading
                        ? t('OPENING')
                        : t('OPEN_CASH_DRAWER')}
                    </Text>
                  </TouchableOpacity>

                  {/* ---------- category grid ---------- */}
                  <View style={styles.categoryRow}>
                    {categoryDetails.isLoading === true ? (
                      <CategoryRowSkeleton count={12} />
                    ) : (
                      displayedCategoryList.map((item, index) => {
                        const isSelected = selected_category == item.id;
                        const isLastInRow = index % 4 === 3;
                        return (
                          <TouchableOpacity
                            key={'cat_' + index}
                            onPress={() => openProduct(item.id, item, index)}
                            style={[
                              styles.categoryPill,
                              isLastInRow && styles.categoryPillLastInRow,
                              isSelected && styles.categoryPillSelected,
                              !item.icon && styles.categoryPillNoImage,
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
                            <View
                              style={[
                                styles.categoryPillTextWrap,
                                !item.icon &&
                                styles.categoryPillTextWrapCentered,
                              ]}
                            >
                              <Text
                                numberOfLines={2}
                                style={[
                                  styles.categoryPillText,
                                  isSelected && styles.categoryPillTextSelected,
                                  !item.icon && styles.categoryPillTextCentered,
                                ]}
                              >
                                {item.isOfferCategory
                                  ? item.name ||
                                  t('SPECIAL_OFFER') ||
                                  'Special Offer'
                                  : item.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>

                  {/* ---------- subcategory pills ---------- */}
                  {category_menu.isLoading === true ? (
                    <View style={styles.subCategoryRow}>
                      <SubCategoryRowSkeleton count={4} />
                    </View>
                  ) : category_menu.list != null &&
                    category_menu.list.subCat &&
                    category_menu.list.subCat.length > 0 ? (
                    <View style={styles.subCategoryRow}>
                      <ScrollView
                        key={'subcat_scroll_' + selected_category}
                        ref={subCatScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                        contentContainerStyle={{
                          paddingRight: responsiveWidth(3),
                        }}
                        sscrollEventThrottle={16}
                        onScroll={e => {
                          subCatScrollX.current = e.nativeEvent.contentOffset.x;
                        }}
                        onLayout={e => {
                          subCatViewportWidth.current = e.nativeEvent.layout.width;
                        }}
                        onContentSizeChange={w => {
                          subCatContentWidth.current = w;
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.subCategoryPill,
                            selected_subcategory === null && styles.subCategoryPillSelected,
                          ]}
                          onLayout={e => {
                            const { x, width } = e.nativeEvent.layout;
                            subCatLayouts.current['all'] = { x, width };
                          }}
                          onPress={() => handleSubCategoryPress(null)}
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
                        {category_menu.list.subCat.map(
                          (subCatItem, subCatIndex) => {
                            const isSelected =
                              selected_subcategory === subCatItem.id;
                            return (
                              <TouchableOpacity
                                key={'subcat_' + subCatIndex}
                                style={[
                                  styles.subCategoryPill,
                                  isSelected && styles.subCategoryPillSelected,
                                ]}
                                onLayout={e => {
                                  const { x, width } = e.nativeEvent.layout;
                                  subCatLayouts.current[subCatItem.id] = { x, width };
                                }}
                                onPress={() => handleSubCategoryPress(subCatItem.id)}
                              >
                                <Text
                                  numberOfLines={1}
                                  style={[
                                    styles.subCategoryPillText,
                                    isSelected &&
                                    styles.subCategoryPillTextSelected,
                                  ]}
                                >
                                  {subCatItem.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          },
                        )}
                      </ScrollView>
                    </View>
                  ) : null}

                  {/* ---------- divider ---------- */}
                  <View
                    style={{
                      paddingTop: hasSubCategories
                        ? responsiveHeight(1.6)
                        : responsiveHeight(1),
                      paddingBottom: responsiveHeight(1.6),
                    }}
                  >
                    <View
                      style={{
                        height: 1.2,
                        backgroundColor: '#D9D6ED',
                        width: '100%',
                      }}
                    />
                  </View>
                </View>
              )
            }
            ListEmptyComponent={
              categoryDetails.isLoading || dishState.isLoading ? (
                renderProductSkeletons()
              ) : (
                <Text style={styles.noRecordText}>{t('NO_RECORD_FOUND')}</Text>
              )
            }
            ListFooterComponent={
              dishState.isLoadingMore ? (
                <ActivityIndicator
                  style={{ paddingVertical: responsiveHeight(2) }}
                  color={theme.primary}
                />
              ) : null
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            initialNumToRender={columns * 3}
            maxToRenderPerBatch={columns * 2}
            updateCellsBatchingPeriod={50}
            windowSize={5}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onLayout={e => {
              scrollViewHeight.current = e.nativeEvent.layout.height;
            }}
            onContentSizeChange={(w, h) => {
              contentHeight.current = h;
            }}
            onScroll={e => {
              scrollOffsetY.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          />
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
                <Ionicons
                  name="cart-outline"
                  size={responsiveFontSize(4)}
                  color={theme.primary}
                />
              </View>
              <Text style={styles.cartEmptyTitle}>
                {t('NO_PRODUCTS_IN_YOUR_CART')}
              </Text>
              <Text style={styles.cartEmptySubtitle}>
                {t('ADD_ITEMS_FROM_THE_MENU_TO_GET_STARTTED')}!
              </Text>
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
            stopRinging();
          }}
        >
          <View style={styles.upload_modal_main}>
            <View style={styles.upload_modal_inner_modalView}>
              <View
                style={[
                  styles.upload_modal_view,
                  {
                    flexDirection: 'column',
                    display: 'flex',
                    position: 'relative',
                    overflow: 'visible',
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setNewOrderModel(false);
                    stopRinging();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: -14,
                    zIndex: 10,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: theme.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 4,
                  }}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={theme.fontColorOnBackground}
                    style={{
                      width: 20,
                      height: 20,
                      lineHeight: 20,
                      textAlign: 'center',
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                  />
                </TouchableOpacity>
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
                      color: theme.fontColorOnBackground,
                    }}
                  >
                    {t('RECEIVED_A_NEW_ORDER')}!
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(1.3),
                      color: theme.fontColorOnBackground,
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
                      #{order_data != null ? order_data.order_no : null}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(1.5),
                      color: theme.fontColorOnBackground,
                    }}
                  >
                    {order_data != null ? order_data.order_type : null}
                  </Text>

                  <TouchableOpacity
                    onPress={async () => {
                      setNewOrderModel(false);
                      stopRinging();
                      const orderId =
                        order_data != null ? order_data.order_id : null;
                      if (!orderId) {
                        Alert.alert(
                          'Error',
                          'No order ID found in notification data.',
                        );
                        return;
                      }
                      navigation.navigate('MyOrder_Tab', {
                        screen: 'OrderDetailFromNotification',
                        params: { orderId },
                      });
                    }}
                    style={{
                      ...styles.button_sty,
                      backgroundColor: theme.primary,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.button_txt,
                        color: theme.fontColor,
                      }}
                    >
                      {t('OK')}
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
          setoptionModelAdd={v => {
            if (!v) pendingBogoCompanionRef.current = null;
            setoptionModelAdd(v);
          }}
          cartQty={cartQuantity}
          updateCartDetails={updateCartDetailsFromChild}
          onAdded={handleOptionModalAdded}
        />
      ) : null}
    </Container>
  );
};

export default Home;