import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Banco, createTable } from "../config/bd";
import { COLORS } from "../constants/theme";
import { ListScreen } from "../screens/ListScreen";
import { RegisterScreen } from "../screens/RegisterScreen";

const Tab = createBottomTabNavigator();

export function Navigator() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function initDatabase() {
      try {
        const db = await Banco();
        await createTable(db);
      } catch (error) {
        console.log("Erro ao inicializar banco", error);
      }
    }
    initDatabase();
  }, []);

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = "";

            if (route.name === "Cadastro") {
              iconName = focused ? "account-plus" : "account-plus-outline";
            } else if (route.name === "Listagem") {
              iconName = focused
                ? "account-multiple"
                : "account-multiple-outline";
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
          tabBarShowLabel: true,
          tabBarItemStyle: styles.tabBarItem,
          // Importante: isso garante que a tab bar seja renderizada acima da barra de navegação do Android
          tabBarPosition: "bottom",
        })}
      >
        <Tab.Screen
          name="Cadastro"
          options={{
            title: "Cadastro",
          }}
        >
          {() => <RegisterScreen onSuccess={handleSaveSuccess} />}
        </Tab.Screen>

        <Tab.Screen
          name="Listagem"
          options={{
            title: "Listagem",
          }}
        >
          {() => <ListScreen refreshTrigger={refreshTrigger} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingBottom: 6,
    paddingTop: 8,
    height: 64,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // Importante para o Android - garante que a tab bar não fique por cima de outras elementos
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    color: COLORS.text,
  },
  tabBarItem: {
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
