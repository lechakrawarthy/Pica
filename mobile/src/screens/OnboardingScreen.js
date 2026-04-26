// Pica Editorial — OnboardingScreen
// Three story slides. Each one earns trust before asking for anything.
// Horizontal swipe with Reanimated. Dot progress. Art panels.

import { useRef, useState } from "react";
import {
    View, Text, StyleSheet, Pressable, Dimensions,
    FlatList, TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    useAnimatedScrollHandler,
    runOnJS,
    Extrapolation,
    FadeIn,
    FadeInDown,
} from "react-native-reanimated";
import { colors } from "../theme/colors";

const { width: W, height: H } = Dimensions.get("window");

const SLIDES = [
    {
        id: "1",
        chapter: "Chapter one",
        headline: "Notice where\nit goes.",
        body: "Most apps count your money. Pica listens to it. A quiet log of every small transaction — built so you can read your month back like a story.",
        artColor: colors.coral,
        symbol: "₹",
        quote: '"every rupee, noticed"',
    },
    {
        id: "2",
        chapter: "Chapter two",
        headline: "Your budget,\nyour pace.",
        body: "Set a monthly intention. Watch how each day shapes your story. No guilt — just awareness. Knowing is the first step to changing.",
        artColor: colors.sage,
        symbol: "◎",
        quote: '"slow money, clear mind"',
    },
    {
        id: "3",
        chapter: "Chapter three",
        headline: "Insights that\nactually help.",
        body: "See where your money flows most. Track patterns across categories. Pica turns your spending into a monthly narrative — readable, honest, yours.",
        artColor: colors.plum,
        symbol: "∿",
        quote: '"spend with intention"',
    },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export const OnboardingScreen = ({ onFinish, onSkip }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
        },
        onMomentumScrollEnd: (e) => {
            const idx = Math.round(e.contentOffset.x / W);
            runOnJS(setActiveIndex)(idx);
        },
    });

    const goNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
            setActiveIndex(activeIndex + 1);
        } else {
            onFinish?.();
        }
    };

    return (
        <View style={styles.root}>
            {/* Skip */}
            <TouchableOpacity onPress={onSkip || onFinish} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <AnimatedFlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => (
                    <SlideItem item={item} index={index} scrollX={scrollX} />
                )}
            />

            {/* Bottom controls */}
            <View style={styles.bottomBar}>
                {/* Progress dots */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <DotIndicator key={i} index={i} activeIndex={activeIndex} scrollX={scrollX} />
                    ))}
                </View>

                <View style={styles.bottomRight}>
                    <Text style={styles.counter}>
                        {String(activeIndex + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                    </Text>
                    <NextButton onPress={goNext} isLast={activeIndex === SLIDES.length - 1} />
                </View>
            </View>
        </View>
    );
};

// ── Individual slide ──────────────────────────────────────────────────────────
const SlideItem = ({ item, index, scrollX }) => {
    const inputRange = [(index - 1) * W, index * W, (index + 1) * W];

    const artStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
        return { transform: [{ scale }], opacity };
    });

    const textStyle = useAnimatedStyle(() => {
        const translateX = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
        return { transform: [{ translateX }], opacity };
    });

    return (
        <View style={styles.slide}>
            {/* Art panel */}
            <Animated.View style={[styles.artPanel, artStyle]}>
                <View style={[styles.artCircle, { backgroundColor: item.artColor }]}>
                    <View style={styles.artCircleInner} />
                    <Text style={styles.artSymbol}>{item.symbol}</Text>
                </View>
                {/* Decorative shapes */}
                <View style={[styles.artDot, { top: 28, left: 24, width: 10, height: 10, opacity: 0.12 }]} />
                <View style={[styles.artDot, { bottom: 36, right: 28, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(26,24,20,0.18)", backgroundColor: "transparent" }]} />
                <View style={[styles.artDot, { top: "50%", right: 22, width: 8, height: 8, backgroundColor: item.artColor }]} />
                <Text style={styles.artIndexLabel}>— {String(index + 1).padStart(2, "0")} —</Text>
                <Text style={styles.artQuote}>{item.quote}</Text>
            </Animated.View>

            {/* Text content */}
            <Animated.View style={[styles.textBlock, textStyle]}>
                <Text style={styles.chapter}>— {item.chapter}</Text>
                <Text style={styles.headline}>{item.headline}</Text>
                <Text style={styles.body}>{item.body}</Text>
            </Animated.View>
        </View>
    );
};

// ── Animated dot indicator ────────────────────────────────────────────────────
const DotIndicator = ({ index, scrollX }) => {
    const dotStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
        const width  = interpolate(scrollX.value, inputRange, [18, 28, 18], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
        return { width, opacity };
    });

    const fillStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
        // Animate pixel width directly (dot container is 18–28px wide)
        const fillW = interpolate(scrollX.value, inputRange, [0, 28, 0], Extrapolation.CLAMP);
        return { width: fillW };
    });

    return (
        <Animated.View style={[styles.dot, dotStyle]}>
            <Animated.View style={[styles.dotFill, fillStyle]} />
        </Animated.View>
    );
};

// ── Next / Get started button ─────────────────────────────────────────────────
const NextButton = ({ onPress, isLast }) => {
    const pressed = useSharedValue(0);
    const btnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(pressed.value ? 0.92 : 1, { damping: 15 }) }],
    }));

    return (
        <Pressable
            onPressIn={() => { pressed.value = 1; }}
            onPressOut={() => { pressed.value = 0; }}
            onPress={onPress}
        >
            <Animated.View style={[styles.nextBtn, btnStyle]}>
                {isLast ? (
                    <Text style={styles.nextBtnTextLong}>Get started</Text>
                ) : (
                    <Text style={styles.nextBtnArrow}>→</Text>
                )}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.paper,
    },
    skipBtn: {
        position: "absolute",
        top: 56,
        right: 24,
        zIndex: 10,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    skipText: {
        fontSize: 13,
        fontWeight: "500",
        color: colors.ink3,
        letterSpacing: 0.2,
    },

    // Slides
    slide: {
        width: W,
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 0,
    },

    // Art
    artPanel: {
        height: H * 0.36,
        backgroundColor: colors.paper2,
        borderRadius: 28,
        marginBottom: 32,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
    },
    artCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    artCircleInner: {
        position: "absolute",
        inset: 14,
        borderRadius: 60,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(244,240,232,0.3)",
    },
    artSymbol: {
        fontSize: 52,
        color: colors.paper,
        fontWeight: "300",
        fontStyle: "italic",
        lineHeight: 60,
    },
    artDot: {
        position: "absolute",
        borderRadius: 999,
        backgroundColor: colors.ink,
    },
    artIndexLabel: {
        position: "absolute",
        top: 22,
        right: 56,
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.4,
        color: "rgba(26,24,20,0.35)",
        textTransform: "uppercase",
    },
    artQuote: {
        position: "absolute",
        bottom: 22,
        left: 22,
        fontSize: 11,
        color: "rgba(26,24,20,0.4)",
        fontStyle: "italic",
        letterSpacing: 0.2,
    },

    // Text
    textBlock: {
        flex: 1,
    },
    chapter: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: colors.coral,
        marginBottom: 14,
    },
    headline: {
        fontSize: 34,
        fontWeight: "300",
        color: colors.ink,
        letterSpacing: -1.0,
        lineHeight: 38,
        marginBottom: 16,
    },
    body: {
        fontSize: 14,
        color: colors.ink3,
        lineHeight: 22,
        maxWidth: 300,
    },

    // Bottom controls
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingBottom: 48,
        paddingTop: 20,
    },
    dotsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        height: 3,
        borderRadius: 2,
        backgroundColor: colors.line2,
        overflow: "hidden",
    },
    dotFill: {
        height: 3,
        backgroundColor: colors.ink,
        borderRadius: 2,
    },
    bottomRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    counter: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.ink3,
        letterSpacing: 0.5,
        fontVariant: ["tabular-nums"],
    },
    nextBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.ink,
        alignItems: "center",
        justifyContent: "center",
    },
    nextBtnArrow: {
        fontSize: 20,
        color: colors.paper,
        fontWeight: "300",
    },
    nextBtnTextLong: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.paper,
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },
});
