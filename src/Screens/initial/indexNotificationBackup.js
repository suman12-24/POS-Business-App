//import libraries
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Styles from './style';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/ImageIconContant';
import { useDispatch, useSelector } from 'react-redux';
import { getData, setData } from '../../Service/localStorage';
import {
  clearUserData,
  localstorage_TokenAdd,
  localstorage_UserdetailsAdd,
  localstorage_DeviceTokenAdd,
  setLoginImages,
} from '../../Store/Reducers/CommonReducer';
import messaging from '@react-native-firebase/messaging';
import { postWithOutToken } from '../../Service/service';

// create a component
const Initial = props => {
  const styles = Styles();
  const dispatch = useDispatch();

  const { baseUrl, user_slug, loginImages } = useSelector(
    state => state.common,
  );

  const [loading, setLoading] = useState(true);

  // 🔹 Initial Setup (Images + Permissions + FCM)
  useEffect(() => {
    // getLoginPageImages();
    setupFCM();
  }, []);

  // 🔹 Stop loader if no image
  // useEffect(() => {
  //   if (!loginImages?.logo) {
  //     setLoading(false);
  //   }
  // }, [loginImages]);

  // 🔹 Navigation + Local Storage Restore
  useEffect(() => {
    getData('device_token').then(token => {
      if (token) {
        dispatch(localstorage_DeviceTokenAdd(JSON.parse(token)));
      }
    });

    getData('userToken').then(token => {
      if (token) {
        dispatch(localstorage_TokenAdd(JSON.parse(token)));
      }
    });

    setTimeout(() => {
      getData('userDetails').then(resp => {
        if (resp) {
          dispatch(localstorage_UserdetailsAdd(JSON.parse(resp)));
          props.navigation.navigate('Main');
        } else {
          dispatch(clearUserData());
          props.navigation.navigate('SplashScreen');
        }
      });
    }, 1000);
  }, []);

  // 🔹 Fetch login images
  // const getLoginPageImages = async () => {
  //   try {
  //     const response = await postWithOutToken(
  //       baseUrl,
  //       'get-login-page-images',
  //       { user_slug },
  //     );

  //     if (response?.status && response?.data) {
  //       const formattedData = {
  //         logo: response?.data?.logo?.url || '',
  //         background:
  //           response?.data?.backgound_image?.url ||
  //           response?.data?.background_image?.url ||
  //           '',
  //       };

  //       dispatch(setLoginImages(formattedData));
  //     }
  //   } catch (error) {
  //     console.log('Error fetching login page images:', error);
  //   }
  // };

  // 🔹 FCM Setup (Single Flow)
  const setupFCM = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);

      const authStatus = await messaging().requestPermission();

      if (authStatus) {
        const token = await messaging().getToken();

        if (token) {
          setData('device_token', JSON.stringify(token));
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
      {/* Background Image */}
      {/* <Image
        style={styles.splashBg}
        resizeMode="contain"
        source={Images.bg}
      /> */}
      {/* Logo + Loader */}
      {/* <View style={styles.logobg}> */}
      {/* {loading && (
        <ActivityIndicator size="large" color={Colors.primary}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',

          }}
        />
      )} */}
      <Image
        style={[
          styles.splashLogo,
          { opacity: loading ? 0 : 1 },
        ]}
        resizeMode="cover"
        // source={
        //   loginImages?.logo
        //     ? { uri: loginImages.logo }
        //     : null
        // }
        source={Images.splash_logo}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {/* </View> */}
    </View>
  );
};

//make this component available to the app
export default Initial;