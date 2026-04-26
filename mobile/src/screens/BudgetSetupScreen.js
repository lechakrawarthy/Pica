// Pica Editorial — BudgetSetupScreen
// Step 03 of the onboarding flow. Set monthly intention.
// Animated slider, preset chips, big number display.

import { useState, useRef } from "react";
import {
    View, Text, StyleSheet, Pressable, PanResponder,
    Dimensions, TouchableOpacity, Alert,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/colors";

const { width: W } = Dimensions.get("window");
const SLIDER_W = W - 48;
const MIN = 5000;
const MAX = 100000;

const PRESETS = [10000, 15000, 20000, 30000, 50000];

const snapToNearest = (val) => {
    // Round to nearest 1000
    return Math.round(val / 1000) * 1000;
};

const formatINR = (val) =>
    "₹" + val.toLocaleString("en-IN");

export const BudgetSetupScreen = ({ onFinish }) => {
    const [budget, setBudget] = useState(20000);
    const [saving, setSaving] = useState(false);
    const thumbPos = useSharedValue(((20000 - MIN) / (MAX - MIN)) * SLIDER_W);
    const thumbScale = useSharedValue(1);
    const numberScale = useSharedValue(1);

    const setFromPct = (pct) => {
        const clamped = Math.max(0, Math.min(1, pct));
        const raw = MIN + clamped * (MAX - MIN);
        const snapped = snapToNearest(raw);
        setBudget(snapped);
        return snapped;
    };

    const sliderRef = useRef(null);
    const sliderLeft = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                thumbScale.value = withSpring(1.3, { damping: 10 });
            },
            onPanResponderMove: (e) => {
                const x = e.nativeEvent.pageX - sliderLeft.current;
                const pct = x / SLIDER_W;
                thumbPos.value = Math.max(0, Math.min(SLIDER_W, x));
                const val = setFromPct(pct);
                numberScale.value = withTiming(1.05, { duration: 80 });
                numberScale.value = withTiming(1, { duration: 120 });
            },
            onPanResponderRelease: () => {
                thumbScale.value = withSpring(1, { damping: 12 });
            },
        })
    ).current;

    const setPreset = (val) => {
        setBudget(val);
        const pct = (val - MIN) / (MAX - MIN);
        thumbPos.value = withSpring(pct * SLIDER_W, { damping: 14 });
        numberScale.value = withSpring(1.08, { damping: 8 });
        numberScale.value = withTiming(1, { duration: 200 });
    };

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: thumbPos.value - 12 },
            { scale: thumbScale.value },
        ],
    }));
    const fillStyle = useAnimatedStyle(() => ({
        width: thumbPos.value,
    }));
    const numStyle = useAnimatedStyle(() => ({
        transform: [{ scale: numberScale.value }],
    }));

    const onSave = async () => {
        try {
            setSaving(true);
            await AsyncStorage.setItem("@pica_budget", String(budget));
            onFinish?.();
        } catch {
            Alert.alert("Couldn't save", "Please try again.");
            setSaving(false);
        }
    };

    return (
        <View style={styles.root}>
            {/* Progress steps */}
            <View style={styles.progressRow}>
                <View style={[styles.step, styles.stepDone]} />
                <View style={[styles.step, styles.stepDone]} />
                <View style={[styles.step, styles.stepActive]} />
                <View style={styles.step} />
            </View>

            <Text style={styles.eyebrow}>Step 03 of 04 · Monthly budget</Text>
            <Text style={styles.headline}>How much do you want to{"\n"}spend this month?</Text>

            {/* Big number */}
            <View style={styles.amtSection}>
                <Animated.View style={[styles.amtRow, numStyle]}>
                    <Text style={styles.amtCur}>₹</Text>
                    <Text style={styles.amtVal}>{budget.toLocaleString("en-IN")}</Text>
                </Animated.View>
                <Text style={styles.amtLabel}>— per month —</Text>
            </View>

            {/* Slider */}
            <View
                style={styles.sliderWrap}
                ref={sliderRef}
                onLayout={(e) => {
                    sliderRef.current?.measure((fx, fy, fw, fh, px, py) => {
                        sliderLeft.current = px;
                    });
                }}
            >
                <View style={styles.track} {...panResponder.panHandlers}>
                    <Animated.View style={[styles.fill, fillStyle]} />
                    <Animated.View style={[styles.thumb, thumbStyle]} />
                </View>
                <View style={styles.trackLabels}>
                    <Text style={styles.trackLabel}>₹5K</Text>
                    <Text style={styles.trackLabel}>₹50K</Text>
                    <Text style={styles.trackLabel}>₹1L+</Text>
                </View>
            </View>

            {/* Preset chips */}
            <View style={styles.presetsRow}>
                {PRESETS.map((p) => (
                    <PresetChip
                        key={p}
                        value={p}
                        active={budget === p}
                        onPress={() => setPreset(p)}
                    />
                ))}
            </View>

            {/* CTA */}
            <View style={styles.ctaWrap}>
                <TouchableOpacity
                    style={[styles.cta, saving && styles.ctaDisabled]}
                    onPress={onSave}
                    disabled={saving}
                >
                    <Text style={styles.ctaText}>
                        {saving ? "Saving..." : "Continue →"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const PresetChip = ({ value, active, onPress }) => {
    const scale = useSharedValue(1);
    const chipStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: active ? colors.ink : "transparent",
        borderColor: active ? colors.ink : colors.line2,
    }));

    return (
        <Pressable
            onPressIn={() => { scale.value = withSpring(0.93, { damping: 12 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
            onPress={onPress}
        >
            <Animated.View style={[styles.chip, chipStyle]}>
                <Text style={[styles.chipText, active && styles.chipTextOn]}>
                    {value >= 100000 ? "₹1L" : `₹${(value / 1000).toFixed(0)}K`}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.paper,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    progressRow: {
        flexDirection: "row",
        gap: 6,
        marginBottom: 20,
    },
    step: {
        flex: 1,
        height: 3,
        backgroundColor: colors.line2,
        borderRadius: 2,
    },
    stepDone: { backgroundColor: colors.ink2 },
    stepActive: { backgroundColor: colors.ink },
    eyebrow: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 12,
    },
    headline: {
        fontSize: 28,
        fontWeight: "400",
        color: colors.ink,
        letterSpacing: -0.7,
        lineHeight: 34,
        marginBottom: 36,
    },

    // Amount display
    amtSection: {
        alignItems: "center",
        marginBottom: 36,
    },
    amtRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 4,
    },
    amtCur: {
        fontSize: 28,
        fontWeight: "300",
        color: colors.ink3,
        marginTop: 10,
        lineHeight: 36,
    },
    amtVal: {
        fontSize: 62,
        fontWeight: "300",
        color: colors.ink,
        letterSpacing: -2,
        lineHeight: 70,
        fontVariant: ["tabular-nums"],
    },
    amtLabel: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: colors.ink3,
        marginTop: 8,
    },

    // Slider
    sliderWrap: {
        marginBottom: 28,
    },
    track: {
        height: 4,
        backgroundColor: colors.line2,
        borderRadius: 2,
        marginBottom: 12,
        position: "relative",
    },
    fill: {
        position: "absolute",
        left: 0,
        top: 0,
        height: 4,
        backgroundColor: colors.ink,
        borderRadius: 2,
    },
    thumb: {
        position: "absolute",
        top: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.ink,
        borderWidth: 3,
        borderColor: colors.paper,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    trackLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    trackLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: colors.ink3,
        letterSpacing: 0.4,
    },

    // Presets
    presetsRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 40,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 100,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.ink2,
        letterSpacing: 0.2,
    },
    chipTextOn: {
        color: colors.paper,
    },

    // CTA
    ctaWrap: {
        marginTop: "auto",
        paddingBottom: 48,
    },
    cta: {
        height: 54,
        backgroundColor: colors.ink,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    ctaDisabled: { opacity: 0.5 },
    ctaText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.paper,
        letterSpacing: 0.3,
    },
});
