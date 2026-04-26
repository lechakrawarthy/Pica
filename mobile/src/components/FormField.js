// Spendly Editorial — FormField
// Borderless underline inputs. Clean, minimal, journalistic.

import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { colors } from "../theme/colors";

export const FormField = ({ label, error, secureTextEntry, ...props }) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(secureTextEntry || false);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, focused && styles.inputRowFocused, error && styles.inputRowError]}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.ink3}
                    secureTextEntry={hidden}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...props}
                />
                {secureTextEntry ? (
                    <Pressable onPress={() => setHidden(!hidden)} style={styles.eyeBtn}>
                        <Text style={styles.eyeText}>{hidden ? "Show" : "Hide"}</Text>
                    </Pressable>
                ) : null}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.line2,
        paddingBottom: 12,
    },
    inputRowFocused: {
        borderBottomWidth: 1.5,
        borderBottomColor: colors.ink,
    },
    inputRowError: {
        borderBottomColor: colors.coral,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.ink,
        fontWeight: "400",
        letterSpacing: -0.1,
        paddingVertical: 0,
        backgroundColor: "transparent",
    },
    eyeBtn: {
        paddingLeft: 12,
    },
    eyeText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.ink3,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    error: {
        marginTop: 6,
        fontSize: 12,
        color: colors.coral,
        letterSpacing: 0.1,
    },
});
