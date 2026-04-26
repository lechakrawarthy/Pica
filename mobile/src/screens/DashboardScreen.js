// Pica Editorial — DashboardScreen (Home)
// Animated balance hero, animated budget bar, staggered category rows.
// Numbers as literature. Pace tracking. Insight card.

import { useMemo, useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";

const TRACK_W = Dimensions.get("window").width - 48; // paddingHorizontal 24 each side
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, withDelay,
    FadeInDown, FadeIn,
    Easing,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StateView } from "../components/StateView";
import { CategoryRow } from "../components/ExpenseCard";
import { useExpenses } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext";
import { colors, getCategoryColor } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

const daysInMonth = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const dayOfMonth  = () => new Date().getDate();
const monthLabel  = () => new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const DashboardScreen = () => {
    const { expenses, loading, error, fetchExpenses } = useExpenses();
    const { user } = useAuth();

    // Budget from AsyncStorage (set in BudgetSetupScreen)
    const [MONTHLY_BUDGET, setMonthlyBudget] = useState(20000);
    useEffect(() => {
        AsyncStorage.getItem("@pica_budget").then((v) => {
            if (v) setMonthlyBudget(Number(v));
        }).catch(() => {});
    }, []);

    useFocusEffect(useCallback(() => { fetchExpenses(); }, []));

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
    const budgetLeft    = Math.max(MONTHLY_BUDGET - totalSpend, 0);
    const day           = dayOfMonth();
    const days          = daysInMonth();
    const daysLeft      = days - day;
    const dailyAvg      = day > 0 ? totalSpend / day : 0;
    const dailyBudget   = daysLeft > 0 ? budgetLeft / daysLeft : 0;
    const paceRatio     = budgetUsedPct / (Math.max((day / days) * 100, 1));
    const isOnTrack     = paceRatio <= 1.1;

    const catTotals = useMemo(() => {
        const map = {};
        thisMonth.forEach((e) => {
            const k = e.category?.trim() || "Other";
            map[k] = (map[k] || 0) + Number(e.amount || 0);
        });
        return Object.entries(map)
            .map(([cat, amt]) => ({
                cat, amt,
                pct: totalSpend > 0 ? (amt / totalSpend) * 100 : 0,
                color: getCategoryColor(cat),
            }))
            .sort((a, b) => b.amt - a.amt);
    }, [thisMonth, totalSpend]);

    const recent = useMemo(
        () => [...thisMonth].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4),
        [thisMonth]
    );

    // Animated progress bar
    const barWidth = useSharedValue(0);
    useEffect(() => {
        barWidth.value = withDelay(400, withTiming(budgetUsedPct, { duration: 900, easing: Easing.out(Easing.cubic) }));
    }, [budgetUsedPct]);
    const barStyle = useAnimatedStyle(() => ({
        width: (barWidth.value / 100) * TRACK_W,
    }));

    const firstName = user?.name?.split(" ")[0] || "there";
    const greeting  = getGreeting();

    return (
        <View style={styles.root}>
            {/* ── Fixed top bar ── */}
            <View style={styles.topBar}>
                <View style={styles.markRow}>
                    <View style={styles.mark}><View style={styles.markDot} /></View>
                    <Text style={styles.brandName}>Pica</Text>
                </View>
                <View style={styles.monthBadge}>
                    <Text style={styles.monthBadgeText}>{monthLabel()}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* ── Greeting ── */}
                <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.greetSection}>
                    <Text style={styles.greetEyebrow}>— {greeting}, {firstName}</Text>
                    <Text style={styles.greetHeadline}>Here's where{"\n"}it went.</Text>
                </Animated.View>

                {/* ── Balance hero ── */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.balanceSection}>
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
                        <Text style={styles.balanceAmt}>{totalSpend.toLocaleString("en-IN")}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <MetaItem label="Budget" value={`₹${MONTHLY_BUDGET.toLocaleString("en-IN")}`} />
                        <View style={styles.metaDivider} />
                        <MetaItem label="Left" value={`₹${budgetLeft.toLocaleString("en-IN")}`} />
                        <View style={styles.metaDivider} />
                        <MetaItem label="Daily avg" value={`₹${Math.round(dailyAvg).toLocaleString("en-IN")}`} />
                    </View>
                </Animated.View>

                {/* ── Animated budget bar ── */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.progressSection}>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>{Math.round(budgetUsedPct)}% of budget used</Text>
                        <Text style={styles.progressSub}>Day {day} of {days}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                barStyle,
                                budgetUsedPct > 90 && styles.progressFillDanger,
                            ]}
                        />
                    </View>
                    <Text style={styles.progressMeta}>
                        ₹{Math.round(dailyBudget).toLocaleString("en-IN")}/day to stay on track
                    </Text>
                </Animated.View>

                <View style={styles.rule} />

                <StateView
                    loading={loading}
                    error={error}
                    onRetry={fetchExpenses}
                    empty={!loading && !error && thisMonth.length === 0}
                    emptyText="No entries this month. Start logging to see your breakdown."
                />

                {!loading && !error && thisMonth.length > 0 ? (<>

                    {/* ── Category breakdown ── */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Where it went</Text>
                            <Text style={styles.sectionCount}>{catTotals.length} categories</Text>
                        </View>
                        {catTotals.map((item, i) => (
                            <Animated.View key={item.cat} entering={FadeInDown.delay(350 + i * 60).duration(400)}>
                                <CategoryRow
                                    category={item.cat}
                                    amount={item.amt}
                                    pct={item.pct}
                                    color={item.color}
                                />
                            </Animated.View>
                        ))}
                    </Animated.View>

                    <View style={styles.rule} />

                    {/* ── Recent entries ── */}
                    <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent entries</Text>
                            <Text style={styles.sectionCount}>{thisMonth.length} total</Text>
                        </View>
                        {recent.map((e, i) => (
                            <Animated.View key={e._id} entering={FadeInDown.delay(540 + i * 50).duration(380)}>
                                <RecentEntry expense={e} />
                            </Animated.View>
                        ))}
                    </Animated.View>

                    <View style={styles.rule} />

                    {/* ── Insight card ── */}
                    <Animated.View entering={FadeIn.delay(700).duration(500)} style={styles.insightCard}>
                        <Text style={styles.insightEyebrow}>— This month's insight</Text>
                        {catTotals.length > 0 ? (
                            <Text style={styles.insightText}>
                                {catTotals[0].cat} is your biggest category at{" "}
                                {Math.round(catTotals[0].pct)}% of total outflows
                                {catTotals[0].pct > 40 ? " — worth a closer look." : ". Staying balanced."}
                            </Text>
                        ) : null}
                        {isOnTrack ? (
                            <Text style={styles.insightPace}>
                                You're spending ₹{Math.round(dailyAvg).toLocaleString("en-IN")}/day.
                                At this pace you'll end the month ₹{budgetLeft.toLocaleString("en-IN")} under budget.
                            </Text>
                        ) : (
                            <Text style={[styles.insightPace, { color: colors.coral }]}>
                                You're running {Math.round((paceRatio - 1) * 100)}% ahead of pace.
                                Pull back to ₹{Math.round(dailyBudget).toLocaleString("en-IN")}/day to finish on track.
                            </Text>
                        )}
                        <Text style={styles.insightQuote}>
                            "A budget isn't about restriction — it's about intention."
                        </Text>
                    </Animated.View>

                </>) : null}
            </ScrollView>
        </View>
    );
};

const MetaItem = ({ label, value }) => (
    <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaVal}>{value}</Text>
    </View>
);

const RecentEntry = ({ expense }) => {
    const catColor = getCategoryColor(expense.category);
    const d = new Date(expense.date);
    const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    return (
        <View style={reStyles.row}>
            <View style={[reStyles.dot, { backgroundColor: catColor }]} />
            <View style={reStyles.info}>
                <Text style={reStyles.cat}>{expense.category || "Other"}</Text>
                {expense.note ? <Text style={reStyles.note} numberOfLines={1}>"{expense.note}"</Text> : null}
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
    monthBadge: {
        paddingVertical: 5, paddingHorizontal: 11,
        borderRadius: 100, borderWidth: 1, borderColor: colors.line2,
    },
    monthBadgeText: {
        fontSize: 10, fontWeight: "600", color: colors.ink2,
        letterSpacing: 0.6, textTransform: "uppercase",
    },

    scrollContent: { paddingBottom: 48 },

    greetSection: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    greetEyebrow: {
        fontSize: 11, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 10,
    },
    greetHeadline: {
        fontSize: 32, fontWeight: "300", color: colors.ink,
        letterSpacing: -0.9, lineHeight: 36,
    },

    balanceSection: {
        paddingHorizontal: 24, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: colors.line,
    },
    balanceHeader: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 10,
    },
    balanceLabel: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    paceTag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100, borderWidth: 1 },
    paceGood: { borderColor: colors.sage, backgroundColor: "rgba(90,107,74,0.06)" },
    paceBad:  { borderColor: colors.coral, backgroundColor: "rgba(232,85,58,0.06)" },
    paceText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
    paceGoodText: { color: colors.sage },
    paceBadText:  { color: colors.coral },

    balanceAmtRow: { flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 18 },
    balanceCur: { fontSize: 22, color: colors.ink3, fontWeight: "300", marginTop: 10, lineHeight: 28 },
    balanceAmt: {
        fontSize: 52, fontWeight: "300", color: colors.ink,
        letterSpacing: -1.8, lineHeight: 58, fontVariant: ["tabular-nums"],
    },
    metaRow: { flexDirection: "row", alignItems: "center" },
    metaItem: { flex: 1, gap: 2 },
    metaLabel: {
        fontSize: 9, fontWeight: "600", letterSpacing: 1.2,
        textTransform: "uppercase", color: colors.ink3,
    },
    metaVal: { fontSize: 14, fontWeight: "600", color: colors.ink, letterSpacing: -0.2, fontVariant: ["tabular-nums"] },
    metaDivider: { width: 1, height: 28, backgroundColor: colors.line, marginHorizontal: 16 },

    progressSection: { paddingHorizontal: 24, paddingVertical: 18 },
    progressRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 10,
    },
    progressLabel: { fontSize: 13, fontWeight: "500", color: colors.ink, letterSpacing: -0.1 },
    progressSub: {
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

    insightCard: {
        marginHorizontal: 24, marginTop: 24, marginBottom: 8,
        padding: 20, backgroundColor: colors.paper2,
        borderRadius: 16, gap: 10,
    },
    insightEyebrow: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    insightText: { fontSize: 14, color: colors.ink2, lineHeight: 22, letterSpacing: -0.1 },
    insightPace: { fontSize: 13, color: colors.ink3, lineHeight: 20 },
    insightQuote: {
        fontSize: 12, color: colors.ink3, fontStyle: "italic",
        lineHeight: 18, marginTop: 4,
        paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line,
    },
});

const reStyles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
    dot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 4, flexShrink: 0 },
    info: { flex: 1, gap: 2 },
    cat: { fontSize: 14, fontWeight: "500", color: colors.ink, letterSpacing: -0.1 },
    note: { fontSize: 12, color: colors.ink3, fontStyle: "italic" },
    right: { alignItems: "flex-end", gap: 2 },
    amt: { fontSize: 14, fontWeight: "600", color: colors.ink, letterSpacing: -0.3, fontVariant: ["tabular-nums"] },
    date: { fontSize: 11, color: colors.ink3 },
});
