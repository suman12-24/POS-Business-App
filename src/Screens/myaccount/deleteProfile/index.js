import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../../Constants/Colors';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import {
  showToastMsg,
  removeData,
} from '../../../Service/localStorage';
import { postWithToken } from '../../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import { Container } from 'react-native-basic-elements';
import { clearUserData } from '../../../Store/Reducers/CommonReducer';
import Loader from '../../Component/loader';
import AccountSidebar from '../accountSidebar';
import Styles from '../style';
import useTranslation from '../../../Hooks/useTranslation';

const TABLET_BREAKPOINT = 768;

/* ---------------------------------------------------
   COLORS — matches CounterPrinterSettings.js
--------------------------------------------------- */
const COLORS = {
  purple: '#3B1BB0',
  purpleLight: '#EFEBFF',
  border: '#E7E7F3',
  bg: '#F5F5FA',
  text: '#1F2937',
  subtext: '#6B7280',
  white: '#FFFFFF',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

const MyAccountDelete = ({ props, route, navigation }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const accountStyles = Styles(isTablet);
  const dispatch = useDispatch();
  const { baseUrl, userToken, deviceToken, userData } = useSelector(
    state => state.common,
  );
  const { t } = useTranslation();
  const [viewloader, setLoader] = useState(false);
  const [update_action_status, setUpdateActionStatus] = useState(false);
  const [selected_nav, setSelectedNav] = useState(0);
  useFocusEffect(React.useCallback(() => { }, []));

  const full_name = userData != null
    ? [userData.name, userData.last_name].filter(Boolean).join(' ')
    : '';
  const email = userData != null ? userData.email : '';

  const DeleteAccount = () => {
    setLoader(true);
    setUpdateActionStatus(true);
    postWithToken(baseUrl, 'account-delete', {}, userToken)
      .then(response => {
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
        setLoader(false);
        setUpdateActionStatus(false);
      });
  };

  function handleLogout() {
    setLoader(true);

    postWithToken(baseUrl, 'logout', { device_id: deviceToken }, userToken)
      .then(response => {
        console.log(response);
        dispatch(clearUserData());
        removeData('userDetails');
        removeData('userToken');

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
    <Container style={accountStyles.container}>
      {viewloader === true ? <Loader /> : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.scrollContent}
      >
        <View style={accountStyles.main}>
          {/* LEFT SIDEBAR */}
          <View style={accountStyles.inner_left}>
            <AccountSidebar
              isTablet={isTablet}
              userData={userData}
              navigation={navigation}
              selectedKey="delete_profile"
            />
          </View>

          {/* RIGHT CONTENT — delete confirmation card */}
          <View style={[accountStyles.inner_right,{justifyContent: 'center', alignItems: 'center'

          }]}>
            <View style={styles.card}>
              <View style={styles.warning_icon_circle}>
                <Feather name="alert-triangle" size={responsiveFontSize(3)} color={COLORS.danger} />
              </View>

              <Text style={styles.cardTitle}>{t('DELETE_YOUR_ACCOUNT')}</Text>
              <Text style={styles.cardSubtitle}>{t('THIS_ACTION_IS_PERMANENT_AND_CANNOT_BE_UNDONE')}</Text>

              <View style={styles.divider} />

              {update_action_status === true ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.button_no, styles.button_disabled]} disabled>
                    <Text style={styles.button_no_text}>{t('MODAL_DELETE_NO')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button_yes, styles.button_disabled]} disabled>
                    <Text style={styles.button_yes_text}>{t('MODAL_DELETE_YES')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.button_no}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Text style={styles.button_no_text}>{t('MODAL_DELETE_NO')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button_yes}
                    activeOpacity={0.85}
                    onPress={() => DeleteAccount()}
                  >
                    <Feather name="trash-2" size={responsiveFontSize(1.6)} color={Colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.button_yes_text}>{t('YES_DELETE')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default MyAccountDelete;
/* ---------------------------------------------------
   STYLES — same tokens/sizing as CounterPrinterSettings.js
--------------------------------------------------- */
const styles = StyleSheet.create({
  card: {
    marginRight: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    alignItems: 'center',
  },
  warning_icon_circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 18,
    color: COLORS.subtext,
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  button_no: {
    borderWidth: 1,
    borderColor: COLORS.purple,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  button_no_text: {
    color: COLORS.purple,
    fontWeight: '700',
    fontSize: 16,
  },
  button_yes: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button_yes_text: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  button_disabled: {
    opacity: 0.5,
  },
});