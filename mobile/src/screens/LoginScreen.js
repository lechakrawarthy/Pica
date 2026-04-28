// Pica Editorial — LoginScreen
// "Your money has been waiting."
// Paper background, animated underline fields, coral CTA, OAuth buttons.

import { useState } from "react";
import {
    View, Text, ScrollView, Alert, StyleSheet, Pressable,
    KeyboardAvoidingView, Platform, TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, FadeInDown,
} from "react-native-reanimated";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { validateAuth } from "../utils/validators";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OAuthButton = ({ label, icon, onPress, delay = 0 }) => {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
            <AnimatedPressable
                style={[styles.oauthBtn, style]}
                onPressIn={() => { scale.value = withTiming(0.96, { duration: 80 }); }}
                onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
                onPress={onPress}
            >
                <Text style={styles.oauthIcon}>{icon}</Text>
                <Text style={styles.oauthLabel}>{label}</Text>
            </AnimatedPressable>
        </Animated.View>
    );
};

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
            Alert.alert("Couldn't sign in", e?.response?.data?.message || "Double-check your email and password.");
        } finally {
            setSubmitting(false);
        }
    };

    const onDemoLogin = async () => {
        try {
            setSubmitting(true);
            await login({ email: "demo@pica.app", password: "Pica@12345" });
        } catch (e) {
            Alert.alert("Demo unavailable", "Start the backend server and try again.");
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
                <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.markRow}>
                    <View style={styles.mark}>
                        <View style={styles.markDot} />
                    </View>
                    <Text style={styles.brandName}>Pica</Text>
                </Animated.View>

                {/* Hero */}
                <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.hero}>
                    <Text style={styles.eyebrow}>— Welcome back</Text>
                    <Text style={styles.headline}>Your money{"\n"}has been waiting.</Text>
                    <Text style={styles.subline}>
                        Pick up where you left off. Every entry still here, just as you left it.
                    </Text>
                </Animated.View>

                <View style={styles.rule} />

                {/* Form */}
                <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.form}>
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
                </Animated.View>

                {/* Primary CTA */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <PrimaryButton title="Sign in" onPress={onSubmit} loading={submitting} />
                </Animated.View>

                {/* Divider */}
                <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                </Animated.View>

                {/* OAuth buttons */}
                <OAuthButton
                    label="Continue with Google"
                    icon="G"
                    onPress={() => Alert.alert("Coming soon", "Google sign-in is coming in the next release.")}
                    delay={420}
                />
                <OAuthButton
                    label="Continue with Apple"
                    icon=""
                    onPress={() => Alert.alert("Coming soon", "Apple sign-in is coming in the next release.")}
                    delay={480}
                />
                {__DEV__ ? (
                    <OAuthButton
                        label="Try demo account"
                        icon="◉"
                        onPress={onDemoLogin}
                        delay={540}
                    />
                ) : (
                    <OAuthButton
                        label="Try demo account"
                        icon="◉"
                        onPress={() => Alert.alert("Coming soon", "Demo account is not available in the production app. It will be enabled in a future release.")}
                        delay={540}
                    />
                )}

                {/* Switch */}
                <Animated.View entering={FadeInDown.delay(580).duration(400)} style={styles.switchRow}>
                    <Text style={styles.switchText}>No account yet?</Text>
                    <Pressable onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.switchLink}> Create one</Text>
                    </Pressable>
                </Animated.View>

                <Text style={styles.footer}>"Every rupee, noticed." — Pica</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.paper },
    scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },

    markRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
    mark: {
        width: 30, height: 30, borderRadius: 15,
        borderWidth: 1, borderColor: colors.line3,
        alignItems: "center", justifyContent: "center",
    },
    markDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.coral },
    brandName: { fontSize: 15, fontWeight: "600", color: colors.ink, letterSpacing: -0.2 },

    hero: { marginBottom: 36 },
    eyebrow: {
        fontSize: 11, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.coral, marginBottom: 12,
    },
    headline: {
        fontSize: 34, fontWeight: "300", color: colors.ink,
        letterSpacing: -1.0, lineHeight: 38, marginBottom: 14,
    },
    subline: { fontSize: 14, color: colors.ink3, lineHeight: 22, maxWidth: 300 },

    rule: { height: 1, backgroundColor: colors.line, marginBottom: 32 },

    form: { marginBottom: 8 },
    forgotRow: { alignSelf: "flex-end", marginTop: -8, marginBottom: 28 },
    forgotText: { fontSize: 12, color: colors.ink2, textDecorationLine: "underline", letterSpacing: 0.1 },

    // Divider
    dividerRow: {
        flexDirection: "row", alignItems: "center",
        gap: 12, marginVertical: 18,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
    dividerText: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.0,
        textTransform: "uppercase", color: colors.ink3,
    },

    // OAuth
    oauthBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        height: 50,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.line2,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    oauthIcon: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.ink,
        width: 22,
        textAlign: "center",
    },
    oauthLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.ink,
        letterSpacing: -0.1,
    },

    switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    switchText: { fontSize: 13, color: colors.ink3 },
    switchLink: {
        fontSize: 13, color: colors.ink,
        fontWeight: "600", textDecorationLine: "underline",
    },
    footer: {
        marginTop: 36, textAlign: "center",
        fontSize: 11, color: colors.ink3, fontStyle: "italic",
        letterSpacing: 0.3, lineHeight: 18,
    },
});
