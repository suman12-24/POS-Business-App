import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    useWindowDimensions,
} from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { postWithToken } from '../../Service/service';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../../Constants/Fonts';
import {
    responsiveFontSize,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import OrderDetailSkeleton from './OrderDetailSkeleton';
import useTranslation from '../../Hooks/useTranslation';
import { useAppTheme } from '../../Hooks/useAppTheme';
import { getStatusLabelKey, isCancelledByRestaurant } from '../../utility/orderStatus';
const DEFAULT_MINUTES = 10;

const GREY_BORDER = '#E5E7EB';

const formatMinutesForApi = mins => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const displayVal = val => {
    if (val == 0) return 'Pending';
    if (val == 1) return 'Accepted By Restaurant';
    if (val == 2) return 'Accepted by Driver';
    if (val == 3) return 'Delivery Complete by Driver';
    if (val == 4) return 'Completed by Resturant';
    if (val == 5) return 'Complete';
    if (val == 6) return 'Cancelled by Resturant';
    if (val == 7) return 'Rejected by Driver';
    if (val == 8) return 'Cancelled';
    if (val == 9) return 'Pickup Complete by Driver';
    if (val == 10) return 'Pickup Complete from user by Driver';
    if (val == 11) return 'Delivery Complete to Business by Driver';
    if (val == 12) return 'Verified by Resturant';
};

const OrderCancelDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const theme = useAppTheme();
    const { baseUrl, userToken, langId } = useSelector(state => state.common);
    const { t } = useTranslation();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const shortSide = Math.min(width, height);
    const isTablet = shortSide >= 600;
    const isCompact = !isTablet && !isLandscape;
    const orderDetails = route.params?.order ?? null;
    const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
    const [loading, setLoading] = useState(false);

    // Accept immediately with the default estimate time — no popup.
    const handleAccept = () => {
        if (!orderDetails) return;

        setLoading(true);

        postWithToken(
            baseUrl,
            'orders/status-change',
            {
                id: orderDetails.id,
                estimate_time: formatMinutesForApi(DEFAULT_MINUTES),
                notes: '',
                status: 1,
                lang_id: langId,
            },
            userToken,
        )
            .then(() => {
                setLoading(false);
                setMinutes(DEFAULT_MINUTES);
                navigation.goBack();
            })
            .catch(error => {
                setLoading(false);
                console.log('Error : ', error);
            });
    };

    // Reject immediately — no popup, no reason collected.
    const handleReject = () => {
        if (!orderDetails) return;

        setLoading(true);

        postWithToken(
            baseUrl,
            'orders/status-change',
            {
                id: orderDetails.id,
                notes: '',
                status: 6,
                lang_id: langId,
            },
            userToken,
        )
            .then(() => {
                setLoading(false);
                navigation.navigate('OrderDetail', {
                    order: {
                        ...orderDetails,
                        status: 1,
                        estimate_time: formatMinutesForApi(minutes),
                    },
                });
            })
            .catch(error => {
                setLoading(false);
                console.log('Error : ', error);
            });
    };

    if (!orderDetails) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: Inter.medium, color: theme.fontColorOnBackground }}>
                    {t('NO_ORDER_SELECTED')}
                </Text>
            </View>
        );
    }

    // Full-screen skeleton REPLACES content while loading, instead of
    // stacking above it.
    if (loading) {
        return <OrderDetailSkeleton variant="accept-reject" />;
    }
    const infoLineStyle = {
        fontFamily: Inter.regular,
        fontSize: responsiveFontSize(0.95),
        color: theme.fontColorOnBackground,
        marginBottom: 4,
    };
    const showActionsPanel = !isCancelledByRestaurant(orderDetails.status);
    const orderTypeLabel =
        orderDetails.order_type == 1
            ? 'Delivery'
            : orderDetails.order_type == 2
                ? 'Pickup'
                : orderDetails.order_type == 3
                    ? 'Dinein'
                    : orderDetails.order_type == 4
                        ? 'POS'
                        : '';

    const paymentMethod =
        orderDetails.paymentmethod?.length > 0
            ? orderDetails.paymentmethod[0].payment_method
            : '-';

    const subtotal = orderDetails.subtotal ?? orderDetails.sub_total ?? orderDetails.total;
    const cartfeeObj = JSON.parse(orderDetails?.cartfee);

    const taxAmount = cartfeeObj?.taxprice ?? null;
    const taxPercent = cartfeeObj?.tax ?? null;
    const serviceFee = cartfeeObj?.servicefeeprice ?? null;
    const servicePercent = cartfeeObj?.servicefee ?? null;
    const discountFee = cartfeeObj?.discount ?? null;
    const deliveryFee = cartfeeObj?.deliverycost ?? null;

    const buyerDetails = JSON.parse(orderDetails?.buyerdata)
    const money = value =>
        value === null || value === undefined
            ? '-'
            : `${orderDetails.currency_symbol}${value}`;
    const formatTwoDecimals = val => {
        const num = Number(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 14,
                    paddingVertical: 8,
                }}
            >
                <TouchableOpacity onPress={() => navigation.navigate('MyOrderCancel')}
                    style={{
                        backgroundColor: "#EBE9FB", width: 38, height: 36, borderRadius: 10,
                        justifyContent: "center", alignItems: "center"
                    }}
                >
                    <AntDesignIcon name="arrowleft" size={22} color={theme.primary} />
                </TouchableOpacity>
                <Text
                    style={{
                        marginLeft: 12,
                        fontFamily: Inter.semibold,
                        fontSize: responsiveFontSize(1.3),
                        color: theme.fontColorOnBackground,
                    }}
                >
                    {t('ORDER')} #{orderDetails.id}
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View
                    style={{
                        flexDirection: isCompact ? 'column' : 'row',
                        padding: isCompact ? 10 : 14,
                        gap: 14,
                    }}
                >
                    {/* -------- LEFT: all order details -------- */}
                    <View style={{ flex: isCompact ? undefined : showActionsPanel ? 2 : 1 }}>
                        {/* ---- Two side-by-side info cards ---- */}
                        <View
                            style={{
                                flexDirection: isCompact ? 'column' : 'row',
                                gap: 10,
                                marginBottom: 12,
                            }}
                        >
                            <View style={{ flex: 1, borderWidth: 1, borderColor: GREY_BORDER, borderRadius: 8, padding: 10 }}>
                                <Text style={infoLineStyle}>{t('ORDER_DATE_AND_TIME')}: {orderDetails.date}</Text>
                                <Text style={infoLineStyle}>{t('UPDATE_ORDER_STATUS')}: {t(getStatusLabelKey(orderDetails.status))}</Text>
                                <Text style={infoLineStyle}>{t('ORDER_TYPE')}: {orderTypeLabel}</Text>
                                <Text style={infoLineStyle}>
                                    {t('GRAND_TOTAL')}: {orderDetails.currency_symbol}{orderDetails.total}
                                </Text>
                                <Text style={[infoLineStyle, { marginBottom: 0 }]}>
                                    {t('PAYMENT_INFORMATION')}: {paymentMethod}
                                </Text>

                                {isCancelledByRestaurant(orderDetails.status) ? (
                                    <Text style={[infoLineStyle, {
                                        color: Colors.red,
                                    }]}>
                                        {t('CANCELLED REASON')}:{orderDetails.comments || '-'}
                                    </Text>
                                ) : null}
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: GREY_BORDER,
                                    borderRadius: 8,
                                    padding: 10,
                                }}
                            >
                                {(buyerDetails?.name || buyerDetails?.last_name) && (
                                    <Text style={[infoLineStyle, { fontFamily: Inter.semibold }]}>
                                        {buyerDetails?.name} {buyerDetails?.last_name}
                                    </Text>
                                )}

                                {buyerDetails?.delievryaddress && (
                                    <Text style={infoLineStyle}>
                                        {t('address')}: {buyerDetails.delievryaddress}
                                    </Text>
                                )}

                                {buyerDetails?.cel && (
                                    <Text style={infoLineStyle}>
                                        {t('PHONE_NUMBER')}: {buyerDetails.cel}
                                    </Text>
                                )}

                                {buyerDetails?.email && (
                                    <Text style={infoLineStyle}>
                                        {t('EMAIL')}: {buyerDetails.email}
                                    </Text>
                                )}

                                {buyerDetails?.notes && (
                                    <Text style={[infoLineStyle, { marginBottom: 0 }]}>
                                        {t('DELIVERY_NOTE')}: {buyerDetails.notes}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* ---- Item list ---- */}
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: GREY_BORDER,
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: Inter.semibold,
                                    fontSize: responsiveFontSize(1.1),
                                    color: theme.fontColorOnBackground,
                                    marginBottom: 10,
                                }}
                            >
                                {t('ORDER_SUMMARY')}
                            </Text>
                            <View>
                                {orderDetails.dishdata?.map((item, groupIndex) =>
                                    item.data.map((dish, dishIndex, arr) => {
                                        const isLastDish =
                                            groupIndex === orderDetails.dishdata.length - 1 &&
                                            dishIndex === arr.length - 1;

                                        return (
                                            <View key={`${groupIndex}_${dishIndex}`} style={{
                                                marginBottom: 6,
                                                paddingBottom: 6,
                                                borderBottomWidth: isLastDish ? 0 : 1,
                                                borderBottomColor: GREY_BORDER,
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                    {dish.is_img ? (
                                                        <View
                                                            style={{
                                                                width: responsiveWidth(3),
                                                                height: responsiveWidth(3),
                                                                marginRight: 8,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                overflow: 'hidden',
                                                                backgroundColor: '#F3F2FE',
                                                                borderRadius: responsiveWidth(0.5),
                                                            }}
                                                        >
                                                            <Image
                                                                source={{ uri: dish.is_img }}
                                                                style={{ width: '100%', height: '100%' }}
                                                            />
                                                        </View>
                                                    ) : null}

                                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                        {/* Quantity badge — sized to actually fit the number */}
                                                        <View
                                                            style={{
                                                                minWidth: responsiveWidth(1.8),
                                                                height: responsiveWidth(1.8),
                                                                paddingHorizontal: 4,
                                                                backgroundColor: theme.primary,
                                                                borderRadius: responsiveWidth(0.5),
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontFamily: Inter.medium,
                                                                    fontSize: responsiveFontSize(0.8),
                                                                    textAlign: 'center',
                                                                    color: theme.fontColor,
                                                                }}
                                                            >
                                                                {dish.quantity}
                                                            </Text>
                                                        </View>
                                                        <Text
                                                            style={{
                                                                marginLeft: responsiveWidth(1),
                                                                flex: 1,
                                                                fontFamily: Inter.medium,
                                                                fontSize: responsiveFontSize(1.1),
                                                                color: theme.fontColorOnBackground,
                                                            }}
                                                        >
                                                            {dish.name}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={{
                                                            fontFamily: Inter.medium,
                                                            fontSize: responsiveFontSize(1),
                                                            color: theme.fontColorOnBackground,
                                                        }}
                                                    >
                                                        {orderDetails.currency_symbol}
                                                        {Number(dish.total).toFixed(2)}
                                                    </Text>
                                                </View>

                                                {/* ---- Choice / Sets ---- */}
                                                {dish.sets?.length > 0
                                                    ? dish.sets.map((set, setIndex) => {
                                                        return set.choice.length > 0
                                                            ? set.choice.map((choice, choice_index) => (
                                                                <View
                                                                    key={'choice_' + setIndex + '_' + choice_index}
                                                                    style={{
                                                                        flexDirection: 'row',
                                                                        flex: 1,
                                                                        marginTop: 1,
                                                                        marginLeft: responsiveWidth(7.5),
                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={{
                                                                            fontFamily: Inter.regular,
                                                                            fontSize: responsiveFontSize(0.9),
                                                                            lineHeight: responsiveFontSize(1.1),
                                                                            color: theme.fontColorOnBackground,
                                                                        }}
                                                                    >
                                                                        {choice.qty} X {choice.name} -{' '}
                                                                    </Text>
                                                                    {choice.price != null ? (
                                                                        <Text
                                                                            style={{
                                                                                fontFamily: Inter.regular,
                                                                                fontSize: responsiveFontSize(0.9),
                                                                                lineHeight: responsiveFontSize(1.1),
                                                                                color: theme.fontColorOnBackground,
                                                                            }}
                                                                        >
                                                                            {orderDetails.currency_symbol}{choice.price}
                                                                        </Text>
                                                                    ) : null}
                                                                </View>
                                                            ))
                                                            : null;
                                                    })
                                                    : null}

                                                {/* ---- Ingredients ---- */}
                                                {dish.ingredientsarray?.length > 0 ? (
                                                    <Text
                                                        style={{
                                                            width: '70%',
                                                            fontFamily: Inter.regular,
                                                            fontSize: responsiveFontSize(0.9),
                                                            lineHeight: responsiveFontSize(1.1),
                                                            color: theme.fontColorOnBackground,
                                                            marginLeft: responsiveWidth(7.5),
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        {dish.ingredientsarray.join(', ')}
                                                    </Text>
                                                ) : null}

                                                {/* ---- Product Note with Pencil Icon ---- */}
                                                {dish.notes ? (
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            marginLeft: responsiveWidth(7.5),
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        <AntDesignIcon
                                                            name="edit"
                                                            size={responsiveFontSize(0.95)}
                                                            color={theme.primary}
                                                            style={{ marginRight: 4 }}
                                                        />
                                                        <Text
                                                            style={{
                                                                flex: 1,
                                                                fontFamily: Inter.regular,
                                                                fontSize: responsiveFontSize(0.9),
                                                                lineHeight: responsiveFontSize(1.1),
                                                                color: theme.fontColorOnBackground,
                                                            }}
                                                        >
                                                            {dish.notes}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>

                                        );
                                    }),
                                )}
                            </View>
                            {/* ---- Summary ---- */}
                            <View
                                style={{
                                    borderTopWidth: 1,
                                    borderTopColor: GREY_BORDER,
                                    borderStyle: 'solid',
                                    marginTop: 12,
                                    paddingTop: 10,
                                    gap: 4,
                                }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                        {t('SUBTOTAL')}
                                    </Text>
                                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                        {orderDetails.currency_symbol}{formatTwoDecimals(subtotal)}
                                    </Text>
                                </View>
                                {taxAmount > 0 && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View>
                                            <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                                {t('TAX')} {taxPercent ? `(${taxPercent}%)` : ''}
                                            </Text>
                                            <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.8), color: theme.fontColorOnBackground }}>
                                                {t('TAX_NOT_INCLUDED')}
                                            </Text>
                                        </View>
                                        <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                            {orderDetails.currency_symbol}{formatTwoDecimals(taxAmount)}
                                        </Text>

                                    </View>
                                )}

                                {serviceFee > 0 &&
                                    (<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                            {t('SERVICE_FEE')} {servicePercent ? `(${servicePercent}%)` : ''}
                                        </Text>
                                        <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                            {orderDetails.currency_symbol}{formatTwoDecimals(serviceFee)}
                                        </Text>
                                    </View>)
                                }

                                {
                                    discountFee > 0 && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                                {t('ORDER_TEMPLATE_DISCOUNT')}
                                            </Text>
                                            <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                                {orderDetails.currency_symbol}-{formatTwoDecimals(discountFee)}
                                            </Text>
                                        </View>
                                    )
                                }
                                {
                                    deliveryFee > 0 && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                                {t('DELIEVRY_FEE')}
                                            </Text>
                                            <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                                {orderDetails.currency_symbol}{formatTwoDecimals(deliveryFee)}
                                            </Text>
                                        </View>
                                    )
                                }
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text style={{ fontFamily: Inter.semibold, fontSize: responsiveFontSize(1.05), color: theme.fontColorOnBackground }}>
                                        {t('TOTAL_AMOUNT')}
                                    </Text>
                                    <Text style={{ fontFamily: Inter.semibold, fontSize: responsiveFontSize(1.05), color: theme.fontColorOnBackground }}>
                                        {orderDetails.currency_symbol} {formatTwoDecimals(orderDetails.total)}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                        {t('PAYMENT_METHOD')}
                                    </Text>
                                    <Text style={{ fontFamily: Inter.regular, fontSize: responsiveFontSize(0.95), color: theme.fontColorOnBackground }}>
                                        {paymentMethod}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default OrderCancelDetailsScreen;