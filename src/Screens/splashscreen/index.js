import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'react-native';
import { Inter } from '../../Constants/Fonts';

import SplashSvg from '../../assets/images/login_logo.png';

import {
  responsiveHeight as hp,
  responsiveWidth as wp,  
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import ButtonComponent from '../../Component/buttomcom';


const SplashScreen = ({navigation}) => {
//   const { t } = useLanguage();
  const [appIsReady, setAppIsReady] = useState(false);
 

  const { width } = Dimensions.get('window');

  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAppIsReady(true);
    };
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      const hide = async () => {
        setIsSplashHidden(true);
      };
      hide();
    }
  }, [appIsReady]);

  const handleStart = () => {
   
     navigation.navigate('Login')
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#5B21B6" />

      <View
                  style={{
                    width: wp(40),
                    height: hp(34),
                    overflow: 'hidden',
                    margin: 'auto',
                  }}
                >
<Image
       style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        source={SplashSvg}
        resizeMode="cover"
      />

                </View>

      
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: hp(2)
        }}
      >
        <Text
          style={{
            fontSize: 28,
            marginBottom: wp(3)
          }}
        >
          Welcome
        </Text>
        <Text
          style={{
            color: '#A0A0A0',
            fontSize: 18,
            fontFamily: Inter.regular,
            textAlign: 'center'
          }}
        >
           We reach you anywhere, anytime
        </Text>

        <ButtonComponent
          title="Start now"
          loading={false}
          loaderComponent={
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginLeft: 10 }}
            />
          }
          onPress={() => {handleStart()}}
          style={{
            width: wp(40),
            height: hp(8),
            backgroundColor: '#5B21B6',
            marginTop: wp(4),
            borderRadius: 30
          }}
          textStyle={{
            fontSize: 16,
            fontFamily: Inter.regular,
            color: '#fff',
            textAlign: 'center',
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  }
});

export default SplashScreen;
