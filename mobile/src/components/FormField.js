import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const FormField = ({ label, error, ...props }) => {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput placeholderTextColor={colors.muted} style={[styles.input, error ? styles.inputError : null]} {...props} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 12,
    },
    label: {
        color: colors.text,
        fontWeight: "600",
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.surface,
        color: colors.text,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputError: {
        borderColor: colors.danger,
    },
    error: {
        color: colors.danger,
        marginTop: 5,
        fontSize: 12,
    },
});
