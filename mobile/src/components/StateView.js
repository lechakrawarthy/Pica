import { ActivityIndicator, View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const StateView = ({ loading, error, empty, onRetry, emptyText }) => {
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.hint}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
                {onRetry ? (
                    <Pressable style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    }

    if (empty) {
        return (
            <View style={styles.center}>
                <Text style={styles.hint}>{emptyText || "No data found."}</Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    center: {
        paddingVertical: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    hint: {
        marginTop: 12,
        color: colors.muted,
        textAlign: "center",
    },
    error: {
        color: colors.danger,
        textAlign: "center",
        marginBottom: 10,
    },
    retryButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    retryText: {
        color: colors.text,
        fontWeight: "600",
    },
});
