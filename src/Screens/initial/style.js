//import liraries
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";

// create a component
const Styles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: responsiveWidth(100),
      width: responsiveWidth(100),
      backgroundColor: '#fff'
    },
    splashLogo: {
      height: responsiveWidth(45), width: responsiveWidth(45)
    },
    splashBg: {                    
      height:'100%', width: '100%', position: 'absolute'
    },
    logobg: {
      position: 'absolute',
      width: responsiveWidth(35),
      height: responsiveWidth(35),
      backgroundColor: '#000000',
      borderRadius: responsiveWidth(30),
      borderWidth: 8,
      borderColor: '#C59D5F',
      alignItems:'center',
      justifyContent:'center',
      overflow:'hidden',
    }
  });
};
export default Styles;