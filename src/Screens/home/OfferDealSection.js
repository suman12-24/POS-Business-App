import React, {
    forwardRef, useEffect, useState, useRef, useCallback, useImperativeHandle,
} from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useSelector } from 'react-redux';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { postWithToken } from '../../Service/service';
import useTranslation from '../../Hooks/useTranslation';
import { useAppTheme } from '../../Hooks/useAppTheme';
import { Inter } from '../../Constants/Fonts';

// A companion dish "has real options" if it carries at least one option
// group with at least one selectable choice — same test used for menu
// dishes elsewhere in the app.
const hasRealOptions = dish =>
    Array.isArray(dish?.options) &&
    dish.options.some(o => o && Array.isArray(o.choices) && o.choices.length > 0);

const OfferDealSection = forwardRef(
    ({
        activeBusiness,
        orderType,
        onDealDishesLoaded,
        onRedeemedIdsChange,
        onFreeItemChosen,
        onConfigureFreeDish, // called for the selected companion dish that has
        // real options, once "Add to order" is pressed
    }, ref) => {
        const baseUrl = useSelector(s => s.common.baseUrl);
        const userToken = useSelector(s => s.common.userToken);
        const langId = useSelector(s => s.common.langId);
        const { t } = useTranslation();
        const theme = useAppTheme();
        const businessId = activeBusiness?.id;

        const [dealState, setDealState] = useState({ isLoading: true, offerMeta: null, dishes: [] });
        const [redeemedIds, setRedeemedIds] = useState([]);
        const [freeItemModal, setFreeItemModal] = useState({
            visible: false, isLoading: false, offerDish: null, freeDishes: [], offerMeta: null,
        });
        const [selectedFreeItems, setSelectedFreeItems] = useState({});
        const dealRequestIdRef = useRef(0);

        const fetchDealDishes = useCallback(() => {
            if (!businessId) return;
            const requestId = ++dealRequestIdRef.current;
            setDealState(prev => ({ ...prev, isLoading: true }));

            postWithToken(baseUrl, 'get-deal-dish-list', { lang_id: langId, business_id: businessId, type: orderType }, userToken)
                .then(response => {
                    if (requestId !== dealRequestIdRef.current) return; // stale request guard
                    const hasDeals = response?.status === true && Array.isArray(response.data) && response.data.length > 0;
                    const offerMeta = hasDeals ? (response.offer_data || response.offer || null) : null;
                    const dishes = hasDeals ? response.data : [];
                    setDealState({ isLoading: false, offerMeta, dishes });
                    onDealDishesLoaded?.(dishes, offerMeta);
                })
                .catch(error => {
                    if (requestId !== dealRequestIdRef.current) return;
                    console.log('Error fetching deal dishes: ', error);
                    setDealState({ isLoading: false, offerMeta: null, dishes: [] });
                    onDealDishesLoaded?.([], null);
                });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [baseUrl, userToken, langId, businessId, orderType]);

        useEffect(() => { fetchDealDishes(); setRedeemedIds([]); }, [fetchDealDishes]);
        useEffect(() => { onRedeemedIdsChange?.(redeemedIds); }, [redeemedIds]); // eslint-disable-line

        const fetchFreeDishes = offerDish => {
            setSelectedFreeItems({});
            setFreeItemModal({ visible: true, isLoading: true, offerDish, freeDishes: [], offerMeta: null });

            postWithToken(baseUrl, 'get-buy-one-get-one-dish-list', { lang_id: langId, type: orderType, dish_id: offerDish.id }, userToken)
                .then(response => {
                    const freeDishes = response?.status === true && Array.isArray(response.data) ? response.data : [];
                    const offerMeta = response?.status === true ? response.offer || null : null;
                    setFreeItemModal(prev => ({ ...prev, isLoading: false, freeDishes, offerMeta }));
                })
                .catch(error => {
                    console.log('Error fetching free dishes: ', error);
                    setFreeItemModal(prev => ({ ...prev, isLoading: false, freeDishes: [], offerMeta: null }));
                });
        };

        useImperativeHandle(ref, () => ({
            openFreeItemModal: offerDish => {
                if (!offerDish) return;
                setRedeemedIds(prev => (prev.includes(offerDish.id) ? prev : [...prev, offerDish.id]));
                fetchFreeDishes(offerDish);
            },
        }));

        const closeFreeItemModal = () => {
            setFreeItemModal({ visible: false, isLoading: false, offerDish: null, freeDishes: [], offerMeta: null });
            setSelectedFreeItems({});
        };

        const maxSelect = Math.max(1, Number(freeItemModal.offerMeta?.maximum_item_select) || 1);

        // Every dish (option-bearing or not) just toggles highlighted/selected
        // state on tap. The actual add/configure only happens when
        // "Add to order" is pressed — see handleConfirmFreeItems below.
        const toggleFreeDishSelection = dish => {
            setSelectedFreeItems(prev => {
                if (prev[dish.id] != null) { const next = { ...prev }; delete next[dish.id]; return next; }
                const selectedCount = Object.keys(prev).length;
                if (selectedCount >= maxSelect) {
                    return maxSelect === 1 ? { [dish.id]: 1 } : prev;
                }
                return { ...prev, [dish.id]: 1 };
            });
        };

        const selectedCount = Object.keys(selectedFreeItems).length;

        // Split the selected dishes: plain dishes go through the existing
        // onFreeItemChosen flow (added straight to cart, no options to fill
        // in); the first option-bearing dish selected (if any) goes through
        // onConfigureFreeDish, which opens its options modal. If more than
        // one option-bearing companion is selected in the same confirm, only
        // the first is configured here.
        const handleConfirmFreeItems = () => {
            const { offerDish, offerMeta } = freeItemModal;
            if (!offerDish || selectedCount === 0) { closeFreeItemModal(); return; }

            const selectedDishes = Object.entries(selectedFreeItems)
                .map(([dishId, qty]) => {
                    const freeDish = freeItemModal.freeDishes.find(d => String(d.id) === String(dishId));
                    return freeDish ? { dish: freeDish, quantity: qty } : null;
                })
                .filter(Boolean);

            const normalSelections = selectedDishes.filter(s => !hasRealOptions(s.dish));
            const optionSelection = selectedDishes.find(s => hasRealOptions(s.dish));

            closeFreeItemModal();

            if (normalSelections.length > 0) {
                onFreeItemChosen?.(offerDish, normalSelections, offerMeta);
            }

            if (optionSelection) {
                onConfigureFreeDish?.(offerDish, optionSelection.dish, offerMeta);
            }
        };

        if (dealState.isLoading && dealState.dishes.length === 0 && !freeItemModal.visible) return null;

        const headerTitle = freeItemModal.offerMeta
            ? (freeItemModal.offerMeta.offer_name || t('SPECIAL_OFFER'))
            : t('CHOOSE_YOUR_ITEM');

        // ---- Layout: 4 cards per row; modal width shrinks when fewer dishes.
        const DISHES_PER_ROW = 4;
        const freeDishRows = Array.from(
            { length: Math.ceil(freeItemModal.freeDishes.length / DISHES_PER_ROW) },
            (_, i) => freeItemModal.freeDishes.slice(i * DISHES_PER_ROW, (i + 1) * DISHES_PER_ROW),
        );

        const dishCount = freeItemModal.freeDishes.length;
        const isFullWidth = freeItemModal.isLoading || dishCount >= DISHES_PER_ROW;
        const CARD_WIDTH = responsiveWidth(18.2);
        const CARD_GAP = responsiveWidth(2.5);
        const cardsInRow = Math.min(dishCount, DISHES_PER_ROW);
        const modalWidth = isFullWidth
            ? responsiveWidth(85)
            : Math.max(
                responsiveWidth(45), // keeps the header and footer buttons from being squeezed
                cardsInRow * CARD_WIDTH + (cardsInRow - 1) * CARD_GAP + 2 * responsiveWidth(5),
            );

        return (
            <View>
                <Modal
                    isVisible={freeItemModal.visible}
                    onBackdropPress={closeFreeItemModal}
                    onBackButtonPress={closeFreeItemModal}
                    style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
                >
                    <View style={{
                        width: modalWidth, maxHeight: responsiveHeight(85),
                        backgroundColor: theme.background, borderRadius: 6,
                        paddingBottom: responsiveHeight(2), overflow: 'hidden',
                    }}>
                        {/* Header */}
                        <View style={{
                            alignItems: 'center', justifyContent: 'center',
                            paddingHorizontal: responsiveWidth(8), paddingVertical: responsiveHeight(1.8),
                            borderBottomWidth: 1, borderColor: '#E8E8E8',
                        }}>
                            <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: theme.primary, textAlign: 'center' }} numberOfLines={2}>
                                {headerTitle}
                            </Text>
                            {maxSelect > 1 ? (
                                <Text style={{ fontSize: responsiveFontSize(1), color: theme.fontColorOnBackground, textAlign: 'center', marginTop: 2, opacity: 0.7 }}>
                                    {t('CHOOSE_UP_TO')} {maxSelect}
                                </Text>
                            ) : null}
                            <TouchableOpacity
                                onPress={closeFreeItemModal}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={{
                                    position: 'absolute', right: responsiveWidth(1.5), top: responsiveHeight(1.2),
                                    width: responsiveFontSize(3.2), height: responsiveFontSize(3.2), borderRadius: responsiveFontSize(1.6),
                                    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                                    elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
                                }}
                            >
                                <Ionicons name="close" size={responsiveFontSize(1.9)} color={theme.fontColorOnBackground} />
                            </TouchableOpacity>
                        </View>

                        {freeItemModal.isLoading ? (
                            <View style={{ paddingHorizontal: responsiveWidth(3.5), paddingTop: responsiveHeight(2) }}>
                                <SkeletonPlaceholder backgroundColor="#EDEBFB" highlightColor="#F9F8FF" speed={1200}>
                                    <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <SkeletonPlaceholder.Item key={'free_skeleton_' + index} width="23%">
                                                <SkeletonPlaceholder.Item width="100%" height={responsiveHeight(11)} borderRadius={8} />
                                                <SkeletonPlaceholder.Item width="75%" height={9} borderRadius={4} marginTop={responsiveHeight(1)} />
                                                <SkeletonPlaceholder.Item width="45%" height={9} borderRadius={4} marginTop={responsiveHeight(0.8)} />
                                                <SkeletonPlaceholder.Item width="100%" height={responsiveHeight(3.6)} borderRadius={6} marginTop={responsiveHeight(1)} />
                                            </SkeletonPlaceholder.Item>
                                        ))}
                                    </SkeletonPlaceholder.Item>
                                </SkeletonPlaceholder>
                            </View>
                        ) : freeItemModal.freeDishes.length === 0 ? (
                            <View style={{ paddingVertical: responsiveHeight(4), alignItems: 'center' }}>
                                <Text style={{ color: theme.fontColorOnBackground }}>{t('NO_FREE_ITEMS_AVAILABLE')}</Text>
                            </View>
                        ) : (
                            <ScrollView contentContainerStyle={{ paddingHorizontal: responsiveWidth(2), paddingTop: responsiveHeight(2) }}>
                                {freeDishRows.map((row, rowIndex) => (
                                    <View
                                        key={'free_row_' + rowIndex}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'stretch', // cards in a row share the same height
                                            // Full-width modal with 3–4 items: equal gaps.
                                            // Otherwise (1–2 items, or shrunk modal): centered.
                                            justifyContent: isFullWidth && row.length >= 3 ? 'space-evenly' : 'center',
                                            marginBottom: responsiveHeight(1.5),
                                        }}
                                    >
                                        {row.map((freeDish, indexInRow) => {
                                            const isChecked = selectedFreeItems[freeDish.id] != null;
                                            const originalPrice = Number(freeDish.delprice ?? 0);
                                            const dishHasOptions = hasRealOptions(freeDish);
                                            return (
                                                <TouchableOpacity
                                                    key={'free_' + freeDish.id}
                                                    onPress={() => toggleFreeDishSelection(freeDish)}
                                                    activeOpacity={0.85}
                                                    style={{
                                                        width: CARD_WIDTH,
                                                        // fixed gap between cards when the row is centered
                                                        marginLeft: !(isFullWidth && row.length >= 3) && indexInRow > 0 ? CARD_GAP : 0,
                                                        padding: responsiveWidth(0.6),
                                                        borderRadius: 10,
                                                        backgroundColor: theme.background,
                                                        borderWidth: isChecked ? 1.5 : 1,
                                                        borderColor: isChecked ? theme.primary : '#E3E3E3',
                                                    }}
                                                >
                                                    {/* Image */}
                                                    {freeDish.url ? (
                                                        <Image
                                                            source={{ uri: freeDish.url }}
                                                            style={{ width: '100%', aspectRatio: 1.2, borderRadius: 8, backgroundColor: '#F3F4F6' }}
                                                            resizeMode="cover"
                                                        />
                                                    ) : (
                                                        <View style={{ width: '100%', aspectRatio: 1.2, borderRadius: 8, backgroundColor: '#F3F4F6' }} />
                                                    )}

                                                    {/* Name + price — flex:1 pushes the button to the bottom */}
                                                    <View style={{ flex: 1, paddingHorizontal: responsiveWidth(0.4), paddingTop: responsiveHeight(1) }}>
                                                        <Text numberOfLines={2} style={{ fontSize: responsiveFontSize(1.1), fontFamily: Inter.semibold, color: theme.fontColorOnBackground }}>
                                                            {freeDish.name}
                                                        </Text>
                                                        {dishHasOptions ? (
                                                            <Text style={{ fontSize: responsiveFontSize(0.85), color: '#999', marginTop: 1 }}>
                                                                {t('CUSTO_MIZABLE')}
                                                            </Text>
                                                        ) : null}
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: responsiveHeight(0.6), marginBottom: responsiveHeight(0.9) }}>
                                                            <Text style={{ fontSize: responsiveFontSize(1.2), color: theme.primary, fontWeight: '700' }}>
                                                                {activeBusiness?.currency_symbol}{originalPrice.toFixed(2)}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Per-card select button */}
                                                    <TouchableOpacity
                                                        onPress={() => toggleFreeDishSelection(freeDish)}
                                                        activeOpacity={0.85}
                                                        style={{
                                                            backgroundColor: isChecked ? theme.background : theme.primary,
                                                            borderWidth: 1.5, borderColor: theme.primary,
                                                            borderRadius: 7, paddingVertical: responsiveHeight(0.8),
                                                            alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Text style={{ color: isChecked ? theme.primary : theme.fontColor, fontSize: responsiveFontSize(1), fontWeight: '700' }}>
                                                            {isChecked ? 'Selected' : 'Select'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {/* Footer buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: responsiveWidth(3), marginTop: responsiveHeight(1) }}>
                            <TouchableOpacity onPress={closeFreeItemModal} style={{
                                borderWidth: 1.5, borderColor: theme.primary, borderRadius: 10,
                                paddingHorizontal: responsiveWidth(4.5), paddingVertical: responsiveHeight(1),
                            }}>
                                <Text style={{ color: theme.primary, fontSize: responsiveFontSize(1.2), fontWeight: '700' }}>
                                    {t('NO_PROCEED_TO_ORDER')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirmFreeItems} disabled={selectedCount === 0} style={{
                                backgroundColor: theme.primary, opacity: selectedCount === 0 ? 0.5 : 1, borderRadius: 10,
                                paddingHorizontal: responsiveWidth(4.5), paddingVertical: responsiveHeight(1),
                            }}>
                                <Text style={{ color: theme.fontColor, fontSize: responsiveFontSize(1.2), fontWeight: '700' }}>
                                    {selectedCount === 0 ? t('ADD_TO_ORDER') : `${t('ADD_TO_ORDER')} (${selectedCount})`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    },
);

export default OfferDealSection;