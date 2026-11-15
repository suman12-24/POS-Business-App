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
  setLoginImages
} from '../../Store/Reducers/CommonReducer';
import messaging from '@react-native-firebase/messaging';
import { postWithOutToken } from '../../Service/service';

// create a component
const Initial = props => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { baseUrl, userData, userToken, user_slug, loginImages } = useSelector(state => state.common);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
    getLoginPageImages();
  }, []);

  const getLoginPageImages = async () => {
    try {
      const response = await postWithOutToken(
        baseUrl,
        'get-login-page-images',
        {
          user_slug: user_slug,
        }
      );

      console.log('Login Page Images Response:', response);

      if (response?.status === true && response?.data) {
        const formattedData = {
          logo: response?.data?.logo?.url || '',

          // handle current typo + future fix
          background:
            response?.data?.backgound_image?.url ||
            response?.data?.background_image?.url ||
            '',
        };

        dispatch(setLoginImages(formattedData));
      } else {
        console.log('API returned failure:', response?.message);
      }
    } catch (error) {
      console.log('Error fetching login page images:', error);
    }
  };

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
      {/* <Image
        style={[
          styles.splashLogo,
          { opacity: loading ? 0 : 1 },
        ]}
        resizeMode="contain"
        source={Images.splash_logo}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      /> */}

      <Image
        style={[styles.splashLogo, { opacity: loading ? 0 : 1 }]}
        resizeMode="contain"
        source={
          loginImages?.logo
            ? { uri: loginImages.logo }
            : Images.splash_logo
        }
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export default Initial;