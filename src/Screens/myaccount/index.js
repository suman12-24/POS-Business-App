import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Styles from './style';
import {Colors} from '../../Constants/Colors';
import {Inter} from '../../Constants/Fonts';
import {Images} from '../../Constants/ImageIconContant';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useDispatch, useSelector} from 'react-redux';
import {
  setUserData,
  setUserDataAfterLogin,
} from '../../Store/Reducers/CommonReducer';
import {showToastMsg, getData, setData} from '../../Service/localStorage';
import {postWithToken, postWithOutToken} from '../../Service/service';
import {useFocusEffect} from '@react-navigation/native';
import {
  Container,
  Icon,
  AppTextInput,
  CheckBox,
} from 'react-native-basic-elements';
import Loader from '../../Component/loader';
// create a component
const MyAccount = ({props, route, navigation}) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const {baseUrl, siteUrl, userToken, userData, post_data, langId} =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useFocusEffect(React.useCallback(() => {}, []));

  const [update_action_status, setUpdateActionStatus] = useState(false);

  useEffect(() => {
    if (userData != null) {
      setFirstName(userData.name);
      setLastName(userData.last_name);
      setEmail(userData.email);
      setPhone(userData.cel.toString());
    }
  }, [userData]);

  const updateProfile = () => {
    let flg = true;

    if (first_name.search(/\S/) == -1) {
      showToastMsg('Please enter first name');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (last_name.search(/\S/) == -1) {
      showToastMsg('Please enter last name');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

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

    if (last_name.search(/\S/) == -1) {
      showToastMsg('Please enter last name');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (phone.search(/\S/) == -1) {
      showToastMsg('Please enter phone number');
      if (flg == true) {
        flg = false;
      }
      return false;
    }

    if (flg == true) {
      setLoader(true);
      setUpdateActionStatus(true);
      postWithToken(
        baseUrl,
        'web-business/update-profile',
        {
          lang_id: langId,
          name: first_name,
          last_name: last_name,
          cel: phone,
        },
        userToken,
      )
        .then(response => {
          // console.log(userData);
          //console.log(response);
          setLoader(false);
          setUpdateActionStatus(false);

          if (response.status === true) {
            dispatch(setUserDataAfterLogin(response));
            setData('userDetails', JSON.stringify(response.data));

            showToastMsg('Profile Updated Successfully');
          } else {
            showToastMsg('Somthing is wrong try after some time');
          }
        })
        .catch(error => {
          console.log('Error : ', error);
        });
    }
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

      <View style={styles.main}>
        <View style={styles.inner_left}>
          <TouchableOpacity
            style={[styles.button_left, {backgroundColor: Colors.blue}]}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.white,
                fontFamily: Inter.medium,
              }}>
              Update Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button_left, {backgroundColor: '#F0F0F0'}]}
            onPress={() => {
              navigation.navigate('MyAccountDelete');
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.black,
                fontFamily: Inter.medium,
              }}>
              Delete Profile
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inner_right}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                paddingHorizontal: responsiveWidth(4),
                paddingVertical: responsiveHeight(4),
                width: '56%',
                marginBottom: '20%',
              }}>
              <AppTextInput
                title={'First Name'}
                inputStyle={{paddingLeft: 10}}
                onChangeText={setFirstName}
                value={first_name}
                placeholder=""
                inputContainerStyle={{
                  borderColor: Colors.grey,
                  marginBottom: responsiveHeight(1),
                  backgroundColor: Colors.white,
                }}
              />

              <AppTextInput
                title={'Last Name'}
                inputStyle={{paddingLeft: 10}}
                onChangeText={setLastName}
                value={last_name}
                placeholder=""
                inputContainerStyle={{
                  borderColor: Colors.grey,
                  marginBottom: responsiveHeight(1),
                  backgroundColor: Colors.white,
                }}
              />

              <AppTextInput
                title={'Email'}
                inputStyle={{paddingLeft: 10}}
                value={email}
                placeholder=""
                inputContainerStyle={{
                  borderColor: Colors.grey,
                  marginBottom: responsiveHeight(1),
                  backgroundColor: Colors.white,
                }}
                editable={false}
              />

              <AppTextInput
                title={'Phone'}
                inputStyle={{paddingLeft: 10}}
                onChangeText={setPhone}
                value={phone}
                placeholder=""
                inputContainerStyle={{
                  borderColor: Colors.grey,
                  marginBottom: responsiveHeight(1),
                  backgroundColor: Colors.white,
                }}
                keyboardType="numeric"
                maxLength={12}
              />

              {update_action_status === true ? (
                <TouchableOpacity style={styles.button_disable}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: responsiveFontSize(1.5),
                      color: '#000',
                      fontFamily: Inter.medium,
                    }}>
                    Update
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    updateProfile();
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: responsiveFontSize(1.5),
                      color: '#fff',
                      fontFamily: Inter.medium,
                    }}>
                    Update
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Container>
  );
};
export default MyAccount;
