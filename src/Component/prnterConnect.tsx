import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    Alert,
    Platform,
    NativeModules
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


//import EbPrinter from 'react-native-ebprinter';


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



export default function Thermalpriter({Tcp_string, Bill_string, close_model, printer_type}:any) {
    const [selectedValue, setSelectedValue] = React.useState<
        keyof typeof printerList
    >("usb");
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
        {}
    );
    const [netprinteripaddres, setnetprinteripaddres] = React.useState<string>('');
    const [dropdownValue, setDropdownValue] = React.useState('');
    const [connetd, setconnted] = React.useState(false)

    const [wifi_IP, setWifiIP] = React.useState<string>('');

    const [selected_usb_printer_name, setSelectedUsbPrinterName] = React.useState<string>('');
   
    const [print_in_progress, setPrintInProgress] = React.useState(false);

    /*React.useEffect(() => {
        console.log(netprinteripaddres, 'printe addres..')
        ThermalPrinterModule.defaultConfig.ip = netprinteripaddres;
        ThermalPrinterModule.defaultConfig.port = 9100;
        ThermalPrinterModule.defaultConfig.autoCut = false;
        ThermalPrinterModule.defaultConfig.timeout = 30000;
    }, [netprinteripaddres])*/

    const {CashDrawerModule} = NativeModules;

  const OpenCashDrawer = async () => {
    console.log("openCashBox");
    EbPrinter.openCashBox();
  };

    const handleConnectSelectedPrinter = async () => {

        setPrintInProgress(true); 

        //OpenCashDrawer();

        setTimeout(() => {
                printer_type.map((item :any, index: any) => {
                    if(item.code == "WIFI"){
                        WifiPrint(item.arr); 
                    }else if(item.code == "USB"){
                        handlePrint();
                    }else if(item.code == "NET"){
                        NetPrint(item.arr);  
                    }
                });

                setPrintInProgress(false);                 
                
                close_model();
        }, 1000);

    };

    const NetPrint = async (arr : any) => {

        arr.map((item:any, index:any) => {

            console.log("Net Ip:" + item.ip_address);

            ThermalPrinterModule.defaultConfig.ip = item.ip_address;
            ThermalPrinterModule.defaultConfig.port = 9100;
            ThermalPrinterModule.defaultConfig.autoCut = false;
            ThermalPrinterModule.defaultConfig.timeout = 30000;

            callIpPrint();             
        })
    }

     const WifiPrint = async (arr : any) => {
         arr.map((item:any, index:any) => {

            console.log("Wifi Ip:" + item.ip_address);

            ThermalPrinterModule.defaultConfig.ip = item.ip_address;
            ThermalPrinterModule.defaultConfig.port = 9100;
            ThermalPrinterModule.defaultConfig.autoCut = false;
            ThermalPrinterModule.defaultConfig.timeout = 30000;

            callIpPrint();             
        })            
    }

    const callIpPrint = async () => {
        try {
            await ThermalPrinterModule.printTcp({ payload: Tcp_string }).then(() => {

            }).catch(() => {
                
            });
        } catch (err: any) {
            //error handling
            console.log(err.message);
        }
    }   

    const handlePrint = async () => {

        try {
            USBPrinter.init()
                .then(() => {
                    // Get the list of connected printers
                    return USBPrinter.getDeviceList();
                })
                .then(devices => {
                    console.log("USB CALL");
                    if (devices.length > 0) {
                        USBPrinter.connectPrinter(
                            devices[0].vendor_id,
                            devices[0].product_id,
                        )

                        PrintUsb();
                    }
                })

        } catch (err) {
            console.warn(err);
        } 

    };

    const PrintUsb = async ()=> {
        try {

            USBPrinter.printBill(Bill_string);
           
        } catch (err) {
            console.warn(err);
        }
    }   


    return (
        <View style={styles.container}>
            <View style={{paddingTop: 5}}> 
            {
                print_in_progress === true ?
                    <Button
                        title={"Print In Progress..."}
                    />
                :

                <Button
                        title={"Print Confirm"}
                        onPress={handleConnectSelectedPrinter}
                    />

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