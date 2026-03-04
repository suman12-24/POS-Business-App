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
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Styles from './style';
import { Colors } from '../../../Constants/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { Images } from '../../../Constants/ImageIconContant';
import { Inter } from '../../../Constants/Fonts';
import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData } from '../../../Service/localStorage';
import { postWithOutToken } from '../../../Service/service';
import VersionNumber from 'react-native-version-number';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
} from 'react-native-basic-elements';
import Loader from '../../../Component/loader';

const Forgot = ({ props, route, navigation }) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, langId } = useSelector(state => state.common);
  const [email, setEmail] = useState('');
  const [version_code, setVersionCode] = useState(null);
  const [viewloader, setLoader] = useState(false);

  useEffect(() => {
    /*console.log(VersionNumber.appVersion);
    console.log(VersionNumber.buildVersion);
    console.log(VersionNumber.bundleIdentifier);*/
    setVersionCode(VersionNumber.appVersion + '.' + VersionNumber.buildVersion);
  }, []);

  const SubmitEmail = () => {
    let flg = true;

    if (email.search(/\S/) == -1) {
      showToastMsg('Please enter your email Id');
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

    if (flg == true) {
      setLoader(true);
      /*postWithOutToken(baseUrl, 'module/user/rest-user', {
        f: 'forgot',
        email: email,
        langId: langId,
      })*/
      postWithOutToken(baseUrl, 'forgot-password', {
        email: email,
        langId: langId,
      })
        .then(response => {
          console.log(response);
          setLoader(false);
          if (response.status == true) {
            setEmail('');
            showToastMsg(response.message);
            setTimeout(() => {
              navigation.navigate('ForgotOtp', {
                email: email,
                userId: response.user,
              });
            }, 500);
          } else {
            setEmail('');
            showToastMsg(response.message);
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }

    //navigation.navigate('Otp', {email: 'sanjeevsaha24@gmail.com'});
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
              Forgot Password!
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
                  Submit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  SubmitEmail();
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
                  Submit
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginTop: responsiveWidth(2),
              }}
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: responsiveFontSize(1),
                  color: Colors.primaryFontColor,
                  fontFamily: Inter.medium,
                }}
              >
                Go Back To Login
              </Text>
            </TouchableOpacity>

            {/*<Text
              style={{
                fontSize: responsiveFontSize(1.2),
                color: Colors.grey,
                fontFamily: Inter.regular,
                paddingTop: responsiveHeight(2),
                textAlign: 'center',
              }}>
              @ Indus v {version_code != null ? version_code : null}
            </Text>*/}
          </View>
        </View>
      </View>
    </Container>
  );
};

export default Forgot;
