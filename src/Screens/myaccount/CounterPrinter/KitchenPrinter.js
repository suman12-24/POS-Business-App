import React, { useState, useEffect, useRef } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    useWindowDimensions,
    StyleSheet,
    Switch,
    Modal,
    FlatList,
    Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { showToastMsg } from '../../../Service/localStorage';
import { postWithToken } from '../../../Service/service';
import { Container } from 'react-native-basic-elements';
import AccountSidebar from '../accountSidebar';
import Styles from '../style';
import useTranslation from '../../../Hooks/useTranslation';
import { useAppTheme } from '../../../Hooks/useAppTheme';
import { Inter } from '../../../Constants/Fonts';

const TABLET_BREAKPOINT = 768;

const COLORS = {
    purpleLight: '#EFEBFF',
    border: '#E7E7F3',
    bg: '#F5F5FA',
    text: '#1F2937',
    skeletonBg: '#E5E7EB',
};

const COPY_OPTIONS = ['1', '2', '3', '4', '5'];

const SkeletonLoader = () => {
    const theme = useAppTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.skeletonItem, { width: '60%', height: 24, opacity }]} />
            <Animated.View style={[styles.skeletonItem, { width: '85%', height: 14, opacity, marginTop: 8 }]} />
            <View style={styles.divider} />
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                    <Animated.View style={[styles.skeletonItem, { width: '60%', height: 14, opacity, marginBottom: 8 }]} />
                    <Animated.View style={[styles.skeletonItem, { width: '100%', height: 46, borderRadius: 10, opacity }]} />
                </View>
                <View style={{ flex: 1 }}>
                    <Animated.View style={[styles.skeletonItem, { width: '60%', height: 14, opacity, marginBottom: 8 }]} />
                    <Animated.View style={[styles.skeletonItem, { width: '100%', height: 46, borderRadius: 10, opacity }]} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Animated.View style={[styles.skeletonItem, { width: 120, height: 16, opacity, marginRight: 12 }]} />
                <Animated.View style={[styles.skeletonItem, { width: 45, height: 24, borderRadius: 12, opacity }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Animated.View style={[styles.skeletonItem, { width: 90, height: 44, borderRadius: 24, opacity }]} />
            </View>
        </View>
    );
};

export default function KitchenPrinterSettings({ navigation }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= TABLET_BREAKPOINT;
    const theme = useAppTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);
    const accountStyles = Styles(isTablet, theme);
    const { baseUrl, userToken, userData, langId } = useSelector((state) => state.common);
    const { t } = useTranslation();

    const [ipAddress, setIpAddress] = useState('');
    const [ipAddress2, setIpAddress2] = useState('');
    const [printCopy, setPrintCopy] = useState('');
    const [autoPrint, setAutoPrint] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewloader, setLoader] = useState(true);

    useEffect(() => {
        fetchPrinterDetails();
    }, []);

    const fetchPrinterDetails = () => {
        setLoader(true);
        const payload = { lang_id: langId };

        postWithToken(baseUrl, 'get-printer-details', payload, userToken)
            .then((response) => {
                setLoader(false);
                if (response.status === true && response.data) {
                    const details = response.data;
                    setIpAddress(details.printer_kitchen_ip_address ? String(details.printer_kitchen_ip_address) : '');
                    setIpAddress2(details.printer_kitchen_ip_address_2 ? String(details.printer_kitchen_ip_address_2) : '');
                    setPrintCopy(details.printer_kitchen_print_copy ? String(details.printer_kitchen_print_copy) : '');
                    setAutoPrint(Boolean(details.printer_kitchen_auto_enable === 1));
                }
            })
            .catch((error) => {
                console.log('Error fetching printer details:', error);
                setLoader(false);
            });
    };

    const handleSave = () => {
        if (!ipAddress && !ipAddress2) {
            showToastMsg(t('PLEASE_ENTER_IP_ADDRESS') || 'Please enter at least one IP address');
            return;
        }

        if (!printCopy) {
            showToastMsg(t('PLEASE_SELECT_NUMBER_OF_PRINT_COPIES') || 'Please select print copies');
            return;
        }

        setSaving(true);
        const payload = {
            lang_id: langId,
            printer_kitchen_ip_address: ipAddress,
            printer_kitchen_ip_address_2: ipAddress2,
            printer_kitchen_print_copy: printCopy,
            printer_kitchen_auto_enable: autoPrint ? 1 : 0,
        };

        postWithToken(baseUrl, 'update-printer-details', payload, userToken)
            .then((response) => {
                setSaving(false);
                if (response.status === true) {
                    showToastMsg(response.message || 'Printer settings saved successfully');
                } else {
                    showToastMsg(response.message || 'Something went wrong');
                }
            })
            .catch((error) => {
                console.log('Error saving printer settings:', error);
                setSaving(false);
                showToastMsg('Something went wrong, try again later');
            });
    };

    return (
        <Container style={accountStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={accountStyles.scrollContent}
            >
                <View style={accountStyles.main}>
                    <View style={accountStyles.inner_left}>
                        <AccountSidebar
                            isTablet={isTablet}
                            userData={userData}
                            navigation={navigation}
                            selectedKey="printer_kitchen"
                        />
                    </View>

                    <View style={accountStyles.inner_right}>
                        {viewloader ? (
                            <SkeletonLoader />
                        ) : (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{t('PRINTER_SETTINGS_FOR_KITCHEN')}</Text>
                                <View style={accountStyles.title_underline} />
                                <Text style={styles.cardSubtitle}>
                                    {t('ENTER_IP_ADDRESS_RO_CONNECT_YOUR_KITCHEN_PRINTER')}
                                </Text>

                                <View style={styles.fieldRow}>
                                    {/* Primary Kitchen IP */}
                                    <View style={styles.fieldCol}>
                                        <Text style={styles.fieldLabel}>{t('IP_ADDRESS')} 1</Text>
                                        <View style={styles.textInputWrapper}>
                                            <Text style={styles.icon}>🌐</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder={t('ENTER_IP_ADDRESS')}
                                                placeholderTextColor={theme.fontColorOnBackground}
                                                value={ipAddress}
                                                onChangeText={setIpAddress}
                                                keyboardType="decimal-pad"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                            />
                                        </View>
                                    </View>

                                    {/* Secondary Kitchen IP */}
                                    <View style={styles.fieldCol}>
                                        <Text style={styles.fieldLabel}>{t('IP_ADDRESS')} 2 (Optional)</Text>
                                        <View style={styles.textInputWrapper}>
                                            <Text style={styles.icon}>🌐</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder={t('ENTER_IP_ADDRESS')}
                                                placeholderTextColor={theme.fontColorOnBackground}
                                                value={ipAddress2}
                                                onChangeText={setIpAddress2}
                                                keyboardType="decimal-pad"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                            />
                                        </View>
                                    </View>

                                    {/* Print Copies */}
                                    <View style={styles.fieldCol}>
                                        <Text style={styles.fieldLabel}>{t('NUMBER_OF_PRINT_COPY')}</Text>
                                        <TouchableOpacity
                                            style={styles.dropdownBtn}
                                            activeOpacity={0.8}
                                            onPress={() => setDropdownVisible(true)}
                                        >
                                            <View style={styles.dropdownInner}>
                                                <Text style={styles.icon}>🖨️</Text>
                                                <Text
                                                    style={[
                                                        styles.dropdownText,
                                                        !printCopy && { color: theme.fontColorOnBackground },
                                                    ]}
                                                >
                                                    {printCopy
                                                        ? `${printCopy} ${printCopy === '1' ? t('COPY') : t('COPIES')}`
                                                        : t('SELECT_PRINT_COPIES')}
                                                </Text>
                                            </View>
                                            <Text style={styles.arrowIcon}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>{t('ENABLE_AUTO_PRINT')}</Text>
                                    <Switch
                                        trackColor={{ false: '#D1D5DB', true: theme.primary }}
                                        thumbColor={theme.fontColor}
                                        ios_backgroundColor="#D1D5DB"
                                        onValueChange={setAutoPrint}
                                        value={autoPrint}
                                    />
                                </View>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                                        activeOpacity={0.85}
                                        onPress={handleSave}
                                        disabled={saving}
                                    >
                                        <Text style={styles.saveBtnText}>{saving ? t('SAVING') : t('SAVE')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal
                transparent
                visible={dropdownVisible}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('SELECT_PRINT_COPIES')}</Text>
                        <FlatList
                            data={COPY_OPTIONS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        printCopy === item && styles.selectedOption,
                                    ]}
                                    onPress={() => {
                                        setPrintCopy(item);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            printCopy === item && styles.selectedOptionText,
                                        ]}
                                    >
                                        {item} {item === '1' ? t('COPY') : t('COPIES')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </Container>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        card: {
            marginRight: 20,
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: COLORS.border,
            elevation: 1,
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.fontColorOnBackground,
            marginBottom: 6,
        },
        cardSubtitle: {
            fontSize: 13,
            color: theme.fontColorOnBackground,
            marginBottom: 16,
        },
        fieldRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 15,
            flexWrap: 'wrap',
        },
        fieldCol: {
            flex: 1,
            minWidth: 160,
            maxWidth: 320,
        },
        fieldLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.fontColorOnBackground,
            marginBottom: 8,
        },
        textInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            backgroundColor: theme.background,
        },
        textInput: {
            flex: 1,
            fontSize: 14,
            color: theme.fontColorOnBackground,
            paddingVertical: 12,
        },
        dropdownBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: theme.background,
        },
        dropdownInner: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        icon: {
            fontSize: 16,
            marginRight: 10,
        },
        dropdownText: {
            fontSize: 14,
            color: theme.fontColorOnBackground,
        },
        arrowIcon: {
            fontSize: 10,
            color: theme.fontColorOnBackground,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        toggleLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.fontColorOnBackground,
            marginRight: 12,
        },
        buttonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
        },
        saveBtn: {
            backgroundColor: theme.primary,
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 24,
        },
        saveBtnText: {
            color: theme.fontColor,
            fontWeight: '700',
            fontSize: 14,
        },
        skeletonItem: {
            backgroundColor: COLORS.skeletonBg,
            borderRadius: 6,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContent: {
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 320,
        },
        modalTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.fontColorOnBackground,
            marginBottom: 12,
            textAlign: 'center',
        },
        optionItem: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 4,
        },
        selectedOption: {
            backgroundColor: COLORS.purpleLight,
        },
        optionText: {
            fontSize: 14,
            color: theme.fontColorOnBackground,
            textAlign: 'center',
        },
        selectedOptionText: {
            color: theme.primary,
            fontWeight: '700',
        },
    });