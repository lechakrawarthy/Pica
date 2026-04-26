import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const AppHeader = ({ title, subtitle }) => {
    return (
        <LinearGradient
            colors={["#0F172A", "#0B1324", "#1E293B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 22,
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: "#243449",
        marginBottom: 14,
    },
    title: {
        color: colors.white,
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 0.4,
    },
    subtitle: {
        color: "#BFD7EA",
        marginTop: 6,
        fontSize: 13,
    },
});
