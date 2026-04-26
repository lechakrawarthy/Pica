import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const layout = StyleSheet.create({
    // Root screen — paper background
    screen: {
        flex: 1,
        backgroundColor: colors.paper,
    },
    // Screen with dark shell background (login, splash)
    screenDark: {
        flex: 1,
        backgroundColor: colors.shell,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
    },
    // Thin editorial rule
    rule: {
        height: 1,
        backgroundColor: colors.line,
        marginVertical: 0,
    },
    // Section separator
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    spaceBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
