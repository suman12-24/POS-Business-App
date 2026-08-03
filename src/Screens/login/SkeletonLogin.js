import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

const SkeletonBox = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={[styles.box, style, { opacity }]} />;
};

const SkeletonLogin = () => {
  return (
    <View style={styles.wrap}>
      {/* Logo placeholder */}
      <SkeletonBox style={styles.logo} />

      {/* "Welcome Back!" heading placeholder */}
      <SkeletonBox style={styles.heading} />

      <View style={styles.formWrap}>
        {/* Username field */}
        <SkeletonBox style={styles.inputRow} />

        {/* Password field */}
        <SkeletonBox style={styles.inputRow} />

        {/* Login button */}
        <SkeletonBox style={styles.button} />

        {/* Forgot password link */}
        <SkeletonBox style={styles.forgotText} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#E4E4EC',
    borderRadius: 8,
  },
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: responsiveWidth(20),
    height: responsiveHeight(10),
    borderRadius: 12,
    marginBottom: responsiveHeight(1),
  },
  heading: {
    width: '55%',
    height: responsiveHeight(2.2),
    marginBottom: responsiveHeight(1.8),
  },
  formWrap: {
    width: '80%',
  },
  inputRow: {
    width: '100%',
    height: responsiveHeight(6.8),
    borderRadius: 8,
    marginBottom: responsiveHeight(1.8),
  },
  button: {
    width: '100%',
    height: responsiveHeight(6.5),
    borderRadius: 7,
    marginTop: responsiveHeight(1),
  },
  forgotText: {
    width: '45%',
    height: responsiveHeight(1.4),
    marginTop: responsiveHeight(2.2),
    alignSelf: 'center',
  },
});

export default SkeletonLogin;