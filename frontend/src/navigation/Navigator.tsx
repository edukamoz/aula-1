import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/theme";
import { ListScreen } from "../screens/ListScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export function Navigator() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = "";

            if (route.name === "Clientes") {
              iconName = focused ? "card-account-details" : "card-account-details-outline";
            } else if (route.name === "Novo") {
              iconName = focused ? "plus-circle" : "plus-circle-outline";
            } else if (route.name === "Ajustes") {
              iconName = focused ? "cog" : "cog-outline";
            }

            return (
              <View style={focused ? styles.iconActive : styles.iconInactive}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={size + 2}
                  color={color}
                />
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
          tabBarShowLabel: true,
          tabBarItemStyle: styles.tabBarItem,
          tabBarPosition: "bottom",
        })}
      >
        <Tab.Screen name="Clientes">
          {() => <ListScreen refreshTrigger={refreshTrigger} />}
        </Tab.Screen>

        <Tab.Screen name="Novo">
          {() => <RegisterScreen onSuccess={handleSaveSuccess} />}
        </Tab.Screen>

        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconActive: {
    backgroundColor: COLORS.surfaceLight,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInactive: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
