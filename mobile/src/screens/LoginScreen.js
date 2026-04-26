// Pica Editorial — LoginScreen
// "Welcome back. Pick up where you left off."
// Paper background, ink form fields, coral CTA.

import { useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { validateAuth } from "../utils/validators";

export const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        const err = validateAuth({ email, password }, false);
        if (err) { Alert.alert("Check your details", err); return; }
        try {
            setSubmitting(true);
            await login({ email, password });
        } catch (e) {
            Alert.alert("Couldn't sign in", e?.message || "Double-check your email and password.");
        } finally {
            setSubmitting(false);
        }
    };

    const onUseDemo = async () => {
        try {
            setSubmitting(true);
            setEmail("demo@pica.app");
            setPassword("Pica@12345");
            await login({ email: "demo@pica.app", password: "Pica@12345" });
        } catch (e) {
            Alert.alert("Demo login failed", e?.message || "Start backend server and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Brand mark */}
                <View style={styles.markRow}>
                    <View style={styles.mark}>
                        <View style={styles.markDot} />
                    </View>
                    <Text style={styles.brandName}>Pica</Text>
                </View>

                {/* Hero copy */}
                <View style={styles.hero}>
                    <Text style={styles.eyebrow}>— Welcome back</Text>
                    <Text style={styles.headline}>Your money{"\n"}has been waiting.</Text>
                    <Text style={styles.subline}>
                        Pick up where you left off. Every entry still here, just as you left it.
                    </Text>
                </View>

                {/* Divider */}
                <View style={styles.rule} />

                {/* Form */}
                <View style={styles.form}>
                    <FormField
                        label="Email address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        returnKeyType="next"
                    />
                    <FormField
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Your password"
                        returnKeyType="done"
                        onSubmitEditing={onSubmit}
                    />
                    <Pressable style={styles.forgotRow}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </Pressable>
                </View>

                {/* Primary CTA */}
                <PrimaryButton
                    title="Sign in"
                    onPress={onSubmit}
                    loading={submitting}
                />

                <PrimaryButton
                    title="Use demo account"
                    onPress={onUseDemo}
                    disabled={submitting}
                    variant="ghost"
                />

                {/* Switch link */}
                <View style={styles.switchRow}>
                    <Text style={styles.switchText}>No account yet?</Text>
                    <Pressable onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.switchLink}> Create one</Text>
                    </Pressable>
                </View>

                {/* Footer quote */}
                <Text style={styles.footer}>
                    "Every rupee, noticed." — Pica
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.paper,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 64,
        paddingBottom: 40,
    },

    // Brand mark
    markRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 40,
    },
    mark: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.line3,
        alignItems: "center",
        justifyContent: "center",
    },
    markDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: colors.coral,
    },
    brandName: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: -0.2,
    },

    // Hero
    hero: {
        marginBottom: 36,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: colors.coral,
        marginBottom: 12,
    },
    headline: {
        fontSize: 34,
        fontWeight: "300",
        color: colors.ink,
        letterSpacing: -1.0,
        lineHeight: 38,
        marginBottom: 14,
    },
    subline: {
        fontSize: 14,
        color: colors.ink3,
        lineHeight: 22,
        maxWidth: 300,
    },

    rule: {
        height: 1,
        backgroundColor: colors.line,
        marginBottom: 32,
    },

    // Form
    form: {
        marginBottom: 8,
    },
    forgotRow: {
        alignSelf: "flex-end",
        marginTop: -8,
        marginBottom: 28,
    },
    forgotText: {
        fontSize: 12,
        color: colors.ink2,
        textDecorationLine: "underline",
        letterSpacing: 0.1,
    },

    // Switch
    switchRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 14,
    },
    switchText: {
        fontSize: 13,
        color: colors.ink3,
    },
    switchLink: {
        fontSize: 13,
        color: colors.ink,
        fontWeight: "600",
        textDecorationLine: "underline",
    },

    // Footer
    footer: {
        marginTop: 36,
        textAlign: "center",
        fontSize: 11,
        color: colors.ink3,
        fontStyle: "italic",
        letterSpacing: 0.3,
        lineHeight: 18,
    },
});
