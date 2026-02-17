//import liraries
import React, {useEffect} from 'react';
import {
  View,
  Image,
  Text,
  Platform,
  Alert,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import Styles from './style';
import {Colors} from '../../Constants/Colors';
import {Images} from '../../Constants/ImageIconContant';
import {useDispatch, useSelector} from 'react-redux';
import {getData, setData, removeData} from '../../Service/localStorage';
import {
  clearUserData,
  localstorage_TokenAdd,
  localstorage_UserdetailsAdd,
  localstorage_DeviceTokenAdd,
} from '../../Store/Reducers/CommonReducer';
import {PERMISSIONS, request} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';

// create a component
const Initial = props => {
  const styles = Styles();
  const dispatch = useDispatch();
  const {baseUrl, userData, userToken} = useSelector(state => state.common);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        } catch (error) {}
      } else {
        RegisterAppWithFCM();
      }
    })();

    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  const RegisterAppWithFCM = async () => {
    await messaging().registerDeviceForRemoteMessages();
    await messaging().setAutoInitEnabled(true);
    checkPermission();
  };

  const checkPermission = () => {
    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          // User has permission
          getToken();
        } else {
          // User doesn't have permission
          requestPermission();
        }
      })
      .catch(error => {
        console.log('[FCMService] Permission Rejected', error);
      });
  };

  const getToken = () => {
    messaging()
      .getToken()
      .then(fcmToken => {
        if (fcmToken) {
          setData('device_token', JSON.stringify(fcmToken));
          console.log(fcmToken);
          dispatch(localstorage_DeviceTokenAdd(fcmToken));
        } else {
          console.log('[FCMService] User does not have a device token');
        }
      })
      .catch(error => {
        console.log('[FCMService] getToken Rejected', error);
      });
  };

  const requestPermission = () => {
    messaging()
      .requestPermission({
        sound: true,
        announcement: true,
      })
      .then(() => {
        getToken();
      })
      .catch(error => {
        console.log('[FCMService] Request Permission Rejected', error);
      });
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        await messaging().registerDeviceForRemoteMessages();
        await messaging().setAutoInitEnabled(true);
        const token = await messaging().getToken();
        setData('device_token', JSON.stringify(token));
        console.log(token);
        dispatch(localstorage_DeviceTokenAdd(token));
      }
    })();
  }, []);

  useEffect(() => {
    /*removeData("userDetails");
        removeData("userToken");
        dispatch(clearUserData());*/

    getData('device_token').then(devivetokenSuccess => {
      if (devivetokenSuccess) {
        dispatch(localstorage_DeviceTokenAdd(JSON.parse(devivetokenSuccess)));
      }
    });

    getData('userToken').then(tokenSuccess => {
      if (tokenSuccess) {
        dispatch(localstorage_TokenAdd(JSON.parse(tokenSuccess)));
      }
    });

    setTimeout(() => {
      getData('userDetails').then(respSuccess => {
        //console.log('user data check');
        //console.log(respSuccess);
        if (respSuccess) {
          dispatch(localstorage_UserdetailsAdd(JSON.parse(respSuccess)));
          const userData = JSON.parse(respSuccess);
          props.navigation.navigate('Main');
        } else {
          dispatch(clearUserData());
          props.navigation.navigate('Login');
        }
      });
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Image style={styles.splashBg} resizeMode="contain" source={Images.bg} />
      <View style={styles.logobg}>
        <Image style={styles.splashLogo} source={Images.splash_logo} />
      </View>
    </View>
  );
};

//make this component available to the app
export default Initial;
