import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from "./src/Store/AppStore";
import { Provider } from "react-redux";
import { MainNavigation } from "./src/Navigations/MainNavigation";
import AppInitializer from './src/Screens/Component/AppInitializer';
import {
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SystemBars } from 'react-native-edge-to-edge';
import { PersistGate } from 'redux-persist/integration/react';
import messaging from '@react-native-firebase/messaging';
import { navigationRef, navigate } from './src/Navigations/NavigationService';


const safeAreaViewAndroidIOS = Platform.OS === 'android' ? StatusBar.currentHeight : StatusBar.currentHeight;

function App() {
  useEffect(() => {
    // 1. App opened from BACKGROUND state via Notification Click
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      const orderId = remoteMessage?.data?.order_id || remoteMessage?.data?.orderId;
      if (orderId) {
        navigate('MyOrder_Tab', {
          screen: 'OrderDetailFromNotification',
          params: { orderId },
        });
      }
    });

    // 2. App opened from QUIT/CLOSED state via Notification Click
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const orderId = remoteMessage?.data?.order_id || remoteMessage?.data?.orderId;
          if (orderId) {
            setTimeout(() => {
              navigate('MyOrder_Tab', {
                screen: 'OrderDetailFromNotification',
                params: { orderId },
              });
            }, 1000); // Small delay to allow react-navigation to mount fully
          }
        }
      });

    return () => {
      unsubscribeNotificationOpened();
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: safeAreaViewAndroidIOS,
        marginBottom: safeAreaViewAndroidIOS,
        backgroundColor: '#FFFFFF',
      }}
    >
      <SystemBars style="dark" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer ref={navigationRef}>
              <AppInitializer>
                <MainNavigation />
              </AppInitializer>
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;