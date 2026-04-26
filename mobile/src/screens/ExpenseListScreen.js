// Pica Editorial — ExpenseListScreen (Journal)
// Chronological entries grouped by date. Staggered FlatList animations.
// Swipe-feel press states. Every rupee, noticed.

import { useCallback, useRef } from "react";
import {
    View, Text, FlatList, Pressable, Alert,
    StyleSheet, TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withSpring, FadeInDown, FadeInRight, Layout,
} from "react-native-reanimated";
import { ExpenseCard } from "../components/ExpenseCard";
import { StateView } from "../components/StateView";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { colors } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Group expenses by human-readable date label
const groupByDate = (expenses) => {
    const groups = {};
    [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((e) => {
            const d    = new Date(e.date);
            const now  = new Date();
            const diff = Math.floor((now - d) / 86400000);
            let label;
            if (diff === 0) label = "Today";
            else if (diff === 1) label = "Yesterday";
            else label = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
            if (!groups[label]) groups[label] = [];
            groups[label].push(e);
        });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
};

export const ExpenseListScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { expenses, loading, error, fetchExpenses, deleteExpense } = useExpenses();

    useFocusEffect(useCallback(() => { fetchExpenses(); }, []));

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

    const grouped  = groupByDate(expenses);
    const listData = grouped.flatMap(({ date, items }) => {
        const total = items.reduce((s, e) => s + Number(e.amount || 0), 0);
        return [
            { type: "header", date, total, id: `h-${date}` },
            ...items.map((e) => ({ type: "item", ...e })),
        ];
    });

    const totalAll = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <View style={styles.root}>
            {/* ── Top bar ── */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
                <View style={styles.markRow}>
                    <View style={styles.mark}><View style={styles.markDot} /></View>
                    <Text style={styles.brandName}>Pica</Text>
                </View>
                <Pressable onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Sign out</Text>
                </Pressable>
            </Animated.View>

            {/* ── Greeting + total hero ── */}
            <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.heroSection}>
                <Text style={styles.greetEyebrow}>— {getGreeting()}</Text>
                <Text style={styles.greetName}>Hello, {firstName}.</Text>
                <View style={styles.totalRow}>
                    <View>
                        <Text style={styles.totalLabel}>Total logged</Text>
                        <Text style={styles.totalAmt}>{formatCurrency(totalAll)}</Text>
                    </View>
                    <View style={styles.totalMeta}>
                        <Text style={styles.totalMetaVal}>{expenses.length}</Text>
                        <Text style={styles.totalMetaLabel}>entries</Text>
                    </View>
                </View>
            </Animated.View>

            <View style={styles.rule} />

            {/* ── Section header + Add button ── */}
            <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Journal</Text>
                <AddEntryButton onPress={() => navigation.navigate("AddEditExpense")} />
            </Animated.View>

            {/* ── States ── */}
            <StateView
                loading={loading}
                error={error}
                empty={!loading && !error && expenses.length === 0}
                onRetry={fetchExpenses}
                emptyText="Your journal is empty. Tap '+ New entry' to begin."
            />

            {/* ── Animated list ── */}
            {!loading && !error && expenses.length > 0 ? (
                <AnimatedFlatList
                    data={listData}
                    keyExtractor={(item) => item.id || item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    itemLayoutAnimation={Layout.springify().damping(14)}
                    renderItem={({ item, index }) => {
                        if (item.type === "header") {
                            return (
                                <Animated.View entering={FadeInDown.delay(index * 30).duration(350)}>
                                    <DateHeader date={item.date} total={item.total} />
                                </Animated.View>
                            );
                        }
                        return (
                            <Animated.View entering={FadeInRight.delay(index * 25).duration(350)}>
                                <ExpenseCard
                                    expense={item}
                                    onEdit={() => navigation.navigate("AddEditExpense", { expense: item })}
                                    onDelete={() => onDelete(item._id)}
                                />
                            </Animated.View>
                        );
                    }}
                />
            ) : null}
        </View>
    );
};

// ── Date section header ────────────────────────────────────────────────────
const DateHeader = ({ date, total }) => (
    <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>{date}</Text>
        <Text style={styles.dateTotalLabel}>{formatCurrency(total)}</Text>
    </View>
);

// ── Animated Add button ────────────────────────────────────────────────────
const AddEntryButton = ({ onPress }) => {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return (
        <Pressable
            onPressIn={() => { scale.value = withSpring(0.93, { damping: 10 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 10 }); }}
            onPress={onPress}
        >
            <Animated.View style={[styles.addBtn, style]}>
                <Text style={styles.addBtnText}>+ New entry</Text>
            </Animated.View>
        </Pressable>
    );
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.paper },

    topBar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
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
    logoutBtn: {
        paddingVertical: 6, paddingHorizontal: 12,
        borderRadius: 100, borderWidth: 1, borderColor: colors.line2,
    },
    logoutText: {
        fontSize: 11, fontWeight: "600", color: colors.ink3,
        letterSpacing: 0.6, textTransform: "uppercase",
    },

    heroSection: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
    greetEyebrow: {
        fontSize: 11, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 8,
    },
    greetName: {
        fontSize: 30, fontWeight: "300", color: colors.ink,
        letterSpacing: -0.8, marginBottom: 20,
    },
    totalRow: {
        flexDirection: "row", alignItems: "flex-end",
        justifyContent: "space-between",
    },
    totalLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 4,
    },
    totalAmt: {
        fontSize: 38, fontWeight: "300", color: colors.ink,
        letterSpacing: -1.2, lineHeight: 42, fontVariant: ["tabular-nums"],
    },
    totalMeta: { alignItems: "flex-end", paddingBottom: 4 },
    totalMetaVal: { fontSize: 22, fontWeight: "500", color: colors.ink, letterSpacing: -0.5 },
    totalMetaLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.0,
        textTransform: "uppercase", color: colors.ink3,
    },

    rule: { height: 1, backgroundColor: colors.line, marginHorizontal: 24 },

    sectionHeader: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: "500", color: colors.ink,
        letterSpacing: -0.3, fontStyle: "italic",
    },
    addBtn: {
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 100, backgroundColor: colors.ink,
    },
    addBtnText: { fontSize: 12, fontWeight: "600", color: colors.paper, letterSpacing: 0.2 },

    listContent: { paddingHorizontal: 24, paddingBottom: 32 },

    dateHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "baseline", paddingTop: 24, paddingBottom: 6,
    },
    dateLabel: {
        fontSize: 12, fontWeight: "600", color: colors.ink3,
        letterSpacing: 0.3, textTransform: "capitalize",
    },
    dateTotalLabel: {
        fontSize: 12, fontWeight: "600", color: colors.ink2,
        fontVariant: ["tabular-nums"],
    },
});
