import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

const ProductCardSkeleton: React.FC = () => {
    const shimmerAnim = React.useRef(new Animated.Value(0)).current;

    /*useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );

        shimmerAnimation.start();

        return () => {
            shimmerAnimation.stop();
        };
    }, [shimmerAnim]);*/

    const animatedStyle = {
        backgroundColor: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["#E0E0E0", "#F0F0F0"],
        }),
    };

    return (
       
            <View>
               
                                     
                    {/* First Row - Order ID & Date */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: responsiveHeight(2),
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.textSkeleton,
                                animatedStyle,
                                {
                                    height: 12,
                                    width: "45%",
                                    borderRadius: 4,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.textSkeleton,
                                animatedStyle,
                                {
                                    height: 12,
                                    width: "50%",
                                    borderRadius: 4,
                                },
                            ]}
                        />
                    </View>

                    {/* Second Row - Time & Status */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.textSkeleton,
                                animatedStyle,
                                {
                                    height: 12,
                                    width: "45%",
                                    borderRadius: 4,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.textSkeleton,
                                animatedStyle,
                                {
                                    height: 12,
                                    width: "50%",
                                    borderRadius: 4,
                                },
                            ]}
                        />
                    </View>
          </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        marginTop: 5,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: "row",
        alignItems: "center",
    },
    imageSkeleton: {
        backgroundColor: "#E0E0E0",
    },
    textSkeleton: {
        backgroundColor: "#E0E0E0",
    },
});

export default ProductCardSkeleton;
