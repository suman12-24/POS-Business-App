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
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Styles from './style';
import {Colors} from '../../../Constants/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {Images} from '../../../Constants/ImageIconContant';
import {Inter} from '../../../Constants/Fonts';
import {useDispatch, useSelector} from 'react-redux';
import {showToastMsg, getData, setData} from '../../../Service/localStorage';
import {postWithOutToken} from '../../../Service/service';
import VersionNumber from 'react-native-version-number';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
} from 'react-native-basic-elements';

const ResetPassword = ({props, route, navigation}) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const {baseUrl, siteUrl} = useSelector(state => state.common);
  const [newpass, setNewPass] = useState('');
  const [confirmpass, setConfirmpass] = useState('');
  const [version_code, setVersionCode] = useState(null);
  const [viewloader, setLoader] = useState(false);
  const [password_field_type, setPasswordFieldType] = useState(true);
  const [password_eye, setPasswordEye] = useState(
    <Icon name="eye" type="Ionicon" color={Colors.black} />,
  );

  const [password_field_type_con, setPasswordFieldTypeCon] = useState(true);
  const [password_eye_con, setPasswordEyeCon] = useState(
    <Icon name="eye" type="Ionicon" color={Colors.black} />,
  );

  const [resetPassword, setResetPassword] = useState(true);

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

  const changeFieldTypeCon = () => {
    if (password_field_type_con == true) {
      setPasswordFieldTypeCon(false);
      setPasswordEyeCon(
        <Icon name="eye-off" type="Ionicon" color={Colors.black} />,
      );
    } else {
      setPasswordFieldTypeCon(true);
      setPasswordEyeCon(
        <Icon name="eye" type="Ionicon" color={Colors.black} />,
      );
    }
  };

  useEffect(() => {
    /*console.log(VersionNumber.appVersion);
    console.log(VersionNumber.buildVersion);
    console.log(VersionNumber.bundleIdentifier);*/
    setVersionCode(VersionNumber.appVersion + '.' + VersionNumber.buildVersion);
  }, []);

  const Reset = () => {
    let flg = true;

    const uppercaseRegExp = /(?=.*?[A-Z])/;
    const lowercaseRegExp = /(?=.*?[a-z])/;
    const digitsRegExp = /(?=.*?[0-9])/;
    const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    const minLengthRegExp = /.{8,}/;

    if (newpass.search(/\S/) == -1) {
      showToastMsg('Please enter your password');
      if (flg == true) {
        flg = false;
      }
      return false;
    } else if (newpass.search(/\S/) != -1) {
      const passwordLength = newpass.length;
      const uppercasePassword = uppercaseRegExp.test(newpass);
      const lowercasePassword = lowercaseRegExp.test(newpass);
      const digitsPassword = digitsRegExp.test(newpass);
      const specialCharPassword = specialCharRegExp.test(newpass);
      const minLengthPassword = minLengthRegExp.test(newpass);

      let errMsg = '';
      let flgg = true;
      if (!uppercasePassword) {
        errMsg = 'password at least one uppercase';
        flgg = false;
      } else if (!lowercasePassword) {
        errMsg = 'password at least one lowercase';
        flgg = false;
      } else if (!digitsPassword) {
        errMsg = 'password at least one digit';
        flgg = false;
      } else if (!specialCharPassword) {
        errMsg = 'password at least one special characters';
        flgg = false;
      } else if (!minLengthPassword) {
        errMsg = 'password at least minimum eight characters';
        flgg = false;
      } else {
        errMsg = '';
      }

      if (flgg == false) {
        showToastMsg(errMsg);
        if (flg == true) {
          flg = false;
        }
        return false;
      }
    }

    if (confirmpass.search(/\S/) == -1) {
      showToastMsg('please enter confirm password');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (newpass != confirmpass) {
      showToastMsg('Mismatch confirm password');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (flg == true) {
      setLoader(true);
      postWithOutToken(baseUrl, 'reset-password', {
        email: route.params.email,
        password: newpass,
        password_confirmation: confirmpass,
      })
        .then(response => {
          setLoader(false);
          if (response.success == true) {
            showToastMsg(response.message);

            setTimeout(() => {
              navigation.navigate('Login');
            }, 1000);
          } else {
            showToastMsg(response.message);
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }
  };

  return (
    <Container style={styles.container}>
      {viewloader === true ? (
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
      ) : null}

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
            }}>
            <Image
              source={Images.login_logo}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </View>
          {resetPassword === false ? (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    color: Colors.black,
                    fontFamily: Inter.light,
                    fontSize: responsiveFontSize(2.5),
                  }}>
                  Reset Password
                </Text>
              </View>

              <View>
                <AppTextInput
                  inputStyle={{paddingLeft: 10, borderColor: Colors.grey}}
                  onChangeText={setNewPass}
                  value={newpass}
                  secureTextEntry={password_field_type}
                  rightAction={password_eye}
                  onRightIconPress={changeFieldType}
                  placeholder="New Password"
                  leftIcon={{
                    name: 'lock',
                    type: 'AntDesign',
                    color: Colors.black,
                  }}
                  inputContainerStyle={{borderColor: Colors.grey}}
                  autoCapitalize="none"
                />

                <AppTextInput
                  inputStyle={{paddingLeft: 10, borderColor: Colors.grey}}
                  onChangeText={setConfirmpass}
                  value={confirmpass}
                  secureTextEntry={password_field_type_con}
                  rightAction={password_eye_con}
                  onRightIconPress={changeFieldTypeCon}
                  placeholder="Password"
                  leftIcon={{
                    name: 'lock',
                    type: 'AntDesign',
                    color: Colors.black,
                  }}
                  inputContainerStyle={{borderColor: Colors.grey}}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('Main');
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: responsiveFontSize(1.5),
                      color: '#fff',
                      fontFamily: Inter.medium,
                    }}>
                    Reset Password
                  </Text>
                </TouchableOpacity>

                <View
                  style={{alignSelf: 'center', marginTop: responsiveHeight(2)}}>
                  <Text
                    style={{
                      color: '#555',
                      fontFamily: Inter.regular,
                      fontSize: responsiveFontSize(1.5),
                    }}>
                    Already Have an account ?
                    <Text
                      onPress={() => {
                        navigation.navigate('Login');
                      }}
                      style={{
                        color: Colors.blue,
                        fontSize: responsiveFontSize(1.5),
                      }}>
                      {' '}
                      Login
                    </Text>
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: responsiveFontSize(1.2),
                    color: Colors.grey,
                    fontFamily: Inter.regular,
                    paddingTop: responsiveHeight(2),
                    textAlign: 'center',
                  }}>
                  @ Indus v {version_code != null ? version_code : null}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <View
                style={{
                  width: responsiveWidth(6),
                  height: responsiveWidth(6),
                  overflow: 'hidden',
                  margin: 'auto',
                  marginTop: responsiveHeight(2),
                }}>
                <Image
                  source={Images.successtick}
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: responsiveHeight(2),
                  marginTop: responsiveHeight(2),
                }}>
                <Text
                  style={{
                    color: Colors.black,
                    fontFamily: Inter.light,
                    fontSize: responsiveFontSize(1.5),
                  }}>
                  Password Changed Successfully
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  navigation.navigate('Login');
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: responsiveFontSize(1.5),
                    color: '#fff',
                    fontFamily: Inter.medium,
                  }}>
                  Go Back To Login
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.2),
                  color: Colors.grey,
                  fontFamily: Inter.regular,
                  paddingTop: responsiveHeight(2),
                  textAlign: 'center',
                }}>
                @ Indus v {version_code != null ? version_code : null}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Container>
  );
};

export default ResetPassword;
