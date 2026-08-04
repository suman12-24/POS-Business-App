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
import React, { useState, useRef, useEffect } from 'react';
import Styles from './style';
import { Colors } from '../../../Constants/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { Inter } from '../../../Constants/Fonts';
import { Images } from '../../../Constants/ImageIconContant';
import OTPTextInput from 'react-native-otp-textinput';
import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData } from '../../../Service/localStorage';
import { postWithOutToken } from '../../../Service/service';
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
} from 'react-native-basic-elements';
import Loader from '../../Component/loader';
import useTranslation from '../../../Hooks/useTranslation';
const ForgotOtp = ({ props, route, navigation }) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, langId } = useSelector(state => state.common);
  const { t } = useTranslation();
  const [version_code, setVersionCode] = useState(null);
  const [viewloader, setLoader] = useState(false);
  const [otp, setOTP] = useState('');
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);
  const ref = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds]);

  function ConfirmWithOtp() {
    let flg = true;
    if (otp == '') {
      showToastMsg('Please Enter OTP');
      if (flg == true) {
        flg = false;
      }
      return false;
    } else if (otp.length < 4) {
      showToastMsg('Please Enter 4 digit OTP');
      if (flg == true) {
        flg = false;
      }

      return false;
    }

    if (flg == true) {
      setLoader(true);

      postWithOutToken(baseUrl, 'forgot-password-check-otp', {
        email: route.params.email,
        user: route.params.userId,
        otp: otp,
      })
        .then(response => {
          setLoader(false);
          console.log(response);
          if (response.status == true) {
            setOTP('');
            ref.current?.clear('');

            setTimeout(() => {
              navigation.navigate('ResetPassword', {
                email: route.params.email,
                userId: route.params.userId,
              });
            }, 400);
          } else {
            setOTP('');
            ref.current?.clear('');
            showToastMsg(response.message);
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }
  }

  function resetPasswordOtp() {

    setLoader(true);
    setOTP('');
    ref.current?.clear('');
    postWithOutToken(baseUrl, 'forgot-password', {
      email: route.params.email,
      langId: langId,
    })
      .then(response => {
        console.log(response);
        setLoader(false);
        if (response.status == true) {
          setMinutes(1);
          setSeconds(30);
          showToastMsg(response.message);
        } else {
          showToastMsg(response.message);
        }
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  }

  return (
    <Container style={styles.container}>

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
              marginTop: responsiveHeight(2),
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontFamily: Inter.light,
                fontSize: responsiveFontSize(2.2),
              }}
            >
              OTP Verify
            </Text>
          </View>
          <View>
            <Text
              numberOfLines={2}
              style={{
                alignSelf: 'center',
                color: '#555',
                fontSize: responsiveFontSize(1),
                marginVertical: responsiveHeight(2),
              }}
            >
              Please enter an OTP we are sending you to{' '}
              <Text style={{ color: Colors.primaryFontColor }}>
                {route.params.email}
              </Text>
            </Text>
            <View style={styles.inputContainer}>
              <OTPTextInput
                inputCount={4}
                inputCellLength={1}
                textInputStyle={{
                  borderWidth: 2,
                  borderRadius: 6,
                  height: responsiveScreenWidth(5),
                  width: responsiveScreenWidth(5),
                }}
                tintColor={Colors.primaryFontColor}
                autoFocus={true}
                handleTextChange={text => setOTP(text)}
                ref={ref}
              />
            </View>

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
                  {t('SUBMIT')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  ConfirmWithOtp();
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
                 {t('SUBMIT')}
                </Text>
              </TouchableOpacity>
            )}

            <View
              style={{
                color: Colors.fontcolor,
                marginTop: responsiveHeight(2),
                alignSelf: 'center',
              }}
            >
              {seconds > 0 || minutes > 0 ? (
                <Text
                  style={{
                    color: Colors.fontcolor,
                    fontFamily: Inter.regular,
                    fontSize: responsiveFontSize(1.2),
                  }}
                >
                  {t('TIME_REMAINING')}: {minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
                </Text>
              ) : (
                <Text
                  style={{
                    color: Colors.fontcolor,
                    fontFamily: Inter.regular,
                    fontSize: responsiveFontSize(1.2),
                  }}
                >
                 {t('DID_NOT_RECEIVE_CODE')}?
                </Text>
              )}
            </View>
            <View
              style={{
                color: Colors.fontcolor,
                marginTop: responsiveHeight(2),
                alignSelf: 'center',
              }}
            >
              {seconds > 0 || minutes > 0 ? (
                <Text
                  style={{
                    color: Colors.fontcolor,
                    fontFamily: Inter.medium,
                    fontSize: responsiveFontSize(1.5),
                  }}
                >
                  {t('RESEND_OTP')}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={viewloader == false ? resetPasswordOtp : null}
                >
                  <Text
                    style={{
                      color: Colors.primaryFontColor,
                      fontFamily: Inter.medium,
                      fontSize: responsiveFontSize(1.5),
                    }}
                  >
                    {t('RESEND_OTP')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </View>
    </Container>
  );
};

export default ForgotOtp;