// Pica Editorial — AddEditExpenseScreen
// "New entry" — full editorial journal page.
// REAL custom numpad (matching the HTML design), animated amount, category chips.

import { useEffect, useState, useCallback } from "react";
import {
    View, Text, ScrollView, Alert, StyleSheet, Pressable,
    TouchableOpacity, KeyboardAvoidingView, Platform, TextInput,
} from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withSpring, withTiming, withSequence, FadeIn, FadeInDown,
    ZoomIn,
} from "react-native-reanimated";
import { useExpenses } from "../context/ExpenseContext";
import { colors, getCategoryColor } from "../theme/colors";
import { validateExpense } from "../utils/validators";

const CATEGORIES = [
    { id: "food",    label: "Food & Dining",    color: colors.coral },
    { id: "shop",    label: "Shopping",         color: "#5E3A5C" },
    { id: "trans",   label: "Transport",        color: colors.sage },
    { id: "health",  label: "Health",           color: colors.gold },
    { id: "bills",   label: "Bills",            color: colors.rust },
    { id: "ent",     label: "Entertainment",    color: "#5E3A5C" },
    { id: "other",   label: "Other",            color: colors.ink3 },
];

const NUMPAD = [
    ["1","2","3"],
    ["4","5","6"],
    ["7","8","9"],
    [".","0","⌫"],
];

export const AddEditExpenseScreen = ({ route, navigation }) => {
    const existing = route.params?.expense;
    const { addExpense, updateExpense } = useExpenses();

    const [amtStr, setAmtStr]     = useState(existing?.amount ? String(existing.amount) : "");
    const [category, setCategory] = useState(existing?.category || "");
    const [date, setDate]         = useState(
        existing?.date
            ? new Date(existing.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
    );
    const [note, setNote]         = useState(existing?.note || "");
    const [submitting, setSubmitting] = useState(false);

    const amtScale  = useSharedValue(1);
    const saveScale = useSharedValue(1);
    const cursorOp  = useSharedValue(1);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        // Cursor blink
        const blink = setInterval(() => {
            cursorOp.value = withSequence(
                withTiming(0, { duration: 500 }),
                withTiming(1, { duration: 500 })
            );
        }, 1000);
        return () => clearInterval(blink);
    }, [navigation]);

    const pressKey = useCallback((key) => {
        if (key === "⌫") {
            setAmtStr((s) => s.slice(0, -1));
        } else if (key === ".") {
            setAmtStr((s) => (s.includes(".") ? s : s + "."));
        } else {
            setAmtStr((s) => {
                if (s === "0") return key;
                return s + key;
            });
        }
        amtScale.value = withSequence(
            withSpring(1.06, { damping: 8 }),
            withSpring(1, { damping: 12 })
        );
    }, []);

    const onSubmit = async () => {
        const payload = {
            amount: Number(amtStr),
            category,
            date: new Date(date).toISOString(),
            note,
        };
        const err = validateExpense(payload);
        if (err) { Alert.alert("One more thing", err); return; }
        try {
            setSubmitting(true);
            saveScale.value = withSpring(0.95, { damping: 10 });
            if (existing) await updateExpense(existing._id, payload);
            else await addExpense(payload);
            navigation.goBack();
        } catch (e) {
            saveScale.value = withSpring(1);
            Alert.alert("Couldn't save", e?.response?.data?.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const isEditing  = !!existing;
    const catColor   = getCategoryColor(category);
    const displayAmt = amtStr || "0";

    const amtStyle  = useAnimatedStyle(() => ({ transform: [{ scale: amtScale.value }] }));
    const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));
    const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOp.value }));

    return (
        <View style={styles.root}>
            {/* ── Top bar ── */}
            <View style={styles.topBar}>
                <Pressable onPress={() => navigation.goBack()} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.screenTitle}>{isEditing ? "Edit entry" : "New entry"}</Text>
                <Animated.View style={saveStyle}>
                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={submitting}
                        style={styles.saveBtn}
                    >
                        <Text style={[styles.saveText, submitting && { opacity: 0.5 }]}>
                            {submitting ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* ── Amount hero ── */}
            <Animated.View entering={FadeIn.duration(300)} style={styles.amtSection}>
                <Text style={styles.amtEyebrow}>— Amount —</Text>
                <Animated.View style={[styles.amtRow, amtStyle]}>
                    <Text style={styles.amtCur}>₹</Text>
                    <Text style={styles.amtDisplay}>{displayAmt}</Text>
                    <Animated.View style={[styles.cursor, cursorStyle]} />
                </Animated.View>
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
                            onPress={() => setCategory(cat.label)}
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

// ── Category chip with spring press ─────────────────────────────────────────
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
                onPressIn={() => { scale.value = withSpring(0.92, { damping: 10 }); }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 10 }); }}
                onPress={onPress}
            >
                <Animated.View style={[styles.chip, style]}>
                    <View style={[styles.chipDot, { backgroundColor: active ? cat.color : cat.color, opacity: active ? 1 : 0.5 }]} />
                    <Text style={[styles.chipText, active && styles.chipTextOn]}>{cat.label}</Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

// ── Numpad key with spring animation ─────────────────────────────────────────
const NumKey = ({ label, onPress }) => {
    const scale = useSharedValue(1);
    const bg    = useSharedValue(0);
    const isSpecial = label === "." || label === "⌫";

    const keyStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: `rgba(26,24,20,${bg.value * 0.06})`,
    }));

    return (
        <Pressable
            onPressIn={() => {
                scale.value = withSpring(0.88, { damping: 10, stiffness: 300 });
                bg.value = withTiming(1, { duration: 80 });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { damping: 12, stiffness: 200 });
                bg.value = withTiming(0, { duration: 200 });
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

    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    cancelBtn: { minWidth: 60, paddingVertical: 4 },
    cancelText: { fontSize: 14, color: colors.ink3, fontWeight: "500" },
    screenTitle: {
        fontSize: 15, fontWeight: "600", color: colors.ink,
        letterSpacing: -0.2, fontStyle: "italic",
    },
    saveBtn: { minWidth: 60, alignItems: "flex-end", paddingVertical: 4 },
    saveText: { fontSize: 14, color: colors.coral, fontWeight: "700", letterSpacing: 0.1 },

    // Amount
    amtSection: {
        alignItems: "center",
        paddingVertical: 24,
        paddingHorizontal: 24,
    },
    amtEyebrow: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.6,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 14,
    },
    amtRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    amtCur: {
        fontSize: 26, color: colors.ink3, fontWeight: "300",
        marginTop: 10, lineHeight: 34,
    },
    amtDisplay: {
        fontSize: 62, fontWeight: "300", color: colors.ink,
        letterSpacing: -2, lineHeight: 70,
        fontVariant: ["tabular-nums"], minWidth: 30,
    },
    cursor: {
        width: 2, height: 44, backgroundColor: colors.coral,
        marginLeft: 4, marginTop: 14, borderRadius: 1,
    },

    rule: { height: 1, backgroundColor: colors.line },

    // Category
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

    // Meta fields
    metaRow: {
        flexDirection: "row",
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 0,
        alignItems: "flex-start",
    },
    metaField: { flex: 1 },
    metaDivider: { width: 1, backgroundColor: colors.line, marginHorizontal: 16, height: 44, marginTop: 24 },
    metaLabel: {
        fontSize: 9, fontWeight: "600", letterSpacing: 1.6,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 8,
    },
    metaInput: {
        fontSize: 14, color: colors.ink, fontWeight: "400",
        paddingVertical: 0, backgroundColor: "transparent",
    },
    noteInput: {
        fontStyle: "italic", fontSize: 13, color: colors.ink2,
        lineHeight: 20,
    },

    // Numpad
    numpad: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    numpadRow: {
        flexDirection: "row",
        flex: 1,
    },
    numKeyWrap: {
        flex: 1,
        padding: 4,
    },
    numKey: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
    },
    numKeyText: {
        fontSize: 24,
        fontWeight: "400",
        color: colors.ink,
        letterSpacing: -0.5,
    },
    numKeySpecial: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.ink3,
    },
});
