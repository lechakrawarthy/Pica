// Pica Editorial — AnimatedCard
// Crisp, instant press feedback. No spring wobble — withTiming for snap, not water.

import { Pressable } from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Timing config — instant down, quick release. Feels mechanical, decisive.
const DOWN = { duration: 80 };
const UP   = { duration: 150 };

// ── Card press (subtle scale) ─────────────────────────────────────────────────
export const AnimatedCard = ({ onPress, children, style, disabled }) => {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPressIn={() => {
                if (disabled) return;
                scale.value = withTiming(0.97, DOWN);
            }}
            onPressOut={() => {
                scale.value = withTiming(1, UP);
            }}
            onPress={disabled ? undefined : onPress}
            style={[animStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};

// ── Row highlight on press ────────────────────────────────────────────────────
export const AnimatedRow = ({ onPress, children, style }) => {
    const bg = useSharedValue(0);
    const animStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(26,24,20,${bg.value * 0.05})`,
    }));

    return (
        <AnimatedPressable
            onPressIn={() => { bg.value = withTiming(1, { duration: 60 }); }}
            onPressOut={() => { bg.value = withTiming(0, { duration: 180 }); }}
            onPress={onPress}
            style={[animStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};

// ── Pill button — crisp scale snap ───────────────────────────────────────────
export const PressablePill = ({ onPress, children, style }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPressIn={() => { scale.value = withTiming(0.94, DOWN); }}
            onPressOut={() => { scale.value = withTiming(1, UP); }}
            onPress={onPress}
            style={[animStyle, style]}
        >
            {children}
        </AnimatedPressable>
    );
};
