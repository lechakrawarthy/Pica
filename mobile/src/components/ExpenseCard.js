// Spendly Editorial — ExpenseCard
// Journal entry style. Category dot, merchant name in serif weight,
// amount in tabular mono. Every rupee, noticed.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, getCategoryColor } from "../theme/colors";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

export const ExpenseCard = ({ expense, onEdit, onDelete }) => {
    const catColor = getCategoryColor(expense.category);
    const hasNote = expense.note && expense.note.trim().length > 0;

    return (
        <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            {/* Left: category dot + info */}
            <View style={styles.left}>
                <View style={[styles.catDot, { backgroundColor: catColor }]} />
                <View style={styles.info}>
                    <Text style={styles.category} numberOfLines={1}>
                        {expense.category || "Uncategorized"}
                    </Text>
                    {hasNote ? (
                        <Text style={styles.note} numberOfLines={1}>
                            "{expense.note}"
                        </Text>
                    ) : null}
                    <Text style={styles.date}>{formatDate(expense.date)}</Text>
                </View>
            </View>

            {/* Right: amount + actions */}
            <View style={styles.right}>
                <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
                <View style={styles.actions}>
                    <Pressable
                        onPress={onEdit}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                    >
                        <Text style={styles.actionLabel}>Edit</Text>
                    </Pressable>
                    <View style={styles.actionDivider} />
                    <Pressable
                        onPress={onDelete}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                    >
                        <Text style={[styles.actionLabel, styles.deleteLabel]}>Del</Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
};

// Compact list item for inside the dashboard category breakdown
export const CategoryRow = ({ category, amount, pct, color, rank }) => (
    <View style={styles.catRow}>
        <View style={[styles.catDot, { backgroundColor: color || colors.ink3, marginTop: 2 }]} />
        <View style={styles.catRowInfo}>
            <Text style={styles.catRowName}>{category}</Text>
            <View style={styles.catRowBar}>
                <View style={[styles.catRowFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color || colors.ink3 }]} />
            </View>
        </View>
        <View style={styles.catRowRight}>
            <Text style={styles.catRowPct}>{Math.round(pct)}%</Text>
            <Text style={styles.catRowAmt}>{formatCurrency(amount)}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    cardPressed: {
        backgroundColor: colors.paper2,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    left: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
        gap: 12,
    },
    catDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 5,
        flexShrink: 0,
    },
    info: {
        flex: 1,
        gap: 3,
    },
    category: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: -0.2,
    },
    note: {
        fontSize: 13,
        color: colors.ink3,
        fontStyle: "italic",
        lineHeight: 18,
    },
    date: {
        fontSize: 11,
        color: colors.ink3,
        letterSpacing: 0.3,
        marginTop: 2,
    },
    right: {
        alignItems: "flex-end",
        gap: 8,
        paddingLeft: 12,
    },
    amount: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.ink,
        letterSpacing: -0.4,
        fontVariant: ["tabular-nums"],
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionBtn: {
        paddingVertical: 2,
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.0,
        textTransform: "uppercase",
        color: colors.ink3,
    },
    deleteLabel: {
        color: colors.coral,
    },
    actionDivider: {
        width: 1,
        height: 10,
        backgroundColor: colors.line2,
    },

    // CategoryRow
    catRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 16,
    },
    catRowInfo: {
        flex: 1,
        gap: 6,
    },
    catRowName: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.ink,
        letterSpacing: -0.1,
    },
    catRowBar: {
        height: 3,
        backgroundColor: colors.line,
        borderRadius: 2,
        overflow: "hidden",
    },
    catRowFill: {
        height: 3,
        borderRadius: 2,
    },
    catRowRight: {
        alignItems: "flex-end",
        gap: 2,
    },
    catRowPct: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.ink3,
        fontVariant: ["tabular-nums"],
    },
    catRowAmt: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.ink,
        fontVariant: ["tabular-nums"],
    },
});
