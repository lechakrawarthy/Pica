import { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { AppHeader } from "../components/AppHeader";
import { StateView } from "../components/StateView";
import { useExpenses } from "../context/ExpenseContext";
import { layout } from "../theme/styles";
import { colors } from "../theme/colors";
import { formatCurrency } from "../utils/formatters";

export const DashboardScreen = () => {
    const { expenses, loading, error, fetchExpenses } = useExpenses();

    useFocusEffect(
        useCallback(() => {
            fetchExpenses();
        }, [])
    );

    const categoryTotals = useMemo(() => {
        return expenses.reduce((acc, expense) => {
            const key = expense.category?.trim() || "Uncategorized";
            acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
            return acc;
        }, {});
    }, [expenses]);

    const sortedTotals = useMemo(() => {
        return Object.entries(categoryTotals)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);
    }, [categoryTotals]);

    const totalSpend = useMemo(() => {
        return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [expenses]);

    return (
        <View style={layout.screen}>
            <View style={layout.content}>
                <AppHeader title="Dashboard" subtitle="Category-wise summary built from real expense records" />

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total Spend</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totalSpend)}</Text>
                    <Text style={styles.totalHint}>{expenses.length} expenses tracked</Text>
                </View>

                <StateView
                    loading={loading}
                    error={error}
                    onRetry={fetchExpenses}
                    empty={!loading && !error && sortedTotals.length === 0}
                    emptyText="No summary yet. Add expenses to populate your dashboard."
                />

                {!loading && !error && sortedTotals.length > 0 ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {sortedTotals.map((item, index) => (
                            <Pressable key={item.category} style={styles.categoryCard}>
                                <View>
                                    <Text style={styles.categoryName}>{item.category}</Text>
                                    <Text style={styles.categoryRank}>Rank #{index + 1}</Text>
                                </View>
                                <Text style={styles.categoryAmount}>{formatCurrency(item.total)}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    totalCard: {
        backgroundColor: "#0B2239",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#27486A",
        padding: 16,
        marginBottom: 14,
    },
    totalLabel: {
        color: "#A7C7E7",
        fontSize: 13,
    },
    totalAmount: {
        color: colors.white,
        fontSize: 30,
        fontWeight: "900",
        marginTop: 8,
    },
    totalHint: {
        color: "#A7C7E7",
        marginTop: 4,
    },
    categoryCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    categoryName: {
        color: colors.text,
        fontWeight: "700",
        fontSize: 16,
    },
    categoryRank: {
        color: colors.muted,
        marginTop: 4,
        fontSize: 12,
    },
    categoryAmount: {
        color: colors.accent,
        fontWeight: "900",
        fontSize: 17,
    },
});
