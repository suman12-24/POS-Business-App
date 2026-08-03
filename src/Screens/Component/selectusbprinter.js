import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    TextInput,
    ScrollView,
    useColorScheme,
    Image,
    Pressable,
    TouchableOpacity,
    FlatList,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Container, Icon } from 'react-native-basic-elements';
import { Colors } from '../../Constants/Colors';
import { Inter } from '../Constants/Fonts';
import {
    responsiveHeight,
    responsiveWidth,
    responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import { showToastMsg, getData, setData } from '../../Service/localStorage';
import {
    setUsbPrinterValue,
    unsetUsbPrinterValue,
} from '../../Store/Reducers/CommonReducer';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import EbPrinter from 'react-native-ebprinter';

// create a component
const SelectUsbPrinter = props => {
    const dispatch = useDispatch();
    const { baseUrl, siteUrl, userToken, userData, post_data, langId } =
        useSelector(state => state.common);
    const [printerlist, setPrinterList] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            GetUsbDeviceList();
        }, []),
    );

    const GetUsbDeviceList = async () => {
        const usbdevicelist = await EbPrinter.getUsbDeviceList(0);

        if (usbdevicelist) {
            setPrinterList(usbdevicelist);
        }
    };

    const selectDevice = item => {
        EbPrinter.selectUsbPrinter(0, item.toString());
        dispatch(setUsbPrinterValue(item));
        setData('UsbPrinterValue', JSON.stringify(item));
        props.printer_model_close();
    };

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={true}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        position: 'relative',
                    }}>
                    <TouchableOpacity
                        onPress={() => {
                            props.printer_model_close();
                        }}
                        style={{
                            position: 'absolute',
                            right: responsiveWidth(1),
                            top: responsiveHeight(1.5),
                            zIndex: 1,
                        }}>
                        <Icon
                            name="closecircleo"
                            type="AntDesign"
                            size={30}
                            color={Colors.red}
                        />
                    </TouchableOpacity>
                    <View
                        style={{
                            height: responsiveHeight(35),
                            width: responsiveWidth(35),
                            backgroundColor: '#ffffff',
                            borderRadius: 5,
                        }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: Colors.backgroundColor,
                                    position: 'relative',
                                }}>
                                <View style={{}}>
                                    <FlatList
                                        data={printerlist}
                                        keyExtractor={(item, index) => item + index}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={{
                                                    paddingVertical: 10,
                                                    borderBottomWidth: 1,
                                                    borderColor: '#ddd',
                                                    paddingHorizontal: 10,
                                                }}
                                                onPress={() => selectDevice(item)}>
                                                <Text
                                                    style={{
                                                        fontSize: responsiveFontSize(1.8),
                                                        color: Colors.blue,
                                                    }}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default SelectUsbPrinter;
