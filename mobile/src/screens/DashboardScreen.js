// Pica Editorial — DashboardScreen (Home)
// The financial overview. Numbers as literature. Budget bar, category breakdown,
// daily avg, pace tracking. All in paper and ink.

import { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { StateView } from "../components/StateView";
import { CategoryRow } from "../components/ExpenseCard";
import { useExpenses } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext";
import { colors, getCategoryColor } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

// Budget — hardcoded for now, later tie to user settings
const MONTHLY_BUDGET = 20000;

const daysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};
const dayOfMonth = () => new Date().getDate();
const monthLabel = () =>
    new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const DashboardScreen = () => {
    const { expenses, loading, error, fetchExpenses } = useExpenses();
    const { user } = useAuth();

    useFocusEffect(useCallback(() => { fetchExpenses(); }, []));

    // This month's expenses only
    const thisMonth = useMemo(() => {
        const now = new Date();
        return expenses.filter((e) => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    }, [expenses]);

    const totalSpend = useMemo(
        () => thisMonth.reduce((s, e) => s + Number(e.amount || 0), 0),
        [thisMonth]
    );

    const budgetUsedPct = Math.min((totalSpend / MONTHLY_BUDGET) * 100, 100);
    const budgetLeft = Math.max(MONTHLY_BUDGET - totalSpend, 0);
    const day = dayOfMonth();
    const days = daysInMonth();
    const daysLeft = days - day;
    const dailyAvg = day > 0 ? totalSpend / day : 0;
    const dailyBudget = daysLeft > 0 ? budgetLeft / daysLeft : 0;
    const paceStatus = budgetUsedPct / ((day / days) * 100);
    const isOnTrack = paceStatus <= 1.1;

    // Category totals
    const catTotals = useMemo(() => {
        const map = {};
        thisMonth.forEach((e) => {
            const k = e.category?.trim() || "Other";
            map[k] = (map[k] || 0) + Number(e.amount || 0);
        });
        return Object.entries(map)
            .map(([cat, amt]) => ({
                cat,
                amt,
                pct: totalSpend > 0 ? (amt / totalSpend) * 100 : 0,
                color: getCategoryColor(cat),
            }))
            .sort((a, b) => b.amt - a.amt);
    }, [thisMonth, totalSpend]);

    // Recent 3 transactions
    const recent = useMemo(
        () => [...thisMonth].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3),
        [thisMonth]
    );

    const firstName = user?.name?.split(" ")[0] || "there";
    const greeting = getGreeting();

    return (
        <View style={styles.root}>
            {/* Fixed top bar */}
            <View style={styles.topBar}>
                <View style={styles.markRow}>
                    <View style={styles.mark}><View style={styles.markDot} /></View>
                    <Text style={styles.brandName}>Pica</Text>
                </View>
                <View style={styles.monthBadge}>
                    <Text style={styles.monthBadgeText}>{monthLabel()}</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Greeting ── */}
                <View style={styles.greetSection}>
                    <Text style={styles.greetEyebrow}>— {greeting}, {firstName}</Text>
                    <Text style={styles.greetHeadline}>Here's where{"\n"}it went.</Text>
                </View>

                {/* ── Balance hero ── */}
                <View style={styles.balanceSection}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>Spent this month</Text>
                        <View style={[styles.paceTag, isOnTrack ? styles.paceGood : styles.paceBad]}>
                            <Text style={[styles.paceText, isOnTrack ? styles.paceGoodText : styles.paceBadText]}>
                                {isOnTrack ? "▾ on track" : "▴ over pace"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.balanceAmtRow}>
                        <Text style={styles.balanceCur}>₹</Text>
                        <Text style={styles.balanceAmt}>
                            {totalSpend.toLocaleString("en-IN")}
                        </Text>
                    </View>

                    {/* Meta row */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Budget</Text>
                            <Text style={styles.metaVal}>₹{MONTHLY_BUDGET.toLocaleString("en-IN")}</Text>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Left</Text>
                            <Text style={styles.metaVal}>₹{budgetLeft.toLocaleString("en-IN")}</Text>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Daily avg</Text>
                            <Text style={styles.metaVal}>₹{Math.round(dailyAvg).toLocaleString("en-IN")}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Budget progress bar ── */}
                <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>
                            {Math.round(budgetUsedPct)}% of budget used
                        </Text>
                        <Text style={styles.progressSubLabel}>Day {day} of {days}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${budgetUsedPct}%` },
                                budgetUsedPct > 90 && styles.progressFillDanger,
                            ]}
                        />
                    </View>
                    <Text style={styles.progressMeta}>
                        ₹{Math.round(dailyBudget).toLocaleString("en-IN")}/day to stay on track
                    </Text>
                </View>

                <View style={styles.rule} />

                {/* ── State ── */}
                <StateView
                    loading={loading}
                    error={error}
                    onRetry={fetchExpenses}
                    empty={!loading && !error && thisMonth.length === 0}
                    emptyText="No entries this month. Start logging to see your breakdown."
                />

                {!loading && !error && thisMonth.length > 0 ? (
                    <>
                        {/* ── Category breakdown ── */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Where it went</Text>
                                <Text style={styles.sectionCount}>{catTotals.length} categories</Text>
                            </View>
                            {catTotals.map((item) => (
                                <CategoryRow
                                    key={item.cat}
                                    category={item.cat}
                                    amount={item.amt}
                                    pct={item.pct}
                                    color={item.color}
                                />
                            ))}
                        </View>

                        <View style={styles.rule} />

                        {/* ── Recent entries ── */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent entries</Text>
                                <Text style={styles.sectionCount}>{thisMonth.length} total</Text>
                            </View>
                            {recent.map((e) => (
                                <RecentEntry key={e._id} expense={e} />
                            ))}
                        </View>

                        <View style={styles.rule} />

                        {/* ── Insight card ── */}
                        <View style={styles.insightCard}>
                            <Text style={styles.insightEyebrow}>— This month's insight</Text>
                            {catTotals.length > 0 ? (
                                <Text style={styles.insightText}>
                                    {catTotals[0].cat} is your biggest spend at{" "}
                                    {Math.round(catTotals[0].pct)}% of total outflows.
                                    {catTotals[0].pct > 40
                                        ? " That's worth a closer look."
                                        : " Staying balanced."}
                                </Text>
                            ) : null}
                            <Text style={styles.insightQuote}>
                                "A budget isn't about restriction — it's about intention."
                            </Text>
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </View>
    );
};

// Mini recent entry row
const RecentEntry = ({ expense }) => {
    const catColor = getCategoryColor(expense.category);
    const d = new Date(expense.date);
    const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    return (
        <View style={reStyles.row}>
            <View style={[reStyles.dot, { backgroundColor: catColor }]} />
            <View style={reStyles.info}>
                <Text style={reStyles.cat}>{expense.category || "Other"}</Text>
                {expense.note ? (
                    <Text style={reStyles.note} numberOfLines={1}>"{expense.note}"</Text>
                ) : null}
            </View>
            <View style={reStyles.right}>
                <Text style={reStyles.amt}>{formatCurrency(expense.amount)}</Text>
                <Text style={reStyles.date}>{dateStr}</Text>
            </View>
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
    root: { flex: 1, backgroundColor: colors.paper },

    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 4,
    },
    markRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    mark: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 1, borderColor: colors.line3,
        alignItems: "center", justifyContent: "center",
    },
    markDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.coral },
    brandName: { fontSize: 14, fontWeight: "600", color: colors.ink, letterSpacing: -0.2 },
    monthBadge: {
        paddingVertical: 5, paddingHorizontal: 11,
        borderRadius: 100, borderWidth: 1, borderColor: colors.line2,
    },
    monthBadgeText: {
        fontSize: 10, fontWeight: "600", color: colors.ink2,
        letterSpacing: 0.6, textTransform: "uppercase",
    },

    scrollContent: { paddingBottom: 48 },

    // Greeting
    greetSection: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    greetEyebrow: {
        fontSize: 11, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 10,
    },
    greetHeadline: {
        fontSize: 32, fontWeight: "300", color: colors.ink,
        letterSpacing: -0.9, lineHeight: 36,
    },

    // Balance hero
    balanceSection: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    balanceHeader: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 10,
    },
    balanceLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    paceTag: {
        paddingVertical: 4, paddingHorizontal: 10,
        borderRadius: 100, borderWidth: 1,
    },
    paceGood: { borderColor: colors.sage, backgroundColor: "rgba(90,107,74,0.06)" },
    paceBad: { borderColor: colors.coral, backgroundColor: "rgba(232,85,58,0.06)" },
    paceText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
    paceGoodText: { color: colors.sage },
    paceBadText: { color: colors.coral },

    balanceAmtRow: {
        flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 18,
    },
    balanceCur: {
        fontSize: 22, color: colors.ink3, fontWeight: "300",
        marginTop: 10, lineHeight: 28,
    },
    balanceAmt: {
        fontSize: 52, fontWeight: "300", color: colors.ink,
        letterSpacing: -1.8, lineHeight: 58, fontVariant: ["tabular-nums"],
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 0 },
    metaItem: { flex: 1, gap: 2 },
    metaLabel: {
        fontSize: 9, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.ink3,
    },
    metaVal: {
        fontSize: 14, fontWeight: "600", color: colors.ink,
        letterSpacing: -0.2, fontVariant: ["tabular-nums"],
    },
    metaDivider: { width: 1, height: 28, backgroundColor: colors.line, marginHorizontal: 16 },

    // Progress
    progressSection: { paddingHorizontal: 24, paddingVertical: 18 },
    progressRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 10,
    },
    progressLabel: { fontSize: 13, fontWeight: "500", color: colors.ink, letterSpacing: -0.1 },
    progressSubLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 0.8,
        textTransform: "uppercase", color: colors.ink3,
    },
    progressTrack: {
        height: 4, backgroundColor: colors.paper2,
        borderRadius: 2, overflow: "hidden", marginBottom: 8,
    },
    progressFill: { height: 4, backgroundColor: colors.ink, borderRadius: 2 },
    progressFillDanger: { backgroundColor: colors.coral },
    progressMeta: { fontSize: 11, color: colors.ink3, letterSpacing: 0.2 },

    rule: { height: 1, backgroundColor: colors.line, marginHorizontal: 24 },

    // Sections
    section: { paddingHorizontal: 24, paddingVertical: 24 },
    sectionHeader: {
        flexDirection: "row", alignItems: "baseline",
        justifyContent: "space-between", marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: "500", color: colors.ink,
        letterSpacing: -0.3, fontStyle: "italic",
    },
    sectionCount: {
        fontSize: 11, fontWeight: "600", color: colors.ink3,
        letterSpacing: 0.4, textTransform: "uppercase",
    },

    // Insight card
    insightCard: {
        marginHorizontal: 24, marginTop: 24,
        padding: 20, backgroundColor: colors.paper2,
        borderRadius: 16, gap: 10,
    },
    insightEyebrow: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    insightText: {
        fontSize: 14, color: colors.ink2, lineHeight: 22, letterSpacing: -0.1,
    },
    insightQuote: {
        fontSize: 12, color: colors.ink3, fontStyle: "italic",
        lineHeight: 18, marginTop: 4,
    },
});

const reStyles = StyleSheet.create({
    row: {
        flexDirection: "row", alignItems: "flex-start",
        gap: 12, marginBottom: 16,
    },
    dot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 4, flexShrink: 0 },
    info: { flex: 1, gap: 2 },
    cat: { fontSize: 14, fontWeight: "500", color: colors.ink, letterSpacing: -0.1 },
    note: { fontSize: 12, color: colors.ink3, fontStyle: "italic" },
    right: { alignItems: "flex-end", gap: 2 },
    amt: {
        fontSize: 14, fontWeight: "600", color: colors.ink,
        letterSpacing: -0.3, fontVariant: ["tabular-nums"],
    },
    date: { fontSize: 11, color: colors.ink3 },
});
