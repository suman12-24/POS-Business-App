
import { StyleSheet } from 'react-native';
import{ Colors} from '../../../Constants/Colors';
import { Calibri } from '../../../Constants/Fonts';
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
      button:{
        height: responsiveWidth(4),
        width: responsiveWidth(30),
        backgroundColor: Colors.blue,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: 10,
        
      },
    });
  };
  export default Styles;
