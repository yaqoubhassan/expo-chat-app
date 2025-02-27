import React, { useState, useEffect, useCallback } from 'react';
import { View, Animated, Easing } from 'react-native';
import styles from "@/styles/chatStyles";

const TypingIndicator = () => {
    const [dot1] = useState(new Animated.Value(0));
    const [dot2] = useState(new Animated.Value(0));
    const [dot3] = useState(new Animated.Value(0));

    const animateDots = useCallback(() => {
        // Reset values
        dot1.setValue(0);
        dot2.setValue(0);
        dot3.setValue(0);

        // Create animation sequence
        Animated.stagger(200, [
            Animated.timing(dot1, {
                toValue: 1,
                duration: 400,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(dot2, {
                toValue: 1,
                duration: 400,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(dot3, {
                toValue: 1,
                duration: 400,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Restart animation
            animateDots();
        });
    }, [dot1, dot2, dot3]);

    useEffect(() => {
        animateDots();
        return () => {
            // Cleanup animation when component unmounts
            dot1.stopAnimation();
            dot2.stopAnimation();
            dot3.stopAnimation();
        };
    }, [animateDots]);

    const dotStyle = (animatedValue: Animated.Value) => ({
        opacity: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 1, 0.3],
        }),
        transform: [
            {
                scale: animatedValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1],
                }),
            },
        ],
    });

    return (
        <View style={styles.typingContainer}>
            <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
            <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
            <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
        </View>
    );
};

export default TypingIndicator;