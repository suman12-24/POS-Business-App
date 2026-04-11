import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
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
import { Colors } from '../Constants/Colors';
import { Icon } from 'react-native-basic-elements';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

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

import Loader from '../Component/loader';
import Modal from 'react-native-modal';

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
      <MyOrderStack.Screen
        name="MyOrderInprogress"
        component={MyOrderInprogress}
      />
      <MyOrderStack.Screen name="MyOrderComplete" component={MyOrderComplete} />
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
    </AccountStack.Navigator>
  );
}

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
      'web-business/logout',
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
      {viewloader === true ? <Loader /> : null}
      <Bottom.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.white,
          tabBarShowLabel: true,
          headerShadowVisible: false,
          tabBarStyle: {
            //height: 65,
            //paddingBottom: 5,
            borderTopColor: Colors.primary,
            borderTopWidth: 6,
            borderTopStartRadius: 15,
            borderTopEndRadius: 15,
            overflow: 'hidden',
            backgroundColor: Colors.black,
          },
        }}
      >
        {/* == For showing Tabs under sidemenu == */}
        <Bottom.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarLabel: 'Create Order',
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
              fontFamily: Inter.regular,
              fontSize: responsiveFontSize(1),
              fontWeight: 'bold',
            },
          }}
        />
        <Bottom.Screen
          name="MyOrder_Tab"
          component={MyOrderStackScreen}
          options={{
            tabBarLabel: 'My Order',
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
              fontFamily: Inter.regular,
              fontSize: responsiveFontSize(1),
              fontWeight: 'bold',
            },
            tabBarIconStyle: {},
          }}
        />
        <Bottom.Screen
          name="Account"
          component={AccountStackScreen}
          options={{
            tabBarLabel: 'My Account',
            tabBarIcon: ({ color, size }) => {
              return (
                <Icon name="user" type="AntDesign" color={color} size={size} />
              );
            },
            tabBarLabelStyle: {
              fontFamily: Inter.regular,
              fontSize: responsiveFontSize(1),
              fontWeight: 'bold',
            },
          }}
        />
        <Bottom.Screen
          name="Logout"
          component={Home}
          options={{
            tabBarLabel: 'Logout',
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
              fontFamily: Inter.regular,
              fontSize: responsiveFontSize(1),
              fontWeight: 'bold',
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
              {'Are you sure you want to Logout your account?'}
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
                  handleLogout();
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
    </>
  );
};

const styles = StyleSheet.create({
  button_accept_model: {
    height: responsiveWidth(4),
    width: responsiveWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.buttonColor,
    borderRadius: responsiveWidth(0.6),
  },
  button_reject_model: {
    height: responsiveWidth(4),
    width: responsiveWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.red,
    borderRadius: responsiveWidth(0.6),
  },
  button_view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveWidth(2),
    marginTop: responsiveWidth(4),
  },

  warningh_txt: {
    fontFamily: Inter.medium,
    fontSize: responsiveFontSize(1.5),
  },
  subwarningh_txt: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(1.3),
    marginTop: responsiveHeight(4),
    textAlign: 'center',
    maxWidth: '70%',
  },
  modalbutton: {
    width: '40%',
    height: responsiveHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(0.6),
  },
  warningmodal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: responsiveWidth(1),
    padding: responsiveWidth(2),
    alignItems: 'center',
  },
  mbtton_txt: {
    fontFamily: Inter.regular,
    fontSize: responsiveFontSize(1.5),
    color: '#fff',
  },
});

export { BottomNavigation };
