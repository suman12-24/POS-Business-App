// import libraries
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Styles from './style';
import { Images } from '../../Constants/ImageIconContant';
import { useDispatch, useSelector } from 'react-redux';
import { getData, setData } from '../../Service/localStorage';
import {
  clearUserData,
  localstorage_TokenAdd,
  localstorage_UserdetailsAdd,
  localstorage_DeviceTokenAdd,
} from '../../Store/Reducers/CommonReducer';
import messaging from '@react-native-firebase/messaging';

// create a component
const Initial = props => {
  const styles = Styles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 1. Setup FCM & Permissions
      await setupFCM();

      // 2. Restore User Session
      const savedUserToken = await getData('userToken');
      if (savedUserToken) {
        dispatch(localstorage_TokenAdd(JSON.parse(savedUserToken)));
      }

      const savedUserDetails = await getData('userDetails');
      if (savedUserDetails) {
        dispatch(localstorage_UserdetailsAdd(JSON.parse(savedUserDetails)));
        props.navigation.navigate('Main');
      } else {
        dispatch(clearUserData());
        props.navigation.navigate('SplashScreen');
      }
    } catch (error) {
      console.log('Error during app initialization:', error);
      dispatch(clearUserData());
      props.navigation.navigate('SplashScreen');
    }
  };

  const setupFCM = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();

        if (token) {
          // Store consistently as a plain string
          await setData('device_token', JSON.stringify(token));
          dispatch(localstorage_DeviceTokenAdd(token));
          console.log('FCM Token:', token);
        }
      }
    } catch (error) {
      console.log('FCM Setup Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={[
          styles.splashLogo,
          { opacity: loading ? 0 : 1 },
        ]}
        resizeMode="cover"
        source={Images.splash_logo}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export default Initial;