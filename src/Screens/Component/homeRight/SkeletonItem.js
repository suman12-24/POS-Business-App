import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const SkeletonItem = ({ width, height, borderRadius = 8, style }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    width: width,
                    height: height,
                    borderRadius: borderRadius,
                    backgroundColor: '#E0E0E0',
                    opacity: opacity,
                },
                style,
            ]}
        />
    );
};

export default SkeletonItem;