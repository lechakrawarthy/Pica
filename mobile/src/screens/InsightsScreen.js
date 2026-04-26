// Pica Editorial — InsightsScreen
// Trends, week-over-week, top category, biggest single spend.
// Pure RN bar charts — no library needed.

import { useMemo, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withDelay, withTiming, FadeInDown, FadeIn,
    Easing,
} from "react-native-reanimated";
import { useExpenses } from "../context/ExpenseContext";
import { colors, getCategoryColor } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

const { width: W } = Dimensions.get("window");
const BAR_W = (W - 48 - 6 * 7) / 7; // 7-day bar width

const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
    }
    return days;
};

const dayLabel = (d) => d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2);

export const InsightsScreen = () => {
    const { expenses, fetchExpenses } = useExpenses();
    useFocusEffect(useCallback(() => { fetchExpenses(); }, []));

    const days7 = useMemo(() => getLast7Days(), []);

    // Daily totals for last 7 days
    const dailyTotals = useMemo(() => {
        return days7.map((d) => {
            const dateStr = d.toISOString().slice(0, 10);
            const total = expenses
                .filter((e) => new Date(e.date).toISOString().slice(0, 10) === dateStr)
                .reduce((s, e) => s + Number(e.amount || 0), 0);
            return { date: d, total, label: dayLabel(d) };
        });
    }, [expenses, days7]);

    const maxDay = Math.max(...dailyTotals.map((d) => d.total), 1);

    // This week vs last week
    const thisWeekTotal = useMemo(() =>
        dailyTotals.reduce((s, d) => s + d.total, 0), [dailyTotals]);

    const lastWeekTotal = useMemo(() => {
        let total = 0;
        for (let i = 7; i <= 13; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            expenses
                .filter((e) => new Date(e.date).toISOString().slice(0, 10) === dateStr)
                .forEach((e) => { total += Number(e.amount || 0); });
        }
        return total;
    }, [expenses]);

    const weekDelta = lastWeekTotal > 0
        ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
        : 0;
    const isUp = weekDelta > 0;

    // Category breakdown (all time)
    const catTotals = useMemo(() => {
        const map = {};
        expenses.forEach((e) => {
            const k = e.category?.trim() || "Other";
            map[k] = (map[k] || 0) + Number(e.amount || 0);
        });
        const totalAll = Object.values(map).reduce((s, v) => s + v, 0);
        return Object.entries(map)
            .map(([cat, amt]) => ({
                cat, amt,
                pct: totalAll > 0 ? (amt / totalAll) * 100 : 0,
                color: getCategoryColor(cat),
            }))
            .sort((a, b) => b.amt - a.amt)
            .slice(0, 5);
    }, [expenses]);

    // Biggest single expense
    const biggestExpense = useMemo(() =>
        [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0],
        [expenses]
    );

    // Average transaction
    const avgTxn = useMemo(() => {
        if (!expenses.length) return 0;
        return expenses.reduce((s, e) => s + Number(e.amount || 0), 0) / expenses.length;
    }, [expenses]);

    return (
        <View style={styles.root}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <View style={styles.markRow}>
                    <View style={styles.mark}><View style={styles.markDot} /></View>
                    <Text style={styles.brandName}>Pica</Text>
                </View>
                <Text style={styles.topTitle}>Insights</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Week comparison ── */}
                <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.weekCard}>
                    <Text style={styles.weekEyebrow}>— This week vs last week</Text>
                    <View style={styles.weekRow}>
                        <View>
                            <Text style={styles.weekAmt}>{formatCurrency(thisWeekTotal)}</Text>
                            <Text style={styles.weekLabel}>This week</Text>
                        </View>
                        <View style={[styles.deltaBadge, isUp ? styles.deltaBadgeUp : styles.deltaBadgeDown]}>
                            <Text style={[styles.deltaText, isUp ? styles.deltaUp : styles.deltaDown]}>
                                {isUp ? "▲" : "▼"} {Math.abs(Math.round(weekDelta))}%
                            </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={[styles.weekAmt, { color: colors.ink3 }]}>{formatCurrency(lastWeekTotal)}</Text>
                            <Text style={styles.weekLabel}>Last week</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── 7-day bar chart ── */}
                <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Last 7 days</Text>
                    <View style={styles.barChart}>
                        {dailyTotals.map((item, i) => (
                            <DayBar
                                key={i}
                                item={item}
                                maxVal={maxDay}
                                index={i}
                                isToday={i === 6}
                            />
                        ))}
                    </View>
                </Animated.View>

                <View style={styles.rule} />

                {/* ── Stat cards ── */}
                <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.statsGrid}>
                    <StatCard
                        eyebrow="Avg transaction"
                        value={formatCurrency(avgTxn)}
                        sub={`across ${expenses.length} entries`}
                    />
                    <StatCard
                        eyebrow="Biggest spend"
                        value={biggestExpense ? formatCurrency(biggestExpense.amount) : "—"}
                        sub={biggestExpense?.category || "—"}
                        accent
                    />
                </Animated.View>

                <View style={styles.rule} />

                {/* ── Top categories ── */}
                <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Top categories</Text>
                    {catTotals.map((item, i) => (
                        <AnimatedCategoryRow key={item.cat} item={item} index={i} />
                    ))}
                </Animated.View>

                <View style={styles.rule} />

                {/* ── Story insight ── */}
                {expenses.length > 0 ? (
                    <Animated.View entering={FadeIn.delay(500).duration(500)} style={styles.storyCard}>
                        <Text style={styles.storyEyebrow}>— Your money story</Text>
                        <Text style={styles.storyText}>
                            You've logged {expenses.length} transactions totaling{" "}
                            {formatCurrency(expenses.reduce((s, e) => s + Number(e.amount || 0), 0))}.
                            {catTotals.length > 0
                                ? ` ${catTotals[0].cat} accounts for ${Math.round(catTotals[0].pct)}% of all your spending.`
                                : ""}
                            {avgTxn > 0
                                ? ` Your average transaction is ${formatCurrency(avgTxn)} — every choice adds up.`
                                : ""}
                        </Text>
                        <Text style={styles.storyQuote}>
                            "The secret to budgeting is to notice before you judge."
                        </Text>
                    </Animated.View>
                ) : null}
            </ScrollView>
        </View>
    );
};

// ── Animated bar ──────────────────────────────────────────────────────────────
const DayBar = ({ item, maxVal, index, isToday }) => {
    const pct = maxVal > 0 ? item.total / maxVal : 0;
    const barH = useSharedValue(0);
    const MAX_H = 90;
    const targetH = pct * MAX_H;

    const barStyle = useAnimatedStyle(() => ({
        height: barH.value,
    }));

    useEffect(() => {
        barH.value = withDelay(
            index * 70 + 300,
            withTiming(targetH, { duration: 600, easing: Easing.out(Easing.cubic) })
        );
    }, [barH, index, targetH]);

    return (
        <View style={bStyles.col}>
            {item.total > 0 ? (
                <Text style={bStyles.val}>
                    {item.total >= 1000 ? `₹${(item.total / 1000).toFixed(1)}k` : `₹${item.total}`}
                </Text>
            ) : null}
            <View style={bStyles.track}>
                <Animated.View
                    style={[
                        bStyles.fill,
                        { width: BAR_W },
                        barStyle,
                        isToday && bStyles.fillToday,
                    ]}
                />
            </View>
            <Text style={[bStyles.label, isToday && bStyles.labelToday]}>{item.label}</Text>
        </View>
    );
};

// ── Animated category row ─────────────────────────────────────────────────────
const AnimatedCategoryRow = ({ item, index }) => {
    const barW = useSharedValue(0);
    const style = useAnimatedStyle(() => ({ width: `${barW.value}%` }));

    useEffect(() => {
        barW.value = withDelay(
            320 + index * 80,
            withTiming(item.pct, { duration: 700, easing: Easing.out(Easing.cubic) })
        );
    }, [barW, index, item.pct]);

    return (
        <Animated.View entering={FadeInDown.delay(340 + index * 60).duration(380)} style={cStyles.row}>
            <View style={[cStyles.dot, { backgroundColor: item.color }]} />
            <View style={cStyles.info}>
                <View style={cStyles.infoHeader}>
                    <Text style={cStyles.name}>{item.cat}</Text>
                    <Text style={cStyles.pct}>{Math.round(item.pct)}%</Text>
                    <Text style={cStyles.amt}>{formatCurrency(item.amt)}</Text>
                </View>
                <View style={cStyles.track}>
                    <Animated.View style={[cStyles.fill, style, { backgroundColor: item.color }]} />
                </View>
            </View>
        </Animated.View>
    );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ eyebrow, value, sub, accent }) => (
    <View style={[scStyles.card, accent && scStyles.cardAccent]}>
        <Text style={scStyles.eyebrow}>{eyebrow}</Text>
        <Text style={[scStyles.value, accent && scStyles.valueAccent]}>{value}</Text>
        <Text style={scStyles.sub}>{sub}</Text>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.paper },
    topBar: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
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
    topTitle: {
        fontSize: 14, fontWeight: "600", color: colors.ink3,
        letterSpacing: -0.1, fontStyle: "italic",
    },
    scroll: { paddingBottom: 48 },

    weekCard: {
        margin: 24,
        padding: 20,
        backgroundColor: colors.paper2,
        borderRadius: 16,
    },
    weekEyebrow: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3, marginBottom: 14,
    },
    weekRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
    },
    weekAmt: { fontSize: 20, fontWeight: "400", color: colors.ink, letterSpacing: -0.5 },
    weekLabel: { fontSize: 11, color: colors.ink3, marginTop: 2 },
    deltaBadge: {
        paddingVertical: 6, paddingHorizontal: 12,
        borderRadius: 100, borderWidth: 1,
    },
    deltaBadgeUp: { borderColor: colors.coral, backgroundColor: "rgba(232,85,58,0.06)" },
    deltaBadgeDown: { borderColor: colors.sage, backgroundColor: "rgba(90,107,74,0.06)" },
    deltaText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
    deltaUp: { color: colors.coral },
    deltaDown: { color: colors.sage },

    section: { paddingHorizontal: 24, paddingVertical: 20 },
    sectionTitle: {
        fontSize: 18, fontWeight: "500", color: colors.ink,
        letterSpacing: -0.3, fontStyle: "italic", marginBottom: 18,
    },

    barChart: { flexDirection: "row", gap: 7, alignItems: "flex-end", height: 130 },

    rule: { height: 1, backgroundColor: colors.line, marginHorizontal: 24 },

    statsGrid: {
        flexDirection: "row", gap: 12,
        paddingHorizontal: 24, paddingVertical: 20,
    },

    storyCard: {
        margin: 24, padding: 20,
        backgroundColor: colors.paper2, borderRadius: 16, gap: 10,
    },
    storyEyebrow: {
        fontSize: 10, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    storyText: { fontSize: 14, color: colors.ink2, lineHeight: 22, letterSpacing: -0.1 },
    storyQuote: {
        fontSize: 12, color: colors.ink3, fontStyle: "italic",
        lineHeight: 18, marginTop: 4,
        paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line,
    },
});

const bStyles = StyleSheet.create({
    col: { flex: 1, alignItems: "center", gap: 4 },
    val: { fontSize: 9, color: colors.ink3, letterSpacing: 0.2 },
    track: {
        width: BAR_W, height: 90,
        backgroundColor: colors.paper2, borderRadius: 4,
        justifyContent: "flex-end", overflow: "hidden",
    },
    fill: {
        backgroundColor: colors.ink, borderRadius: 4,
    },
    fillToday: { backgroundColor: colors.coral },
    label: { fontSize: 11, fontWeight: "600", color: colors.ink3, letterSpacing: 0.2 },
    labelToday: { color: colors.coral },
});

const cStyles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
    dot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 5, flexShrink: 0 },
    info: { flex: 1, gap: 8 },
    infoHeader: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    name: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.ink, letterSpacing: -0.1 },
    pct: { fontSize: 11, fontWeight: "600", color: colors.ink3, fontVariant: ["tabular-nums"] },
    amt: { fontSize: 13, fontWeight: "600", color: colors.ink, fontVariant: ["tabular-nums"] },
    track: { height: 3, backgroundColor: colors.line, borderRadius: 2, overflow: "hidden" },
    fill: { height: 3, borderRadius: 2 },
});

const scStyles = StyleSheet.create({
    card: {
        flex: 1, padding: 16,
        backgroundColor: colors.paper2, borderRadius: 14, gap: 6,
    },
    cardAccent: { backgroundColor: colors.ink },
    eyebrow: {
        fontSize: 9, fontWeight: "600", letterSpacing: 1.4,
        textTransform: "uppercase", color: colors.ink3,
    },
    value: { fontSize: 18, fontWeight: "400", color: colors.ink, letterSpacing: -0.4 },
    valueAccent: { color: colors.paper },
    sub: { fontSize: 11, color: colors.ink3 },
});
