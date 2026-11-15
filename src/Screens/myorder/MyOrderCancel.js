import React, { useState } from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Styles from './style';
import { Inter } from '../../Constants/Fonts';
import { responsiveHeight, responsiveFontSize, } from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';
import { postWithToken } from '../../Service/service';
import { useFocusEffect } from '@react-navigation/native';
import Moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import useTranslation from '../../Hooks/useTranslation';
import Loader from '../Component/loader';
import OrderCardSkeleton from '../Component/OrderCardSkeleton';
import OrderCard, { OrderTableHeader } from '../Component/OrderCard';
import { useAppTheme } from '../../Hooks/useAppTheme';
import SelectUsbPrinter from '../Component/selectusbprinter';
import { printOrderReceipt } from '../../utility/printReceipt';
// create a component
const MyOrderCancel = () => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  Moment.locale('en');
  const navigation = useNavigation();
  const { baseUrl, userToken, langId, UsbPrinter } = useSelector(state => state.common);
  const { t } = useTranslation();
  // ---- RESPONSIVE HELPERS -------------------------------------------------
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const isLandscape = winWidth > winHeight;
  const shortSide = Math.min(winWidth, winHeight);
  const isTablet = shortSide >= 600;
  const isCompact = !isTablet && !isLandscape;
  // --------------------------------------------------------------------------

  // Fixed at 1 for this screen, but kept as a named constant (rather than a
  // literal in JSX) so it can drive the FlatList `key` below. If this ever
  // becomes responsive (e.g. tied to isTablet/isLandscape), the key will
  // automatically force a clean remount instead of throwing
  // "Changing numColumns on the fly is not supported".
  const numColumns = 1;

  const [viewloader, setLoader] = useState(false);
  const [orderlist, setOrderList] = useState({
    isLoading: true,
    list: [],
  });
  const [viewmoreloader, setMoreLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [printer_model, setPrinterVisiblemodal] = useState(false);

  const printer_model_close = () => {
    setPrinterVisiblemodal(false);
  };
  useFocusEffect(
    React.useCallback(() => {
      getOrderList();
    }, []),
  );

  // Cancel tab -> statuses 6 (Cancelled by Restaurant) and 8 (Cancelled)
  const CANCEL_STATUSES = [6, 8];

  const getOrderList = () => {
    const firstPage = 1;
    let search_status = CANCEL_STATUSES;
    postWithToken(
      baseUrl,
      'orders/list',
      {
        lang_id: langId,
        pageNo: firstPage,
        status: search_status,
      },
      userToken,
    )
      .then(response => {
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(firstPage);
          setOrderList({ isLoading: false, list: response.data });
          setHasMore(true);
        } else {
          setOrderList({ isLoading: false, list: [] });
          setHasMore(false);
        }
      })
      .catch(error => {
        setOrderList({ isLoading: false, list: [] });
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    if (viewmoreloader || !hasMore) return;
    setMoreLoader(true);
    const nextPage = currentPage + 1;
    let search_status = CANCEL_STATUSES;
    postWithToken(
      baseUrl,
      'orders/list',
      {
        lang_id: langId,
        pageNo: nextPage,
        status: search_status,
      },
      userToken,
    )
      .then(response => {
        setMoreLoader(false);
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList(prev => ({
            isLoading: false,
            list: [...prev.list, ...response.data],
          }));
        } else {
          setHasMore(false);
        }
      })
      .catch(error => {
        setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  const renderLoader = () => {
    return viewmoreloader === true ? (
      <View>
        {Array.from({ length: 4 }).map((_, index) => (
          <OrderCardSkeleton key={'skeleton_lo' + index} />
        ))}
      </View>
    ) : null;
  };

  const handlePrint = item => {
    if (UsbPrinter === null) {
      setPrinterVisiblemodal(true);
      return;
    }
    const printed = printOrderReceipt({ response: item, usbPrinter: UsbPrinter });
    if (!printed) {
      Alert.alert(t('ERROR'), t('PRINT_FAILED'));
    }
  };
  const openOrderDetail = item => {
    navigation.navigate('OrderCancelDetails', { order: item });
  };
  return (
    <View style={styles.container}>
      {viewloader === true ? <Loader /> : null}
      {printer_model === true && (
        <SelectUsbPrinter printer_model_close={printer_model_close} />
      )}
      <View style={styles.main}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.primary,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrder')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.background,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.semibold,
              }}
            >
              {t('CURRENT')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderInprogress')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.background,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.semibold,
              }}
            >
              {t('INPROGRESS')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderComplete')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.background,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColorOnBackground,
                fontFamily: Inter.semibold,
              }}
            >
              {t('COMPLETE')}
            </Text>
          </TouchableOpacity>

          {/* Active tab -> Cancel */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderCancel')}
            style={[
              styles.tab_button,
              {
                borderColor: theme.primary,
                borderWidth: 1,
                backgroundColor: theme.primary,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingHorizontal: isCompact ? 10 : 14,
                paddingVertical: isCompact ? 8 : 6,
              },
            ]}
          >
            <Text
              style={{

                fontSize: isCompact ? responsiveFontSize(1.3) : responsiveFontSize(1.1),
                color: theme.fontColor,
                fontFamily: Inter.medium,
              }}
            >
              {t('CANCELLED')}
            </Text>
          </TouchableOpacity>
        </View>

        {orderlist.isLoading === false && orderlist.list.length > 0 ? (
          <FlatList
            // Forces a full remount if numColumns ever changes (e.g. becomes
            // responsive later) instead of mutating a live FlatList, which is
            // what throws "Changing numColumns on the fly is not supported".
            key={`cancel-list-cols-${numColumns}`}
            data={orderlist.list}
            numColumns={numColumns}
            contentContainerStyle={{
              paddingBottom: responsiveHeight(10),
            }}
            ListHeaderComponent={OrderTableHeader}
            stickyHeaderIndices={[0]}
            ListFooterComponent={
              viewmoreloader ? (
                <View>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <OrderCardSkeleton key={'skeleton_lo' + index} />
                  ))}
                </View>
              ) : null
            }
            onEndReached={getOrderListRefresh}
            onEndReachedThreshold={0.1}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              // Cancelled orders are read-only: no accept/reject/complete/print
              // actions, so we only pass onPress. (The previous version
              // referenced handleAccept/handleReject/handleComplete/handlePrint
              // here without defining them, which would throw at render time.)
              <OrderCard
                item={item}
                tabType={'cancel'}
                onPress={() => openOrderDetail(item)}
                onPrint={() => handlePrint(item)}
              />
            )}
          />
        ) : orderlist.isLoading === false && orderlist.list.length == 0 ? (
          <View>
            <Text
              style={{
                marginTop: responsiveHeight(30),
                alignSelf: 'center',
                fontFamily: Inter.bold,
                fontSize: 18,
                color: theme.cancelButton,
              }}
            >
              {t('NO_RECORD_FOUND')}
            </Text>
          </View>
        ) : (
          <View>
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderCardSkeleton key={'skeleton_lo_1' + index} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default MyOrderCancel;