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
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
} from 'react-native-basic-elements';
import { useAppTheme } from '../../../Hooks/useAppTheme';
import useTranslation from '../../../Hooks/useTranslation';
//import Loader from '../../Component/loader';

const Forgot = ({ props, route, navigation }) => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, langId, loginImages } = useSelector(state => state.common);
  const [email, setEmail] = useState('');
  const [viewloader, setLoader] = useState(false);
  const { t } = useTranslation();
  const SubmitEmail = () => {
    let flg = true;

    if (email.search(/\S/) == -1) {
      showToastMsg(t('PLEASE_ENTER_EMAIL'));
      if (flg == true) {
        flg = false;
      }
      return false;
    } else if (email.search(/\S/) != -1) {
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
      if (reg.test(email) === false) {
        showToastMsg(t('ENTER_VALID_EMAIL_ADDRESS'));
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

      {/* {viewloader === true ? <Loader /> : null} */}

      {/* <Image style={styles.Bg} resizeMode="contain" source={Images.bg} /> */}

      <View style={styles.main}>
        <View style={styles.main_inner}>
          <View
            style={{
              width: responsiveWidth(25),
              height: responsiveHeight(15),
              overflow: 'hidden',
              borderRadius: 10,
              margin: 'auto',
            }}
          >
            <Image
              // source={
              //   loginImages?.logo
              //     ? { uri: loginImages.logo }
              //     : Images.login_logo
              // }
              source={Images.splash_logo}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
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
                fontSize: responsiveFontSize(1.8),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.regular,
              }}
            >
              {t('FORGOT_PASSWORD_BT')}!
            </Text>
          </View>
          <View>
            <AppTextInput
              inputStyle={{ paddingLeft: 10 }}
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              placeholderTextColor={theme.fontColorOnBackground}
              leftIcon={{
                name: 'mail',
                type: 'AntDesign',
                color: theme.fontColorOnBackground,
              }}
              autoCapitalize="none"
            />

            {viewloader === true ? (
              <TouchableOpacity style={styles.button_dis}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1),
                    color: theme.fontColor,
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
                  SubmitEmail();
                }}
              >
                <Text
                  style={{

                    fontSize: responsiveFontSize(1),
                    color: theme.fontColor,
                    fontFamily: Inter.medium,
                  }}
                >
                  {t('SUBMIT')}
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
                  fontSize: responsiveFontSize(1),
                  color: theme.primary,
                  fontFamily: Inter.regular,
                }}
              >
                {t('GO_BACK_TO_LOGIN')}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Container>
  );
};

export default Forgot;