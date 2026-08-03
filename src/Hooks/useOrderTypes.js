import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { postWithOutToken } from '../Service/service';

const useOrderTypes = () => {
    const { siteSetting, langId, user_slug } = useSelector(state => state.common);
    const [orderTypes, setOrderTypes] = useState({ isLoading: true, list: [] });

    const fetchOrderTypes = useCallback(() => {
        setOrderTypes(prev => ({ ...prev, isLoading: true }));
        postWithOutToken(siteSetting, 'get-order-types', {
            user_slug,
            lang_id: langId,
        })
            .then(response => {
                if (response?.status === true && Array.isArray(response.data)) {
                    const activeTypes = response.data
                        .filter(type => Number(type.status) === 1)
                        .sort((a, b) => Number(b.is_default) - Number(a.is_default));
                    setOrderTypes({ isLoading: false, list: activeTypes });
                } else {
                    setOrderTypes({ isLoading: false, list: [] });
                }
            })
            .catch(error => {
                console.log('Error fetching order types: ', error);
                setOrderTypes({ isLoading: false, list: [] });
            });
    }, [siteSetting, user_slug, langId]);

    useEffect(() => {
        fetchOrderTypes();
    }, [fetchOrderTypes]);

    // Cross-references against a business's is_* flags. Works whether the
    // flags sit on `business` directly or nested under `business.business`
    // (get-business-info returns the latter shape in a couple of places).
    const getAvailableOrderTypes = useCallback(
        business => {
            if (!business || orderTypes.list.length === 0) return [];
            const flags = business.business || business;
            return orderTypes.list.filter(
                type => Number(flags[type.business_order_type]) === 1,
            );
        },
        [orderTypes.list],
    );

    // Prefers Pickup when the business offers it, else whatever the API
    // flags is_default, else the first available type.
    const getDefaultOrderTypeId = useCallback(
        business => {
            const available = getAvailableOrderTypes(business);
            if (available.length === 0) return null;
            const pickup = available.find(t => t.slug === 'pickup');
            if (pickup) return pickup.id;
            const flaggedDefault = available.find(t => Number(t.is_default) === 1);
            return (flaggedDefault || available[0]).id;
        },
        [getAvailableOrderTypes],
    );

    return { orderTypes, fetchOrderTypes, getAvailableOrderTypes, getDefaultOrderTypeId };
};

export default useOrderTypes;