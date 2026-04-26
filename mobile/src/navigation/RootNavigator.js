// Spendly Editorial — RootNavigator
// Paper-and-ink navigation theme. Clean tab bar, no clutter.

import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ExpenseListScreen } from "../screens/ExpenseListScreen";
import { AddEditExpenseScreen } from "../screens/AddEditExpenseScreen";
import { DashboardScreen } from "../screens/DashboardScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ExpenseStack = createNativeStackNavigator();

// Editorial nav theme — paper bg, ink text
const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background:  colors.paper,
        card:        colors.paper,
        text:        colors.ink,
        border:      colors.line,
        primary:     colors.coral,
        notification:colors.coral,
    },
};

// Tab bar icon — simple geometric shapes, no icon library needed
const TabIcon = ({ name, focused }) => {
    const icons = {
        Journal: focused
            ? <View style={ti.stack}><View style={ti.line} /><View style={ti.lineShort} /><View style={ti.line} /></View>
            : <View style={ti.stack}><View style={[ti.line, ti.lineMuted]} /><View style={[ti.lineShort, ti.lineMuted]} /><View style={[ti.line, ti.lineMuted]} /></View>,
        Home: focused
            ? <View style={ti.square}><View style={ti.squareDot} /></View>
            : <View style={[ti.square, ti.squareMuted]} />,
    };
    return icons[name] || null;
};

const ti = StyleSheet.create({
    stack:       { gap: 4, alignItems: "flex-start", width: 18 },
    line:        { height: 1.5, width: 18, backgroundColor: colors.ink, borderRadius: 1 },
    lineShort:   { height: 1.5, width: 12, backgroundColor: colors.ink, borderRadius: 1 },
    lineMuted:   { backgroundColor: colors.ink3 },
    square:      { width: 16, height: 16, borderWidth: 1.5, borderColor: colors.ink, borderRadius: 4, alignItems: "center", justifyContent: "center" },
    squareMuted: { borderColor: colors.ink3 },
    squareDot:   { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.coral },
});

// Custom tab bar label
const TabLabel = ({ label, focused }) => (
    <Text style={{
        fontSize: 9,
        fontWeight: "600",
        letterSpacing: 1.0,
        textTransform: "uppercase",
        color: focused ? colors.ink : colors.ink3,
        marginTop: 3,
    }}>
        {label}
    </Text>
);

const ExpensesStackNavigator = () => (
    <ExpenseStack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: "slide_from_right",
        }}
    >
        <ExpenseStack.Screen name="ExpenseList" component={ExpenseListScreen} />
        <ExpenseStack.Screen
            name="AddEditExpense"
            component={AddEditExpenseScreen}
            options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
    </ExpenseStack.Navigator>
);

const AppTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.paper,
                borderTopWidth: 1,
                borderTopColor: colors.line,
                height: 72,
                paddingBottom: 16,
                paddingTop: 12,
                elevation: 0,
                shadowOpacity: 0,
            },
            tabBarIcon: ({ focused }) => (
                <TabIcon name={route.name === "ExpensesTab" ? "Journal" : "Home"} focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
                <TabLabel
                    label={route.name === "ExpensesTab" ? "Journal" : "Home"}
                    focused={focused}
                />
            ),
            tabBarActiveTintColor: colors.ink,
            tabBarInactiveTintColor: colors.ink3,
        })}
    >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="ExpensesTab" component={ExpensesStackNavigator} />
    </Tab.Navigator>
);

export const RootNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={loadStyles.root}>
                <View style={loadStyles.mark}>
                    <View style={loadStyles.dot} />
                </View>
                <Text style={loadStyles.name}>Spendly</Text>
                <Text style={loadStyles.hint}>Reading your journal...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer theme={navTheme}>
            {!user ? (
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.paper },
                        animation: "slide_from_right",
                    }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            ) : (
                <AppTabs />
            )}
        </NavigationContainer>
    );
};

const loadStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.paper,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    mark: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line3,
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.coral,
    },
    name: {
        fontSize: 18,
        fontWeight: "400",
        color: colors.ink,
        letterSpacing: -0.3,
        fontStyle: "italic",
    },
    hint: {
        fontSize: 12,
        color: colors.ink3,
        letterSpacing: 0.2,
    },
});
