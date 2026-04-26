// Pica Editorial — RegisterScreen
// "Let's begin quietly." Animated step indicator, staggered fields.

import { useState } from "react";
import {
    View, Text, ScrollView, Alert, StyleSheet, Pressable,
    KeyboardAvoidingView, Platform,
} from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, withSpring, FadeInDown,
} from "react-native-reanimated";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { validateAuth } from "../utils/validators";

const STEPS = ["Your details", "Preferences", "You're in"];

export const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [name, setName]         = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        const err = validateAuth({ name, email, password }, true);
        if (err) { Alert.alert("A small issue", err); return; }
        try {
            setSubmitting(true);
            await register({ name, email, password });
        } catch (e) {
            Alert.alert("Couldn't create account", e?.response?.data?.message || "Please try again in a moment.");
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
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hero}>
                    <Text style={styles.eyebrow}>— Chapter one</Text>
                    <Text style={styles.headline}>Let's begin{"\n"}quietly.</Text>
                    <Text style={styles.subline}>
                        No dashboards screaming for attention. Just your money, kept like a journal.
                    </Text>
                </Animated.View>

                {/* Animated step dots */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.stepRow}>
                    {STEPS.map((s, i) => (
                        <AnimatedStepDot key={s} index={i} active={i === 0} label={s} />
                    ))}
                    <Text style={styles.stepLabel}>01 / 03 — Your details</Text>
                </Animated.View>

                {/* Form */}
                <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.form}>
                    <FormField
                        label="Your name"
                        value={name}
                        onChangeText={setName}
                        placeholder="What should we call you?"
                        returnKeyType="next"
                        autoCapitalize="words"
                    />
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
                        placeholder="At least 8 characters"
                        returnKeyType="done"
                        onSubmitEditing={onSubmit}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(380).duration(400)}>
                    <PrimaryButton title="Create my account" onPress={onSubmit} loading={submitting} />
                </Animated.View>

                <Animated.Text entering={FadeInDown.delay(440).duration(400)} style={styles.legal}>
                    By continuing you agree to our{" "}
                    <Text style={styles.legalLink}>Terms</Text>
                    {" "}and{" "}
                    <Text style={styles.legalLink}>Privacy Policy</Text>.
                </Animated.Text>

                <Animated.View entering={FadeInDown.delay(480).duration(400)} style={styles.switchRow}>
                    <Text style={styles.switchText}>Already have an account?</Text>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.switchLink}> Sign in</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const AnimatedStepDot = ({ index, active }) => {
    const width = useSharedValue(active ? 32 : 22);
    const style = useAnimatedStyle(() => ({
        width: withSpring(width.value, { damping: 14 }),
        backgroundColor: active ? colors.ink : colors.line2,
    }));
    return <Animated.View style={[styles.dot, style]} />;
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

    hero: { marginBottom: 28 },
    eyebrow: {
        fontSize: 11, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.coral, marginBottom: 12,
    },
    headline: {
        fontSize: 34, fontWeight: "300", color: colors.ink,
        letterSpacing: -1.0, lineHeight: 38, marginBottom: 14,
    },
    subline: { fontSize: 14, color: colors.ink3, lineHeight: 22, maxWidth: 300 },

    stepRow: {
        flexDirection: "row", alignItems: "center",
        gap: 6, marginBottom: 32,
    },
    dot: {
        height: 3, borderRadius: 2,
    },
    stepLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.0,
        textTransform: "uppercase", color: colors.ink3, marginLeft: 6,
    },

    form: { marginBottom: 8 },

    legal: {
        marginTop: 16, textAlign: "center",
        fontSize: 11, color: colors.ink3, lineHeight: 18,
    },
    legalLink: { textDecorationLine: "underline", color: colors.ink2 },

    switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    switchText: { fontSize: 13, color: colors.ink3 },
    switchLink: {
        fontSize: 13, color: colors.ink,
        fontWeight: "600", textDecorationLine: "underline",
    },
});
