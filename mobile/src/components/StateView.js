// Pica Editorial — StateView
// Quiet, literary empty and error states. No screaming icons.

import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const StateView = ({ loading, error, empty, emptyText, onRetry }) => {
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color={colors.ink3} />
                <Text style={styles.loadingText}>Reading your entries...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorMark}>—</Text>
                <Text style={styles.errorTitle}>Something went quiet</Text>
                <Text style={styles.errorBody}>
                    We couldn't reach your data. Check your connection and try again.
                </Text>
                {onRetry ? (
                    <Pressable onPress={onRetry} style={styles.retryBtn}>
                        <Text style={styles.retryLabel}>Try again</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    }

    if (empty) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyMark}>○</Text>
                <Text style={styles.emptyTitle}>Nothing here yet.</Text>
                <Text style={styles.emptyBody}>
                    {emptyText || "Start adding entries and your journal will take shape."}
                </Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    center: {
        paddingVertical: 48,
        alignItems: "center",
        gap: 10,
    },
    loadingText: {
        fontSize: 13,
        color: colors.ink3,
        letterSpacing: 0.2,
        marginTop: 6,
    },

    // Error
    errorMark: {
        fontSize: 28,
        color: colors.coral,
        fontWeight: "300",
        lineHeight: 32,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.ink,
        letterSpacing: -0.2,
        marginTop: 4,
    },
    errorBody: {
        fontSize: 13,
        color: colors.ink3,
        textAlign: "center",
        lineHeight: 20,
        maxWidth: 260,
    },
    retryBtn: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 22,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.line3,
    },
    retryLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },

    // Empty
    emptyMark: {
        fontSize: 24,
        color: colors.ink3,
        lineHeight: 28,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.ink,
        letterSpacing: -0.2,
    },
    emptyBody: {
        fontSize: 13,
        color: colors.ink3,
        textAlign: "center",
        lineHeight: 20,
        maxWidth: 240,
    },
});
