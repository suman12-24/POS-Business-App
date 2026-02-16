import React,{ useEffect, useState} from "react";
import { StyleSheet, Text, View, Image, Dimensions, Pressable, ActivityIndicator, TouchableOpacity} from 'react-native'
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, CardStyleInterpolators} from '@react-navigation/native-stack';
import {Home, MyAccount, MyOrder, MyOrderComplete, MyOrderInprogress, OrderSuccess, MyAccountDelete} from "../Screens";
import { Icons, Images } from '../Constants/ImageIconContant';
import { Inter } from '../Constants/Fonts';
import{ Colors} from '../Constants/Colors'
import { Icon } from 'react-native-basic-elements';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Feather from 'react-native-vector-icons/Feather';
import { responsiveHeight, responsiveWidth, responsiveFontSize} from "react-native-responsive-dimensions";
const Bottom = createBottomTabNavigator();
import {NavigationContainer} from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData} from '../Service/localStorage';
import {postWithOutToken} from "../Service/service";
import { removeData} from '../Service/localStorage';
import { clearUserData} from '../Store/Reducers/CommonReducer';

const MyOrderStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

function HomeStackScreen() {
    return (
      <HomeStack.Navigator initialRouteName="H" screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="H" component={Home} />
        <HomeStack.Screen name="OrderSuccess" component={OrderSuccess} />
      </HomeStack.Navigator>
    );
  }

function MyOrderStackScreen() {
  return (
    <MyOrderStack.Navigator initialRouteName="MyOrder" screenOptions={{ headerShown: false }}>
      <MyOrderStack.Screen name="MyOrder" component={MyOrder} />
      <MyOrderStack.Screen name="MyOrderInprogress" component={MyOrderInprogress} />
      <MyOrderStack.Screen name="MyOrderComplete" component={MyOrderComplete} />
    </MyOrderStack.Navigator>
  );
}

function AccountStackScreen() {
  return (
    <AccountStack.Navigator initialRouteName="MyAccount" screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="MyAccount" component={MyAccount} />
      <AccountStack.Screen name="MyAccountDelete" component={MyAccountDelete} />
    </AccountStack.Navigator>
  );
}


const BottomNavigation = ({props, navigation}) => {

    const dispatch = useDispatch();
    const { baseUrl, siteUrl, userToken, userData, post_data, deviceToken} = useSelector(state => state.common);
    const [viewloader, setLoader] = useState(false);

  function handleLogout(){
    console.log(userData);
    console.log(userData.id);
   setLoader(true);
   postWithOutToken(baseUrl, "module/user/rest-user", {f: 'logout', id: userData.id, device_id: deviceToken})
    .then((response) => {
      console.log(response);
      dispatch(clearUserData());
      removeData("userDetails");
      //removeData("userToken");
     // removeData("device_token");
        
      setTimeout(() => {
          setLoader(false);
          navigation.navigate('Login');
      }, 500);	
    })
    .catch((error) => {
      console.log("Error : ", error);
    });
  }

  //initialRouteName="Home"

  return (
    <>
    { viewloader === true ?<View style={{ 
        alignItems: 'center',
        justifyContent: 'center', 
        display: 'flex',
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        left:0,
        top:0,
        zIndex: 1}}>
            <ActivityIndicator size="large" color={Colors.blue}  />
        </View>
        : null }
    <Bottom.Navigator  initialRouteName="Home" screenOptions={{
        headerShown: false,
        "tabBarHideOnKeyboard": true,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.white,
        tabBarShowLabel: true,
        headerShadowVisible: false,
        tabBarStyle: {
            //height: 65,
            //paddingBottom: 5,
            borderTopColor: Colors.blue,
            borderTopWidth: 6,
            borderTopStartRadius: 15,
            borderTopEndRadius: 15,
            overflow: 'hidden',
            backgroundColor: Colors.black,

        },
        
      }}>
     
      {/* == For showing Tabs under sidemenu == */}
                    <Bottom.Screen 
                    name="Home"
                    component={HomeStackScreen}
                    options={{
                            tabBarLabel: 'Create Order',
                            tabBarIcon: ({ color, size, }) => {
                                return <Icon name='shoppingcart' type='AntDesign'  color={color} size={size}  />
                            },
                            tabBarLabelStyle: {
                                fontFamily: Inter.regular,
                                fontSize: responsiveFontSize(1),
                                fontWeight: 'bold'
                            },
                       }}
                    />
                    <Bottom.Screen 
                        name="MyOrder_Tab"
                        component={MyOrderStackScreen}
                        options={{
                            tabBarLabel: 'My Order',
                            tabBarIcon: ({ color, size, }) => {
                                return (
                                        <Icon name='shopping-bag' type='Feather' size={size} color={color} />
                                 )
                            },
                            tabBarLabelStyle: {fontFamily: Inter.regular, fontSize: responsiveFontSize(1),fontWeight: 'bold'},
                            tabBarIconStyle: {}
                           
                        }}
                    />
                     <Bottom.Screen 
                        name="Account"
                        component={AccountStackScreen}
                        options={{
                            
                            tabBarLabel: 'My Account',
                            tabBarIcon: ({ color, size, }) => {
                                return (<Icon name='user'  type='AntDesign' color={color} size={size} />)
                            },
                            tabBarLabelStyle: {fontFamily: Inter.regular,fontSize: responsiveFontSize(1),fontWeight: 'bold'},
                        }}
                    />
                    <Bottom.Screen 
                        name="Logout"
                        component={Home}
                        options={{
                            
                            tabBarLabel: 'Logout',
                            tabBarIcon: ({ color, size, }) => {
                                return (<Icon name='poweroff' type='AntDesign' color={color} size={size} />)
                            },
                            tabBarLabelStyle: {fontFamily: Inter.regular,fontSize: responsiveFontSize(1),fontWeight: 'bold'},
                        }}
                        listeners={{
                            tabPress: e => {
                              // Prevent default action
                              e.preventDefault();
                        
                              //Any custom code here
                              handleLogout();
                            },
                          }}
                    />
                    
    </Bottom.Navigator>
    </>
  );
};
export {BottomNavigation};
