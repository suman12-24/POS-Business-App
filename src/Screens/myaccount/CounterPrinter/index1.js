import React, { useState, useEffect, useRef } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
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
import EbPrinter from 'react-native-ebprinter';
import SelectUsbPrinter from '../../Component/selectusbprinter';
const TABLET_BREAKPOINT = 768;

/* ---------------------------------------------------
   COLORS
--------------------------------------------------- */
const COLORS = {
    purpleLight: '#EFEBFF',
    border: '#E7E7F3',
    bg: '#F5F5FA',
    text: '#1F2937',
    skeletonBg: '#E5E7EB',
};

const COPY_OPTIONS = ['1', '2', '3', '4', '5'];

/* ---------------------------------------------------
   SKELETON LOADER COMPONENT
--------------------------------------------------- */
const SkeletonLoader = () => {
    const theme = useAppTheme();
    // Generate styles using the active theme
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
            {/* Title Skeleton */}
            <Animated.View style={[styles.skeletonItem, { width: '60%', height: 24, opacity }]} />

            {/* Subtitle Skeleton */}
            <Animated.View style={[styles.skeletonItem, { width: '85%', height: 14, opacity, marginTop: 8 }]} />

            <View style={styles.divider} />

            {/* Field Label Skeleton */}
            <Animated.View style={[styles.skeletonItem, { width: '40%', height: 14, opacity, marginBottom: 8 }]} />

            {/* Dropdown Skeleton */}
            <Animated.View style={[styles.skeletonItem, { width: 320, height: 46, borderRadius: 10, opacity, marginBottom: 20 }]} />

            {/* Toggle Row Skeleton */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Animated.View style={[styles.skeletonItem, { width: 120, height: 16, opacity, marginRight: 12 }]} />
                <Animated.View style={[styles.skeletonItem, { width: 45, height: 24, borderRadius: 12, opacity }]} />
            </View>

            {/* Button Row Skeleton */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Animated.View style={[styles.skeletonItem, { width: 90, height: 44, borderRadius: 24, opacity }]} />
                <Animated.View style={[styles.skeletonItem, { width: 170, height: 44, borderRadius: 24, opacity }]} />
            </View>
        </View>
    );
};

/* ---------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------- */
export default function CounterPrinterSettings({ navigation }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= TABLET_BREAKPOINT;
    const theme = useAppTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);

    const accountStyles = Styles(isTablet, theme);

    const { baseUrl, userToken, userData, langId, UsbPrinter, } = useSelector((state) => state.common);
    const { t } = useTranslation();
    const [printCopy, setPrintCopy] = useState('');

    const [autoPrint, setAutoPrint] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewloader, setLoader] = useState(true);

    const [visiblemodal, setvisiblemodal] = useState(false);

    const printer_model_close = () => {
        setvisiblemodal(false);
    };
    /* ---------------------------------------------------
        FETCH PRINTER DETAILS ON LOAD
    --------------------------------------------------- */
    useEffect(() => {
        fetchPrinterDetails();
    }, []);

    const fetchPrinterDetails = () => {
        setLoader(true);

        const payload = {
            lang_id: langId,
        };

        postWithToken(baseUrl, 'get-printer-details', payload, userToken)
            .then((response) => {
                setLoader(false);
                if (response.status === true && response.data) {
                    const details = response.data;
                    const copies = details.printer_counter_print_copy;
                    const isAuto = details.printer_counter_auto_enable === 1;

                    setPrintCopy(copies ? String(copies) : '');
                    setAutoPrint(Boolean(isAuto));
                }
            })
            .catch((error) => {
                console.log('Error fetching printer details:', error);
                setLoader(false);
            });
    };

    /* ---------------------------------------------------
        SAVE PRINTER SETTINGS
    --------------------------------------------------- */
    const handleSave = () => {
        if (!printCopy) {
            showToastMsg(t('PLEASE_SELECT_NUMBER_OF_PRINT_COPIES'));
            return;
        }

        setSaving(true);

        const payload = {
            lang_id: langId,
            printer_counter_print_copy: printCopy,
            printer_counter_auto_enable: autoPrint ? 1 : 0,
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

    const handleConnectUSBPrinter = () => {
        showToastMsg(t('SEARCHING_FOR_USB_PRINTERS'));
    };
    return (
        <Container style={accountStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={accountStyles.scrollContent}
            >
                {visiblemodal === true && (
                    <SelectUsbPrinter printer_model_close={printer_model_close} />
                )}
                <View style={accountStyles.main}>
                    {/* LEFT SIDEBAR */}
                    <View style={accountStyles.inner_left}>
                        <AccountSidebar
                            isTablet={isTablet}
                            userData={userData}
                            navigation={navigation}
                            selectedKey="printer_counter"
                        />
                    </View>

                    {/* RIGHT CONTENT */}
                    <View style={accountStyles.inner_right}>
                        {viewloader ? (
                            <SkeletonLoader />
                        ) : (
                            <View style={[styles.card, { backgroundColor: theme.background }]}>
                                {/* Title Header */}
                                <Text style={[styles.cardTitle, { color: theme.fontColorOnBackground }]}>{t('PRINTER_SETTINGS_FOR_COUNTER')}</Text>
                                <View style={accountStyles.title_underline} />
                                <Text style={[styles.cardSubtitle, { color: theme.fontColorOnBackground }]}>
                                    {t('CLICK_THE_BUTTON_TO_CONNECT_YOUR_USB_PRINTER_WITH_CASH_DRAWER')}
                                </Text>
                                {/* Select Copy Dropdown */}
                                <Text style={[styles.fieldLabel, { color: theme.fontColorOnBackground }]}>{t('NUMBER_OF_PRINT_COPY')}</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownBtn, { backgroundColor: theme.background }]}
                                    activeOpacity={0.8}
                                    onPress={() => setDropdownVisible(true)}
                                >
                                    <View style={styles.dropdownInner}>
                                        <Text style={styles.icon}>🖨️</Text>
                                        <Text
                                            style={[
                                                styles.dropdownText, theme.fontColorOnBackground,
                                                !printCopy && { color: theme.fontColorOnBackground },
                                            ]}
                                        >
                                            {printCopy ? `${printCopy} ${printCopy === '1' ? t('COPY') : t('COPIES')}` : t('SELECT_PRINT_COPIES')}
                                        </Text>
                                    </View>
                                    <Text style={styles.arrowIcon}>▼</Text>
                                </TouchableOpacity>
                                {/* Enable Auto Print Toggle */}
                                <View style={styles.toggleRow}>
                                    <Text style={[styles.toggleLabel, { color: theme.fontColorOnBackground }]}>{t('ENABLE_AUTO_PRINT')}</Text>
                                    <Switch
                                        trackColor={{ false: '#D1D5DB', true: theme.primary }}
                                        thumbColor={theme.background}
                                        ios_backgroundColor="#D1D5DB"
                                        onValueChange={setAutoPrint}
                                        value={autoPrint}
                                    />
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.saveBtn, { backgroundColor: theme.primary }, saving && { opacity: 0.7 }]}
                                        activeOpacity={0.85}
                                        onPress={handleSave}
                                        disabled={saving}
                                    >
                                        <Text style={[styles.saveBtnText, { color: theme.fontColor }]}>{saving ? t('SAVING') : t('SAVE')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.connectBtn, { backgroundColor: theme.primary }]}
                                        activeOpacity={0.85}
                                        onPress={handleConnectUSBPrinter}
                                    >
                                        <Text style={styles.connectBtnIcon}>🖨️</Text>
                                        <Text style={[styles.connectBtnText, { color: theme.fontColor }]}>{t('CONNECT_USB_PRINTER')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* DROPDOWN SELECTION MODAL */}
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
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.fontColorOnBackground }]}>{t('SELECT_PRINT_COPIES')}</Text>
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
                                            styles.optionText, theme.fontColorOnBackground,
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

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */
const getStyles = (theme) => StyleSheet.create({
    card: {
        marginRight: 20,
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: Inter.regular,
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 13,
        fontFamily: Inter.regular,
        marginBottom: 8,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: 320,
        marginBottom: 10,
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
    },
    arrowIcon: {
        fontSize: 10,
        color: theme.fontColorOnBackground,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    toggleLabel: {
        fontSize: 14,
        //fontFamily: Inter.medium,
        marginRight: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
    },
    saveBtn: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    saveBtnText: {
        fontFamily: Inter.semibold,
        fontSize: 14,
    },
    connectBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectBtnIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    connectBtnText: {
        fontFamily: Inter.semibold,
        fontSize: 14,
    },

    /* Skeleton Styles */
    skeletonItem: {
        backgroundColor: COLORS.skeletonBg,
        borderRadius: 6,
    },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 320,
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: Inter.semibold,
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
        textAlign: 'center',
    },
    selectedOptionText: {
        color: theme.primary,
        fontWeight: '700',
    },
});