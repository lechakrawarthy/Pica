import { useState } from "react";
import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { layout } from "../theme/styles";
import { colors } from "../theme/colors";
import { validateAuth } from "../utils/validators";

export const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        const validationError = validateAuth({ name, email, password }, true);
        if (validationError) {
            Alert.alert("Validation", validationError);
            return;
        }

        try {
            setSubmitting(true);
            await register({ name, email, password });
        } catch (error) {
            Alert.alert("Registration Failed", error?.response?.data?.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={layout.screen}>
            <View style={layout.content}>
                <AppHeader title="Create Account" subtitle="Build your money habits with daily tracking." />
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Start your expense journey</Text>
                    <FormField label="Name" value={name} onChangeText={setName} />
                    <FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    <FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    <PrimaryButton title="Register" onPress={onSubmit} loading={submitting} />
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.switchLink}>Already have an account? Sign in</Text>
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
