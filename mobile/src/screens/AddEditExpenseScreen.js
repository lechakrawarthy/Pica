// Pica Editorial — AddEditExpenseScreen
// "New entry" — minimal, focused, like opening a fresh journal page.
// Category chips, clean underline inputs, amount as the hero.

import { useEffect, useState } from "react";
import {
    View, Text, ScrollView, Alert, StyleSheet, Pressable,
    TextInput, KeyboardAvoidingView, Platform, TouchableOpacity,
} from "react-native";
import { useExpenses } from "../context/ExpenseContext";
import { colors, getCategoryColor } from "../theme/colors";
import { validateExpense } from "../utils/validators";

const CATEGORIES = [
    "Food & Dining",
    "Shopping",
    "Transport",
    "Health",
    "Bills",
    "Entertainment",
    "Other",
];

export const AddEditExpenseScreen = ({ route, navigation }) => {
    const existing = route.params?.expense;
    const { addExpense, updateExpense } = useExpenses();

    const [amount, setAmount]     = useState(existing?.amount ? String(existing.amount) : "");
    const [category, setCategory] = useState(existing?.category || "");
    const [date, setDate]         = useState(
        existing?.date
            ? new Date(existing.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
    );
    const [note, setNote]         = useState(existing?.note || "");
    const [submitting, setSubmitting] = useState(false);
    const [amtFocused, setAmtFocused] = useState(false);

    const isEditing = !!existing;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const onSubmit = async () => {
        const payload = {
            amount: Number(amount),
            category,
            date: new Date(date).toISOString(),
            note,
        };
        const err = validateExpense(payload);
        if (err) { Alert.alert("One more thing", err); return; }

        try {
            setSubmitting(true);
            if (isEditing) await updateExpense(existing._id, payload);
            else await addExpense(payload);
            navigation.goBack();
        } catch (e) {
            Alert.alert("Couldn't save", e?.response?.data?.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const catColor = getCategoryColor(category);

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Top bar */}
            <View style={styles.topBar}>
                <Pressable onPress={() => navigation.goBack()} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.screenTitle}>{isEditing ? "Edit entry" : "New entry"}</Text>
                <TouchableOpacity onPress={onSubmit} disabled={submitting} style={styles.saveBtn}>
                    <Text style={[styles.saveText, submitting && styles.saveDisabled]}>
                        {submitting ? "Saving..." : "Save"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Amount hero — the most important field */}
                <View style={styles.amtSection}>
                    <Text style={styles.amtEyebrow}>— Amount</Text>
                    <View style={[styles.amtRow, amtFocused && styles.amtRowFocused]}>
                        <Text style={styles.amtCurrency}>₹</Text>
                        <TextInput
                            style={styles.amtInput}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor={colors.line3}
                            onFocus={() => setAmtFocused(true)}
                            onBlur={() => setAmtFocused(false)}
                            returnKeyType="done"
                            selectionColor={colors.coral}
                        />
                    </View>
                </View>

                <View style={styles.rule} />

                {/* Category chips */}
                <View style={styles.section}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {CATEGORIES.map((cat) => {
                            const isOn = category === cat;
                            const chipColor = getCategoryColor(cat);
                            return (
                                <Pressable
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    style={[
                                        styles.chip,
                                        isOn && { backgroundColor: colors.ink, borderColor: colors.ink },
                                    ]}
                                >
                                    {isOn ? (
                                        <View style={[styles.chipDot, { backgroundColor: chipColor }]} />
                                    ) : (
                                        <View style={[styles.chipDot, { backgroundColor: chipColor, opacity: 0.4 }]} />
                                    )}
                                    <Text style={[styles.chipText, isOn && styles.chipTextOn]}>
                                        {cat}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Custom category fallback */}
                    {!CATEGORIES.includes(category) && category.length > 0 ? (
                        <View style={styles.customCatBadge}>
                            <View style={[styles.chipDot, { backgroundColor: colors.ink3 }]} />
                            <Text style={styles.customCatText}>{category}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.rule} />

                {/* Date */}
                <View style={styles.section}>
                    <Text style={styles.fieldLabel}>Date</Text>
                    <TextInput
                        style={styles.fieldInput}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.ink3}
                        autoCapitalize="none"
                        selectionColor={colors.coral}
                    />
                </View>

                <View style={styles.rule} />

                {/* Note */}
                <View style={styles.section}>
                    <Text style={styles.fieldLabel}>Note</Text>
                    <TextInput
                        style={[styles.fieldInput, styles.noteInput]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="A short reflection on this expense..."
                        placeholderTextColor={colors.ink3}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        selectionColor={colors.coral}
                    />
                </View>

                <View style={styles.rule} />

                {/* Summary row */}
                {amount && category ? (
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryDot, { backgroundColor: catColor }]} />
                        <Text style={styles.summaryText}>
                            ₹{amount} · {category}
                            {note ? ` · "${note.slice(0, 32)}${note.length > 32 ? "…" : ""}"` : ""}
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.paper,
    },

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
    cancelBtn: {
        paddingVertical: 4,
        minWidth: 60,
    },
    cancelText: {
        fontSize: 14,
        color: colors.ink3,
        fontWeight: "500",
        letterSpacing: 0.1,
    },
    screenTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: -0.2,
        fontStyle: "italic",
    },
    saveBtn: {
        paddingVertical: 4,
        minWidth: 60,
        alignItems: "flex-end",
    },
    saveText: {
        fontSize: 14,
        color: colors.coral,
        fontWeight: "700",
        letterSpacing: 0.1,
    },
    saveDisabled: {
        opacity: 0.5,
    },

    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 48,
    },

    // Amount hero
    amtSection: {
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 24,
    },
    amtEyebrow: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.6,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 16,
        textAlign: "center",
    },
    amtRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 4,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    amtRowFocused: {
        borderBottomColor: colors.ink,
        borderBottomWidth: 1.5,
    },
    amtCurrency: {
        fontSize: 28,
        color: colors.ink3,
        fontWeight: "300",
        marginTop: 12,
        lineHeight: 36,
    },
    amtInput: {
        fontSize: 64,
        fontWeight: "300",
        color: colors.ink,
        letterSpacing: -2,
        lineHeight: 72,
        minWidth: 80,
        maxWidth: 260,
        textAlign: "center",
        fontVariant: ["tabular-nums"],
        paddingVertical: 0,
        backgroundColor: "transparent",
    },

    rule: {
        height: 1,
        backgroundColor: colors.line,
        marginHorizontal: 24,
    },

    section: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.6,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 14,
    },
    fieldInput: {
        fontSize: 16,
        color: colors.ink,
        fontWeight: "400",
        paddingVertical: 0,
        letterSpacing: -0.1,
        backgroundColor: "transparent",
    },
    noteInput: {
        fontSize: 15,
        lineHeight: 24,
        minHeight: 72,
        fontStyle: "italic",
        color: colors.ink2,
    },

    // Category chips
    chipsRow: {
        gap: 8,
        paddingRight: 4,
        paddingBottom: 4,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.line2,
        backgroundColor: "transparent",
    },
    chipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "500",
        color: colors.ink2,
        letterSpacing: -0.1,
    },
    chipTextOn: {
        color: colors.paper,
    },

    // Custom category
    customCatBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
    },
    customCatText: {
        fontSize: 13,
        color: colors.ink3,
        fontStyle: "italic",
    },

    // Summary
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    summaryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        flexShrink: 0,
        marginTop: 1,
    },
    summaryText: {
        fontSize: 13,
        color: colors.ink3,
        fontStyle: "italic",
        lineHeight: 20,
        flex: 1,
    },
});
