
import { StyleSheet } from 'react-native';
import{ Colors} from '../../Constants/Colors'
import { Inter } from '../../Constants/Fonts';
import { responsiveHeight, responsiveWidth, responsiveFontSize} from "react-native-responsive-dimensions";
const Styles = () => {
    return StyleSheet.create({
      container: {flex: 1, backgroundColor: Colors.backgroundColor, position: 'relative'},
      main: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        paddingHorizontal: responsiveWidth(2),
        paddingVertical: responsiveHeight(2),
      },
      tab_button:{
        height: responsiveWidth(4),
        width: responsiveWidth(15),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      },
      button_accept:{
        height: responsiveWidth(4),
        width: responsiveWidth(10),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: Colors.green,
        borderRadius: 10
      },
      button_reject:{
        height: responsiveWidth(4),
        width: responsiveWidth(10),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: Colors.red,
        borderRadius: 10
      },
      button_accept_model:{
        height: responsiveWidth(4),
        width: responsiveWidth(16),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: Colors.green,
        borderRadius: 10
      },
      button_reject_model:{
        height: responsiveWidth(4),
        width: responsiveWidth(16),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: Colors.red,
        borderRadius: 10
      },
    });
  };
  export default Styles;
