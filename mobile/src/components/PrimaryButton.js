import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const PrimaryButton = ({ title, onPress, loading, disabled }) => {
    const isDisabled = disabled || loading;

    return (
        <Pressable style={[styles.button, isDisabled ? styles.disabled : null]} onPress={onPress} disabled={isDisabled}>
            {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.label}>{title}</Text>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary,
        marginTop: 6,
    },
    disabled: {
        opacity: 0.6,
    },
    label: {
        color: colors.bg,
        fontWeight: "800",
        fontSize: 15,
    },
});
