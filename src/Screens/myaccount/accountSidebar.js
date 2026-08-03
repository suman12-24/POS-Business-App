import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { Images } from '../../Constants/ImageIconContant';
import Styles from './style';
import useTranslation from '../../Hooks/useTranslation';
import { postWithToken, postWithTokenForImage } from '../../Service/service';
import { showToastMsg } from '../../Service/localStorage';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppTheme } from '../../Hooks/useAppTheme';
export const nav_items = [
    { key: 'update_profile', label: 'UPDATE_PROFILE', icon: 'user', screen: 'MyAccount' },
    { key: 'printer_counter', label: 'PRINTER_SETTINGS_FOR_COUNTER', icon: 'printer', screen: 'CounterPrinterSettings' },
    { key: 'printer_kitchen', label: 'PRINTER_SETTINGS_FOR_KITCHEN', icon: 'printer', screen: 'KitchenPrinterSettings' },
    { key: 'report', label: 'REPORT', icon: 'file-text', screen: 'Report' },
    // { key: 'delete_profile', label: 'Delete Profile', icon: 'trash-2', screen: 'MyAccountDelete', isDanger: true },
];

const AccountSidebar = ({ isTablet, userData, navigation, selectedKey }) => {
    const theme = useAppTheme();
    const { baseUrl, userToken } = useSelector(state => state.common);
    const { t } = useTranslation();
    const styles = useMemo(() => Styles(isTablet, theme), [isTablet, theme]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const full_name = userData
        ? [userData.name, userData.last_name].filter(Boolean).join(' ')
        : '';
    const email = userData != null ? userData.email : null;

    /* ---------------------------------------------------
        FETCH PROFILE IMAGE FROM SERVER
        Local state only — not written to Redux. Used on
        mount and again right after a successful upload.
    --------------------------------------------------- */
    const fetchProfileImage = useCallback(() => {
        return postWithToken(baseUrl, 'get-profile', {}, userToken)
            .then(response => {
                if (response.status === true && response.data) {
                    setProfileImage(response.data.image_path || response.data.url || null);
                } else {
                    console.log('get-profile failed:', response);
                }
            })
            .catch(error => {
                console.error('get-profile status:', error.response?.status);
                console.error('get-profile data:', error.response?.data);
            });
    }, [baseUrl, userToken]);

    useEffect(() => {
        if (baseUrl && userToken) {
            fetchProfileImage();
        }
    }, [baseUrl, userToken, fetchProfileImage]);

    const handleNavigation = (item) => {
        if (item.screen) {
            navigation.navigate(item.screen);
        }
    };

    const handleChangeProfileImage = () => {
        if (isUploadingImage) return;

        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8 },
            response => {
                if (response.didCancel || response.errorCode) {
                    return;
                }
                const asset = response.assets && response.assets[0];
                if (!asset) return;
                uploadProfileImage(asset);
            },
        );
    };

    const uploadProfileImage = asset => {
        setIsUploadingImage(true);

        const formData = new FormData();
        formData.append('image', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'profile.jpg',
        });

        postWithTokenForImage(baseUrl, 'update-profile-image', formData, userToken)
            .then(response => {
                if (response.status === true) {
                    // Re-fetch the canonical image from get-profile rather
                    // than trusting this endpoint's own response shape.
                    fetchProfileImage().finally(() => {
                        setIsUploadingImage(false);
                        showToastMsg('Profile image updated successfully');
                    });
                } else {
                    setIsUploadingImage(false);
                    showToastMsg(response.message || 'Failed to update profile image');
                    console.log('Image update failed:', response);
                }
            })
            .catch(error => {
                setIsUploadingImage(false);
                showToastMsg('Something went wrong, try again later');
                console.error('update-profile-image status:', error.response?.status);
                console.error('update-profile-image data:', error.response?.data);
            });
    };
    return (
        <View style={styles.sidebar_card}>
            {/* Top wash gradient */}
            <LinearGradient
                colors={['#BFB9E3', '#EBE9F6', '#FFFFFF']}
                locations={[0, 0.18, 0.35]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sidebar_gradient}
            />

            <View style={styles.sidebar_content}>
                <TouchableOpacity
                    style={styles.avatar_circle}
                    onPress={handleChangeProfileImage}
                    activeOpacity={0.85}
                    disabled={isUploadingImage}
                >
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.avatar_image}
                            resizeMode="cover"
                        />
                    ) : (
                        <Feather name="user" size={responsiveFontSize(3)} color={theme.primary} />
                    )}
                    <View style={styles.avatar_edit_badge}>
                        <Feather name="edit-2" size={responsiveFontSize(1.1)} color={theme.fontColorOnBackground} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.sidebar_title}>{full_name || 'My Account'}</Text>
                {!!email && <Text style={styles.sidebar_email}>{email}</Text>}
                <Text style={styles.sidebar_subtitle}>
                    {t('MANAGE_YOUR_PERSONAL_INFORMATION_AND_ACCOUNT_SETTING')}.
                </Text>
            </View>
            {nav_items.map((item) => {
                const isSelected = item.key === selectedKey;
                // 1. Container Style
                let itemContainerStyle = styles.nav_item;
                if (isSelected) {
                    itemContainerStyle = item.isDanger
                        ? styles.nav_item_active_danger
                        : styles.nav_item_active;
                }
                // 2. Icon Badge Style
                let iconContainerStyle = styles.nav_icon_inactive;
                if (isSelected) {
                    iconContainerStyle = item.isDanger
                        ? styles.nav_icon_active_danger
                        : styles.nav_icon_active;
                } else if (item.isDanger) {
                    iconContainerStyle = styles.nav_icon_danger;
                }
                // 3. Icon Color
                let iconColor = theme.primary;
                if (isSelected) {
                    iconColor = '#FFFFFF';
                } else if (item.isDanger) {
                    iconColor = '#EF4444';
                }

                // 4. Text Style
                let textStyle = styles.nav_item_text_inactive;
                if (isSelected) {
                    textStyle = item.isDanger
                        ? styles.nav_item_active_danger_text
                        : styles.nav_item_active_text;
                } else if (item.isDanger) {
                    textStyle = styles.nav_item_text;
                }
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={itemContainerStyle}
                        onPress={() => handleNavigation(item)}
                    >
                        <View style={styles.nav_item_left}>
                            <View style={iconContainerStyle}>
                                <Feather
                                    name={item.icon}
                                    size={responsiveFontSize(item.isDanger ? 1.3 : 1.2)}
                                    color={iconColor}
                                />
                            </View>
                            <Text style={textStyle}>{t(item.label)}</Text>
                        </View>
                        <Feather
                            name="chevron-right"
                            size={responsiveFontSize(item.isDanger ? 1.3 : 1.2)}
                            color={isSelected && item.isDanger ? '#EF4444' : styles.chevron_color.color}
                        />
                    </TouchableOpacity>
                );
            })}

            {/* "Your Data is Safe" Card */}
            <View style={styles.safe_card}>
                <View style={styles.safe_icon_wrap}>
                    <Image
                        source={Images.safeLogo}
                        style={styles.safe_logo_image}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.safe_title}>{t('YOUR_DATE_IS_SAFE')}</Text>
                <Text style={styles.safe_subtitle}>
                    {t('WE_USE_INDUSTRY_STANDARD_SECURITY_TO_KEEP_YOUR_INFORMATION_SECURE')}.
                </Text>
            </View>
        </View>
    );
};
export default AccountSidebar;