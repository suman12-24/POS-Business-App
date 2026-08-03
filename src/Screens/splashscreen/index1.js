import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Inter } from '../../Constants/Fonts';

import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import ButtonComponent from '../../Component/buttomcom';
import { useSelector } from 'react-redux';
import { Images } from '../../Constants/ImageIconContant';
const SplashScreen = ({ navigation }) => {
  const [appIsReady, setAppIsReady] = useState(false);
  const { loginImages } = useSelector(state => state.common);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAppIsReady(true);
    };
    prepare();
  }, []);

  const handleStart = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2916A1" />

      <View style={styles.content}>
        {/* Logo — smaller in landscape since vertical space is tighter */}
        <View
          style={{
            width: isLandscape ? hp(60) : wp(35),
            height: isLandscape ? hp(15) : wp(35),
            overflow: 'hidden',
            // marginBottom: isLandscape ? hp(2) : hp(3),
          }}
        >
          <Image
            style={{ width: '100%', height: '100%' }}
            //source={loginImages?.logo ? { uri: loginImages.logo } : null}
            source={Images.splash_logo}
            resizeMode="cover"
          />
        </View>

        <Text
          style={{
            fontSize: isLandscape ? rf(3) : rf(3.2),
            fontFamily: Inter.bold ?? Inter.regular,
            marginBottom: hp(1),
            textAlign: 'center',
          }}
        >
          Welcome
        </Text>

        <Text
          style={{
            color: '#A0A0A0',
            fontSize: isLandscape ? rf(1.8) : rf(2),
            fontFamily: Inter.regular,
            textAlign: 'center',
            maxWidth: wp(60),
            marginBottom: hp(1),
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
          onPress={handleStart}
          style={{
            width: isLandscape ? wp(20) : wp(40),
            height: isLandscape ? hp(10) : hp(7),
            backgroundColor: '#2916A1',
            marginTop: isLandscape ? hp(2) : hp(3),
            borderRadius: 8,
          }}
          textStyle={{
            fontSize: rf(1.8),
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
