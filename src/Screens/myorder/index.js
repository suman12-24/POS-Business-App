import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Styles from './style';
import { Inter } from '../../Constants/Fonts';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { printOrderReceipt } from '../../utility/printReceipt';

const MyOrder = () => {
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

  // Printer Configuration & Selection Modal
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [targetOrder, setTargetOrder] = useState(null);
  const [selectedPrinters, setSelectedPrinters] = useState({});
  const [printingStatus, setPrintingStatus] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      getOrderList();
      fetchConfiguredPrinters();
    }, []),
  );

  const fetchConfiguredPrinters = () => {
    postWithToken(baseUrl, 'get-printer-details', { lang_id: langId }, userToken)
      .then(response => {
        if (response.status === true && response.data) {
          const d = response.data;
          const printers = [];

          if (UsbPrinter) {
            printers.push({
              id: 'usb',
              name: `USB Printer (${UsbPrinter})`,
              type: 'usb',
              device: UsbPrinter,
            });
          }

          if (d.printer_kitchen_ip_address) {
            printers.push({
              id: 'wifi_1',
              name: `Kitchen Printer 1 (${d.printer_kitchen_ip_address})`,
              type: 'wifi',
              ip: String(d.printer_kitchen_ip_address),
            });
          }

          if (d.printer_kitchen_ip_address_2) {
            printers.push({
              id: 'wifi_2',
              name: `Kitchen Printer 2 (${d.printer_kitchen_ip_address_2})`,
              type: 'wifi2',
              ip: String(d.printer_kitchen_ip_address_2),
            });
          }

          setAvailablePrinters(printers);
        }
      })
      .catch(error => {
        console.log('Error fetching printers for modal:', error);
      });
  };

  const handleOpenPrintModal = item => {
    setTargetOrder(item);
    setSelectedPrinters({});
    setPrinterModalVisible(true);
  };

  const togglePrinterSelection = id => {
    setSelectedPrinters(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const executeSelectedPrints = async () => {
    if (!targetOrder) return;
    const selectedIds = Object.keys(selectedPrinters).filter(k => selectedPrinters[k]);

    if (selectedIds.length === 0) {
      Alert.alert('Notice', 'Please select at least one printer.');
      return;
    }

    const chosenUsb = selectedIds.includes('usb')
      ? availablePrinters.find(p => p.id === 'usb')?.device
      : null;
    const chosenWifi1 = selectedIds.includes('wifi_1')
      ? { ip: availablePrinters.find(p => p.id === 'wifi_1')?.ip }
      : null;
    const chosenWifi2 = selectedIds.includes('wifi_2')
      ? { ip: availablePrinters.find(p => p.id === 'wifi_2')?.ip }
      : null;

    setPrinterModalVisible(false);
    setPrintingStatus(true);
    await new Promise(r => setTimeout(r, 300));

    try {
      const res = await printOrderReceipt({
        response: targetOrder,
        usbPrinter: chosenUsb,
        wifiPrinter: chosenWifi1,
        wifiPrinter2: chosenWifi2,
      });

      if (res?.errors?.length) {
        Alert.alert('Print problem', res.errors.join('\n\n'));
      }
    } catch (e) {
      console.log('Error generating print output:', e);
      Alert.alert('Print error', String(e?.message || e));
    } finally {
      setPrintingStatus(false);
    }
  };

  const getOrderList = () => {
    const nextPage = 1;
    postWithToken(
      baseUrl,
      'orders/list',
      { lang_id: langId, pageNo: nextPage, status: [0] },
      userToken,
    )
      .then(response => {
        if (response.status == true) {
          if (response.data.length > 0) {
            setCurrentPage(nextPage);
            setOrderList({ isLoading: false, list: response.data });
          } else {
            setOrderList({ isLoading: false, list: [] });
          }
        } else {
          setOrderList({ isLoading: false, list: [] });
        }
      })
      .catch(error => {
        setLoader(false);
        console.log('Error : ', error);
      });
  };

  const getOrderListRefresh = () => {
    if (viewmoreloader) return;
    setMoreLoader(true);
    const nextPage = currentPage + 1;
    postWithToken(
      baseUrl,
      'orders/list',
      { lang_id: langId, pageNo: nextPage, status: [0] },
      userToken,
    )
      .then(response => {
        setMoreLoader(false);
        if (response.status == true && response.data.length > 0) {
          setCurrentPage(nextPage);
          setOrderList({
            isLoading: false,
            list: [...orderlist.list, ...response.data],
          });
        } else {
          setOrderList({ isLoading: false, list: orderlist.list });
        }
      })
      .catch(error => {
        setMoreLoader(false);
        console.log('Error : ', error);
      });
  };

  const openOrderDetail = item => {
    navigation.navigate('OrderDetail', { order: item });
  };

  const handleAccept = item => {
    navigation.navigate('OrderDetail', { order: item });
  };

  const handleReject = item => {
    navigation.navigate('OrderDetail', { order: item });
  };

  return (
    <View style={styles.container}>
      {viewloader === true ? <Loader /> : null}

      {/* Printer Selection Modal */}
      <Modal
        visible={printerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPrinterModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: responsiveWidth(45),
              backgroundColor: theme.background,
              borderRadius: 12,
              padding: 20,
              elevation: 5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(1.4),
                  fontFamily: Inter.bold,
                  color: theme.fontColorOnBackground,
                }}
              >
                Select Printers (Order #{targetOrder?.id})
              </Text>
              <TouchableOpacity onPress={() => setPrinterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.fontColorOnBackground} />
              </TouchableOpacity>
            </View>

            {availablePrinters.length === 0 ? (
              <Text
                style={{
                  fontSize: responsiveFontSize(1.1),
                  color: theme.fontColorOnBackground,
                  marginVertical: 20,
                  textAlign: 'center',
                }}
              >
                No printers configured in Settings.
              </Text>
            ) : (
              availablePrinters.map(printer => {
                const isSelected = !!selectedPrinters[printer.id];
                return (
                  <TouchableOpacity
                    key={printer.id}
                    onPress={() => togglePrinterSelection(printer.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EDEBFB',
                    }}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={isSelected ? theme.primary : '#9CA3AF'}
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      style={{
                        fontSize: responsiveFontSize(1.2),
                        fontFamily: Inter.medium,
                        color: theme.fontColorOnBackground,
                      }}
                    >
                      {printer.name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 20,
                gap: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => setPrinterModalVisible(false)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                }}
              >
                <Text style={{ color: theme.fontColorOnBackground }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={printingStatus || availablePrinters.length === 0}
                onPress={executeSelectedPrints}
                style={{
                  backgroundColor: theme.primary,
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 6,
                  opacity: printingStatus ? 0.6 : 1,
                }}
              >
                {printingStatus ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: theme.fontColor, fontFamily: Inter.semibold }}>
                    Print
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            showsVerticalScrollIndicator={false}
            data={orderlist.list}
            numColumns={1}
            contentContainerStyle={{
              paddingBottom: responsiveHeight(10),
            }}
            ListHeaderComponent={OrderTableHeader}
            stickyHeaderIndices={[0]}
            onMomentumScrollEnd={getOrderListRefresh}
            onEndReachedThreshold={0.5}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <OrderCard
                item={item}
                tabType="current"
                onPress={() => openOrderDetail(item)}
                onAccept={() => handleAccept(item)}
                onReject={() => handleReject(item)}
                onPrint={() => handleOpenPrintModal(item)}
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

export default MyOrder;