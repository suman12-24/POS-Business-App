import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/native-stack';
import {
  Home,
  MyAccount,
  MyOrder,
  MyOrderComplete,
  MyOrderInprogress,
  OrderSuccess,
  MyAccountDelete,
} from '../Screens';
import { Icons, Images } from '../Constants/ImageIconContant';
import { Inter } from '../Constants/Fonts';
import { Icon } from 'react-native-basic-elements';
import { CommonActions } from '@react-navigation/native'; // add this import at the top
import { useAppTheme } from "../Hooks/useAppTheme"
import useTranslation from '../Hooks/useTranslation';
import Feather from 'react-native-vector-icons/Feather';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
const Bottom = createBottomTabNavigator();
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData } from '../Service/localStorage';
import { postWithOutToken, postWithToken } from '../Service/service';
import { removeData } from '../Service/localStorage';
import { clearUserData } from '../Store/Reducers/CommonReducer';
import Modal from 'react-native-modal';
import OrderDetailScreen from '../Screens/myorder/OrderDetailScreen';
import OrderDetailInprogress from '../Screens/myorder/OrderDetailInprogress';
import OrderDetailComplete from '../Screens/myorder/OrderDetailComplete';
import MyOrderCancel from '../Screens/myorder/MyOrderCancel';
import OrderCancelDetailsScreen from '../Screens/myorder/OrderCancelDetailsScreen';
import OrderDetailFromNotification from '../Screens/myorder/OrderDetailFromNotification';
import ReportScreen from '../Screens/myaccount/report';
import CounterPrinterSettings from '../Screens/myaccount/CounterPrinter';
import KitchenPrinterSettings from '../Screens/myaccount/CounterPrinter/KitchenPrinter';

const MyOrderStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      initialRouteName="H"
      screenOptions={{ headerShown: false }}
    >
      <HomeStack.Screen name="H" component={Home} />
      <HomeStack.Screen name="OrderSuccess" component={OrderSuccess} />
    </HomeStack.Navigator>
  );
}

function MyOrderStackScreen() {
  return (
    <MyOrderStack.Navigator
      initialRouteName="MyOrder"
      screenOptions={{ headerShown: false }}
    >
      <MyOrderStack.Screen name="MyOrder" component={MyOrder} />
      <MyOrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />

      <MyOrderStack.Screen name="MyOrderInprogress" component={MyOrderInprogress} />
      <MyOrderStack.Screen name="OrderDetailInprogress" component={OrderDetailInprogress} />

      <MyOrderStack.Screen name="MyOrderComplete" component={MyOrderComplete} />
      <MyOrderStack.Screen name="OrderDetailComplete" component={OrderDetailComplete} />

      <MyOrderStack.Screen name="MyOrderCancel" component={MyOrderCancel} />
      <MyOrderStack.Screen name="OrderCancelDetails" component={OrderCancelDetailsScreen} />

      <MyOrderStack.Screen name="OrderDetailFromNotification" component={OrderDetailFromNotification} />
    </MyOrderStack.Navigator>
  );
}

function AccountStackScreen() {
  return (
    <AccountStack.Navigator
      initialRouteName="MyAccount"
      screenOptions={{ headerShown: false }}
    >
      <AccountStack.Screen name="MyAccount" component={MyAccount} />
      <AccountStack.Screen name="MyAccountDelete" component={MyAccountDelete} />

      <AccountStack.Screen name="CounterPrinterSettings" component={CounterPrinterSettings} />

      <AccountStack.Screen name="KitchenPrinterSettings" component={KitchenPrinterSettings} />

      <AccountStack.Screen name="Report" component={ReportScreen} />
    </AccountStack.Navigator>
  );
}

// ---- Skeleton loader shown while logout is in progress ----
const SKELETON_BASE_COLOR = '#E1E1E1';
const SKELETON_CARD_COLOR = '#FFFFFF';

const SkeletonLoader = () => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);
  return (
    <View style={styles.skeletonOverlay}>
      <View style={[styles.skeletonCard, { backgroundColor: SKELETON_CARD_COLOR }]}>
        <Animated.View
          style={[
            styles.skeletonCircle,
            { opacity: pulseAnim, backgroundColor: SKELETON_BASE_COLOR },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineWide,
            { opacity: pulseAnim, backgroundColor: SKELETON_BASE_COLOR },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineMedium,
            { opacity: pulseAnim, backgroundColor: SKELETON_BASE_COLOR },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineNarrow,
            { opacity: pulseAnim, backgroundColor: SKELETON_BASE_COLOR },
          ]}
        />
      </View>
    </View>
  );
};

const BottomNavigation = ({ props, navigation }) => {
  const dispatch = useDispatch();
  const {
    baseUrl,
    siteUrl,
    userToken,
    userData,
    post_data,
    deviceToken,
    langId,
  } = useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [cnfModal, setCnfModal] = useState(false);
  const theme = useAppTheme()
  const { t } = useTranslation();
  const LogoutAction = () => {
    setCnfModal(true);
  };

  const CloseConfimModel = () => {
    setLoader(false);
    setCnfModal(false);
  };

  function handleLogout() {
    console.log(userData);
    console.log(userData.id);
    setLoader(true);
    setCnfModal(false);

    postWithToken(
      baseUrl,
      'logout',
      { device_id: deviceToken },
      userToken,
    )
      .then(response => {
        console.log(response);
        dispatch(clearUserData());
        removeData('userDetails');
        removeData('userToken');
        // removeData("device_token");

        setTimeout(() => {
          setLoader(false);
          navigation.navigate('Login');
        }, 500);
      })
      .catch(error => {
        setLoader(false);
        console.log('Error : ', error);
      });
  }

  //initialRouteName="Home"

  return (
    <>
      {viewloader === true ? <SkeletonLoader /> : null}
      <Bottom.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: theme.secondary,
          tabBarInactiveTintColor: theme.fontColor,
          tabBarShowLabel: true,
          headerShadowVisible: false,
          tabBarStyle: {
            //height: 65,
            //paddingBottom: 5,
            borderTopColor: theme.secondary,
            borderTopWidth: 6,
            borderTopStartRadius: 15,
            borderTopEndRadius: 15,
            overflow: 'hidden',
            backgroundColor: theme.primary,
          },
        }}
      >
        {/* == For showing Tabs under sidemenu == */}
        <Bottom.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarLabel: t('CREATE_ORDER'),
            tabBarIcon: ({ color, size }) => {
              return (
                <Icon
                  name="shoppingcart"
                  type="AntDesign"
                  color={color}
                  size={size}
                />
              );
            },
            tabBarLabelStyle: {
              fontFamily: Inter.semibold,
              fontSize: responsiveFontSize(1),
            },
          }}
          listeners={({ navigation, route }) => ({
            blur: () => {
              const state = navigation.getState();
              const tabRoute = state.routes.find(r => r.name === 'Home');
              const nestedState = tabRoute?.state;

              // Only reset if we're deeper than the root screen (MyOrder)
              if (nestedState && nestedState.index > 0) {
                navigation.dispatch({
                  ...CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'H' }],
                  }),
                  target: nestedState.key,
                });
              }
            },
          })}
        />
        <Bottom.Screen
          name="MyOrder_Tab"
          component={MyOrderStackScreen}
          options={{
            tabBarLabel: t('MY_ORDER'),
            tabBarIcon: ({ color, size }) => {
              return (
                <Icon
                  name="shopping-bag"
                  type="Feather"
                  size={size}
                  color={color}
                />
              );
            },
            tabBarLabelStyle: {
              fontFamily: Inter.semibold,
              fontSize: responsiveFontSize(1),
            },
            tabBarIconStyle: {},
          }}
          listeners={({ navigation, route }) => ({
            blur: () => {
              const state = navigation.getState();
              const tabRoute = state.routes.find(r => r.name === 'MyOrder_Tab');
              const nestedState = tabRoute?.state;

              // Only reset if we're deeper than the root screen (MyOrder)
              if (nestedState && nestedState.index > 0) {
                navigation.dispatch({
                  ...CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MyOrder' }],
                  }),
                  target: nestedState.key,
                });
              }
            },
          })}
        />
        <Bottom.Screen
          name="Account"
          component={AccountStackScreen}
          options={{
            tabBarLabel: t('MY_ACCOUNT'),
            tabBarIcon: ({ color, size }) => {
              return (
                <Icon name="user" type="AntDesign" color={color} size={size} />
              );
            },
            tabBarLabelStyle: {
              fontFamily: Inter.semibold,
              fontSize: responsiveFontSize(1),
            },
          }}
          listeners={({ navigation, route }) => ({
            blur: () => {
              const state = navigation.getState();
              const tabRoute = state.routes.find(r => r.name === 'Account');
              const nestedState = tabRoute?.state;

              // Only reset if we're deeper than the root screen (MyOrder)
              if (nestedState && nestedState.index > 0) {
                navigation.dispatch({
                  ...CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MyAccount' }],
                  }),
                  target: nestedState.key,
                });
              }
            },
          })}
        />
        <Bottom.Screen
          name="Logout"
          component={Home}
          options={{
            tabBarLabel: t('LOGOUT'),
            tabBarIcon: ({ color, size }) => {
              return (
                <Icon
                  name="poweroff"
                  type="AntDesign"
                  color={color}
                  size={size}
                />
              );
            },
            tabBarLabelStyle: {
              fontFamily: Inter.semibold,
              fontSize: responsiveFontSize(1),
            },
          }}
          listeners={{
            tabPress: e => {
              // Prevent default action
              e.preventDefault();

              //Any custom code here
              LogoutAction();
            },
          }}
        />
      </Bottom.Navigator>

      <Modal
        supportedOrientations={['landscape']}
        transparent={true}
        visible={cnfModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={350}
        animationOutTiming={250}
        onRequestClose={() => setCnfModal(false)}
        style={{
          width: '100%',
          alignSelf: 'center',
          justifyContent: 'center',
          margin: 0,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          }}
        >
          <View style={[styles.warningmodal, { backgroundColor: theme.background }]}>
            {/* Icon badge */}
            <View style={[styles.warningIconCircle, { backgroundColor: theme.cancelButton }]}>
              <Feather name="log-out" size={responsiveFontSize(2.6)} color={theme.fontColor} />
            </View>

            <Text style={[styles.warningh_txt, { color: theme.fontColorOnBackground }]}>{'Log Out?'}</Text>
            <Text style={[styles.subwarningh_txt, {
              color: theme.fontColorOnBackground
            }]}>
              {'Are you sure you want to log out of your account?'}
            </Text>

            <View style={{ ...styles.button_view, width: '95%' }}>
              <TouchableOpacity
                onPress={() => {
                  CloseConfimModel(false);
                }}
                style={[styles.modalbutton, styles.cancelButton]}
              >
                <Text style={[styles.mbtton_txt, { color: theme.fontColorOnBackground }]}>
                  {'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleLogout();
                }}
                style={[styles.modalbutton, styles.logoutButton, { backgroundColor: theme.cancelButton }]}
              >
                <Feather name="log-out" size={responsiveFontSize(1.6)} color={theme.fontColor} />
                <Text style={[styles.mbtton_txt, { marginLeft: 6, color: theme.fontColor }]}>{'Logout'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button_view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveWidth(2),
    marginTop: responsiveWidth(4),
  },
  warningmodal: {
    width: '82%',
    borderRadius: 20,
    paddingVertical: responsiveHeight(3.5),
    paddingHorizontal: responsiveWidth(3),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  warningIconCircle: {
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    borderRadius: responsiveWidth(4.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveHeight(1.8),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  warningh_txt: {
    fontFamily: Inter.semibold,
    fontSize: responsiveFontSize(1.9),
  },
  subwarningh_txt: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(1.3),
    marginTop: responsiveHeight(1.2),
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: responsiveFontSize(1.9),
  },
  modalbutton: {
    width: '46%',
    height: responsiveHeight(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  logoutButton: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  mbtton_txt: {
    fontFamily: Inter.medium,
    fontSize: responsiveFontSize(1.45),
  },
  // ---- Skeleton loader styles ----
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  skeletonCard: {
    width: '78%',
    borderRadius: 16,
    paddingVertical: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
    alignItems: 'center',
  },
  skeletonCircle: {
    width: responsiveWidth(9),
    height: responsiveWidth(9),
    borderRadius: responsiveWidth(4.5),
    marginBottom: responsiveHeight(2),
  },
  skeletonLine: {
    height: responsiveHeight(2.5),
    borderRadius: 6,
    marginBottom: responsiveHeight(1.2),
  },
  skeletonLineWide: {
    width: '75%',
  },
  skeletonLineMedium: {
    width: '55%',
  },
  skeletonLineNarrow: {
    width: '45%',
  },
});

export { BottomNavigation };