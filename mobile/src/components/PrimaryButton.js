// Pica Editorial — PrimaryButton
// Pill-shaped, ink-filled. One decisive action per screen.

import { Pressable, Text, ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export const PrimaryButton = ({ title, onPress, loading, disabled, variant = "primary" }) => {
    const isDisabled = disabled || loading;
    const isPrimary = variant === "primary";
    const isGhost = variant === "ghost";
    const isDanger = variant === "danger";

    return (
        <Pressable
            style={({ pressed }) => [
                styles.base,
                isPrimary && styles.primary,
                isGhost && styles.ghost,
                isDanger && styles.danger,
                pressed && !isDisabled && styles.pressed,
                isDisabled && styles.disabled,
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? (
                <ActivityIndicator
                    color={isPrimary || isDanger ? colors.paper : colors.ink}
                    size="small"
                />
            ) : (
                <Text
                    style={[
                        styles.label,
                        isGhost && styles.labelGhost,
                        isDanger && styles.labelDanger,
                    ]}
                >
                    {title}
                </Text>
            )}
        </Pressable>
    );
};

// Small icon + text action button
export const IconButton = ({ icon, label, onPress, style }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed, style]}
    >
        {icon}
        {label ? <Text style={styles.iconBtnLabel}>{label}</Text> : null}
    </Pressable>
);

// Circular FAB — the Add button in the tab bar / screens
export const FabButton = ({ onPress, size = 56 }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            styles.fab,
            { width: size, height: size, borderRadius: size / 2 },
            pressed && styles.fabPressed,
        ]}
    >
        <Text style={styles.fabIcon}>+</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    base: {
        height: 54,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    primary: {
        backgroundColor: colors.ink,
    },
    ghost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.line2,
    },
    danger: {
        backgroundColor: colors.coral,
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.4,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.paper,
        letterSpacing: 0.2,
    },
    labelGhost: {
        color: colors.ink,
    },
    labelDanger: {
        color: colors.paper,
    },

    // IconButton
    iconBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.line2,
    },
    iconBtnPressed: {
        backgroundColor: colors.paper2,
    },
    iconBtnLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.ink2,
        letterSpacing: 0.3,
    },

    // FAB
    fab: {
        backgroundColor: colors.ink,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    fabPressed: {
        opacity: 0.8,
    },
    fabIcon: {
        fontSize: 28,
        color: colors.paper,
        fontWeight: "300",
        lineHeight: 32,
        marginTop: -2,
    },
});
