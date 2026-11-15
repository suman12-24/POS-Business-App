import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    useWindowDimensions,
    StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Styles from './style';
import { Colors } from '../../Constants/Colors';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDataAfterLogin } from '../../Store/Reducers/CommonReducer';
import { showToastMsg, setData } from '../../Service/localStorage';
import { postWithToken } from '../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import { Container } from 'react-native-basic-elements';
import Loader from '../Component/loader';
import AccountSidebar from './accountSidebar'; // Import shared sidebar
import useTranslation from '../../Hooks/useTranslation';
import { useAppTheme } from '../../Hooks/useAppTheme';
const TABLET_BREAKPOINT = 768;

// Order matters here — this is also the priority order used to decide
// which field to scroll to first when multiple fields are invalid at once
// (keeps the same precedence as the original sequential validation).
const FIELD_ORDER = ['first_name', 'last_name', 'email', 'phone', 'address'];

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

const MyAccount = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isTablet = width >= TABLET_BREAKPOINT;
    const theme = useAppTheme();
    const styles = useMemo(() => Styles(isTablet, theme), [isTablet, theme]);
    const dispatch = useDispatch();
    const { baseUrl, userToken, userData, langId } = useSelector(
        state => state.common,
    );
    const { t } = useTranslation();

    const [viewloader, setLoader] = useState(false);
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [update_action_status, setUpdateActionStatus] = useState(false);

    // One error message per field, keyed by the same names as FIELD_ORDER.
    // Empty string / absent key means "no error".
    const [errors, setErrors] = useState({});

    const [initialValues, setInitialValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
    });

    // scrollViewRef lets us call scrollTo(); fieldY stores each field's
    // measured vertical position (captured via onLayout) so we know where
    // to scroll when that field is the first one with an error.
    const scrollViewRef = useRef(null);
    const fieldY = useRef({});

    const registerFieldY = (field) => (event) => {
        fieldY.current[field] = event.nativeEvent.layout.y;
    };

    useFocusEffect(React.useCallback(() => { }, []));

    useEffect(() => {
        if (userData != null) {
            const loaded = {
                first_name: userData.name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone: userData.cel != null ? userData.cel.toString() : '',
                address: userData.address || '',
            };
            setFirstName(loaded.first_name);
            setLastName(loaded.last_name);
            setEmail(loaded.email);
            setPhone(loaded.phone);
            setAddress(loaded.address);
            setInitialValues(loaded);
        }
    }, [userData]);

    const hasChanges = useMemo(() => {
        return (
            first_name !== initialValues.first_name ||
            last_name !== initialValues.last_name ||
            phone !== initialValues.phone ||
            address !== initialValues.address
        );
    }, [first_name, last_name, phone, address, initialValues]);

    // Clears a single field's error as soon as the user starts fixing it,
    // rather than making them wait for the next submit attempt to see
    // the red border go away.
    const clearError = (field) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const onChangeFirstName = (val) => { setFirstName(val); clearError('first_name'); };
    const onChangeLastName = (val) => { setLastName(val); clearError('last_name'); };
    const onChangePhone = (val) => { setPhone(val); clearError('phone'); };
    const onChangeAddress = (val) => { setAddress(val); clearError('address'); };

    // Runs the full set of checks and returns an { field: message } map.
    // Does not touch state — validateAndFocus below decides what to do
    // with the result.
    const validate = () => {
        const nextErrors = {};

        if (first_name.search(/\S/) === -1) {
            nextErrors.first_name = 'Please enter first name';
        }
        if (last_name.search(/\S/) === -1) {
            nextErrors.last_name = 'Please enter last name';
        }
        if (email.search(/\S/) === -1) {
            nextErrors.email = 'Please enter email';
        } else if (EMAIL_REGEX.test(email) === false) {
            nextErrors.email = 'Please enter valid email Id';
        }
        if (phone.search(/\S/) === -1) {
            nextErrors.phone = 'Please enter phone number';
        }
        if (address.search(/\S/) === -1) {
            nextErrors.address = 'Please enter address';
        }

        return nextErrors;
    };

    // Validates, stores the errors so the UI can highlight every invalid
    // field at once, and scrolls to whichever invalid field comes first
    // in FIELD_ORDER. Returns true only when the form is fully valid.
    const validateAndFocus = () => {
        const nextErrors = validate();
        setErrors(nextErrors);

        const firstInvalidField = FIELD_ORDER.find((f) => nextErrors[f]);
        if (firstInvalidField) {
            const y = fieldY.current[firstInvalidField] ?? 0;
            scrollViewRef.current?.scrollTo({
                y: Math.max(y - 20, 0), // small offset so the label isn't flush against the top edge
                animated: true,
            });
            return false;
        }
        return true;
    };

    const updateProfile = () => {
        if (!validateAndFocus()) {
            return;
        }

        setLoader(true);
        setUpdateActionStatus(true);

        postWithToken(
            baseUrl,
            'update-profile',
            {
                lang_id: langId,
                name: first_name,
                last_name: last_name,
                cel: phone,
                email: email,
                address: address,
            },
            userToken,
        )
            .then(response => {
                setLoader(false);
                setUpdateActionStatus(false);

                if (response.status === true) {
                    dispatch(setUserDataAfterLogin(response));
                    setData('userDetails', JSON.stringify(response.data));
                    showToastMsg('Profile Updated Successfully');
                    setInitialValues({
                        first_name,
                        last_name,
                        email,
                        phone,
                        address,
                    });
                } else {
                    showToastMsg('Something went wrong, try again later');
                }
            })
            .catch(error => {
                console.log('Error : ', error);
                setLoader(false);
                setUpdateActionStatus(false);
            });
    };

    return (
        <Container style={styles.container}>
            {viewloader === true ? <Loader /> : null}
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.main}>
                    {/* LEFT SIDEBAR */}
                    <View style={styles.inner_left}>
                        <AccountSidebar
                            isTablet={isTablet}
                            userData={userData}
                            navigation={navigation}
                            selectedKey="update_profile"
                        />
                    </View>
                    {/* RIGHT CONTENT */}
                    <View style={styles.inner_right}>
                        <View style={styles.form_card}>
                            <Text style={styles.form_title}>{t('UPDATE_PROFILE')}</Text>
                            <View style={styles.title_underline} />
                            <Text style={styles.form_subtitle}>{t('UPDATE_YOUR_PERSONAL_INFORMATION_BELOW')}.</Text>

                            {/* First Name */}
                            <View onLayout={registerFieldY('first_name')}>
                                <Text style={styles.field_label}>{t('NAME')}</Text>
                                <View style={[styles.input_wrap, errors.first_name && localStyles.input_wrap_error]}>
                                    <View style={styles.input_icon_circle}>
                                        <Feather name="user" size={responsiveFontSize(1.3)} color={theme.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.text_input}
                                        value={first_name}
                                        onChangeText={onChangeFirstName}
                                        placeholder="First Name"
                                        placeholderTextColor={theme.fontColorOnBackground}
                                    />
                                </View>
                                {errors.first_name ? <Text style={localStyles.error_text}>{errors.first_name}</Text> : null}
                            </View>

                            {/* Last Name */}
                            <View onLayout={registerFieldY('last_name')}>
                                <Text style={styles.field_label}>{t('LAST_NAME')}</Text>
                                <View style={[styles.input_wrap, errors.last_name && localStyles.input_wrap_error]}>
                                    <View style={styles.input_icon_circle}>
                                        <Feather name="user" size={responsiveFontSize(1.3)} color={theme.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.text_input}
                                        value={last_name}
                                        onChangeText={onChangeLastName}
                                        placeholder="Last Name"
                                        placeholderTextColor={theme.fontColorOnBackground}
                                    />
                                </View>
                                {errors.last_name ? <Text style={localStyles.error_text}>{errors.last_name}</Text> : null}
                            </View>

                            {/* Phone */}
                            <View onLayout={registerFieldY('phone')}>
                                <Text style={styles.field_label}>{t('PHONE_NUMBER')}</Text>
                                <View style={[styles.input_wrap, errors.phone && localStyles.input_wrap_error]}>
                                    <View style={styles.input_icon_circle}>
                                        <Feather name="phone" size={responsiveFontSize(1.3)} color={theme.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.text_input}
                                        value={phone}
                                        onChangeText={onChangePhone}
                                        keyboardType="numeric"
                                        maxLength={12}
                                        placeholder="Phone"
                                        placeholderTextColor={theme.fontColorOnBackground}
                                    />
                                </View>
                                {errors.phone ? <Text style={localStyles.error_text}>{errors.phone}</Text> : null}
                            </View>

                            {/* Address */}
                            <View onLayout={registerFieldY('address')}>
                                <Text style={styles.field_label}>{t('ADDRESS')}</Text>
                                <View style={[styles.input_wrap, errors.address && localStyles.input_wrap_error]}>
                                    <View style={styles.input_icon_circle}>
                                        <Feather name="map-pin" size={responsiveFontSize(1.3)} color={theme.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.text_input}
                                        value={address}
                                        onChangeText={onChangeAddress}
                                        placeholder="Address"
                                        placeholderTextColor={theme.fontColorOnBackground}
                                    />
                                </View>
                                {errors.address ? <Text style={localStyles.error_text}>{errors.address}</Text> : null}
                            </View>

                            {/* Email */}
                            <View onLayout={registerFieldY('email')}>
                                <Text style={styles.field_label}>{t('EMAIL')}</Text>
                                <View style={[styles.input_wrap, errors.email && localStyles.input_wrap_error]}>
                                    <View style={styles.input_icon_circle}>
                                        <Feather name="mail" size={responsiveFontSize(1.3)} color={theme.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.text_input}
                                        value={email}
                                        editable={false}
                                        placeholder="Email"
                                        placeholderTextColor={theme.fontColorOnBackground}
                                    />
                                </View>
                                {errors.email ? <Text style={localStyles.error_text}>{errors.email}</Text> : null}
                            </View>

                            {update_action_status === true ? (
                                <TouchableOpacity style={styles.button_disable} disabled>
                                    <Text style={styles.button_text}>{t('UPDATING')}...</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={hasChanges ? styles.button : styles.button_disable}
                                    onPress={updateProfile}
                                    disabled={!hasChanges}
                                >
                                    <Text style={styles.button_text}>{t('UPDATE')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
};

const localStyles = StyleSheet.create({
    input_wrap_error: {
        borderColor: '#DC2626',
        borderWidth: 1,
    },
    error_text: {
        color: '#DC2626',
        fontSize: 10,
        marginBottom: 8,
    },
});
export default MyAccount;