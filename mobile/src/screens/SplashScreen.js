// Pica Editorial — SplashScreen
// The first breath. Ink background, mark fades in, name rises, loader pulses.
// Uses Reanimated 4 for butter-smooth 60fps animations.

import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withRepeat,
    Easing,
    runOnJS,
} from "react-native-reanimated";
import { colors } from "../theme/colors";

export const SplashScreen = ({ onFinish }) => {
    // Animation values
    const markOpacity   = useSharedValue(0);
    const markScale     = useSharedValue(0.6);
    const nameOpacity   = useSharedValue(0);
    const nameY         = useSharedValue(20);
    const tagOpacity    = useSharedValue(0);
    const loaderOpacity = useSharedValue(0);
    const dotScale      = useSharedValue(1);

    useEffect(() => {
        // Mark appears
        markOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
        markScale.value   = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.3)) });

        // Name rises
        nameOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
        nameY.value       = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

        // Tagline
        tagOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

        // Loader pulse
        loaderOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
        dotScale.value = withDelay(1100, withRepeat(
            withSequence(
                withTiming(1.6, { duration: 700, easing: Easing.inOut(Easing.sine) }),
                withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.sine) })
            ),
            -1,
            false
        ));

        // Navigate after 2.8s
        const timer = setTimeout(() => {
            if (onFinish) runOnJS(onFinish)();
        }, 2800);

        return () => clearTimeout(timer);
    }, []);

    const markStyle = useAnimatedStyle(() => ({
        opacity:   markOpacity.value,
        transform: [{ scale: markScale.value }],
    }));
    const nameStyle = useAnimatedStyle(() => ({
        opacity:   nameOpacity.value,
        transform: [{ translateY: nameY.value }],
    }));
    const tagStyle = useAnimatedStyle(() => ({
        opacity: tagOpacity.value,
    }));
    const loaderStyle = useAnimatedStyle(() => ({
        opacity: loaderOpacity.value,
    }));
    const dotStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dotScale.value }],
    }));

    return (
        <View style={styles.root}>
            {/* Circular mark */}
            <Animated.View style={[styles.markWrap, markStyle]}>
                <View style={styles.mark}>
                    <Animated.View style={[styles.dot, dotStyle]} />
                </View>
            </Animated.View>

            {/* App name */}
            <Animated.Text style={[styles.name, nameStyle]}>
                Pica
            </Animated.Text>

            {/* Tagline */}
            <Animated.Text style={[styles.tag, tagStyle]}>
                MONEY, MADE PERSONAL
            </Animated.Text>

            {/* Loader */}
            <Animated.Text style={[styles.loader, loaderStyle]}>
                — loading —
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.ink,
        alignItems: "center",
        justifyContent: "center",
    },
    markWrap: {
        marginBottom: 24,
    },
    mark: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1.5,
        borderColor: "rgba(244,240,232,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.coral,
    },
    name: {
        fontSize: 48,
        fontWeight: "300",
        color: colors.paper,
        letterSpacing: -1.5,
        fontStyle: "italic",
        marginBottom: 8,
    },
    tag: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 2.2,
        color: "rgba(244,240,232,0.35)",
        textTransform: "uppercase",
    },
    loader: {
        position: "absolute",
        bottom: 64,
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.8,
        color: "rgba(244,240,232,0.25)",
        textTransform: "uppercase",
    },
});
