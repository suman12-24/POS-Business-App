import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { ORDER_TABLE_COLS } from './OrderCard';

const GREY_BORDER = '#F4F3FA';

// Mirrors OrderCard.js's table-row structure exactly (same flex columns +
// dividers as ORDER_TABLE_COLS), so the loading state doesn't "jump" in
// size/shape once real data replaces it.
const ColumnDivider = () => <View style={styles.verticalDivider} />;

const OrderCardSkeleton = () => {
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

    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerAnim]);

  const animatedStyle = {
    backgroundColor: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E0E0E0', '#F0F0F0'],
    }),
  };

  const Bar = ({ w, h = 12, style }) => (
    <Animated.View
      style={[styles.bar, animatedStyle, { width: w, height: h }, style]}
    />
  );

  return (
    <View style={styles.row}>
      {/* ---------------- Order Details ---------------- */}
      <View style={[styles.cell, { flex: ORDER_TABLE_COLS.details }]}>
        <Bar w={isCompact ? 70 : 60} h={13} />
        <Bar w={50} h={10} style={{ marginTop: 6 }} />
      </View>

      <ColumnDivider />

      {/* ---------------- Customer Details ---------------- */}
      <View style={[styles.cell, { flex: ORDER_TABLE_COLS.customer }]}>
        <Bar w={isCompact ? 90 : 75} h={13} />
        <Bar w={70} h={10} style={{ marginTop: 6 }} />
        <Bar w={80} h={10} style={{ marginTop: 6 }} />
      </View>

      <ColumnDivider />

      {/* ---------------- Order Date ---------------- */}
      <View style={[styles.cell, { flex: ORDER_TABLE_COLS.date }]}>
        <Bar w={isCompact ? 60 : 50} h={10} />
      </View>

      <ColumnDivider />

      {/* ---------------- Order Value ---------------- */}
      <View style={[styles.cell, { flex: ORDER_TABLE_COLS.value }]}>
        <Bar w={40} h={13} />
      </View>

      <ColumnDivider />

      {/* ---------------- Action ---------------- */}
      <View style={[styles.cell, { flex: ORDER_TABLE_COLS.action }]}>
        <Bar w="60%" h={22} style={{ borderRadius: 6, marginBottom: 5 }} />
        <Bar w="60%" h={22} style={{ borderRadius: 6 }} />
      </View>

      <ColumnDivider />

      {/* ---------------- Print ---------------- */}
      <View style={[styles.cell, { flex: ORDER_TABLE_COLS.print }]}>
        <Bar w="70%" h={26} style={{ borderRadius: 6 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: GREY_BORDER,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1.2,
    alignSelf: 'stretch',
    backgroundColor: GREY_BORDER,
    marginHorizontal: 5,
    flexShrink: 0,
  },
  bar: {
    borderRadius: 4,
  },
});

export default OrderCardSkeleton;