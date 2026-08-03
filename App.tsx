/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated'

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from "./src/Store/AppStore";
import { Provider } from "react-redux";
import { MainNavigation } from "./src/Navigations/MainNavigation";
import AppInitializer from './src/Screens/Component/AppInitializer';
import {
  Dimensions,
  StatusBar,
  Text,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SystemBars } from 'react-native-edge-to-edge';
import { PersistGate } from 'redux-persist/integration/react';

const safeAreaViewAndroidIOS =
  Platform.OS === 'android' ? StatusBar.currentHeight : StatusBar.currentHeight;

function App() {

  return (

    <SafeAreaView
      style={{
        flex: 1,
        // paddingTop: safeAreaViewAndroidIOS,
        marginTop: safeAreaViewAndroidIOS,
        marginBottom: safeAreaViewAndroidIOS,
        backgroundColor: '#FFFFFF',
      }}
    >
      <SystemBars style="dark" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer>
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
/*<NavigationContainer>
                    <MainNavigation />
                  </NavigationContainer>*/

export default App;