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
import React, { useEffect, useMemo, useState } from 'react';
import Styles from './style';
import { Colors } from '../../Constants/Colors';
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
import {
  Container,
  Icon,
  AppTextInput,
  AppButton,
} from 'react-native-basic-elements';

import SkeletonLogin from './SkeletonLogin';
import { useAppTheme } from '../../Hooks/useAppTheme';
import useTranslation from '../../Hooks/useTranslation';
const Login = ({ props, route, navigation }) => {
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, deviceToken, langId, user_slug, loginImages } = useSelector(state => state.common,);
  const theme = useAppTheme();
  const styles = useMemo(() => Styles(theme), [theme]);
  const { t } = useTranslation();
  const [viewloader, setLoader] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_field_type, setPasswordFieldType] = useState(true);

  const [password_eye, setPasswordEye] = useState(
    <Icon name="eye" type="Ionicon" color={theme.fontColorOnBackground} size={18} />,
  );

  const changeFieldType = () => {
    if (password_field_type == true) {
      setPasswordFieldType(false);
      setPasswordEye(
        <Icon name="eye-off" type="Ionicon" color={theme.fontColorOnBackground} size={18} />,
      );
    } else {
      setPasswordFieldType(true);
      setPasswordEye(<Icon name="eye" type="Ionicon" color={theme.fontColorOnBackground} size={18} />);
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

  const handleLogin = () => {
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

    if (password.search(/\S/) == -1) {
      showToastMsg(t('ENTER_YOUR_PASSWORD'));
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (flg == true) {
      setLoader(true);

      postWithOutToken(baseUrl, 'login', {
        email: email,
        password: password,
        lang_id: langId,
        level: 1,
        device_id: deviceToken,
        user_slug: user_slug,
      })
        .then(response => {
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
          console.log('Error status:', error.response?.status);
          console.log('Error data:', error.response?.data);
        });
    }
  };

  return (
    <Container style={styles.container}>
      {/* Background image - the lavender triangle artwork */}
      {/* <Image
        style={styles.Bg}
        resizeMode="cover"
        source={Images.bg}
      /> */}
      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.main_inner}>
            {viewloader ? (
              <SkeletonLogin />
            ) : (
              <>
                {/* Logo image */}
                <View style={styles.logoWrap}>
                  <Image
                    source={Images.splash_logo}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.welcomeText}>{t('WELCOME_BACK')}</Text>

                <View style={styles.formWrap}>
                  <View style={styles.inputRow}>
                    <Icon
                      name="person"
                      type="Ionicon"
                      color={theme.fontColorOnBackground}
                      size={15}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      onChangeText={setEmail}
                      value={email}
                      placeholder={t('LOGIN_EMAIL_PLACEHOLDER')}
                      placeholderTextColor={theme.fontColorOnBackground}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Icon
                      name="lock-closed"
                      type="Ionicon"
                      color={theme.fontColorOnBackground}
                      size={15}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      onChangeText={setPassword}
                      value={password}
                      secureTextEntry={password_field_type}
                      placeholder={t('LOGIN_PASSWORD_PLACEHOLDER')}
                      placeholderTextColor={theme.fontColorOnBackground}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={changeFieldType} style={styles.eyeIcon}>
                      {password_eye}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      handleLogin();
                    }}
                  >
                    <Text style={styles.buttonText}>{t('LOGIN')}</Text>
                  </TouchableOpacity>

                  <Text
                    onPress={() => navigation.navigate('Forgot')}
                    style={styles.forgotText}
                  >
                    {t('FORGOT_PASSWORD')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Container>
  );
};

export default Login;