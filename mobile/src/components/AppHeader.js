// Pica Editorial — AppHeader
// A minimal mark + wordmark bar. No gradients, just paper and ink.

import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../theme/colors";

export const AppHeader = ({ title, subtitle, rightAction, rightLabel }) => {
    return (
        <View style={styles.container}>
            <View style={styles.mark}>
                <View style={styles.markDot} />
            </View>
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {rightAction ? (
                <Pressable onPress={rightAction} style={styles.rightBtn}>
                    <Text style={styles.rightLabel}>{rightLabel || "More"}</Text>
                </Pressable>
            ) : null}
        </View>
    );
};

// Compact inline header used inside screens (e.g. Journal screen top row)
export const ScreenHeader = ({ eyebrow, headline, right }) => (
    <View style={styles.screenHeader}>
        <View style={{ flex: 1 }}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.screenHeadline}>{headline}</Text>
        </View>
        {right || null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18,
        gap: 12,
    },
    mark: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line3,
        alignItems: "center",
        justifyContent: "center",
    },
    markDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.coral,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: -0.2,
    },
    subtitle: {
        fontSize: 12,
        color: colors.ink3,
        marginTop: 1,
        letterSpacing: 0.1,
    },
    rightBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.line2,
    },
    rightLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.ink2,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },

    // ScreenHeader
    screenHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.6,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 4,
    },
    screenHeadline: {
        fontSize: 26,
        fontWeight: "400",
        color: colors.ink,
        letterSpacing: -0.6,
        lineHeight: 30,
    },
});
