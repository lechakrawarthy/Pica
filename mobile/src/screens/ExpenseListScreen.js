// Spendly Editorial — ExpenseListScreen (Journal)
// Your money, kept like a journal. Chronological, readable, personal.

import { useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ExpenseCard } from "../components/ExpenseCard";
import { StateView } from "../components/StateView";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { colors } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

// Helper: group expenses by date
const groupByDate = (expenses) => {
    const groups = {};
    expenses.forEach((e) => {
        const d = new Date(e.date);
        const label = d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
        if (!groups[label]) groups[label] = [];
        groups[label].push(e);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
};

// Section header component
const DateHeader = ({ date, total }) => (
    <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>{date}</Text>
        <Text style={styles.dateTotalLabel}>{formatCurrency(total)}</Text>
    </View>
);

export const ExpenseListScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { expenses, loading, error, fetchExpenses, deleteExpense } = useExpenses();

    useFocusEffect(
        useCallback(() => {
            fetchExpenses();
        }, [])
    );

    const onDelete = (id) => {
        Alert.alert(
            "Remove this entry?",
            "This can't be undone. The entry will be gone from your journal.",
            [
                { text: "Keep it", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try { await deleteExpense(id); }
                        catch (e) { Alert.alert("Couldn't remove", e?.response?.data?.message || "Please try again."); }
                    },
                },
            ]
        );
    };

    const grouped = groupByDate(expenses);

    // Flatten groups into FlatList data
    const listData = grouped.flatMap(({ date, items }) => {
        const total = items.reduce((s, e) => s + Number(e.amount || 0), 0);
        return [{ type: "header", date, total, id: `h-${date}` }, ...items.map((e) => ({ type: "item", ...e }))];
    });

    const totalThisMonth = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const greeting = getGreeting();
    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <View style={styles.root}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <View style={styles.markRow}>
                    <View style={styles.mark}><View style={styles.markDot} /></View>
                    <Text style={styles.brandName}>Spendly</Text>
                </View>
                <Pressable onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Sign out</Text>
                </Pressable>
            </View>

            {/* Greeting + total hero */}
            <View style={styles.heroSection}>
                <Text style={styles.greetingEyebrow}>— {greeting}</Text>
                <Text style={styles.greetingName}>
                    Hello, {firstName}.
                </Text>
                <View style={styles.totalRow}>
                    <View>
                        <Text style={styles.totalLabel}>Total logged</Text>
                        <Text style={styles.totalAmt}>{formatCurrency(totalThisMonth)}</Text>
                    </View>
                    <View style={styles.totalMeta}>
                        <Text style={styles.totalMetaVal}>{expenses.length}</Text>
                        <Text style={styles.totalMetaLabel}>entries</Text>
                    </View>
                </View>
            </View>

            <View style={styles.rule} />

            {/* Journal section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Journal</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate("AddEditExpense")}
                >
                    <Text style={styles.addBtnText}>+ New entry</Text>
                </TouchableOpacity>
            </View>

            {/* State: loading / error / empty */}
            <StateView
                loading={loading}
                error={error}
                empty={!loading && !error && expenses.length === 0}
                onRetry={fetchExpenses}
                emptyText="Your journal is empty. Add your first entry to begin."
            />

            {/* Expense list */}
            {!loading && !error && expenses.length > 0 ? (
                <FlatList
                    data={listData}
                    keyExtractor={(item) => item.id || item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        if (item.type === "header") {
                            return <DateHeader date={item.date} total={item.total} />;
                        }
                        return (
                            <ExpenseCard
                                expense={item}
                                onEdit={() => navigation.navigate("AddEditExpense", { expense: item })}
                                onDelete={() => onDelete(item._id)}
                            />
                        );
                    }}
                />
            ) : null}
        </View>
    );
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

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
        paddingBottom: 4,
    },
    markRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    mark: {
        width: 28,
        height: 28,
        borderRadius: 14,
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
        fontSize: 14,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: -0.2,
    },
    logoutBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.line2,
    },
    logoutText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.ink3,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },

    // Hero section
    heroSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    greetingEyebrow: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 8,
    },
    greetingName: {
        fontSize: 30,
        fontWeight: "300",
        color: colors.ink,
        letterSpacing: -0.8,
        marginBottom: 20,
    },
    totalRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 4,
    },
    totalAmt: {
        fontSize: 38,
        fontWeight: "300",
        color: colors.ink,
        letterSpacing: -1.2,
        lineHeight: 42,
        fontVariant: ["tabular-nums"],
    },
    totalMeta: {
        alignItems: "flex-end",
        paddingBottom: 4,
    },
    totalMetaVal: {
        fontSize: 22,
        fontWeight: "500",
        color: colors.ink,
        letterSpacing: -0.5,
    },
    totalMetaLabel: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.0,
        textTransform: "uppercase",
        color: colors.ink3,
    },

    rule: {
        height: 1,
        backgroundColor: colors.line,
        marginHorizontal: 24,
    },

    // Section header
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "500",
        color: colors.ink,
        letterSpacing: -0.3,
        fontStyle: "italic",
    },
    addBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 100,
        backgroundColor: colors.ink,
    },
    addBtnText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.paper,
        letterSpacing: 0.2,
    },

    // List
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    dateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingTop: 24,
        paddingBottom: 6,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.ink3,
        letterSpacing: 0.3,
        textTransform: "capitalize",
    },
    dateTotalLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.ink2,
        fontVariant: ["tabular-nums"],
    },
});
