import { useState } from "react";
import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { layout } from "../theme/styles";
import { colors } from "../theme/colors";
import { validateAuth } from "../utils/validators";

export const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        const validationError = validateAuth({ email, password }, false);
        if (validationError) {
            Alert.alert("Validation", validationError);
            return;
        }

        try {
            setSubmitting(true);
            await login({ email, password });
        } catch (error) {
            Alert.alert("Login Failed", error?.response?.data?.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={layout.screen}>
            <View style={layout.content}>
                <AppHeader title="Welcome Back" subtitle="Track every cent with clarity and control." />
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Sign in to continue</Text>
                    <FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    <PrimaryButton title="Login" onPress={onSubmit} loading={submitting} />
                    <Pressable onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.switchLink}>No account? Create one</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    form: {
        marginTop: 8,
        backgroundColor: colors.bgSoft,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },
    formTitle: {
        color: colors.text,
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 12,
    },
    switchLink: {
        color: colors.primary,
        textAlign: "center",
        marginTop: 14,
        fontWeight: "700",
    },
});
