import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
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

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.bg,
        card: colors.bgSoft,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
    },
};

const ExpensesStackNavigator = () => (
    <ExpenseStack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.bgSoft },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
        }}
    >
        <ExpenseStack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ title: "Expenses" }} />
        <ExpenseStack.Screen
            name="AddEditExpense"
            component={AddEditExpenseScreen}
            options={({ route }) => ({ title: route.params?.expense ? "Edit Expense" : "Add Expense" })}
        />
    </ExpenseStack.Navigator>
);

const AppTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.bgSoft,
                borderTopColor: colors.border,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            tabBarIcon: ({ color, size }) => {
                const iconName = route.name === "ExpensesTab" ? "wallet-outline" : "pie-chart-outline";
                return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
    >
        <Tab.Screen name="ExpensesTab" component={ExpensesStackNavigator} options={{ title: "Expenses" }} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
);

export const RootNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={navTheme}>
            {!user ? (
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: colors.bgSoft },
                        headerTintColor: colors.text,
                        contentStyle: { backgroundColor: colors.bg },
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
