import React from 'react';
import {
  createNativeStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/native-stack';
import {
  Initial,
  Login,
  Forgot,
  ForgotOtp,
  ResetPassword,
  Main,
  MyAccount,
  MyOrder,
} from '../Screens';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

const MainNavigation = props => {
  const horizontalAnimation = {
    gestureDirection: 'horizontal',
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };

  const verticalAnimation = {
    gestureDirection: 'vertical',
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
      };
    },
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '' },
        headerShadowVisible: false,
        gestureEnabled: Platform.OS === 'android' ? false : true,
      }}
      initialRouteName="Initial"
    >
      <Stack.Screen
        name="Initial"
        component={Initial}
        options={horizontalAnimation}
      />

      <Stack.Screen
        name="Main"
        component={Main}
        options={horizontalAnimation}
      />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerTitle: 'Login', headerShown: false }}
      />

      <Stack.Screen
        name="Forgot"
        component={Forgot}
        options={{ headerTitle: 'Forgot Password', headerShown: false }}
      />

      <Stack.Screen
        name="ForgotOtp"
        component={ForgotOtp}
        options={{ headerTitle: 'OTP Vefify', headerShown: false }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ headerTitle: 'Reset Password', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// export default MainNavigation;
export { MainNavigation };
