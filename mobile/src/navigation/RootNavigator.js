// Pica Editorial — RootNavigator
// Full flow: Splash → Onboarding → Auth → App (5 tabs)
// Paper-and-ink theme. Custom tab bar. Animated transitions.

import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

// Screens
import { SplashScreen }          from "../screens/SplashScreen";
import { OnboardingScreen }      from "../screens/OnboardingScreen";
import { BudgetSetupScreen }     from "../screens/BudgetSetupScreen";
import { LoginScreen }           from "../screens/LoginScreen";
import { RegisterScreen }        from "../screens/RegisterScreen";
import { DashboardScreen }       from "../screens/DashboardScreen";
import { ExpenseListScreen }     from "../screens/ExpenseListScreen";
import { AddEditExpenseScreen }  from "../screens/AddEditExpenseScreen";
import { InsightsScreen }        from "../screens/InsightsScreen";
import { ProfileScreen }         from "../screens/ProfileScreen";

const Stack        = createNativeStackNavigator();
const AuthStack    = createNativeStackNavigator();
const Tab          = createBottomTabNavigator();
const ExpenseStack = createNativeStackNavigator();

// Editorial nav theme
const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background:   colors.paper,
        card:         colors.paper,
        text:         colors.ink,
        border:       colors.line,
        primary:      colors.coral,
        notification: colors.coral,
    },
};

// ── Tab icon shapes (pure RN, no icon library) ────────────────────────────────

const HomeIcon = ({ focused }) => (
    <View style={[ti.square, !focused && ti.squareMuted]}>
        <View style={[ti.squareDot, focused && ti.squareDotActive]} />
    </View>
);

const JournalIcon = ({ focused }) => (
    <View style={ti.stack}>
        <View style={[ti.line, !focused && ti.lineMuted]} />
        <View style={[ti.lineShort, !focused && ti.lineMuted]} />
        <View style={[ti.line, !focused && ti.lineMuted]} />
    </View>
);

const AddIcon = ({ focused }) => (
    <View style={[ti.addCircle, focused && ti.addCircleActive]}>
        <Text style={[ti.addPlus, focused && ti.addPlusActive]}>+</Text>
    </View>
);

const InsightsIcon = ({ focused }) => (
    <View style={ti.barsWrap}>
        <View style={[ti.bar, ti.bar1, !focused && ti.barMuted]} />
        <View style={[ti.bar, ti.bar2, !focused && ti.barMuted]} />
        <View style={[ti.bar, ti.bar3, !focused && ti.barMuted]} />
    </View>
);

const ProfileIcon = ({ focused }) => (
    <View style={[ti.profile, !focused && ti.profileMuted]}>
        <View style={[ti.profileHead, !focused && ti.profileHeadMuted]} />
        <View style={[ti.profileShoulder, !focused && ti.profileShoulderMuted]} />
    </View>
);

const TAB_ICONS = { Home: HomeIcon, Journal: JournalIcon, Add: AddIcon, Insights: InsightsIcon, Profile: ProfileIcon };

// ── Custom tab bar ─────────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={tabBar.container}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const focused = state.index === index;
                const label   = route.name;
                const Icon    = TAB_ICONS[label] || HomeIcon;

                const scale = useSharedValue(1);
                const style = useAnimatedStyle(() => ({
                    transform: [{ scale: scale.value }],
                }));

                const onPress = () => {
                    scale.value = withSpring(0.88, { damping: 8 });
                    setTimeout(() => { scale.value = withSpring(1, { damping: 12 }); }, 120);
                    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                    if (!focused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <Pressable key={route.key} onPress={onPress} style={tabBar.tab}>
                        <Animated.View style={[tabBar.tabInner, style]}>
                            <Icon focused={focused} />
                            <Text style={[tabBar.label, focused && tabBar.labelActive]}>
                                {label}
                            </Text>
                        </Animated.View>
                    </Pressable>
                );
            })}
        </View>
    );
};

// ── Expense nested stack ───────────────────────────────────────────────────────
const ExpensesStackNavigator = () => (
    <ExpenseStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        <ExpenseStack.Screen name="ExpenseList" component={ExpenseListScreen} />
        <ExpenseStack.Screen
            name="AddEditExpense"
            component={AddEditExpenseScreen}
            options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
    </ExpenseStack.Navigator>
);

// ── App tabs ──────────────────────────────────────────────────────────────────
const AppTabs = () => (
    <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
    >
        <Tab.Screen name="Home"     component={DashboardScreen} />
        <Tab.Screen name="Insights" component={InsightsScreen} />
        <Tab.Screen name="Journal"  component={ExpensesStackNavigator} />
        <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
);

// ── Auth stack ─────────────────────────────────────────────────────────────────
const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: "slide_from_right",
        }}
    >
        <AuthStack.Screen name="Login"    component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

// ── Root ──────────────────────────────────────────────────────────────────────
export const RootNavigator = () => {
    const { user, loading } = useAuth();
    const [stage, setStage] = useState("splash"); // splash | onboarding | budget | auth | app

    useEffect(() => {
        if (!loading) {
            if (user) {
                setStage("app");
            }
            // If not logged in, splash will navigate to onboarding
        }
    }, [user, loading]);

    const onSplashDone = async () => {
        const seen = await AsyncStorage.getItem("@pica_onboarded").catch(() => null);
        setStage(seen ? "auth" : "onboarding");
    };

    const onOnboardingDone = () => {
        setStage("budget");
    };

    const onBudgetDone = async () => {
        await AsyncStorage.setItem("@pica_onboarded", "1").catch(() => {});
        setStage("auth");
    };

    // Splash screen (always shown first on cold launch)
    if (stage === "splash") {
        return <SplashScreen onFinish={onSplashDone} />;
    }

    if (stage === "onboarding") {
        return (
            <OnboardingScreen
                onFinish={onOnboardingDone}
                onSkip={() => setStage("budget")}
            />
        );
    }

    if (stage === "budget") {
        return <BudgetSetupScreen onFinish={onBudgetDone} />;
    }

    if (loading) {
        return (
            <View style={loadStyles.root}>
                <View style={loadStyles.mark}><View style={loadStyles.dot} /></View>
                <Text style={loadStyles.name}>Pica</Text>
                <Text style={loadStyles.hint}>Reading your journal...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer theme={navTheme}>
            {user ? <AppTabs /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

// ── Tab bar styles ─────────────────────────────────────────────────────────────
const tabBar = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: colors.paper,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        paddingBottom: 20,
        paddingTop: 12,
        height: 72,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    tabInner: {
        alignItems: "center",
        gap: 4,
    },
    label: {
        fontSize: 9,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: colors.ink3,
    },
    labelActive: {
        color: colors.ink,
    },
});

// ── Icon styles ────────────────────────────────────────────────────────────────
const ti = StyleSheet.create({
    // Home (square with dot)
    square: {
        width: 16, height: 16, borderWidth: 1.5,
        borderColor: colors.ink, borderRadius: 4,
        alignItems: "center", justifyContent: "center",
    },
    squareMuted: { borderColor: colors.ink3 },
    squareDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.paper2 },
    squareDotActive: { backgroundColor: colors.coral },

    // Journal (3 lines)
    stack: { gap: 3.5, alignItems: "flex-start", width: 18 },
    line: { height: 1.5, width: 18, backgroundColor: colors.ink, borderRadius: 1 },
    lineShort: { height: 1.5, width: 12, backgroundColor: colors.ink, borderRadius: 1 },
    lineMuted: { backgroundColor: colors.ink3 },

    // Add (circle)
    addCircle: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 1.5, borderColor: colors.ink3,
        alignItems: "center", justifyContent: "center",
    },
    addCircleActive: { backgroundColor: colors.ink, borderColor: colors.ink },
    addPlus: { fontSize: 18, fontWeight: "300", color: colors.ink3, lineHeight: 22, marginTop: -1 },
    addPlusActive: { color: colors.paper },

    // Insights (bar chart)
    barsWrap: { flexDirection: "row", alignItems: "flex-end", gap: 2.5, height: 14 },
    bar: { width: 4, borderRadius: 2, backgroundColor: colors.ink },
    bar1: { height: 8 },
    bar2: { height: 14 },
    bar3: { height: 11 },
    barMuted: { backgroundColor: colors.ink3 },

    // Profile (head + shoulders)
    profile: { alignItems: "center", gap: 1 },
    profileMuted: {},
    profileHead: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink },
    profileHeadMuted: { backgroundColor: colors.ink3 },
    profileShoulder: { width: 14, height: 5, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: colors.ink },
    profileShoulderMuted: { backgroundColor: colors.ink3 },
});

// ── Loading screen ─────────────────────────────────────────────────────────────
const loadStyles = StyleSheet.create({
    root: {
        flex: 1, backgroundColor: colors.paper,
        alignItems: "center", justifyContent: "center", gap: 12,
    },
    mark: {
        width: 40, height: 40, borderRadius: 20,
        borderWidth: 1, borderColor: colors.line3,
        alignItems: "center", justifyContent: "center",
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.coral },
    name: { fontSize: 18, fontWeight: "400", color: colors.ink, letterSpacing: -0.3, fontStyle: "italic" },
    hint: { fontSize: 12, color: colors.ink3, letterSpacing: 0.2 },
});
