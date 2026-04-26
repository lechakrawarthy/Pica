import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const layout = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    subtitle: {
        color: colors.muted,
        marginTop: 4,
        fontSize: 14,
    },
});
