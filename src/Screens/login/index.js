import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Styles from './style';
import { Colors } from '../../Constants/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { Inter } from '../../Constants/Fonts';
import { Images } from '../../Constants/ImageIconContant';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../../Store/Reducers/CommonReducer';
import { showToastMsg, getData, setData } from '../../Service/localStorage';
import {
  postWithOutToken,
  postWithOutTokenWithoutData,
} from '../../Service/service';
import { clearUserData } from '../../Store/Reducers/CommonReducer';
import { useFocusEffect } from '@react-navigation/native';
import VersionNumber from 'react-native-version-number';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
} from 'react-native-basic-elements';
import Loader from '../../Component/loader';

const Login = ({ props, route, navigation }) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, deviceToken, langId } = useSelector(
    state => state.common,
  );
  const [version_code, setVersionCode] = useState(null);
  const [viewloader, setLoader] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_field_type, setPasswordFieldType] = useState(true);

  const [password_eye, setPasswordEye] = useState(
    <Icon name="eye" type="Ionicon" color={Colors.black} />,
  );

  const changeFieldType = () => {
    if (password_field_type == true) {
      setPasswordFieldType(false);
      setPasswordEye(
        <Icon name="eye-off" type="Ionicon" color={Colors.black} />,
      );
    } else {
      setPasswordFieldType(true);
      setPasswordEye(<Icon name="eye" type="Ionicon" color={Colors.black} />);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clearUserData());
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
      };

      const ExitAlert = () => {
        /*Alert.alert('Jatayu Supplier', 'do you want to close app?', [
            {
              text: 'No',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                backAction();
              },
            },
          ]);*/
        backAction();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        ExitAlert,
      );

      return () => backHandler.remove();
    }, []),
  );

  useEffect(() => {
    /*console.log(VersionNumber.appVersion);
    console.log(VersionNumber.buildVersion);
    console.log(VersionNumber.bundleIdentifier);*/
    setVersionCode(VersionNumber.appVersion + '.' + VersionNumber.buildVersion);
  }, []);

  const handleLogin = () => {
    let flg = true;
    if (email.search(/\S/) == -1) {
      showToastMsg('Please enter email');
      if (flg == true) {
        flg = false;
      }
      return false;
    } else if (email.search(/\S/) != -1) {
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
      if (reg.test(email) === false) {
        showToastMsg('Please enter valid email Id');
        if (flg == true) {
          flg = false;
        }
        return false;
      }
    }

    if (password.search(/\S/) == -1) {
      showToastMsg('Please enter your password');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (flg == true) {
      setLoader(true);
      /* postWithOutToken(baseUrl, 'module/user/rest-user', {
        f: 'login',
        email: email,
        pass: password,
        langId: langId,
        level: 1,
        device_id: deviceToken,
      })*/

      postWithOutToken(baseUrl, 'business/login', {
        email: email,
        password: password,
        lang_id: langId,
        level: 1,
        device_id: deviceToken,
      })
        .then(response => {
          //console.log(response);
          setLoader(false);
          if (response.status == true) {
            setEmail('');
            setPassword('');
            dispatch(setUserData(response));
            setData('userDetails', JSON.stringify(response.data));
            setData('userToken', JSON.stringify(response.token));

            setTimeout(() => {
              navigation.navigate('Main');
            }, 200);
          } else {
            showToastMsg(response.message);
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }

    //setTimeout(() => {navigation.navigate('Main')}, 200);
  };

  return (
    <Container style={styles.container}>
      {/*viewloader === true ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
          }}>
          <ActivityIndicator size="large" color={Colors.activityIndicator} />
        </View>
      ) : null*/}

      {viewloader === true ? <Loader /> : null}

      <Image style={styles.Bg} resizeMode="contain" source={Images.bg} />

      <View style={styles.main}>
        <View style={styles.main_inner}>
          <View
            style={{
              width: responsiveWidth(20),
              height: responsiveHeight(14),
              overflow: 'hidden',
              borderRadius: 10,
              margin: 'auto',
            }}
          >
            <Image
              source={Images.login_logo}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontFamily: Inter.light,
                fontSize: responsiveFontSize(2.5),
              }}
            >
              Welcome Back!
            </Text>
          </View>
          <View>
            <AppTextInput
              inputStyle={{ paddingLeft: 10 }}
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              leftIcon={{
                name: 'mail',
                type: 'AntDesign',
                color: Colors.black,
              }}
              inputContainerStyle={{
                borderColor: Colors.grey,
                marginBottom: responsiveHeight(1),
              }}
              autoCapitalize="none"
            />

            <AppTextInput
              inputStyle={{ paddingLeft: 10, borderColor: Colors.grey }}
              onChangeText={setPassword}
              value={password}
              secureTextEntry={password_field_type}
              rightAction={password_eye}
              onRightIconPress={changeFieldType}
              placeholder="Password"
              leftIcon={{
                name: 'lock',
                type: 'AntDesign',
                color: Colors.black,
              }}
              inputContainerStyle={{ borderColor: Colors.grey }}
              autoCapitalize="none"
            />

            {viewloader === true ? (
              <TouchableOpacity style={styles.button_dis}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#000',
                    fontFamily: Inter.medium,
                  }}
                >
                  Login
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  handleLogin();
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#fff',
                    fontFamily: Inter.medium,
                  }}
                >
                  Login
                </Text>
              </TouchableOpacity>
            )}

            <Text
              onPress={() => navigation.navigate('Forgot')}
              style={{
                fontSize: responsiveFontSize(1.5),
                color: Colors.blue,
                fontFamily: Inter.regular,
                paddingTop: responsiveHeight(2),
                textAlign: 'center',
              }}
            >
              Forgot Password?
            </Text>
            {/*<Text
              style={{
                fontSize: responsiveFontSize(1.2),
                color: Colors.grey,
                fontFamily: Inter.regular,
                paddingTop: responsiveHeight(2),
                textAlign: 'center',
              }}
            >
              @ Indus v {version_code != null ? version_code : null}
            </Text>*/}
          </View>
        </View>
      </View>
    </Container>
  );
};

export default Login;
