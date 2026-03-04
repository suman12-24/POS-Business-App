import React, { useEffect, useState } from 'react';
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
import { Colors } from '../../../Constants/Colors';
import { Inter } from '../../../Constants/Fonts';
import { Images } from '../../../Constants/ImageIconContant';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import {
  showToastMsg,
  getData,
  setData,
  removeData,
} from '../../../Service/localStorage';
import { postWithToken } from '../../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import {
  Container,
  Icon,
  AppTextInput,
  CheckBox,
} from 'react-native-basic-elements';
import { clearUserData } from '../../../Store/Reducers/CommonReducer';
import Loader from '../../../Component/loader';
// create a component
const MyAccountDelete = ({ props, route, navigation }) => {
  const styles = Styles();
  const dispatch = useDispatch();
  const { baseUrl, siteUrl, userToken, userData, deviceToken, post_data } =
    useSelector(state => state.common);
  const [viewloader, setLoader] = useState(false);

  useFocusEffect(React.useCallback(() => {}, []));

  const [update_action_status, setUpdateActionStatus] = useState(false);

  const DeleteAccount = () => {
    setLoader(true);
    setUpdateActionStatus(true);
    postWithToken(baseUrl, 'web-business/account-delete', {}, userToken)
      .then(response => {
        // console.log(userData);
        //console.log(response);
        setLoader(false);
        setUpdateActionStatus(false);

        if (response.status === true) {
          handleLogout();
        } else {
          showToastMsg('Somthing is wrong try after some time');
        }
      })
      .catch(error => {
        console.log('Error : ', error);
      });
  };

  function handleLogout() {
    setLoader(true);

    postWithToken(
      baseUrl,
      'web-business/logout',
      { device_id: deviceToken },
      userToken,
    )
      .then(response => {
        console.log(response);
        dispatch(clearUserData());
        removeData('userDetails');
        removeData('userToken');
        // removeData("device_token");

        setTimeout(() => {
          setLoader(false);
          navigation.navigate('Login');
        }, 500);
      })
      .catch(error => {
        setLoader(false);
        console.log('Error : ', error);
      });
  }

  return (
    <Container style={styles.container}>
      {/*viewloader === true ?<View style={{ 
				alignItems: 'center',
				justifyContent: 'center', 
				display: 'flex',
				width: '100%', 
				height: '100%', 
				position: 'absolute', 
				left:0,
				top:0,
				zIndex: 1}}>
					<ActivityIndicator size="large" color={Colors.primary}  />
				</View>
				: null */}

      {viewloader === true ? <Loader /> : null}

      <View style={styles.main}>
        <View style={styles.inner_left}>
          <TouchableOpacity
            style={[styles.button_left, { backgroundColor: '#F0F0F0' }]}
            onPress={() => {
              navigation.navigate('MyAccount');
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.black,
                fontFamily: Inter.medium,
              }}
            >
              Update Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button_left,
              { backgroundColor: Colors.primaryFontColor },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: responsiveFontSize(1.5),
                color: Colors.white,
                fontFamily: Inter.medium,
              }}
            >
              Delete Profile
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inner_right}>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: responsiveHeight(-15),
                backgroundColor: Colors.white,
                borderRadius: 10,
                width: responsiveWidth(40),
                height: responsiveHeight(30),
              }}
            >
              <Text
                style={{
                  fontFamily: Inter.bold,
                  fontSize: responsiveFontSize(2),
                  color: Colors.black,
                }}
              >
                {' '}
                Delete Your Account
              </Text>
              {update_action_status === true ? (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 15,
                    marginTop: responsiveHeight(2),
                  }}
                >
                  <TouchableOpacity style={styles.button_no_disable}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: responsiveFontSize(1.5),
                        color: '#000',
                        fontFamily: Inter.medium,
                      }}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button_yes_disable}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: responsiveFontSize(1.5),
                        color: '#000',
                        fontFamily: Inter.medium,
                      }}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 15,
                    marginTop: responsiveHeight(2),
                  }}
                >
                  <TouchableOpacity
                    style={styles.button_no}
                    onPress={() => {
                      navigation.navigate('Home');
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: responsiveFontSize(1.5),
                        color: Colors.white,
                        fontFamily: Inter.medium,
                      }}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button_yes}
                    onPress={() => {
                      DeleteAccount();
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: responsiveFontSize(1.5),
                        color: Colors.white,
                        fontFamily: Inter.medium,
                      }}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Container>
  );
};
export default MyAccountDelete;
