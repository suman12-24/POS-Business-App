import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    Alert,
    Platform
} from "react-native";
import { Picker } from "react-native-basic-elements";
import { responsiveHeight } from "react-native-responsive-dimensions";
import ThermalPrinterModule from 'react-native-thermal-printer';
import {
    BLEPrinter,
    NetPrinter,
    USBPrinter,
    IBLEPrinter,
    INetPrinter,
} from "react-native-thermal-receipt-printer";

import WifiManager from "react-native-wifi-reborn";


const printerList: Record<string, any> = {
    //ble: BLEPrinter,
    net: NetPrinter,
    usb: USBPrinter,
    wifi: NetPrinter,
};

interface SelectedPrinter
    extends Partial<IUSBPrinter & IBLEPrinter & INetPrinter> {
    printerType?: keyof typeof printerList;
}

interface IUSBPrinter {
    device_name: string;
    vendor_id: number;
    product_id: number;
  }



export default function Thermalpriter({Tcp_string, Bill_string, close_model}:any) {
    const [selectedValue, setSelectedValue] = React.useState<
        keyof typeof printerList
    >("usb");
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
        {}
    );
    const [netprinteripaddres, setnetprinteripaddres] = React.useState<string>('')
    const [dropdownValue, setDropdownValue] = React.useState('');
    const [connetd, setconnted] = React.useState(false)

    const [wifi_IP, setWifiIP] = React.useState<string>('');

    const [selected_usb_printer_name, setSelectedUsbPrinterName] = React.useState<string>('');

    /*React.useEffect(() => {
       
        USBPrinter.init()
        .then(() => {
            // Get the list of connected printers
            return USBPrinter.getDeviceList();
        })
        .then(devices => {
            // Update the state with the list of printers

            // Check if there are any printers available
            if (devices.length > 0) {
                setSelectedUsbPrinterName(devices[0].device_name);
                USBPrinter.connectPrinter(
                    devices[0].vendor_id,
                    devices[0].product_id,
                  )
            }
        })

      }, []);*/

    React.useEffect(() => {
        const getListDevices = async () => {

            console.log("first call")

            setnetprinteripaddres('');
         
            if (selectedValue === "usb"){
                try {

                /* await Printer.init();
                    const results = await Printer.getDeviceList();
                    setDevices(
                        results.map((item: any) => ({ ...item, printerType: selectedValue }))
                    );*/

                    USBPrinter.init()
                        .then(() => {
                            // Get the list of connected printers
                            return USBPrinter.getDeviceList();
                        })
                        .then(devices => {
                            // Update the state with the list of printers

                            // Check if there are any printers available
                            if (devices.length > 0) {
                                setSelectedUsbPrinterName(devices[0].device_name);
                                USBPrinter.connectPrinter(
                                    devices[0].vendor_id,
                                    devices[0].product_id,
                                )
                            }
                        })

                } catch (err) {
                    console.warn(err);
                } 
            }
        };
        getListDevices();
       
    }, [selectedValue]);

    React.useEffect(() => {
        console.log(netprinteripaddres, 'printe addres..')
        ThermalPrinterModule.defaultConfig.ip = netprinteripaddres;
        ThermalPrinterModule.defaultConfig.port = 9100;
        ThermalPrinterModule.defaultConfig.autoCut = false;
        ThermalPrinterModule.defaultConfig.timeout = 30000;
    }, [netprinteripaddres])
    const handleConnectSelectedPrinter = () => {
       
        if (!selectedPrinter) return;
        const connect = async () => {
            console.log("thermal ip : " + ThermalPrinterModule.defaultConfig.ip);
            try {
                setLoading(true);
                switch (selectedPrinter.printerType) {
                    /*case "ble":
                        await BLEPrinter.connectPrinter(
                            selectedPrinter?.inner_mac_address || ""
                        ).then(() => {
                            setconnted(true)

                            Alert.alert('Device Connected', 'Connected Sucessfully', [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        });
                        break;*/
                    case "net":
                        try {
                            await ThermalPrinterModule.printTcp({ payload: Tcp_string }).then(() => {

                                close_model();
                                
                                Alert.alert('', 'Net Print Succesfull.', [
                                  
                                    {
                                        text: 'Cancel',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                                ]);
                            }).catch(() => {
                                Alert.alert('', 'Enter Valid IP Address.', [
                                   
                                    {
                                        text: 'Cancel',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                                ]);
                            });
                        } catch (err: any) {
                            //error handling
                            console.log(err.message);
                        }
                        // await NetPrinter.connectPrinter(
                        //     netprinteripaddres,
                        //     9100
                        // ).then((res) => {
                        //     console.log(res, 'conoesfsfl')
                        //     setconnted(true)
                        //     Alert.alert('Device Connected', 'LAN Connected Sucessfully', [

                        //         {
                        //             text: 'Cancel',
                        //             onPress: () => console.log('Cancel Pressed'),
                        //             style: 'cancel',
                        //         },
                        //         { text: 'OK', onPress: () => console.log('OK Pressed') },
                        //     ]),
                        //         (error: any) => console.warn(error)


                        // }).catch(() => {
                        //     Alert.alert('', 'Enter Valid IP Address.', [
                        //         // {
                        //         //   text: 'Ask me later',
                        //         //   onPress: () => console.log('Ask me later pressed'),
                        //         // },
                        //         {
                        //             text: 'Cancel',
                        //             onPress: () => console.log('Cancel Pressed'),
                        //             style: 'cancel',
                        //         },
                        //         { text: 'OK', onPress: () => console.log('OK Pressed') },
                        //     ]);
                        // });
                        break;
                    /*case "usb":
                        console.log('usb printer..')
                        await USBPrinter.connectPrinter(
                            selectedPrinter?.vendor_id || "",
                            selectedPrinter?.product_id || ""
                        ).then(() => {
                            setconnted(true)

                            Alert.alert('Device Connected', 'Connected Sucessfully', [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        });
                        break;*/
                        case "wifi":
                            console.log('wifi printer..')
                        try {
                            await ThermalPrinterModule.printTcp({ payload: Tcp_string }).then(() => {

                                close_model();
                               
                                Alert.alert('', 'Wifi Print Succesfull.', [
                                   
                                    {
                                        text: 'Cancel',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                                ]);
                            }).catch(() => {
                                Alert.alert('', 'Select Valid Address.', [
                                    {
                                        text: 'Cancel',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                                ]);
                            });
                        } catch (err: any) {
                            //error handling
                            console.log(err.message);
                        }
                        break;
                    default:
                }
            } catch (err) {
                console.warn(err);
            } finally {
                setLoading(false);
            }
        };
        connect();
    };

    const handlePrint = async () => {
        try {
            // [options valueForKey:@"imageWidth"];
            const Printer = printerList[selectedValue];

            console.log(Printer);
            // await Printer.printImage("https://howmuch-pk.s3.ap-southeast-1.amazonaws.com/spree/stores/1380/squared_large/logo-for-grocery-store-vector-21609822.jpeg", { imageWidth: 100, paddingX: 300 });
            //await Printer.printBill(Bill_string);

            USBPrinter.printBill(Bill_string);

            close_model();
        } catch (err) {
            console.warn(err);
        }
    };
    React.useEffect(() => {
        setSelectedPrinter({ printerType: 'usb' });
    }, [])

    // close connre
    const closeConn = async () => {
        try {
            switch (selectedPrinter.printerType) {
                /*case "ble":
                    await BLEPrinter.closeConn();
                    console.log("BLE printer connection closed.");
                    break;

                case "net":
                    await NetPrinter.closeConn();
                    console.log("Network printer connection closed.");
                    break;*/

                case "usb":
                    await USBPrinter.closeConn();
                    console.log("USB printer connection closed.");
                    break;

                default:
                    console.warn("No connection to close or unsupported printer type.");
            }
            setconnted(false)
        } catch (error) {
            console.error("Error closing printer connection:", error);
        }
    };
    const handleChangePrinterType = async (type: keyof typeof printerList) => {
             console.log(type,'printer type//')
        closeConn()

        setSelectedValue((prev) => {
            return type;
        });

        if(type == 'wifi'){
            try {
                const wifiip = await WifiManager.getIP();
                console.log(`Your current Wi-Fi ip is ${wifiip}`);
                if(wifiip == '0.0.0.0'){
                    Alert.alert('Warning!', 'Please Connect Your Device to WIFI', [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                }else{
                    /*setnetprinteripaddres((prev) => {
                        return wifiip;
                    });*/
                    setSelectedPrinter({ printerType: 'wifi' });
                    setWifiIP(wifiip);
                    
                }
               
              } catch (error) {
                console.log("Cannot get current SSID!");
              }
        }else{
           
           
            if (type == 'net') {
                setSelectedPrinter({ printerType: 'net' });
            }else{
                setSelectedPrinter({ printerType: 'usb' });
            }

        }
    };

    const handleChangeHostAndPort = (params: string) => (text: string) =>
        setSelectedPrinter((prev) => ({
            ...prev,
            device_name: "Net Printer",
            [params]: text,
            printerType: "net",
        }));

    const _renderNet = () => (

        <View style={{ paddingVertical: responsiveHeight(0)}}>
            <View style={{paddingBottom: responsiveHeight(3)}}>
                <Text style={{paddingBottom: responsiveHeight(2)}}>Printer IP Address: </Text>
                <TextInput
                    placeholder="Printer IP Address"
                    onChangeText={text => setnetprinteripaddres(text)}
                    style={{
                        borderColor: '#CECECE',
                        borderWidth: 1,
                        padding: 3,
                        borderRadius: 5,
                        paddingTop: 3
                    }}
                />
            </View>

            <Button
                disabled={netprinteripaddres == '' ? true : false}
                title={"Connect and Print"}
                onPress={handleConnectSelectedPrinter}
            />

        </View>
       
    );

    function setprinterselected() {

    }
    const _renderOther = () => (
        <>
        {/*<Text>Select printer: </Text>
        <Picker
            options={devices?.map((de: any) => {
                return {
                    label: de?.device_name,
                    value: de

                }
            })}
            placeholder={"Select USB Port"}
            textStyle={{
                fontSize: 15
            }}
            selectedValue={dropdownValue}
            onValueChange={(val) => {
                const item = devices.find((item: any) => item.device_name === val?.device_name);

                setSelectedPrinter(item as never)
                setDropdownValue(val)

            }}
        />*/}
        <View style={{paddingVertical: responsiveHeight(2)}}>
            {
                selected_usb_printer_name != '' ?
                <View>
                    <Text>Connected USB Printer :</Text>
                    <Text>{selected_usb_printer_name}{'helkjkrle'}</Text>
                    </View>
                : 
                <Text style={{color: 'red'}}>No Connected USB Printer Found</Text>
            }
           
        </View>
        </>

    );

    const _renderWifi = () => (

        <>

        <View style={{ paddingVertical: responsiveHeight(0)}}>
        <View style={{paddingVertical: responsiveHeight(1)}}>
            <Text> Wi-Fi IP : {wifi_IP} </Text>
        </View>
            <View style={{paddingBottom: responsiveHeight(3)}}>
                <Text style={{paddingBottom: responsiveHeight(2)}}>Printer IP Address: </Text>
                <TextInput
                    placeholder="Printer IP Address"
                    onChangeText={text => setnetprinteripaddres(text)}
                    style={{
                        borderColor: '#CECECE',
                        borderWidth: 1,
                        padding: 3,
                        borderRadius: 5,
                        paddingTop: 3
                    }}
                />
            </View>

            <Button
                disabled={netprinteripaddres == '' ? true : false}
                title="Connect and Print"
                onPress={handleConnectSelectedPrinter}
            />

        </View>
        </>
       
    );


    return (
        <View style={styles.container}>

            <View style={{}}>
                <Text>Select printer type: </Text>
                <Picker
                    options={Object.keys(printerList).map((de: any, index: any) => {
                        return {
                            label: de.toUpperCase(),
                            value: de
                        }
                    })}
                    placeholder="PlaceHolder"
                    textStyle={{
                        fontSize: 13
                    }}
                    selectedValue={selectedValue}
                    onValueChange={(val) => handleChangePrinterType(val)}
                />

            </View>
           
                
            <View style={styles.section}>
                {selectedValue === "net" ? _renderNet() : selectedValue === "wifi" ? _renderWifi() : _renderOther()}
            </View>

            {/*selectedValue == 'usb' ?
                        <Button
                            disabled={(!selectedPrinter?.device_name) ? true : false}
                            title="Connect"
                            onPress={handleConnectSelectedPrinter}
                        />
                    :null*/
            }

            <View style={{paddingTop: 5}}>
                {/*selectedValue == 'usb' ?
                    <Button
                        disabled={(!selectedPrinter?.device_name && !connetd) ? true : false}
                        title="Print"
                        onPress={handlePrint}
                    />
                :
                    null*/
                }

                {selectedValue == 'usb' ?
                    <Button
                        disabled={selected_usb_printer_name == '' ? true : false}
                        title="Print"
                        onPress={handlePrint}
                    />
                :
                    null
                }


            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
    },
    section: {
        flex: 1,
    },
    rowDirection: {
        // flexDirection: "row",
        // alignItems:'center'
    },
});