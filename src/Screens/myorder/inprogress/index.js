import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, useWindowDimensions, Alert } from 'react-native';
import Styles from './style';
import { Inter } from '../../../Constants/Fonts';
import { responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';
import { postWithToken } from '../../../Service/service';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Moment from 'moment';
import useTranslation from '../../../Hooks/useTranslation';
import Loader from '../../Component/loader';
import OrderCardSkeleton from '../../Component/OrderCardSkeleton';
import OrderCard, { OrderTableHeader } from '../../Component/OrderCard';
import { useAppTheme } from '../../../Hooks/useAppTheme';
import SelectUsbPrinter from '../../Component/selectusbprinter';
import { printOrderReceipt } from '../../../utility/printReceipt';

const MyOrderInprogress = () => {
  const theme = useAppTheme();
  const styles = Styles(theme);
  Moment.locale('en');
  const navigation = useNavigation();
  const { baseUrl, userToken, langId, UsbPrinter } = useSelector(state => state.common);
  const { t } = useTranslation();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const isLandscape = winWidth > winHeight;
  const shortSide = Math.min(winWidth, winHeight);
  const isTablet = shortSide >= 600;
  const isCompact = !isTablet && !isLandscape;
  const [viewloader, setLoader] = useState(false);
  const [orderlist, setOrderList] = useState({ isLoading: true, list: [] });
  const [viewmoreloader, setMoreLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [printer_model, setPrinterVisiblemodal] = useState(false);
  const printer_model_close = () => {
    setPrinterVisiblemodal(false);
  };
  useFocusEffect(
    React.useCallback(() => {
      getOrderList();
    }, []),
  );
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
  const getOrderList = () => {
    const nextPage = 1;
    let search_status = [1, 2, 3, 9, 10, 11, 12];
    postWithToken(
      baseUrl,
      'orders/list',
      { lang_id: langId, pageNo: nextPage, status: search_status },
      userToken,
    )
      .then(response => {
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList({ isLoading: false, list: response.data });
        } else {
          setOrderList({ isLoading: false, list: [] });
        }
      })
      .catch(error => {
        setLoader(false);
        setOrderList({ isLoading: false, list: [] });
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    if (viewmoreloader) return;
    setMoreLoader(true);
    const nextPage = currentPage + 1;
    let search_status = [1, 2, 3, 9, 10, 11, 12];
    postWithToken(
      baseUrl,
      'orders/list',
      { lang_id: langId, pageNo: nextPage, status: search_status },
      userToken,
    )
      .then(response => {
        setMoreLoader(false);
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList({ isLoading: false, list: [...orderlist.list, ...response.data] });
        } else {
          setOrderList({ isLoading: false, list: orderlist.list });
        }
      })
      .catch(error => {
        setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  // Tapping a card now opens the detail screen. Complete Order lives there.
  const openOrderDetail = item => {
    navigation.navigate('OrderDetailInprogress', { order: item });
  };
  const handleComplete = (item) => {
    navigation.navigate('OrderDetailInprogress', { order: item });
  }
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
          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrderCancel')}
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
              {t('CANCELLED')}
            </Text>
          </TouchableOpacity>
        </View>

        {orderlist.isLoading === false && orderlist.list.length > 0 ? (
          <FlatList
            data={orderlist.list}
            numColumns={1}
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
            onMomentumScrollEnd={getOrderListRefresh}
            onEndReachedThreshold={0.1}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <OrderCard
                item={item}
                tabType="inprogress"
                onPress={() => openOrderDetail(item)}
                //onAccept={() => handleAccept(item)}
                // onReject={() => handleReject(item)}
                onComplete={() => handleComplete(item)}
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
              {t('NO_RECORD_FOUND')}{' '}
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

export default MyOrderInprogress;