import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../Constants/Colors';

const GREY_BORDER = '#E5E7EB';

// variant: 'accept-reject' (Order Detail / Current tab) | 'complete' (Inprogress tab)
const OrderDetailSkeleton = ({ variant = 'accept-reject' }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 600;
  const isLandscape = width > height;
  const isCompact = !isTablet && !isLandscape;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const animatedStyle = {
    backgroundColor: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E0E0E0', '#F0F0F0'],
    }),
  };

  const Bar = ({ w, h = 12, style }) => (
    <Animated.View style={[styles.bar, animatedStyle, { width: w, height: h }, style]} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* Header */}
      <View style={styles.header}>
        <AntDesignIcon name="arrowleft" size={20} color="#D1D5DB" />
        <Bar w={110} h={18} style={{ marginLeft: 12 }} />
      </View>

      <View style={{ flexDirection: isCompact ? 'column' : 'row', padding: isCompact ? 10 : 14, gap: 14 }}>
        {/* -------- LEFT column -------- */}
        <View style={{ flex: isCompact ? undefined : 2 }}>
          {/* Two info cards */}
          <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 10, marginBottom: 12 }}>
            <View style={styles.infoCard}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Bar key={i} w={i === 4 ? '70%' : '90%'} h={11} style={{ marginBottom: 8 }} />
              ))}
            </View>
            <View style={styles.infoCard}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Bar key={i} w={i === 0 ? '50%' : '85%'} h={11} style={{ marginBottom: 8 }} />
              ))}
            </View>
          </View>

          {/* Item rows */}
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Bar w={responsiveSize(width, 4)} h={responsiveSize(width, 4)} style={{ borderRadius: 3, marginRight: 8 }} />
                <Bar w="55%" h={13} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }} />
                <Bar w={40} h={13} />
              </View>
              <Bar w="35%" h={10} style={{ marginTop: 6, marginLeft: 44 }} />
            </View>
          ))}

          {/* Summary block */}
          <View style={{ borderTopWidth: 1, borderTopColor: GREY_BORDER, marginTop: 12, paddingTop: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.summaryLine}>
                <Bar w={90} h={11} />
                <Bar w={50} h={11} />
              </View>
            ))}
            <View style={styles.summaryLine}>
              <Bar w={90} h={14} />
              <Bar w={60} h={14} />
            </View>
          </View>
        </View>

        {/* -------- RIGHT: action panel -------- */}
        <View style={[styles.actionCard, { flex: isCompact ? undefined : 1 }]}>
          <Bar w={130} h={15} style={{ marginBottom: 12 }} />

          {variant === 'complete' ? (
            <>
              <Bar
                w="80%"
                h={56}
                style={{ borderRadius: 8, alignSelf: 'center', marginBottom: 16 }}
              />
              <Bar w="100%" h={42} style={{ borderRadius: 8 }} />
            </>
          ) : (
            <>
              <Bar w="60%" h={38} style={{ borderRadius: 8, alignSelf: 'center', marginBottom: 16 }} />
              <Bar w="100%" h={40} style={{ borderRadius: 8, marginBottom: 8 }} />
              <Bar w="100%" h={40} style={{ borderRadius: 8 }} />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

// small helper so we don't need to import responsiveWidth just for this
const responsiveSize = (screenWidth, percent) => (screenWidth * percent) / 100;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: GREY_BORDER,
    borderRadius: 8,
    padding: 10,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GREY_BORDER,
    borderRadius: 12,
    padding: 14,
  },
  bar: {
    borderRadius: 4,
  },
});

export default OrderDetailSkeleton;