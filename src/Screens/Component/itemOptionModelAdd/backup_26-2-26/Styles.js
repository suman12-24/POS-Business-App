
import { StyleSheet } from 'react-native';
import{ Colors} from '../../Constants/Colors'
import { Inter } from '../../Constants/Fonts';
import { responsiveHeight, responsiveWidth, responsiveFontSize} from "react-native-responsive-dimensions";

const Styles = () => {

  return StyleSheet.create({

    button:{
      height: responsiveWidth(4),
      width: "96%",
      backgroundColor: Colors.green,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 10,
      
    },
    radioButton: {
            
    },
    checkbox: {
      alignSelf: 'center',
      
    },

    add_button:{
      height: responsiveWidth(4),
      width: responsiveWidth(10),
      backgroundColor: Colors.blue,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 10,
    }

  });
};

export default Styles;
