import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

/* ---------------------------------------------------
   SHIMMER PLACEHOLDER (generic pulsing block)
--------------------------------------------------- */
export default function ShimmerPlaceholder({ width = '100%', height = 14, borderRadius = 4, style }) {
    const opacity = useRef(new Animated.Value(0.35)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 650,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.35,
                    duration: 650,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.base,
                { width, height, borderRadius, opacity },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: '#E2E2EE',
    },
});