/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { store } from "./src/Store/AppStore";
import { Provider} from "react-redux";
import { MainNavigation } from "./src/Navigations/MainNavigation";
import 'react-native-gesture-handler';
import { setData} from './src/Service/localStorage';

function App(){

  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
    </Provider>
  );
}

export default App;