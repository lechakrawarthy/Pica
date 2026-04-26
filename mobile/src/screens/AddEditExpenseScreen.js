// Pica Editorial — AddEditExpenseScreen
// Real custom numpad. Budget alert on exceed. Haptic feedback on every key.
// Crisp withTiming animations — no spring wobble.

import { useEffect, useState, useCallback } from "react";
import {
    View, Text, ScrollView, Alert, StyleSheet, Pressable,
    TouchableOpacity, TextInput,
} from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, withSequence, FadeIn, FadeInDown,
    ZoomIn,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useExpenses } from "../context/ExpenseContext";
import { colors, getCategoryColor } from "../theme/colors";
import { validateExpense } from "../utils/validators";
import { formatCurrency } from "../utils/formatters";
import { hapticTap, hapticSuccess, hapticWarning, hapticError } from "../utils/feedback";

const CATEGORIES = [
    { id: "food",   label: "Food & Dining",  color: colors.coral },
    { id: "shop",   label: "Shopping",       color: colors.plum },
    { id: "trans",  label: "Transport",      color: colors.sage },
    { id: "health", label: "Health",         color: colors.gold },
    { id: "bills",  label: "Bills",          color: colors.rust },
    { id: "ent",    label: "Entertainment",  color: colors.plum },
    { id: "other",  label: "Other",          color: colors.ink3 },
];

const NUMPAD = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"],
];

export const AddEditExpenseScreen = ({ route, navigation }) => {
    const existing = route.params?.expense;
    const { addExpense, updateExpense, expenses } = useExpenses();

    const [amtStr, setAmtStr]     = useState(existing?.amount ? String(existing.amount) : "");
    const [category, setCategory] = useState(existing?.category || "");
    const [date, setDate]         = useState(
        existing?.date
            ? new Date(existing.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
    );
    const [note, setNote]       = useState(existing?.note || "");
    const [submitting, setSubmitting] = useState(false);
    const [budget, setBudget]   = useState(null); // loaded from AsyncStorage

    // Load budget on mount
    useEffect(() => {
        AsyncStorage.getItem("@pica_budget").then((v) => {
            if (v) setBudget(Number(v));
        }).catch(() => {});
    }, []);

    const amtScale   = useSharedValue(1);
    const saveScale  = useSharedValue(1);
    const cursorOp   = useSharedValue(1);
    const shakeX     = useSharedValue(0);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        const blink = setInterval(() => {
            cursorOp.value = withSequence(
                withTiming(0, { duration: 500 }),
                withTiming(1, { duration: 500 })
            );
        }, 1000);
        return () => clearInterval(blink);
    }, [navigation]);

    // Crisp scale snap — no spring wobble
    const pressKey = useCallback((key) => {
        hapticTap();
        if (key === "⌫") {
            setAmtStr((s) => s.slice(0, -1));
        } else if (key === ".") {
            setAmtStr((s) => (s.includes(".") ? s : s + "."));
        } else {
            setAmtStr((s) => (s === "0" ? key : s + key));
        }
        // Sharp punch animation on amount display
        amtScale.value = withSequence(
            withTiming(1.05, { duration: 60 }),
            withTiming(1, { duration: 100 })
        );
    }, []);

    // Shake animation for validation error
    const shake = () => {
        hapticError();
        shakeX.value = withSequence(
            withTiming(-8, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-6, { duration: 50 }),
            withTiming(6, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    // Check if this transaction will breach the monthly budget
    const checkBudgetAndSubmit = async () => {
        const amount = Number(amtStr);
        const payload = {
            amount,
            category,
            date: new Date(date).toISOString(),
            note,
        };

        const err = validateExpense(payload);
        if (err) { shake(); Alert.alert("One more thing", err); return; }

        if (budget && !existing) {
            // Calculate current month's total
            const now = new Date();
            const monthTotal = expenses
                .filter((e) => {
                    const d = new Date(e.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                })
                .reduce((s, e) => s + Number(e.amount || 0), 0);

            const newTotal = monthTotal + amount;
            const overage = newTotal - budget;

            if (newTotal > budget) {
                hapticWarning();
                // Show alert but let user decide — don't block them
                Alert.alert(
                    "Budget exceeded",
                    `This entry will put you ${formatCurrency(overage)} over your ${formatCurrency(budget)} monthly budget.\n\nYou've spent ${formatCurrency(monthTotal)} so far this month.`,
                    [
                        {
                            text: "Cancel entry",
                            style: "cancel",
                        },
                        {
                            text: "Save anyway",
                            style: "destructive",
                            onPress: () => doSave(payload),
                        },
                    ]
                );
                return;
            }
        }

        doSave(payload);
    };

    const doSave = async (payload) => {
        try {
            setSubmitting(true);
            saveScale.value = withTiming(0.95, { duration: 80 });
            if (existing) await updateExpense(existing._id, payload);
            else await addExpense(payload);
            hapticSuccess();
            saveScale.value = withTiming(1, { duration: 120 });
            navigation.goBack();
        } catch (e) {
            hapticError();
            saveScale.value = withTiming(1, { duration: 120 });
            Alert.alert("Couldn't save", e?.response?.data?.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const isEditing  = !!existing;
    const displayAmt = amtStr || "0";
    const amount     = Number(amtStr) || 0;

    // Live budget indicator
    const now = new Date();
    const monthTotal = expenses
        .filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((s, e) => s + Number(e.amount || 0), 0);
    const projectedTotal = monthTotal + amount;
    const wouldExceed = budget && !existing && projectedTotal > budget;

    const amtStyle    = useAnimatedStyle(() => ({
        transform: [{ scale: amtScale.value }, { translateX: shakeX.value }],
    }));
    const saveStyle   = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));
    const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOp.value }));

    return (
        <View style={styles.root}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.cancelBtn}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.screenTitle}>{isEditing ? "Edit entry" : "New entry"}</Text>
                <Animated.View style={saveStyle}>
                    <TouchableOpacity
                        onPress={checkBudgetAndSubmit}
                        disabled={submitting}
                        style={[styles.saveBtn, wouldExceed && styles.saveBtnWarn]}
                    >
                        <Text style={[styles.saveText, submitting && { opacity: 0.5 }, wouldExceed && styles.saveTextWarn]}>
                            {submitting ? "Saving..." : wouldExceed ? "Over budget" : "Save"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* ── Amount hero ── */}
            <Animated.View entering={FadeIn.duration(300)} style={styles.amtSection}>
                <Text style={styles.amtEyebrow}>— Amount —</Text>
                <Animated.View style={[styles.amtRow, amtStyle]}>
                    <Text style={[styles.amtCur, wouldExceed && { color: colors.coral }]}>₹</Text>
                    <Text style={[styles.amtDisplay, wouldExceed && { color: colors.coral }]}>
                        {displayAmt}
                    </Text>
                    <Animated.View style={[styles.cursor, cursorStyle]} />
                </Animated.View>

                {/* Live budget status */}
                {budget && amount > 0 ? (
                    <Animated.View entering={FadeIn.duration(200)} style={[styles.budgetPill, wouldExceed && styles.budgetPillWarn]}>
                        <Text style={[styles.budgetPillText, wouldExceed && styles.budgetPillTextWarn]}>
                            {wouldExceed
                                ? `${formatCurrency(projectedTotal - budget)} over your ${formatCurrency(budget)} budget`
                                : `${formatCurrency(budget - projectedTotal)} remaining of ${formatCurrency(budget)}`
                            }
                        </Text>
                    </Animated.View>
                ) : null}
            </Animated.View>

            <View style={styles.rule} />

            {/* ── Category chips ── */}
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.catSection}>
                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    {CATEGORIES.map((cat, idx) => (
                        <CategoryChip
                            key={cat.id}
                            cat={cat}
                            active={category === cat.label}
                            onPress={() => { hapticTap(); setCategory(cat.label); }}
                            delay={idx * 40}
                        />
                    ))}
                </ScrollView>
            </Animated.View>

            <View style={styles.rule} />

            {/* ── Meta fields (date, note) ── */}
            <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.metaRow}>
                <View style={styles.metaField}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <TextInput
                        style={styles.metaInput}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.ink3}
                        autoCapitalize="none"
                        selectionColor={colors.coral}
                    />
                </View>
                <View style={styles.metaDivider} />
                <View style={[styles.metaField, { flex: 2 }]}>
                    <Text style={styles.metaLabel}>Note</Text>
                    <TextInput
                        style={[styles.metaInput, styles.noteInput]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="A short reflection..."
                        placeholderTextColor={colors.ink3}
                        selectionColor={colors.coral}
                        returnKeyType="done"
                        multiline
                    />
                </View>
            </Animated.View>

            <View style={styles.rule} />

            {/* ── Numpad ── */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.numpad}>
                {NUMPAD.map((row, ri) => (
                    <View key={ri} style={styles.numpadRow}>
                        {row.map((key) => (
                            <NumKey key={key} label={key} onPress={() => pressKey(key)} />
                        ))}
                    </View>
                ))}
            </Animated.View>
        </View>
    );
};

// ── Category chip — crisp press ──────────────────────────────────────────────
const CategoryChip = ({ cat, active, onPress, delay }) => {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: active ? colors.ink : "transparent",
        borderColor: active ? colors.ink : colors.line2,
    }));
    return (
        <Animated.View entering={ZoomIn.delay(delay).duration(300)}>
            <Pressable
                onPressIn={() => { scale.value = withTiming(0.93, { duration: 80 }); }}
                onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
                onPress={onPress}
            >
                <Animated.View style={[styles.chip, style]}>
                    <View style={[styles.chipDot, { backgroundColor: cat.color, opacity: active ? 1 : 0.5 }]} />
                    <Text style={[styles.chipText, active && styles.chipTextOn]}>{cat.label}</Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

// ── Numpad key — instant snap ────────────────────────────────────────────────
const NumKey = ({ label, onPress }) => {
    const scale = useSharedValue(1);
    const bg    = useSharedValue(0);
    const isSpecial = label === "." || label === "⌫";

    const keyStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: `rgba(26,24,20,${bg.value * 0.07})`,
    }));

    return (
        <Pressable
            onPressIn={() => {
                scale.value = withTiming(0.85, { duration: 60 });
                bg.value    = withTiming(1,    { duration: 60 });
            }}
            onPressOut={() => {
                scale.value = withTiming(1, { duration: 120 });
                bg.value    = withTiming(0, { duration: 150 });
            }}
            onPress={onPress}
            style={styles.numKeyWrap}
        >
            <Animated.View style={[styles.numKey, keyStyle]}>
                <Text style={[styles.numKeyText, isSpecial && styles.numKeySpecial]}>
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.paper },

    topBar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: colors.line,
    },
    cancelBtn: { minWidth: 60, paddingVertical: 4 },
    cancelText: { fontSize: 14, color: colors.ink3, fontWeight: "500" },
    screenTitle: { fontSize: 15, fontWeight: "600", color: colors.ink, letterSpacing: -0.2, fontStyle: "italic" },
    saveBtn: { minWidth: 60, alignItems: "flex-end", paddingVertical: 4 },
    saveBtnWarn: {},
    saveText: { fontSize: 14, color: colors.coral, fontWeight: "700", letterSpacing: 0.1 },
    saveTextWarn: { color: colors.coral, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },

    amtSection: { alignItems: "center", paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24 },
    amtEyebrow: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.6,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 14,
    },
    amtRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
    amtCur: { fontSize: 26, color: colors.ink3, fontWeight: "300", marginTop: 10, lineHeight: 34 },
    amtDisplay: {
        fontSize: 62, fontWeight: "300", color: colors.ink,
        letterSpacing: -2, lineHeight: 70, fontVariant: ["tabular-nums"], minWidth: 30,
    },
    cursor: { width: 2, height: 44, backgroundColor: colors.coral, marginLeft: 4, marginTop: 14, borderRadius: 1 },

    // Live budget pill
    budgetPill: {
        marginTop: 10, paddingVertical: 5, paddingHorizontal: 14,
        borderRadius: 100, backgroundColor: colors.paper2,
        borderWidth: 1, borderColor: colors.line2,
    },
    budgetPillWarn: {
        backgroundColor: "rgba(232,85,58,0.08)",
        borderColor: "rgba(232,85,58,0.3)",
    },
    budgetPillText: { fontSize: 11, fontWeight: "600", color: colors.ink3, letterSpacing: 0.2 },
    budgetPillTextWarn: { color: colors.coral },

    rule: { height: 1, backgroundColor: colors.line },

    catSection: { paddingVertical: 16, paddingHorizontal: 24 },
    fieldLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.6,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 12,
    },
    chipsRow: { gap: 8, paddingBottom: 4 },
    chip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingVertical: 9, paddingHorizontal: 14,
        borderRadius: 100, borderWidth: 1,
    },
    chipDot: { width: 6, height: 6, borderRadius: 3 },
    chipText: { fontSize: 12, fontWeight: "500", color: colors.ink2 },
    chipTextOn: { color: colors.paper },

    metaRow: {
        flexDirection: "row", paddingVertical: 14,
        paddingHorizontal: 24, alignItems: "flex-start",
    },
    metaField: { flex: 1 },
    metaDivider: { width: 1, backgroundColor: colors.line, marginHorizontal: 16, height: 44, marginTop: 24 },
    metaLabel: {
        fontSize: 9, fontWeight: "600", letterSpacing: 1.6,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 8,
    },
    metaInput: { fontSize: 14, color: colors.ink, fontWeight: "400", paddingVertical: 0, backgroundColor: "transparent" },
    noteInput: { fontStyle: "italic", fontSize: 13, color: colors.ink2, lineHeight: 20 },

    numpad: { flex: 1, paddingHorizontal: 8, paddingVertical: 8 },
    numpadRow: { flexDirection: "row", flex: 1 },
    numKeyWrap: { flex: 1, padding: 4 },
    numKey: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 14 },
    numKeyText: { fontSize: 24, fontWeight: "400", color: colors.ink, letterSpacing: -0.5 },
    numKeySpecial: { fontSize: 18, fontWeight: "600", color: colors.ink3 },
});
