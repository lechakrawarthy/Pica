// Pica Editorial — ProfileScreen
// Settings, budget configuration, user info, sign out.
// Clean editorial rows with animated press states.

import { useState, useEffect } from "react";
import {
    View, Text, ScrollView, StyleSheet, Pressable,
    Alert, TextInput,
} from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, FadeInDown,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

const BUDGET_PRESETS = [10000, 15000, 20000, 30000, 50000, 75000];

export const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [budget, setBudget]   = useState(20000);
    const [editing, setEditing] = useState(false);
    const [budgetInput, setBudgetInput] = useState("");

    useEffect(() => {
        AsyncStorage.getItem("@pica_budget").then((v) => {
            if (v) setBudget(Number(v));
        }).catch(() => {});
    }, []);

    const saveBudget = async (val) => {
        const num = Number(val);
        if (!num || num < 100) { Alert.alert("Invalid budget", "Enter a value above ₹100."); return; }
        await AsyncStorage.setItem("@pica_budget", String(num));
        setBudget(num);
        setEditing(false);
    };

    const onLogout = () => {
        Alert.alert(
            "Sign out?",
            "Your entries are saved. Come back anytime.",
            [
                { text: "Stay", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: logout },
            ]
        );
    };

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <View style={styles.root}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <View style={styles.markRow}>
                    <View style={styles.mark}><View style={styles.markDot} /></View>
                    <Text style={styles.brandName}>Pica</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Avatar + name ── */}
                <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || "—"}</Text>
                    <Text style={styles.userEmail}>{user?.email || "—"}</Text>
                </Animated.View>

                <View style={styles.rule} />

                {/* ── Budget section ── */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Monthly budget</Text>

                    {!editing ? (
                        <>
                            <View style={styles.budgetDisplay}>
                                <Text style={styles.budgetCur}>₹</Text>
                                <Text style={styles.budgetAmt}>{budget.toLocaleString("en-IN")}</Text>
                            </View>
                            <Text style={styles.budgetSub}>per month — tap to change</Text>
                            <RowItem
                                label="Change budget"
                                value={formatCurrency(budget)}
                                onPress={() => { setEditing(true); setBudgetInput(String(budget)); }}
                            />
                        </>
                    ) : (
                        <View style={styles.budgetEdit}>
                            <Text style={styles.fieldLabel}>New monthly budget</Text>
                            <View style={styles.editRow}>
                                <Text style={styles.editCur}>₹</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={budgetInput}
                                    onChangeText={setBudgetInput}
                                    keyboardType="number-pad"
                                    autoFocus
                                    selectionColor={colors.coral}
                                    placeholder="20000"
                                    placeholderTextColor={colors.ink3}
                                    returnKeyType="done"
                                    onSubmitEditing={() => saveBudget(budgetInput)}
                                />
                            </View>
                            {/* Presets */}
                            <View style={styles.presetsRow}>
                                {BUDGET_PRESETS.map((p) => (
                                    <PresetChip
                                        key={p}
                                        value={p}
                                        active={budgetInput === String(p)}
                                        onPress={() => setBudgetInput(String(p))}
                                    />
                                ))}
                            </View>
                            <View style={styles.editActions}>
                                <Pressable onPress={() => setEditing(false)} style={styles.editCancel}>
                                    <Text style={styles.editCancelText}>Cancel</Text>
                                </Pressable>
                                <Pressable onPress={() => saveBudget(budgetInput)} style={styles.editSave}>
                                    <Text style={styles.editSaveText}>Save budget</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </Animated.View>

                <View style={styles.rule} />

                {/* ── App settings ── */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>App</Text>
                    <RowItem label="Currency" value="Indian Rupee (₹)" />
                    <RowItem label="Language" value="English" />
                    <RowItem label="Week starts" value="Monday" />
                </Animated.View>

                <View style={styles.rule} />

                {/* ── Account ── */}
                <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <RowItem label="Privacy policy" />
                    <RowItem label="Terms of service" />
                    <RowItem label="Open source licenses" />
                </Animated.View>

                <View style={styles.rule} />

                {/* ── Sign out ── */}
                <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.signOutSection}>
                    <Pressable onPress={onLogout} style={styles.signOutBtn}>
                        <Text style={styles.signOutText}>Sign out</Text>
                    </Pressable>
                    <Text style={styles.versionText}>Pica v1.0 — Money, made personal</Text>
                </Animated.View>

            </ScrollView>
        </View>
    );
};

// ── Row item with animated press ─────────────────────────────────────────────
const RowItem = ({ label, value, onPress }) => {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable
            onPressIn={() => { if (onPress) scale.value = withTiming(0.98, { duration: 80 }); }}
            onPressOut={() => { if (onPress) scale.value = withTiming(1, { duration: 150 }); }}
            onPress={onPress}
        >
            <Animated.View style={[styles.rowItem, style]}>
                <Text style={styles.rowLabel}>{label}</Text>
                {value ? <Text style={styles.rowValue}>{value}</Text> : null}
                {onPress ? <Text style={styles.rowChevron}>›</Text> : null}
            </Animated.View>
        </Pressable>
    );
};

// ── Budget preset chip ────────────────────────────────────────────────────────
const PresetChip = ({ value, active, onPress }) => {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: active ? colors.ink : "transparent",
        borderColor: active ? colors.ink : colors.line2,
    }));
    return (
        <Pressable
            onPressIn={() => { scale.value = withTiming(0.93, { duration: 80 }); }}
            onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
            onPress={onPress}
        >
            <Animated.View style={[styles.presetChip, style]}>
                <Text style={[styles.presetText, active && { color: colors.paper }]}>
                    {value >= 100000 ? "₹1L" : `₹${(value / 1000).toFixed(0)}K`}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.paper },
    topBar: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 4,
    },
    markRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    mark: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 1, borderColor: colors.line3,
        alignItems: "center", justifyContent: "center",
    },
    markDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.coral },
    brandName: { fontSize: 14, fontWeight: "600", color: colors.ink, letterSpacing: -0.2 },

    scroll: { paddingBottom: 60 },

    // Avatar
    avatarSection: { alignItems: "center", paddingVertical: 32, gap: 8 },
    avatar: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.ink,
        alignItems: "center", justifyContent: "center",
        marginBottom: 4,
    },
    avatarText: { fontSize: 22, fontWeight: "500", color: colors.paper, letterSpacing: -0.5 },
    userName: { fontSize: 20, fontWeight: "400", color: colors.ink, letterSpacing: -0.4 },
    userEmail: { fontSize: 13, color: colors.ink3, letterSpacing: 0.1 },

    rule: { height: 1, backgroundColor: colors.line, marginHorizontal: 24 },

    section: { paddingHorizontal: 24, paddingVertical: 20 },
    sectionTitle: {
        fontSize: 18, fontWeight: "500", color: colors.ink,
        letterSpacing: -0.3, fontStyle: "italic", marginBottom: 16,
    },

    // Budget display
    budgetDisplay: { flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 4 },
    budgetCur: { fontSize: 20, color: colors.ink3, fontWeight: "300", marginTop: 8, lineHeight: 28 },
    budgetAmt: { fontSize: 44, fontWeight: "300", color: colors.ink, letterSpacing: -1.5, lineHeight: 52, fontVariant: ["tabular-nums"] },
    budgetSub: { fontSize: 12, color: colors.ink3, marginBottom: 16 },

    // Budget edit
    budgetEdit: { gap: 16 },
    fieldLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    editRow: { flexDirection: "row", alignItems: "flex-start", gap: 4, borderBottomWidth: 1.5, borderBottomColor: colors.ink, paddingBottom: 8 },
    editCur: { fontSize: 20, color: colors.ink3, fontWeight: "300", marginTop: 8, lineHeight: 28 },
    editInput: {
        fontSize: 40, fontWeight: "300", color: colors.ink,
        letterSpacing: -1.2, flex: 1, paddingVertical: 0,
        fontVariant: ["tabular-nums"], backgroundColor: "transparent",
    },
    presetsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    presetChip: {
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 100, borderWidth: 1,
    },
    presetText: { fontSize: 12, fontWeight: "600", color: colors.ink2 },
    editActions: { flexDirection: "row", gap: 10 },
    editCancel: {
        flex: 1, height: 46, borderRadius: 100,
        borderWidth: 1, borderColor: colors.line2,
        alignItems: "center", justifyContent: "center",
    },
    editCancelText: { fontSize: 13, fontWeight: "600", color: colors.ink3 },
    editSave: {
        flex: 2, height: 46, borderRadius: 100,
        backgroundColor: colors.ink,
        alignItems: "center", justifyContent: "center",
    },
    editSaveText: { fontSize: 13, fontWeight: "600", color: colors.paper },

    // Row items
    rowItem: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line,
    },
    rowLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.ink, letterSpacing: -0.1 },
    rowValue: { fontSize: 13, color: colors.ink3, marginRight: 6 },
    rowChevron: { fontSize: 18, color: colors.ink3, fontWeight: "300" },

    // Sign out
    signOutSection: { paddingHorizontal: 24, paddingTop: 24, alignItems: "center", gap: 16 },
    signOutBtn: {
        width: "100%", height: 50, borderRadius: 100,
        borderWidth: 1, borderColor: "rgba(200,70,40,0.3)",
        alignItems: "center", justifyContent: "center",
    },
    signOutText: { fontSize: 14, fontWeight: "600", color: colors.coral, letterSpacing: 0.2 },
    versionText: { fontSize: 11, color: colors.ink3, fontStyle: "italic", letterSpacing: 0.2 },
});
