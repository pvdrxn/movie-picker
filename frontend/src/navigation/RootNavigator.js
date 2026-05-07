import React, { useContext, useRef, useEffect } from "react";
import { Animated } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PickScreen } from "../screens/PickScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { MovieDetailsScreen } from "../screens/MovieDetailsScreen";
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
      <ActivityIndicator />
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const scaleValues = useRef(state.routes.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    scaleValues.forEach((value, index) => {
      Animated.spring(value, {
        toValue: state.index === index ? 1.35 : 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 150,
      }).start();
    });
  }, [state.index]);

return (
    <View style={styles.outerContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
                  const { options } = descriptors[route.key];
                  const label = options.tabBarLabel ?? options.title ?? route.name;
                  const isFocused = state.index === index;

                  const onPress = () => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  };

                  const icons = {
                    Browse: "star-outline",
                    Search: "search-outline",
                    Favorites: "bookmark-outline",
                    Pick: "swap-horizontal-outline",
                  };

                  return (
                    <TouchableOpacity
                      key={route.key}
                      onPress={onPress}
                      style={styles.tabItem}
                    >
                      <Animated.View style={{ transform: [{ scale: scaleValues[index] }] }}>
                        <Ionicons
                          name={icons[route.name]}
                          size={24}
                          color={isFocused ? "#000" : "rgba(0,0,0,0.5)"}
                        />
                      </Animated.View>
                      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
);
        })}
      </View>
    </View>
  );
}

function MoviesTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Browse"
        component={HomeScreen}
        options={{
          tabBarLabel: "Browse",
          tabBarIcon: () => <Ionicons name="star-outline" size={24} color="#000" />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: () => <Ionicons name="search-outline" size={24} color="#000" />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Favorites",
          tabBarIcon: () => <Ionicons name="bookmark-outline" size={24} color="#000" />,
        }}
      />
      <Tab.Screen
        name="Pick"
        component={PickScreen}
        options={{
          tabBarLabel: "Pick",
          tabBarIcon: () => <Ionicons name="swap-horizontal-outline" size={24} color="#000" />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MoviesTabs" component={MoviesTabs} />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack.Navigator>
    </View>
  );
}

export function RootNavigator() {
  const { isBootstrapping, isSignedIn } = useContext(AuthContext);

  if (isBootstrapping) return <Splash />;

  return (
    <NavigationContainer>
      {isSignedIn ? (
        <AppStack />
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerStyle: { backgroundColor: "#000000" }, headerTintColor: "#fff" }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
outerContainer: {
    position: "absolute",
    bottom: 24,
    left: "2.5%",
    right: 0,
    width: "95%",
    height: 80,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 80,
    backgroundColor: "#A7ED10",
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
paddingBottom: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(0,0,0,0.5)",
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#000",
  },
});