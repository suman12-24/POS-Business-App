import React, { useEffect, useState, useRef } from 'react';
import { Text, View, BackHandler, Dimensions, TextInput, ScrollView, Image, TouchableOpacity, Alert, Platform, Modal, FlatList, useColorScheme, Keyboard, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Styles from './Styles';
import { Colors } from '../../../Constants/Colors';
import { Images } from '../../Constants/ImageIconContant';
import { responsiveHeight, responsiveWidth, responsiveFontSize, } from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import { setCartDetails, setCartQuantity, } from '../../../Store/Reducers/CommonReducer';
import { showToastMsg, getData, setData } from '../../../Service/localStorage';
import { postWithOutToken, postWithToken } from '../../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import { Container, Icon, AppTextInput, AppButton, RadioButton, CheckBox, } from 'react-native-basic-elements';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Menu } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import useTranslation from '../../../Hooks/useTranslation';
import SkeletonItem from './SkeletonItem';
import { EmptyCartSkeleton, } from '../../Component/ProductCardSkeleton';
import useOrderTypes from '../../../Hooks/useOrderTypes';
import { useAppTheme } from '../../../Hooks/useAppTheme';
import EbPrinter from 'react-native-ebprinter';

const SERVICE_TYPE_META = {
  delivery: { sub: 'We deliver to you', icon: 'bicycle-outline' },
  pickup: { sub: 'Pick up your order', icon: 'bag-handle-outline' },
  'dine-in': { sub: 'Enjoy in our restaurant', icon: 'restaurant-outline' },
  catering: { sub: 'We bring it to your car', icon: 'storefront-outline' },
  'catering-delivery': { sub: 'Delivered for your event', icon: 'car-outline' },
};
const GOOGLE_PLACES_API_KEY = 'AIzaSyBNp8VGcaCxcHqGrlwbLfsgeyPFkUgU67Y';

const NOTES_MAX_LENGTH = 250;
const DISCOUNT_MIN_SUBTOTAL = 100;
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const kmToMiles = km => km * 0.621371;

const isPointInZone = (lat, lng, zonePoints) => {
  let inside = false;
  for (let i = 0, j = zonePoints.length - 1; i < zonePoints.length; j = i++) {
    const xi = parseFloat(zonePoints[i].longitud);
    const yi = parseFloat(zonePoints[i].latitud);
    const xj = parseFloat(zonePoints[j].longitud);
    const yj = parseFloat(zonePoints[j].latitud);

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const CheckoutSkeleton = ({ styles }) => {
  return (
    <View style={styles.skeletonOverlay}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: responsiveWidth(3) }}>
        {/* Name Fields Row / Inputs */}
        {[1, 2].map(i => (
          <View key={'sk_name_' + i} style={{ marginBottom: responsiveHeight(1.8) }}>
            <SkeletonItem width={responsiveWidth(22)} height={responsiveHeight(1.6)} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonItem width="100%" height={responsiveHeight(5)} borderRadius={8} />
          </View>
        ))}
        {/* Contact Fields */}
        {[1, 2].map(i => (
          <View key={'sk_contact_' + i} style={{ marginBottom: responsiveHeight(1.8) }}>
            <SkeletonItem width={responsiveWidth(22)} height={responsiveHeight(1.6)} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonItem width="100%" height={responsiveHeight(5)} borderRadius={8} />
          </View>
        ))}

        {/* Address Input */}
        <View style={{ marginBottom: responsiveHeight(2) }}>
          <SkeletonItem width="100%" height={responsiveHeight(5)} borderRadius={8} />
        </View>

        {/* Cart Items Cards */}
        {[1, 2].map(i => (
          <View
            key={'sk_cart_' + i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F9F9F9',
              padding: responsiveWidth(2.5),
              borderRadius: 10,
              marginBottom: responsiveHeight(1.5),
            }}
          >
            <SkeletonItem width={responsiveWidth(12)} height={responsiveWidth(12)} borderRadius={8} />
            <View style={{ marginLeft: responsiveWidth(3), flex: 1 }}>
              <SkeletonItem width="70%" height={responsiveHeight(1.8)} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonItem width="40%" height={responsiveHeight(1.4)} borderRadius={4} />
            </View>
          </View>
        ))}

        {/* Fee Breakdown Area */}
        <View style={{ marginTop: responsiveHeight(1), paddingHorizontal: responsiveWidth(1) }}>
          {[1, 2, 3].map(i => (
            <View
              key={'sk_fee_' + i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: responsiveHeight(1.2),
              }}
            >
              <SkeletonItem width={responsiveWidth(28)} height={responsiveHeight(1.6)} borderRadius={4} />
              <SkeletonItem width={responsiveWidth(16)} height={responsiveHeight(1.6)} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* Pay Now Button */}
        <SkeletonItem
          width="100%"
          height={responsiveHeight(6)}
          borderRadius={10}
          style={{ marginTop: responsiveHeight(2) }}
        />
      </ScrollView>
    </View>
  );
};

// Move this OUTSIDE HomeRight, e.g. right above it or in its own file.
const EstimateTimeDropdown = ({
  selectedTime,
  setSelectedTime,
  clearFieldError,
  errors,
  timeOptions,
  styles,
  theme
}) => {
  const { t } = useTranslation()
  const [value, setValue] = useState(selectedTime ? selectedTime : null);

  useEffect(() => {
    if (selectedTime) {
      setValue(selectedTime);
    }
  }, [selectedTime]);

  const renderItem = item => {
    const isTableBooked = timeOptions.includes(item.value);
    const isSelected = item.value === value;

    return (
      <View style={[styles.item, isSelected && styles.selectedItem]}>
        <Text style={[styles.textItem, isSelected && styles.selectedText]}>
          {item.label}
        </Text>
        <View style={styles.iconContainer}>
          {isTableBooked && (
            <AntDesignIcon style={styles.icon} color={theme.primary} name="clockcircleo" size={20} />
          )}
          {isSelected && (
            <AntDesignIcon style={styles.icon} color={theme.primary} name="clockcircleo" size={20} />
          )}
        </View>
      </View>
    );
  };
  return (
    <Dropdown
      style={[styles.dropdown, errors.selectedTime ? { borderColor: Colors.red, borderWidth: 1 } : null]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={timeOptions}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={t('ESTIMATE_DELIVERY_TIME')}
      searchPlaceholder={t('SEARCH')}
      value={value}
      onChange={item => {
        setSelectedTime(item.value);
        clearFieldError('selectedTime');
      }}
      renderLeftIcon={() => (
        <AntDesignIcon style={styles.icon} color={theme.primary} name="clockcircleo" size={responsiveFontSize(1.5)} />
      )}
      renderItem={renderItem}
    />
  );
};
// create a component
const HomeRight = props => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { baseUrl, siteUrl, userToken, userData, langId, cartDetails, siteSetting, user_slug, UsbPrinter } =
    useSelector(state => state.common);
  const { t } = useTranslation();
  const [viewloader, setLoader] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [CartDish, setCartDish] = useState({ isLoading: true, list: [] });
  const [cartQuantity, setcartQuantity] = useState(0);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const { orderTypes, getAvailableOrderTypes } = useOrderTypes();
  const [orderType, setOrderType] = useState(0);
  const [siteSettings, setSiteSettings] = useState(null);
  const [addressDistanceError, setAddressDistanceError] = useState('');
  const [CartSubTotal, setCartSubTotal] = useState(0.0);
  const [PendingMinimumFee, setPendingMinimumFee] = useState(0.0);
  const [PendingFreeDelivery, setPendingFreeDelivery] = useState(false);
  const [PendingFreeDeliveryValue, setPendingFreeDeliveryValue] = useState('');
  const [preorderDetails, setPreorderDetails] = useState(null);
  const [discount_code, setDiscountCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });
  const [printers, setPrinters] = useState(null);
  const [currentPrinter, setCurrentPrinter] = useState(null);
  const noActiveMenuSignalRef = useRef();
  const [buyerDetails, setBuyerDetails] = useState({
    id: 0,
    preorder: false,
    name: '',
    last_name: '',
    email: '',
    cel: '',
    specialaddress: '',
    delievryaddress: '',
    lat: null,     // add
    lng: null,     // add
    notes: '',
  });
  const [discountInfo, setDiscountInfo] = useState({
    discounttext: null,
    discounttype: null,
    discountid: null,
  });
  const [discount, setDiscount] = useState(0.0);
  const [tips, setTips] = useState(0.0);
  const [cartFee, setCartFee] = useState([]);
  const [ipAddressPrinter, setipaddresprinter] = useState();
  const [paymentMethod, setPaymentMethod] = useState({
    isLoading: true,
    list: [],
  });
  const [paymentId, setPaymentId] = useState('');
  const [paymentIndex, setPaymentIndex] = useState('');

  const [paircode, setPaircode] = useState('');
  const [displaypaircode, setDisplayPairCode] = useState(false);
  const [editingNoteKey, setEditingNoteKey] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  // ---- Inline validation state ----
  const [errors, setErrors] = useState({
    name: '',
    last_name: '',
    cel: '',
    email: '',
    specialaddress: '',
    delievryaddress: '',
    selectedTime: '',
    paymentId: '',
    paircode: '',
  });

  const clearFieldError = field => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const [selectedTime, setSelectedTime] = useState('');

  const timeOptions = React.useMemo(
    () => [
      { label: t('TIME_10_MIN'), value: '00:10' },
      { label: t('TIME_20_MIN'), value: '00:20' },
      { label: t('TIME_30_MIN'), value: '00:30' },
      { label: t('TIME_40_MIN'), value: '00:40' },
      { label: t('TIME_50_MIN'), value: '00:50' },
    ],
    [t],
  );

  const [update_action_status, setUpdateActionStatus] = useState(false);
  const scrollViewRef = React.useRef(null);
  const fieldPositions = useRef({}); // NEW
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState('pickup');
  const [orderTiming, setOrderTiming] = useState('now');
  const hasAutoOpenedOrderType = React.useRef(false);
  const ORDER_TYPE_MODAL_SHOWN_KEY = 'hasShownOrderTypeModal';
  const mapDefaultOrderTypeToKey = val => {
    const found = orderTypes.list.find(t => Number(t.id) === Number(val));
    return found ? found.slug : 'pickup';
  };
  const registerFieldPosition = key => e => {
    fieldPositions.current[key] = e.nativeEvent.layout.y;
  };
  const FIELD_ORDER = ['name', 'last_name', 'cel', 'delievryaddress', 'selectedTime', 'paymentId', 'paircode'];

  const scrollToFirstError = newErrors => {
    const firstErrorField = FIELD_ORDER.find(key => newErrors[key]);
    if (!firstErrorField || !scrollViewRef.current) return;

    const y = fieldPositions.current[firstErrorField];
    if (typeof y === 'number') {
      scrollViewRef.current.scrollTo({ y: Math.max(y - responsiveHeight(2), 0), animated: true });
    }
  };

  const mapServiceTypeKeyToOrderType = key => {
    const found = serviceTypeOptions.find(opt => opt.key === key);
    return found ? found.id : 2; // fall back to Pickup
  };
  const serviceTypeOptions = React.useMemo(
    () =>
      getAvailableOrderTypes(activeBusiness).map(type => ({
        key: type.slug,
        id: type.id,
        label: type.name,
        sub: SERVICE_TYPE_META[type.slug]?.sub || '',
        icon: SERVICE_TYPE_META[type.slug]?.icon || 'ellipse-outline',
        imagePath: type.image_path,
      })),
    [activeBusiness, getAvailableOrderTypes],
  );

  const hasSingleOrderType = serviceTypeOptions.length <= 1;

  const selectedServiceTypeLabel = React.useMemo(() => {
    const found = serviceTypeOptions.find(opt => opt.key === selectedServiceType);
    return found ? found.label : 'Pickup';
  }, [serviceTypeOptions, selectedServiceType]);
  useEffect(() => {
    if (
      serviceTypeOptions.length > 0 &&
      !serviceTypeOptions.some(opt => opt.key === selectedServiceType)
    ) {
      setSelectedServiceType(serviceTypeOptions[0].key);
    }
  }, [serviceTypeOptions]);

  useEffect(() => {
    const isNewFailure =
      props.noActiveMenu &&
      props.noActiveMenuSignal !== noActiveMenuSignalRef.current;

    if (isNewFailure && activeBusiness && serviceTypeOptions.length > 0) {
      noActiveMenuSignalRef.current = props.noActiveMenuSignal;
      setShowOrderTypeModal(true);
    }
  }, [props.noActiveMenu, props.noActiveMenuSignal, activeBusiness, serviceTypeOptions.length]);
  // ---- Preorder / Pickup toggle + date & time picker modals ----
  // 'preorder' opens a date picker then a time picker (scheduled order);
  // 'pickup' means order now, no scheduling needed.
  const [orderMode, setOrderMode] = useState(
    props.preorderDetails && props.preorderDetails.preorder
      ? 'preorder'
      : 'pickup',
  );
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedPreorderDate, setSelectedPreorderDate] = useState(
    (props.preorderDetails && props.preorderDetails.preorderDate) || '',
  );
  const [selectedPreorderTime, setSelectedPreorderTime] = useState(
    (props.preorderDetails && props.preorderDetails.preorderTime) || '',
  );

  // preorderinterval (minutes between time slots) comes off the business object.
  const preorderIntervalMinutes = React.useMemo(() => {
    const interval = parseInt(activeBusiness && activeBusiness.preorderinterval, 10);
    return interval > 0 ? interval : 30;
  }, [activeBusiness]);

  // Next 15 days starting today, each carrying that weekday's open/closed
  // status + time windows straight from the business schedule, e.g.
  // { label: '05/07/2026', weekday: 'Sunday', isToday, isSunday, isOpen, times }
  const orderDateOptions = React.useMemo(() => {
    const schedule = (activeBusiness && activeBusiness.schedule) || [];
    const days = [];
    const today = new Date();

    for (let i = 0; i < 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const weekdayName = WEEKDAY_NAMES[d.getDay()];
      const daySchedule = schedule.find(s => s.name === weekdayName);

      days.push({
        label: `${dd}/${mm}/${yyyy}`,
        weekday: weekdayName,
        isToday: i === 0,
        isSunday: d.getDay() === 0,
        isOpen: daySchedule ? !!daySchedule.status : false,
        times: daySchedule ? daySchedule.times : [],
      });
    }
    return days;
  }, [activeBusiness]);

  // Builds preorderIntervalMinutes-spaced slots for every open/close window
  // on a given date entry (from orderDateOptions). Drops slots already in
  // the past when the date is today.
  const buildTimeSlotsForDate = dateItem => {
    if (!dateItem || !dateItem.isOpen || !Array.isArray(dateItem.times)) {
      return [];
    }

    const slots = [];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    dateItem.times.forEach(window => {
      const openHour = parseInt(window.opens.hour, 10);
      const openMinute = parseInt(window.opens.minute, 10);
      const closeHour = parseInt(window.closes.hour, 10);
      const closeMinute = parseInt(window.closes.minute, 10);

      let cursor = openHour * 60 + openMinute;
      const end = closeHour * 60 + closeMinute;

      while (cursor <= end) {
        if (!dateItem.isToday || cursor >= nowMinutes) {
          const hh = Math.floor(cursor / 60);
          const mm = cursor % 60;
          const period = hh >= 12 ? 'pm' : 'am';
          let displayHour = hh % 12;
          if (displayHour === 0) displayHour = 12;

          slots.push({
            value: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
            label: `${displayHour}:${String(mm).padStart(2, '0')} ${period}`,
          });
        }
        cursor += preorderIntervalMinutes;
      }
    });

    return slots;
  };

  // Time slots for whichever date was just picked in the date modal.
  const [selectedDateTimeSlots, setSelectedDateTimeSlots] = useState([]);

  const pushPreorderDetailsUp = details => {
    // Home.js owns the source-of-truth preorderDetails state (used when
    // fetching the business menu). If it passed down a setter, keep it in
    // sync; if not, this screen still tracks the selection locally.
    if (typeof props.updatePreorderDetails === 'function') {
      props.updatePreorderDetails(details);
    }
  };

  const openPreorderFlow = () => {
    setOrderMode('preorder');
    setShowDateModal(true);
  };

  const handleSelectPreorderDate = dateItem => {
    if (!dateItem.isOpen) {
      return; // business is closed that day — nothing to select
    }
    setSelectedPreorderDate(dateItem.label);
    setSelectedDateTimeSlots(buildTimeSlotsForDate(dateItem));
    setShowDateModal(false);
    setShowTimeModal(true);
  };

  const handleSelectPreorderTime = timeItem => {
    setSelectedPreorderTime(timeItem.label);
    setShowTimeModal(false);
    setOrderMode('preorder');
    setBuyerDetails(prev => ({ ...prev, preorder: true }));
    pushPreorderDetailsUp({
      preorder: true,
      preorderDate: selectedPreorderDate,
      preorderTime: timeItem.label,
      preorderMenu:
        (props.preorderDetails && props.preorderDetails.preorderMenu) || 0,
    });
  };


  const handleSelectPickup = () => {
    setOrderMode('pickup');
    setSelectedPreorderDate('');
    setSelectedPreorderTime('');
    setBuyerDetails(prev => ({ ...prev, preorder: false }));
    pushPreorderDetailsUp({
      preorder: false,
      preorderDate: '',
      preorderTime: '',
      preorderMenu: 0,
    });
    checkPickupDistance();
  };
  // const confirmOrderTypeSelection = () => {
  //   setShowOrderTypeModal(false);

  //   if (selectedServiceType === 'pickup') {
  //     if (orderTiming === 'later') {
  //       setShowDateModal(true); // reuses your existing date -> time flow
  //     } else {
  //       handleSelectPickup(); // order now
  //     }
  //   } else if (selectedServiceType === 'delivery') {
  //     if (orderTiming === 'later') {
  //       openPreorderFlow(); // reuses your existing date -> time flow
  //     } else {
  //       handleSelectPickup(); // order now
  //     }
  //   }
  // };
  const confirmOrderTypeSelection = () => {
    setShowOrderTypeModal(false);
    const typeId = mapServiceTypeKeyToOrderType(selectedServiceType);

    if (orderTiming === 'later') {
      setShowDateModal(true); // date -> time flow, unchanged
      return;
    }

    if (typeof props.onOrderTypeSelected === 'function') {
      props.onOrderTypeSelected(typeId);
    }
    if (selectedServiceType === 'pickup') {
      handleSelectPickup();
    }
  };
  const clearPreorderSelection = () => {
    handleSelectPickup();
  };

  useEffect(() => {
    if (props.noActiveMenu && activeBusiness && serviceTypeOptions.length > 0) {
      setSelectedServiceType('pickup');
      setOrderTiming('now');
      setShowOrderTypeModal(true);
    }
  }, [props.noActiveMenu, activeBusiness, serviceTypeOptions.length]);
  useEffect(() => {
    if (activeBusiness) {
      postWithToken(
        siteSetting,
        'get-site-settings',
        { user_slug: user_slug },
        userToken,
      )
        .then(response => {
          if (response.status === true) {
            setSiteSettings(response.data);
            console.log('siteSettings', response.data);
          }
        })
        .catch(error => {
          console.log('Error fetching site settings: ', error);
        });
    }
  }, [activeBusiness]);

  // ---- Delivery zones: my-business-info gives us delivery_prices, each
  // with a polygon ("zone") + a flat price + a minimum purchase for that
  // zone. Fetched once per business, then reused for the point-in-polygon
  // check whenever the customer's address / service type changes. ----
  const [businessDeliveryInfo, setBusinessDeliveryInfo] = useState(null);
  const [deliveryZoneMatch, setDeliveryZoneMatch] = useState(null); // { id, price, minimumpur }
  const [deliveryZoneError, setDeliveryZoneError] = useState('');

  useEffect(() => {
    if (activeBusiness) {
      postWithToken(
        baseUrl,
        'my-business-info',
        { business_id: activeBusiness.id, lang_id: langId },
        userToken,
      )
        .then(response => {
          if (response.status === true && response.all_data) {
            setBusinessDeliveryInfo(response.all_data);
          }
        })
        .catch(error => {
          console.log('Error fetching business info: ', error);
        });
    }
  }, [activeBusiness]);

  const checkPickupDistance = (overrideLat, overrideLng) => {
    setAddressDistanceError('');
    if (selectedServiceType !== 'pickup') return;

    const storeLat = parseFloat(activeBusiness?.latitud);
    const storeLng = parseFloat(activeBusiness?.longitud);
    if (isNaN(storeLat) || isNaN(storeLng) || !siteSettings?.NEAR_ME_DISTANCE) return;

    const customerLat = parseFloat(overrideLat ?? buyerDetails?.lat ?? props?.userLocation?.lat);
    const customerLng = parseFloat(overrideLng ?? buyerDetails?.lng ?? props?.userLocation?.lng);
    if (isNaN(customerLat) || isNaN(customerLng)) return;

    const maxDistance = parseFloat(siteSettings.NEAR_ME_DISTANCE);
    const distanceKm = getDistanceFromLatLonInKm(customerLat, customerLng, storeLat, storeLng);
    const distance = siteSettings.NEAR_ME_UNIT === 'M' ? kmToMiles(distanceKm) : distanceKm;

    if (distance > maxDistance) {
      setAddressDistanceError('Sorry, this location is outside the pickup range.');
    }
  };

  // Finds which delivery_prices zone (polygon) the customer's lat/lng falls
  // inside, using the business info fetched above. Sets deliveryZoneMatch
  // (price + minimum purchase for that zone) or deliveryZoneError when the
  // address isn't covered by any zone.
  const checkDeliveryZone = (overrideLat, overrideLng) => {
    setDeliveryZoneError('');
    setDeliveryZoneMatch(null);
    if (selectedServiceType !== 'delivery') return;
    if (!businessDeliveryInfo || !Array.isArray(businessDeliveryInfo.delivery_prices)) return;

    const customerLat = parseFloat(overrideLat ?? buyerDetails?.lat ?? props?.userLocation?.lat);
    const customerLng = parseFloat(overrideLng ?? buyerDetails?.lng ?? props?.userLocation?.lng);
    if (isNaN(customerLat) || isNaN(customerLng)) return;

    let matchedZone = null;
    for (const deliveryPrice of businessDeliveryInfo.delivery_prices) {
      if (String(deliveryPrice.status) !== '1') continue;

      let zonePoints;
      try {
        zonePoints =
          typeof deliveryPrice.zone === 'string'
            ? JSON.parse(deliveryPrice.zone)
            : deliveryPrice.zone;
      } catch (e) {
        continue;
      }
      if (!Array.isArray(zonePoints) || zonePoints.length < 3) continue;

      if (isPointInZone(customerLat, customerLng, zonePoints)) {
        matchedZone = deliveryPrice;
        break;
      }
    }

    if (matchedZone) {
      setDeliveryZoneMatch({
        id: matchedZone.id,
        price: parseFloat(matchedZone.price) || 0,
        minimumpur: parseFloat(matchedZone.minimumpur) || 0,
      });
    } else {
      setDeliveryZoneError('Sorry, we do not deliver to this address.');
    }
  };

  const handleAddressSelected = (data, details) => {
    if (!details?.geometry?.location) return;

    const { lat, lng } = details.geometry.location;

    setBuyerDetails(prev => ({
      ...prev,
      delievryaddress: data.description,
      lat,
      lng,
    }));
    clearFieldError('delievryaddress');
    // run immediately, don't wait for state
    if (selectedServiceType === 'delivery') {
      checkDeliveryZone(lat, lng);
    } else {
      checkPickupDistance(lat, lng);
    }
  };
  useEffect(() => {
    if (siteSettings && activeBusiness && selectedServiceType === 'pickup') {
      checkPickupDistance();
    }
  }, [siteSettings, activeBusiness, selectedServiceType]);
  useEffect(() => {
    if (selectedServiceType === 'delivery' && businessDeliveryInfo) {
      checkDeliveryZone();
    } else {
      setDeliveryZoneError('');
      setDeliveryZoneMatch(null);
    }
  }, [businessDeliveryInfo, selectedServiceType, buyerDetails.lat, buyerDetails.lng]);
  useEffect(() => {
    if (activeBusiness) {
      FetchPaymentMothod(activeBusiness.id, mapServiceTypeKeyToOrderType(selectedServiceType));
    }
  }, [selectedServiceType, activeBusiness]);
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (props.cartDish != undefined) {
  //       setCategoryDetails(props.categoryDetails);
  //       setActiveBusiness(props.activeBusiness);
  //       setOrderType(props.orderType);
  //       setCartDish({ isLoading: false, list: props.cartDish.list });
  //       setPreorderDetails(props.preorderDetails);
  //       FetchPaymentMothod(props.activeBusiness.id, props.orderType);
  //       if (!hasAutoOpenedOrderType.current && props.activeBusiness) {
  //         hasAutoOpenedOrderType.current = true; // prevents duplicate checks within this session

  //         getData(ORDER_TYPE_MODAL_SHOWN_KEY)
  //           .then(alreadyShown => {
  //             if (!alreadyShown) {
  //               const defaultKey = mapDefaultOrderTypeToKey(
  //                 props.activeBusiness.default_order_type,
  //               );
  //               setSelectedServiceType(defaultKey);
  //               setOrderTiming('now');
  //               setShowOrderTypeModal(true);
  //               setData(ORDER_TYPE_MODAL_SHOWN_KEY, 'true');
  //             }
  //           })
  //           .catch(e => {
  //             console.log('Error checking order type modal flag:', e);
  //           });
  //       }
  //       let cartQty = 0;
  //       for (const cartDish of props.cartDish.list) {
  //         for (const dish of cartDish.dish) {
  //           cartQty += dish.quantity;
  //         }
  //       }
  //       setcartQuantity(cartQty);
  //       dispatch(setCartQuantity(cartQty));
  //       calCartTotal(props.cartDish.list, props.activeBusiness);
  //     }
  //   }, [props.cartDish]),
  // );

  useFocusEffect(
    React.useCallback(() => {
      if (props.cartDish != undefined) {
        setCategoryDetails(props.categoryDetails);
        setActiveBusiness(prev =>
          prev && prev.id === props.activeBusiness.id ? prev : props.activeBusiness
        );
        setOrderType(props.orderType);
        setCartDish({ isLoading: false, list: props.cartDish.list });
        setPreorderDetails(props.preorderDetails);
        FetchPaymentMothod(props.activeBusiness.id, props.orderType);
        if (!hasAutoOpenedOrderType.current && props.activeBusiness) {
          hasAutoOpenedOrderType.current = true; // prevents duplicate checks within this session

          const activeTypesCount = ['is_delivery', 'is_pickup', 'is_dinein', 'is_catering']
            .filter(flag => Number(props.activeBusiness[flag]) === 1).length;

          getData(ORDER_TYPE_MODAL_SHOWN_KEY)
            .then(alreadyShown => {
              if (!alreadyShown && activeTypesCount > 1) {
                const defaultKey = mapDefaultOrderTypeToKey(
                  props.activeBusiness.default_order_type,
                );
                setSelectedServiceType(defaultKey);
                setOrderTiming('now');
                setShowOrderTypeModal(true);
                setData(ORDER_TYPE_MODAL_SHOWN_KEY, 'true');
              }
            })
            .catch(e => {
              console.log('Error checking order type modal flag:', e);
            });
        }
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
    clearFieldError('name');
    clearFieldError('last_name');
    clearFieldError('cel');

    setMenuVisible(false);
  };

  const FetchUserByPhone = mobilenumber => {
    //console.log(mobilenumber.length);
    if (mobilenumber.length > 0) {
      if (mobilenumber.length >= 3) {
        postWithToken(
          baseUrl,
          'get-customer-details',
          {
            lang_id: langId,
            search_phone: mobilenumber,
          },
          userToken,
        )
          .then(response => {
            console.log(response);

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
  const FetchPaymentMothod = (bid, orderType_val) => {
    postWithToken(
      baseUrl,
      'get-business-payment-methods',
      {
        lang_id: langId,
      },
      userToken,
    )
      .then(response => {
        let paymentResponse = response.data;
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
            paymentc.payment_method = paymentResponse[j].payment_method;
            paymentc.active = paymentId !== '' && paymentc.id == paymentId;
            paymentc.credential = paymentResponse[j].credential;

            if (paymentc.id == 1 || paymentc.id == 2) {
              payment_arr.push(paymentc);
            }
          }
        }

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



  const updateDishNote = (cartindex, dishindex, dataindex, text) => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    cart[cartindex].dish[dishindex].data[dataindex].notes = text;
    props.updateCartDetails(cart);
  };

  const startEditingNote = (key, currentNote) => {
    setEditingNoteKey(key);
    setNoteDraft(currentNote || '');
  };

  const saveNote = (cartindex, dishindex, dataindex) => {
    updateDishNote(cartindex, dishindex, dataindex, noteDraft);
    setEditingNoteKey(null);
    setNoteDraft('');
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
      setDiscountCode('');
      setCouponMessage({ text: '', isError: false });
      setDiscountInfo({ discounttext: null, discounttype: null, discountid: null });
      setDiscount(0.0);
    }

    props.updateCartDetails(cart);
    calCartTotal(cart, props.activeBusiness);
  };

  const deleteCartItem = (index, dishindex, dishdataindex) => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    cart[index].dish[dishindex].data.splice(dishdataindex, 1);

    if (cart[index].dish[dishindex].data.length === 0) {
      cart[index].dish.splice(dishindex, 1);
    } else {
      // Recalculate the parent quantity from the remaining variants,
      // since getCartQtyForDish (Home.js) reads this cached total.
      let newQty = 0;
      for (const d of cart[index].dish[dishindex].data) {
        newQty += parseInt(d.quantity, 10);
      }
      cart[index].dish[dishindex].quantity = newQty;
    }

    if (cart[index].dish.length === 0) {
      cart.splice(index, 1);
    }
    props.updateCartDetails(cart);
    calCartTotal(cart, props.activeBusiness);
  }
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
    if (discountInfo.discounttype === 'code') {
      CalDiscountCode(cart, discount, CartSubTotal_val);
      return;
    }
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
        'check-offer',
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
          if (offerResponse.status === true && offerResponse.data && offerResponse.data.length > 0) {
            const offerData = offerResponse.data[0];

            // FIX: Immutable state update with populated text & id
            setDiscountInfo({
              discounttype: 'offer',
              discounttext: offerData.distext || offerData.name || 'Automatic Offer',
              discountid: offerData.id || offerData.offer_id || null,
            });

            if (offerData.d_type == '1') {
              let discount = offerData.price;
              setDiscount(discount);
              CalDiscountAuto(cart, discount, CartSubTotal_val, offerResponse);
            } else {
              let percent = Number(offerData.percent) * 0.01;
              let discount = parseFloat(CartSubTotal_val) * percent;
              discount = parseFloat(discount).toFixed(2);
              setDiscount(discount);
              CalDiscountAuto(cart, discount, CartSubTotal_val, offerResponse);
            }
          } else {
            // RESET on failure/no offer
            setDiscountInfo({
              discounttext: null,
              discounttype: null,
              discountid: null,
            });
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
    // Only apply a delivery fee when Delivery is the selected service type
    // and the customer's address matched one of the business's zones.
    const deliveryCostValue =
      selectedServiceType === 'delivery' && deliveryZoneMatch
        ? parseFloat(deliveryZoneMatch.price) || 0
        : 0;

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
      total =
        parseFloat(CartSubTotal_val) -
        parseFloat(discount_val) +
        parseFloat(deliveryCostValue) +
        parseFloat(taxprice) +
        parseFloat(servicefeeprice) +
        parseFloat(tips);
      total = parseFloat(total).toFixed(2);
      let fee;
      fee = {
        id: cart_val[i].id,
        name: cart_val[i].details.name,
        subtotal: Number(SubTotal),
        tax: Number(cart_val[i].details.tax),
        taxtype: cart_val[i].details.taxtype,
        taxprice: Number(taxprice),
        deliverycost: deliveryCostValue,
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

    setCartFee(cartFee);
  };

  const CalDiscountCode = (cart_val, discount_val, CartSubTotal_val) => {
    let cartFee = new Array();
    let SubTotal = 0.0;
    const safeDiscount = Number.isFinite(parseFloat(discount_val)) ? parseFloat(discount_val) : 0;
    // Only apply a delivery fee when Delivery is the selected service type
    // and the customer's address matched one of the business's zones.
    const deliveryCostValue =
      selectedServiceType === 'delivery' && deliveryZoneMatch
        ? parseFloat(deliveryZoneMatch.price) || 0
        : 0;
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
      let subtotal = parseFloat(SubTotal) - safeDiscount;
      subtotal = parseFloat(subtotal).toFixed(2);
      let taxprice =
        parseFloat(subtotal) * Number(cart_val[i].details.tax * 0.01);
      taxprice = parseFloat(taxprice).toFixed(2);
      let servicefeeprice = parseFloat(subtotal) + parseFloat(0);
      servicefeeprice = servicefeeprice * cart_val[i].details.servicefee * 0.01;
      servicefeeprice = parseFloat(servicefeeprice).toFixed(2);
      let total;
      total =
        parseFloat(CartSubTotal_val) -
        safeDiscount +
        parseFloat(deliveryCostValue) +
        parseFloat(taxprice) +
        parseFloat(servicefeeprice) +
        parseFloat(tips);
      total = parseFloat(total).toFixed(2);

      let fee;
      fee = {
        id: cart_val[i].id,
        name: cart_val[i].details.name,
        subtotal: Number(SubTotal),
        tax: Number(cart_val[i].details.tax),
        taxtype: cart_val[i].details.taxtype,
        taxprice: Number(taxprice),
        deliverycost: deliveryCostValue,
        extraminimum: extraminimum,
        firstoffer: 0,
        servicefee: Number(cart_val[i].details.servicefee),
        servicefeeprice: Number(servicefeeprice),
        discount: safeDiscount,
        tips: Number(tips),
        total: Number(total),
        autodiscount: 0,

      };

      cartFee.push(fee);
    }

    setCartFee(cartFee);
  };

  const CheckDiscount = () => {
    let cart = JSON.parse(JSON.stringify(CartDish.list));
    setCouponMessage({ text: '', isError: false });
    if (discount_code.search(/\S/) == -1) {
      //showToastMsg('Please enter discount code');
      setCouponMessage({ text: t('PLEASE_ENTER_DISCOUNT_CODE'), isError: true });
      return false;
    }
    else if (parseFloat(CartSubTotal) < DISCOUNT_MIN_SUBTOTAL) {
      // showToastMsg(
      //   `Discount is applicable only on orders above ${activeBusiness.currency_symbol}${DISCOUNT_MIN_SUBTOTAL}`,
      // );
      setCouponMessage({
        text: `${t('DISCOUNT_IS_APPLICABLE_ONLY_ON_ORDER_ABOVE')} ${activeBusiness.currency_symbol}${DISCOUNT_MIN_SUBTOTAL}`,
        isError: true,
      });
      return false;
    }
    else {
      // setLoader(true);
      setUpdateActionStatus(true);
      postWithToken(
        baseUrl,
        'check-discount-code',
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
          //setLoader(false);
          if (offerResponse.status === true) {
            discountInfo.discounttype = 'code';
            setDiscountInfo(discountInfo);
            if (offerResponse.data.d_type === '1') {
              let discount = offerResponse.data.price;
              setDiscount(discount);
              CalDiscountCode(cart, discount, CartSubTotal);
            } else {
              let percent = Number(offerResponse.data.percent) * 0.01;
              let discount = parseFloat(CartSubTotal) * percent;
              discount = parseFloat(discount).toFixed(2);
              setDiscount(discount);
              CalDiscountCode(cart, discount, CartSubTotal);
            }
            //showToastMsg('Discount Applied');
            setCouponMessage({ text: t('DISCOUNT_APPLIED_SUCESSFULLY'), isError: false });
          } else {
            discountInfo.discounttype = '';
            setDiscountInfo(discountInfo);
            //showToastMsg('Discount Code Not Valid');
            setCouponMessage({ text: t('INVALID_OR_EXPIRED_DISCOUNT_CODE'), isError: true });
          }
        })
        .catch(error => {
          console.log('Error : ', error);
          setUpdateActionStatus(false);
          setCouponMessage({ text: t('FAILED_TO_APPLY_DISOUNT_CODE'), isError: true });
        });
    }
  };

  const SelectPayment = async val => {
    setPaymentId(val.id);
    clearFieldError('paymentId');

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
    Alert.alert('Open Cash Drawer');
    console.log('openCashBox');
    EbPrinter.openCashBox(0);
    setCodeRun('Code Is Run');
  };
  const GetUsbDeviceList = async () => {
    const usbdevicelist = await EbPrinter.getUsbDeviceList();

    if (usbdevicelist) {
      setPrinterList(usbdevicelist);
      //setPrinterList(['Devin', 'Dan']);
      setvisiblemodal(true);
    }
    Alert.alert(usbdevicelist);

    //setPrinterList(['Devin', 'Dan']);
    //setvisiblemodal(true);
  };

  // const selectDevice = item => {
  //   setSelectedUsb(item);
  //   setvisiblemodal(false);
  //   placeOrder();
  // };

  const selectDevice = item => {
    setSelectedUsb(item);
    EbPrinter.selectUsbPrinter(item);
    dispatch(setUsbPrinterValue(item));
    setData('UsbPrinterValue', JSON.stringify(item));
    setvisiblemodal(false);
    placeOrder();
  };

  const validateAll = () => {
    const newErrors = {
      name: '',
      last_name: '',
      cel: '',
      selectedTime: '',
      delievryaddress: '',
      paymentId: '',
      paircode: '',
    };
    let isValid = true;
    if (buyerDetails.name.search(/\S/) === -1) {
      newErrors.name = t('PLEASE_ENTER_FIRST_NAME');
      isValid = false;
    }

    if (buyerDetails.last_name.search(/\S/) === -1) {
      newErrors.last_name = t('PLEASE_ENTER_LAST_NAME');
      isValid = false;
    }
    if (buyerDetails.cel.search(/\S/) === -1) {
      newErrors.cel = t('ENTER_YOUR_MOBILE_MIN_DIGIT');
      isValid = false;
    }

    if (
      (selectedServiceType === 'delivery' || selectedServiceType === 'catering-delivery') &&
      (!buyerDetails.delievryaddress || buyerDetails.delievryaddress.search(/\S/) === -1)
    ) {
      newErrors.delievryaddress = t('PLEASE_ENTER_A_DELIVERY_ADDRESS');
      isValid = false;
    }

    if (selectedTime === '') {
      newErrors.selectedTime = t('PLEASE_SELECT_AN_ESTIMATE_TIME');
      isValid = false;
    }

    if (paymentId === '') {
      newErrors.paymentId = 'Please select a payment method';
      isValid = false;
    } else if (paymentId == 2 && paircode.search(/\S/) === -1) {
      newErrors.paircode = 'Please enter terminal pair code';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      scrollToFirstError(newErrors);
    }
    return isValid;
  };

  const CheckallDetails = () => {
    if (!validateAll()) {
      return false;
    }
    if (selectedServiceType === 'pickup' && addressDistanceError) {
      showToastMsg(addressDistanceError);
      return false;
    }
    if (selectedServiceType === 'delivery') {
      if (deliveryZoneError) {
        showToastMsg(deliveryZoneError);
        return false;
      }
      if (
        deliveryZoneMatch &&
        parseFloat(CartSubTotal) < parseFloat(deliveryZoneMatch.minimumpur)
      ) {
        showToastMsg(
          // `Minimum order for delivery to this address is ${activeBusiness.currency_symbol}${deliveryZoneMatch.minimumpur}`,
          `${t('MINIMUM_ORDER_FOR_DELIVERY_TO_THIS_ADDRESS_IS')} ${activeBusiness.currency_symbol}${deliveryZoneMatch.minimumpur}`,
        );
        return false;
      }
    }
    if (paymentId == 2) {
      linkly_pinpad_request();
    } else {
      if (UsbPrinter == null) {
        GetUsbDeviceList();
      } else {
        placeOrder();
      }

      // placeOrder();
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
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  const placeOrder = () => {
    const orderTypeValue = mapServiceTypeKeyToOrderType(selectedServiceType);

    let Search = {
      lat: activeBusiness.latitud,
      lng: activeBusiness.longitud,
      search_address: activeBusiness.address,
      order_type: orderTypeValue,
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
        selectedServiceType === 'delivery' && deliveryZoneMatch
          ? {
            id: deliveryZoneMatch.id,
            name: '',
            delivery: deliveryZoneMatch.price,
            minimum: deliveryZoneMatch.minimumpur,
          }
          : { id: '0', name: '', delivery: '0', minimum: activeBusiness.minimumfee },
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
      order_type: orderTypeValue,
      payment_id: paymentId,
      tax: tax,
      taxtype: taxtype,
      tax_price: tax_price,
      dishdata: CartDish.list[0].dish,
      total: total,
    };
    setLoader(true);
    setUpdateActionStatus(true);
    postWithToken(baseUrl, 'order-placed', postData, userToken)
      .then(response => {
        if (paymentId == 1) {
          OpenCashDrawer();
        }
        setLoader(false);
        setUpdateActionStatus(false);
        setSelectedTime('');
        setBuyerDetails({
          id: 0, preorder: false, name: '', last_name: '', email: '',
          cel: '', specialaddress: '', delievryaddress: '', notes: '',
        });
        // Inside response of order-placed:
        setDiscountInfo({ discounttext: null, discounttype: null, discountid: null });
        setDiscount(0.0);
        setTips(0.0);
        setCartFee([]);
        setPaymentMethod({ isLoading: true, list: [] });
        setPaymentId('');
        setPaymentIndex('');
        setDiscountCode('');
        setCouponMessage({ text: '', isError: false });
        setCartDish({ isLoading: true, list: [] });
        setData('cartDetails', JSON.stringify([]));
        setErrors({
          name: '', last_name: '', cel: '', selectedTime: '', paymentId: '', paircode: '',
        });
        navigation.navigate('OrderSuccess', { orderId: response.data.id, activeBusiness: activeBusiness });
      })
      .catch(error => {
        setLoader(false);
        setUpdateActionStatus(false);
        console.log('Error : ', error);
        showToastMsg(t('SOMETHING_WENT_WRONG_PLACING_YOUR_ORDER'));
      });
  };
  const setBuyerInfo = (val, type) => {
    if (type === 'name') {
      setBuyerDetails(prev => ({ ...prev, name: val }));
      if (val.search(/\S/) !== -1) clearFieldError('name');
    } else if (type === 'last_name') {
      setBuyerDetails(prev => ({ ...prev, last_name: val }));
      if (val.search(/\S/) !== -1) clearFieldError('last_name');
    } else if (type === 'email') {
      setBuyerDetails(prev => ({ ...prev, email: val }));
      // FIX: Clear the email error when text is entered
      if (val.search(/\S/) !== -1) clearFieldError('email');
    } else if (type === 'cel') {
      setBuyerDetails(prev => ({ ...prev, cel: val }));
      if (val.search(/\S/) !== -1) clearFieldError('cel');
    } else if (type === 'address') {
      setBuyerDetails(prev => ({ ...prev, delievryaddress: val }));
    } else if (type === 'notes') {
      setBuyerDetails(prev => ({ ...prev, notes: val }));
    }
  };

  return (
    <View style={styles.purpleBox}>
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
              backgroundColor: theme.background,
              borderRadius: 5,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.background,
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
                            color: theme.primary,
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

      {/* ---------- Select Order Date modal ---------- */}
      <Modal
        supportedOrientations={['landscape']}
        animationType="fade"
        transparent={true}
        visible={showDateModal}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <TouchableOpacity
              style={styles.pickerModalCloseBtn}
              onPress={() => setShowDateModal(false)}
            >
              <Ionicons
                name="close"
                size={responsiveFontSize(1.8)}
                color={theme.fontColorOnBackground}
              />
            </TouchableOpacity>

            <Text style={styles.pickerModalTitle}>
              <Text style={styles.pickerModalTitleAccentDark}>
                {t('SELECT_YOUR_ORDER')}{' '}
              </Text>
              <Text style={styles.pickerModalTitleAccentOrange}>Date</Text>
            </Text>
            <Text style={styles.pickerModalSubtitle}>
              {t('CHOOSE_A_SERVICE')}
            </Text>
            <View style={styles.pickerModalUnderline} />

            <ScrollView style={styles.pickerModalList}>
              {orderDateOptions.map((dateItem, index) => (
                <TouchableOpacity
                  key={'order_date_' + index}
                  disabled={!dateItem.isOpen}
                  style={[
                    styles.pickerRow,
                    dateItem.isToday && styles.pickerRowSelected,
                    !dateItem.isOpen && { opacity: 0.4 },
                  ]}
                  onPress={() => handleSelectPreorderDate(dateItem)}
                >
                  <View style={styles.pickerRowIconWrap}>
                    <Ionicons
                      name="calendar-outline"
                      size={responsiveFontSize(1.5)}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.pickerRowMiddle}>
                    <Text style={styles.pickerRowDateText}>
                      {dateItem.label}
                    </Text>
                    {dateItem.isToday ? (
                      <View style={styles.pickerTodayBadge}>
                        <Text style={styles.pickerTodayBadgeText}>{t('TODAY')}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.pickerRowWeekday,
                      dateItem.isSunday && styles.pickerRowWeekdaySunday,
                    ]}
                  >
                    {dateItem.isOpen ? dateItem.weekday : 'Closed'}
                  </Text>
                  {dateItem.isOpen ? (
                    <Ionicons
                      name="chevron-forward"
                      size={responsiveFontSize(1.4)}
                      color={theme.fontColorOnBackground}
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ---------- Select Order Time modal ---------- */}
      <Modal
        supportedOrientations={['landscape']}
        animationType="fade"
        transparent={true}
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <TouchableOpacity
              style={styles.pickerModalCloseBtn}
              onPress={() => setShowTimeModal(false)}
            >
              <Ionicons
                name="close"
                size={responsiveFontSize(1.8)}
                color={theme.fontColorOnBackground}
              />
            </TouchableOpacity>

            <Text style={styles.pickerModalTitle}>
              <Text style={styles.pickerModalTitleAccentDark}>
                {t('SELECT_YOUR_ORDER')}{' '}
              </Text>
              <Text style={styles.pickerModalTitleAccentOrange}>{t('TIME')}</Text>
            </Text>
            <Text style={styles.pickerModalSubtitle}>
              {t('CHOOSE_THE_TIME_THAT_WORKS_BEST_FOR_YOU')}
            </Text>
            <View style={styles.pickerModalUnderline} />

            <ScrollView style={styles.pickerModalList}>
              {selectedDateTimeSlots.length > 0 ? (
                selectedDateTimeSlots.map((timeItem, index) => {
                  const isSelected = selectedPreorderTime === timeItem.label;
                  return (
                    <TouchableOpacity
                      key={'order_time_' + index}
                      style={[
                        styles.pickerRow,
                        isSelected && styles.pickerRowSelected,
                      ]}
                      onPress={() => handleSelectPreorderTime(timeItem)}
                    >
                      <View style={styles.pickerRowIconWrap}>
                        <Ionicons
                          name="time-outline"
                          size={responsiveFontSize(1.5)}
                          color={theme.primary}
                        />
                      </View>
                      <Text style={styles.pickerRowTimeText}>
                        {timeItem.label}
                      </Text>
                      {isSelected ? (
                        <View style={styles.pickerCheckBadge}>
                          <Ionicons
                            name="checkmark"
                            size={responsiveFontSize(1.1)}
                            color={theme.fontColor}
                          />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text
                  style={[
                    styles.pickerModalSubtitle,
                    { paddingVertical: responsiveHeight(2) },
                  ]}
                >
                  {t('NO_AVALIABLE_TIME_SLOTS_FOR_THIS_DATE')}
                </Text>
              )}
            </ScrollView>

            <View style={styles.pickerNoticeBar}>
              <Ionicons
                name="alarm-outline"
                size={responsiveFontSize(1.5)}
                color={theme.secondary}
              />
              <Text style={styles.pickerNoticeText}>
                {t('ESTIMATED_READY_TIME_WILL_BE')}{' '}
                <Text style={styles.pickerNoticeTextAccent}>
                  {t('SHOWN_AT_CHECKOUT')}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- How would you like to order? modal ---------- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showOrderTypeModal}
        onRequestClose={() => setShowOrderTypeModal(false)}
      >
        <View style={styles.orderTypeModalOverlay}>
          <View style={styles.orderTypeModalCard}>
            <TouchableOpacity
              style={styles.orderTypeModalCloseBtn}
              onPress={() => setShowOrderTypeModal(false)}
            >
              <Ionicons name="close" size={responsiveFontSize(1.6)} color={theme.fontColorOnBackground} />
            </TouchableOpacity>

            <Text style={styles.pickerModalTitle}>
              <Text style={styles.pickerModalTitleAccentDark}>{t('How Would You Like to')} </Text>
              <Text style={styles.pickerModalTitleAccentOrange}>{t('HOW_TO_ORDER_HIGHLIGHTS')}</Text>
            </Text>
            <Text style={styles.pickerModalSubtitle}>
              {t('CHOOSE_A_SERVICE')}
            </Text>
            <View style={styles.pickerModalUnderline} />
            <View style={styles.serviceTypeRow}>
              {serviceTypeOptions.map(opt => {
                const isSelected = selectedServiceType === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.serviceTypeCard,
                      isSelected && styles.serviceTypeCardSelected,
                    ]}
                    onPress={() => setSelectedServiceType(opt.key)}
                  >
                    {isSelected ? (
                      <View style={styles.serviceTypeCheckBadge}>
                        <Ionicons name="checkmark" size={responsiveFontSize(0.95)} color={theme.fontColor} />
                      </View>
                    ) : null}
                    <Ionicons
                      name={opt.icon}
                      size={responsiveFontSize(1.8)}
                      color={isSelected ? theme.primary : theme.fontColorOnBackground}
                      style={{ marginBottom: responsiveHeight(0.6) }}
                    />
                    <Text style={styles.serviceTypeLabel}>{opt.label}</Text>
                    <Text style={styles.serviceTypeSub} numberOfLines={2}>
                      {opt.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.orderTypeModalDivider} />
            <Text style={styles.pickerModalTitle}>
              <Text style={styles.pickerModalTitleAccentOrange}>{t('WHEN_WOULD_YOU_LIKE')} </Text>
              <Text style={styles.pickerModalTitleAccentDark}>{t('YOUR_ORDER')}?</Text>
            </Text>
            <View style={styles.pickerModalUnderline} />

            <View style={styles.timingRow}>
              <TouchableOpacity
                style={[
                  styles.timingCard,
                  orderTiming === 'now' && styles.timingCardSelectedNow,
                ]}
                onPress={() => setOrderTiming('now')}
              >
                <View style={styles.timingIconWrapNow}>
                  <Ionicons name="time-outline" size={responsiveFontSize(1.5)} color={theme.fontColor} />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.timingLabel}>{t('NOW')}</Text>
                  <Text style={styles.timingSub}>{t('GOT_IT_AS_SOON_AS_POSSIBLE')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timingCard,
                  orderTiming === 'later' && styles.timingCardSelectedLater,
                ]}
                onPress={() => setOrderTiming('later')}
              >
                <View style={styles.timingIconWrapLater}>
                  <Ionicons name="calendar-outline" size={responsiveFontSize(1.5)} color={theme.fontColor} />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.timingLabel}>{t('PREORDER_FROM_TYPE')}</Text>
                  <Text style={styles.timingSub}>{t('PREORDER_FROM_TYPE_DESCRIPTION')}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={confirmOrderTypeSelection} activeOpacity={0.85}>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.orderTypeConfirmBtn}
              >
                <Ionicons name="calendar-outline" size={responsiveFontSize(1.3)} color={theme.fontColor} />
                <Text style={styles.orderTypeConfirmBtnText}>
                  {orderTiming === 'later' ? t('SELECT_DATE_TIME') : t('CONFIRM')}
                </Text>
                <Ionicons name="arrow-forward" size={responsiveFontSize(1.3)} color={theme.fontColor} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* {viewloader === true ? <Loader /> : null} */}
      {viewloader === true ? <CheckoutSkeleton styles={styles} /> : null}

      {CartDish.isLoading === false && CartDish.list.length > 0 ? (
        <>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'always'}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ---------- First Name ---------- */}
            {/* <Text style={styles.headerText}>{t('NAME')}</Text> */}
            <View style={styles.inputBlock}
              onLayout={registerFieldPosition('name')}
            >
              <View
                style={[styles.inputRow, errors.name && styles.inputRowError]}
              >
                <View style={styles.inputIconWrap}>
                  <Feather
                    name="user"
                    size={responsiveFontSize(1.5)}
                    color={theme.primary}
                  />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder={t('NAME')}
                  placeholderTextColor={theme.fontColorOnBackground}
                  value={buyerDetails.name}
                  onChangeText={text => setBuyerInfo(text, 'name')}
                />
              </View>
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>
            {/* ---------- Last Name ---------- */}
            {/* <Text style={styles.headerText}>{t('LAST_NAME')}</Text> */}
            <View style={styles.inputBlock}
              onLayout={registerFieldPosition('last_name')}
            >
              <View
                style={[
                  styles.inputRow,
                  errors.last_name && styles.inputRowError,
                ]}
              >
                <View style={styles.inputIconWrap}>
                  <Feather
                    name="user"
                    size={responsiveFontSize(1.5)}
                    color={theme.primary}
                  />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder={t('LAST_NAME')}
                  placeholderTextColor={theme.fontColorOnBackground}
                  value={buyerDetails.last_name}
                  onChangeText={text => setBuyerInfo(text, 'last_name')}
                />
              </View>
              {errors.last_name ? (
                <Text style={styles.errorText}>{errors.last_name}</Text>
              ) : null}
            </View>
            {/* ---------- Phone No ---------- */}
            {/* <Text style={styles.headerText}>{t('PHONENO')}</Text> */}
            <View style={[styles.inputBlock, {
              position: 'relative',
              zIndex: 20,
              elevation: Platform.OS === 'android' ? 5 : 0,
            },]}
              onLayout={registerFieldPosition('cel')}
            >
              <View
                style={[styles.inputRow, errors.cel && styles.inputRowError]}
              >
                <View style={styles.inputIconWrap}>
                  <Feather
                    name="phone"
                    size={responsiveFontSize(1.5)}
                    color={theme.primary}
                  />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder={t('PHONENO')}
                  placeholderTextColor={theme.fontColorOnBackground}
                  value={buyerDetails.cel}
                  onChangeText={text => {
                    setBuyerInfo(text, 'cel');
                    FetchUserByPhone(text);
                  }}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              {errors.cel ? (
                <Text style={styles.errorText}>{errors.cel}</Text>
              ) : null}

              {menuVisible && userlist.length > 0 && (
                <View style={styles.phoneMenu}>
                  <ScrollView keyboardShouldPersistTaps={'always'}>
                    {userlist.map((item, index) => (
                      <TouchableOpacity
                        key={'cel_t' + index}
                        onPress={() => {
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
            {/* ---------- Email ---------- */}
            {/* <Text style={styles.headerText}>{t('EMAIL')}</Text> */}
            <View style={styles.inputBlock}>
              <View style={styles.inputRow}>
                <View style={styles.inputIconWrap}>
                  <Feather
                    name="mail"
                    size={responsiveFontSize(1.5)}
                    color={theme.primary}
                  />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder={t('EMAIL')}
                  placeholderTextColor={theme.fontColorOnBackground}
                  value={buyerDetails.email}
                  onChangeText={text => setBuyerInfo(text, 'email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            {/* ---------- Address ---------- */}
            {(selectedServiceType === 'delivery' || selectedServiceType === 'catering-delivery') ? (
              <View style={[styles.inputBlock, styles.addressOverlayWrap]}
                onLayout={registerFieldPosition('delievryaddress')}
              >
                <View style={[styles.inputRow, styles.addressInputRow]}>
                  <View style={styles.inputIconWrap}>
                    <Feather name="map-pin" size={responsiveFontSize(1.5)} color={theme.primary} />
                  </View>

                  <GooglePlacesAutocomplete
                    placeholder={t('ADDRESS')}
                    fetchDetails={true}
                    onPress={handleAddressSelected}
                    onFail={error => console.log('Places error:', error)}
                    query={{ key: GOOGLE_PLACES_API_KEY, language: 'en' }}
                    textInputProps={{
                      value: buyerDetails.delievryaddress,
                      placeholderTextColor: theme.fontColorOnBackground,
                      onChangeText: text => {
                        setBuyerDetails(prev => ({
                          ...prev,
                          delievryaddress: text,
                          lat: null,
                          lng: null,
                        }));
                        setAddressDistanceError('');
                        setDeliveryZoneError('');
                        setDeliveryZoneMatch(null);
                        if (text.search(/\S/) != -1) clearFieldError('delievryaddress');
                      },
                    }}

                    styles={{
                      container: { flex: 1 },
                      textInput: [styles.inputField, { height: responsiveHeight(5), paddingVertical: 0 }],
                      listView: styles.addressSuggestionList,
                    }}
                    enablePoweredByContainer={false}
                  />
                </View>
                {selectedServiceType === 'pickup' && addressDistanceError ? (
                  <Text style={styles.errorText}>{addressDistanceError}</Text>
                ) : null}
                {selectedServiceType === 'delivery' && deliveryZoneError ? (
                  <Text style={styles.errorText}>{deliveryZoneError}</Text>
                ) : null}
                {errors.delievryaddress ? (
                  <Text style={styles.errorText}>{errors.delievryaddress}</Text>
                ) : null}
                {selectedServiceType === 'delivery' && deliveryZoneMatch ? (
                  <Text style={styles.successText}>
                    {t('DELIEVRY_FEE')}: {activeBusiness != null ? activeBusiness.currency_symbol : null}
                    {deliveryZoneMatch.price.toFixed(2)}
                    {deliveryZoneMatch.minimumpur > 0
                      ? ` (min order ${activeBusiness != null ? activeBusiness.currency_symbol : ''}${deliveryZoneMatch.minimumpur})`
                      : ''}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {/* ---------- Discount coupon ---------- */}
            {discountInfo.discounttype !== 'offer' ? (
              <View style={{ marginBottom: responsiveHeight(0.5) }}>
                <View style={styles.couponRow}>
                  <View style={styles.couponInputWrap}>
                    <View style={styles.inputRow}>
                      <View style={styles.inputIconWrap}>
                        <Feather
                          name="tag"
                          size={responsiveFontSize(1.5)}
                          color={theme.primary}
                        />
                      </View>
                      <TextInput
                        style={styles.inputField}
                        placeholder="Discount Coupon"
                        placeholderTextColor={theme.fontColorOnBackground}
                        value={discount_code}
                        // 1. Re-enable the Apply button as soon as user taps into the field
                        onFocus={() => {
                          if (discountInfo.discounttype === 'code') {
                            setDiscountInfo({
                              discounttext: null,
                              discounttype: null,
                              discountid: null,
                            });
                            setDiscount(0.0);
                            // Recalculate totals without the applied discount
                            let cart = JSON.parse(JSON.stringify(CartDish.list));
                            CalDiscountCode(cart, 0, CartSubTotal);
                          }
                          if (couponMessage.text) {
                            setCouponMessage({ text: '', isError: false });
                          }
                        }}
                        // 2. Clear applied discount if text changes
                        onChangeText={text => {
                          setDiscountCode(text);

                          if (couponMessage.text) {
                            setCouponMessage({ text: '', isError: false });
                          }

                          if (discountInfo.discounttype === 'code') {
                            setDiscountInfo({
                              discounttext: null,
                              discounttype: null,
                              discountid: null,
                            });
                            setDiscount(0.0);

                            let cart = JSON.parse(JSON.stringify(CartDish.list));
                            CalDiscountCode(cart, 0, CartSubTotal);
                          }
                        }}
                      />
                    </View>
                  </View>

                  {/* Button State Logic */}
                  {update_action_status === true || discountInfo.discounttype === 'code' ? (
                    <View style={styles.applyBtnDisabled}>
                      <Text style={styles.applyBtnTextDisabled}>{t('APPLY')}</Text>
                    </View>
                  ) : CartDish.list.length > 0 && discount_code.trim().length > 0 ? (
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => {
                        Keyboard.dismiss();
                        CheckDiscount();
                      }}
                    >
                      <Text style={styles.applyBtnText}>{t('APPLY')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.applyBtnDisabled}>
                      <Text style={styles.applyBtnTextDisabled}>{t('APPLY')}</Text>
                    </View>
                  )}
                </View>
                {/* Display inline validation text below the field */}
                {couponMessage.text ? (
                  <Text style={couponMessage.isError ? styles.errorText : styles.successText}>
                    {couponMessage.text}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* ---------- Estimate time ---------- */}
            <View style={[styles.dropdownBlock]}
              onLayout={registerFieldPosition('selectedTime')}
            >
              <EstimateTimeDropdown
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                clearFieldError={clearFieldError}
                errors={errors}
                timeOptions={timeOptions}
                styles={styles}
                theme={theme}
              />
              {errors.selectedTime ? (
                <Text style={styles.errorText}>{errors.selectedTime}</Text>
              ) : null}
            </View>

            {/* ---------- Preorder date/time summary ---------- */}
            {orderMode === 'preorder' &&
              selectedPreorderDate &&
              selectedPreorderTime ? (
              <View style={styles.preorderSummaryBar}>
                <TouchableOpacity
                  style={styles.preorderSummaryCloseBadge}
                  onPress={clearPreorderSelection}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="close"
                    size={responsiveFontSize(1)}
                    color={theme.fontColorOnBackground}
                  />
                </TouchableOpacity>
                <Text style={styles.preorderSummaryTitle}>
                  {t('YOUR_PREORDER_DATE_TIME')}
                </Text>
                <View style={styles.preorderSummaryRow}>
                  <Text style={styles.preorderSummaryLabel}>
                    {t('DATE')}:{' '}
                    <Text style={styles.preorderSummaryDateValue}>
                      {selectedPreorderDate}
                    </Text>
                  </Text>
                  <Text style={styles.preorderSummaryLabel}>
                    {t('TIME')}:{' '}
                    <Text style={styles.preorderSummaryTimeValue}>
                      {selectedPreorderTime}
                    </Text>
                  </Text>
                </View>
              </View>
            ) : null}
            {/* ---------- Preorder / Pickup toggle ---------- */}
            <View style={styles.orderModeBlock}>
              <TouchableOpacity
                style={styles.orderModeBtn}
                onPress={openPreorderFlow}
              >
                <Text style={styles.orderModeBtnText}>
                  {t('PREORDER')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.orderModeBtn, {
                }]}
                onPress={hasSingleOrderType ? undefined : () => setShowOrderTypeModal(true)}
              >
                <View style={styles.orderModePickupLabelRow}>
                  <Text style={styles.orderModeBtnText}>
                    {selectedServiceTypeLabel}
                  </Text>
                  {hasSingleOrderType ? null : (
                    <TouchableOpacity
                      onPress={() => setShowOrderTypeModal(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.orderModePickupEditIcon}>
                      <Feather
                        name="edit-2"
                        size={responsiveFontSize(1.15)}
                        color={theme.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
            {/* ---------- Cart items ---------- */}
            {CartDish.list.map((cartdish, cartindex) => {
              return cartdish.dish.map((cdish, dishindex) => {
                return cdish.data.map((dish, dataindex) => {
                  return (
                    <View style={styles.cartItemCard} key={'cdish_' + dataindex}>
                      <View style={styles.cartItemTopSection}>
                        {dish.is_img ? (
                          <View style={styles.cartItemImageWrap}>
                            <Image
                              source={{ uri: dish.is_img }}
                              style={styles.cartItemImage}
                              resizeMode="cover"
                            />
                          </View>

                        ) : null}
                        <View style={styles.cartItemBody}>
                          <View style={styles.cartItemTopRow}>
                            <View style={styles.cartItemNameRow}>
                              <View style={styles.cartItemQtyBadge}>
                                <Text style={styles.cartItemQtyBadgeText}>{dish.quantity}</Text>
                              </View>
                              <Text style={styles.cartItemName} numberOfLines={1} ellipsizeMode="tail">
                                {dish.name}
                              </Text>
                            </View>
                            <Text style={styles.cartItemPrice}>
                              {activeBusiness != null ? activeBusiness.currency_symbol : null}
                              {dish.total}
                            </Text>
                          </View>

                          {dish.sets.length > 0
                            ? dish.sets.map((set, set_index) => {
                              return set.choice.length > 0
                                ? set.choice.map((choice, choice_index) => (
                                  <Text
                                    key={'choice_' + set_index + '_' + choice_index}
                                    style={styles.cartItemCategory}
                                    numberOfLines={1}
                                  >
                                    {choice.qty} X {choice.name} -{' '}
                                    {activeBusiness != null ? activeBusiness.currency_symbol : null}
                                    {choice.price}
                                  </Text>
                                ))
                                : null;
                            })
                            : null}
                          {dish.activeIngredients.length > 0 ? (
                            <Text style={styles.cartItemCategory} numberOfLines={2} ellipsizeMode="tail">
                              {dish.activeIngredients.join(', ')}
                            </Text>
                          ) : null}
                          {dish.sets.length > 0
                            ? dish.sets.map((set, set_index) => {
                              return set.choice.length > 0
                                ? set.choice.map((choice, choice_index) => (
                                  <Text
                                    key={'choice_' + set_index + '_' + choice_index}
                                    style={styles.cartItemCategory}
                                    numberOfLines={1}
                                  >
                                    {'- '}
                                    {choice.name}
                                    {' x '}
                                    {choice.qty}
                                    {' - '}
                                    {activeBusiness != null ? activeBusiness.currency_symbol : null}
                                    {choice.price}
                                  </Text>
                                ))
                                : null;
                            })
                            : null}
                        </View>
                      </View>
                      {/* ---------- Note (full width, sits above the qty stepper) ---------- */}
                      {(() => {
                        const noteKey = `${cartindex}-${dishindex}-${dataindex}`;
                        const isEditingThisNote = editingNoteKey === noteKey;

                        if (isEditingThisNote) {
                          return (
                            <View style={styles.cartItemNoteEditRow}>
                              <TextInput
                                style={styles.cartItemNoteInput}
                                value={noteDraft}
                                onChangeText={setNoteDraft}
                                placeholder={t('ADD_A_NOTE')}
                                placeholderTextColor={theme.fontColorOnBackground}
                                multiline
                                autoFocus
                                onBlur={() => saveNote(cartindex, dishindex, dataindex)}
                              />
                              <TouchableOpacity
                                style={styles.cartItemNoteSaveBtn}
                                onPress={() => saveNote(cartindex, dishindex, dataindex)}
                              >
                                <Ionicons name="checkmark-sharp" size={responsiveFontSize(1.3)} color={theme.primary} />
                              </TouchableOpacity>
                            </View>
                          );
                        }
                        return (
                          <TouchableOpacity
                            style={styles.cartItemNoteRow}
                            onPress={() => startEditingNote(noteKey, dish.notes)}
                          >
                            <View style={styles.cartItemNoteIcon}>
                              <Feather name="edit-2" size={responsiveFontSize(1.05)} color={theme.primary} />
                            </View>
                            {dish.notes ? (
                              <Text style={styles.cartItemNoteText} numberOfLines={2}>
                                {dish.notes}
                              </Text>
                            ) : (
                              <Text style={styles.cartItemNotePlaceholder}>{t('ADD_A_NOTE')}...</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })()}

                      {/* Qty stepper + edit/delete now span the full card width, left-aligned
                     under the image, matching the mock */}
                      <View style={styles.cartItemBottomRow}>
                        <View style={styles.qtyStepper}>
                          <TouchableOpacity
                            style={styles.qtyStepperBtn}
                            onPress={() => addTocartDecrement(cartindex, dishindex, dataindex)}
                          >
                            <Ionicons name="remove" size={responsiveFontSize(1.5)} color={theme.fontColorOnBackground} />
                          </TouchableOpacity>
                          <Text style={styles.qtyStepperValue}>{dish.quantity}</Text>
                          <TouchableOpacity
                            style={styles.qtyStepperBtn}
                            onPress={() => addTocartIncrement(cartindex, dishindex, dataindex)}
                          >
                            <Ionicons name="add" size={responsiveFontSize(1.5)} color={theme.fontColorOnBackground} />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => deleteCartItem(cartindex, dishindex, dataindex)}
                        >
                          <Feather name="trash-2" size={responsiveFontSize(1.3)} color={theme.cancelButton} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                });
              });
            })}
            {/* ---------- Fee breakdown ---------- */}
            {PendingMinimumFee > 0.0 ? null : (
              <>
                <View style={styles.feeBox}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>{t('SUBTOTAL')}</Text>
                    <Text style={styles.feeValue}>
                      {activeBusiness.currency_symbol}
                      {CartSubTotal}
                    </Text>
                  </View>
                  {cartFee.map((cartfee, index) => {
                    return (
                      <View key={'carefee_' + index}>
                        {cartfee.deliverycost > 0 ? (
                          <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('DELIEVRY_FEE')}</Text>
                            <Text style={styles.feeValue}>
                              {activeBusiness.currency_symbol}
                              {parseFloat(cartfee.deliverycost).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}
                        {cartfee.taxprice > 0 ? (
                          <View style={styles.feeRow}>
                            <View>
                              <Text style={styles.feeLabel}>
                                {t('ORDER_TEMPLATE_TAX')} ({cartfee.tax}%)
                              </Text>
                            </View>
                            <Text style={styles.feeValue}>
                              {activeBusiness.currency_symbol}
                              {parseFloat(cartfee.taxprice).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}
                        {cartfee.servicefeeprice > 0 ? (
                          <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>
                              {t('SERVICE_FEE')} ({cartfee.servicefee}%)
                            </Text>
                            <Text style={styles.feeValue}>
                              {activeBusiness.currency_symbol}
                              {parseFloat(cartfee.servicefeeprice).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}

                        {cartfee.tips > 0 ? (
                          <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('TIPS')}</Text>
                            <Text style={styles.feeValue}>
                              {activeBusiness.currency_symbol}
                              {parseFloat(cartfee.tips).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}

                        {cartfee.discount > 0 ? (
                          <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>{t('DISCOUNT')}</Text>
                            <Text style={styles.feeValueDiscount}>
                              {'-'}
                              {activeBusiness.currency_symbol}
                              {parseFloat(cartfee.discount).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}

                        {cartfee?.autodiscount > 0 ? (
                          <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>
                              {cartfee?.firstoffer?.message}(
                              {cartfee?.firstoffer?.data[0]?.distext})
                            </Text>
                            <Text style={styles.feeValueDiscount}>
                              {'-'}
                              {activeBusiness.currency_symbol}
                              {parseFloat(cartfee.autodiscount).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}
                        <View style={styles.totalDivider} />
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>{t('TOTAL')}</Text>
                          <Text style={styles.totalValue}>
                            {activeBusiness.currency_symbol}
                            {parseFloat(cartfee.total).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.totalDivider} />
                {/* ---------- Notes ---------- */}
                <View style={styles.notesBlock}>

                  <TextInput
                    style={styles.notesInput}
                    placeholder={t('NOTE') + "..."}
                    placeholderTextColor={theme.fontColorOnBackground}
                    value={buyerDetails.notes}
                    onChangeText={text => setBuyerInfo(text, 'notes')}
                    multiline
                    maxLength={NOTES_MAX_LENGTH}
                  />
                  <Text style={styles.notesCounter}>
                    {(buyerDetails.notes || '').length}/{NOTES_MAX_LENGTH}
                  </Text>
                </View>

                {displaypaircode === true ? (
                  <View style={styles.inputBlock}
                    onLayout={registerFieldPosition('paircode')}
                  >
                    <View
                      style={[
                        styles.inputRow,
                        errors.paircode && styles.inputRowError,
                      ]}
                    >
                      <View style={styles.inputIconWrap}>
                        <Ionicons
                          name="keypad-outline"
                          size={responsiveFontSize(1.5)}
                          color={theme.fontColorOnBackground}
                        />
                      </View>
                      <TextInput
                        style={styles.inputField}
                        placeholder="Terminal PairCode"
                        placeholderTextColor={theme.fontColorOnBackground}
                        value={paircode}
                        onChangeText={text => {
                          setPaircode(text);
                          if (text.search(/\S/) != -1)
                            clearFieldError('paircode');
                        }}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                    {errors.paircode ? (
                      <Text style={styles.errorText}>{errors.paircode}</Text>
                    ) : null}
                  </View>
                ) : null}
                {/* ---------- Payment method cards ---------- */}
                <View style={{ marginBottom: responsiveHeight(1) }}
                  onLayout={registerFieldPosition('paymentId')}
                >
                  <View style={styles.paymentRow}>
                    {paymentMethod.isLoading === false &&
                      paymentMethod.list.length > 0
                      ? paymentMethod.list.map((item, index) => {
                        return (
                          <TouchableOpacity
                            key={'pay_' + index}
                            style={[
                              styles.paymentCard,
                              item.active && styles.paymentCardSelected,
                            ]}
                            onPress={() => {
                              SelectPayment(item);
                              setPaymentIndex(index);
                            }}
                          >
                            <View style={styles.paymentCardIconWrap}>
                              <Ionicons
                                name={
                                  item.payment_method &&
                                    item.payment_method.toLowerCase() === 'cash'
                                    ? 'cash-outline'
                                    : 'card-outline'
                                }
                                size={responsiveFontSize(1.8)}
                                color={theme.primary}
                              />
                            </View>

                            <Text style={styles.paymentCardLabel}>
                              {item.payment_method}
                            </Text>
                            {item.active ? (
                              <View style={styles.paymentCheckBadge}>
                                <Ionicons
                                  name="checkmark"
                                  size={responsiveFontSize(1.3)}
                                  color={theme.fontColor}
                                />
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })
                      : null}
                  </View>
                  {errors.paymentId ? (
                    <Text style={styles.errorText}>{errors.paymentId}</Text>
                  ) : null}
                </View>
                {/* ---------- Pay now ---------- */}

              </>
            )}
          </ScrollView>
          <View style={styles.stickyPayNowBar}>
            {PendingMinimumFee > 0.0 ? (
              <Text style={styles.minimumFeeText}>
                {t('MINIMUM_PRICE_NEED_TO_ADD')} {activeBusiness.currency_symbol}
                {PendingMinimumFee}
              </Text>
            ) : update_action_status === true ? (
              <View style={styles.button_disable}>
                <Text style={styles.buttonTextDisabled}>{t('PAY_NOW')}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  CheckallDetails();
                }}
              >
                <Text style={styles.buttonText}>{t('PAY_NOW')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) :
        CartDish.isLoading === true ? (
          <View style={styles.emptyWrap}>
            <EmptyCartSkeleton />
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={responsiveFontSize(5)} color={theme.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('NO_PRODUCTS_IN_YOUR_CART')}</Text>
            <Text style={styles.emptySubtitle}>{t('ADD_ITEMS_FROM_THE_MENU_TO_GET_STARTTED')} </Text>
          </View>
        )
      }
    </View>
  );
};

export default HomeRight;

