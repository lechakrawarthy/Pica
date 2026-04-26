// Pica Editorial — AnimatedCard
// Reusable press-spring wrapper. Every card in the app gets this feel.
// Also exports: AnimatedRow, PressablePill, ShimmerPlaceholder

import { Pressable } from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withSpring, withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Card with spring press-in ─────────────────────────────────────────────────
export const AnimatedCard = ({ onPress, children, style, disabled }) => {
    const scale = useSharedValue(1);
    const shadow = useSharedValue(0);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: 0.04 + shadow.value * 0.06,
    }));

    return (
        <AnimatedPressable
            onPressIn={() => {
                if (disabled) return;
                scale.value  = withSpring(0.97, { damping: 14, stiffness: 280 });
                shadow.value = withTiming(1, { duration: 100 });
            }}
            onPressOut={() => {
                scale.value  = withSpring(1, { damping: 14, stiffness: 200 });
                shadow.value = withTiming(0, { duration: 200 });
            }}
            onPress={disabled ? undefined : onPress}
            style={[animStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};

// ── Row that highlights on press ──────────────────────────────────────────────
export const AnimatedRow = ({ onPress, children, style }) => {
    const bg = useSharedValue(0);
    const animStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(26,24,20,${bg.value * 0.04})`,
    }));

    return (
        <AnimatedPressable
            onPressIn={() => { bg.value = withTiming(1, { duration: 60 }); }}
            onPressOut={() => { bg.value = withTiming(0, { duration: 200 }); }}
            onPress={onPress}
            style={[animStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};

// ── Pill button with spring ────────────────────────────────────────────────────
export const PressablePill = ({ onPress, children, style }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPressIn={() => { scale.value = withSpring(0.93, { damping: 10, stiffness: 300 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
            onPress={onPress}
            style={[animStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};
