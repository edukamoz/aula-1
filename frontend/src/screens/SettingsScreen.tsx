import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { COLORS, BORDER_RADIUS, SHADOW } from "../constants/theme";
import { getPreference, savePreference } from "../utils/storage";

// Fallback in-memory storage
export let globalDbType = "sqlite";

export function SettingsScreen() {
  const [dbType, setDbType] = useState<"sqlite" | "mongo">("sqlite");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDb = await getPreference("@db_type");
      if (savedDb === "mongo" || savedDb === "sqlite") {
        setDbType(savedDb);
        globalDbType = savedDb;
      }
    } catch (e) {
      console.warn("Erro ao ler prefs, usando fallback de memória");
      setDbType(globalDbType as any);
    }
  };

  const toggleSwitch = async (value: boolean) => {
    const newDb = value ? "mongo" : "sqlite";
    setDbType(newDb);
    globalDbType = newDb;
    try {
      await savePreference("@db_type", newDb);
      Toast.show({
        type: "success",
        text1: "Banco de dados alterado!",
        text2: `Agora o app salvará no: ${newDb.toUpperCase()}`,
      });
    } catch (e) {
      Toast.show({
        type: "success",
        text1: "Alterado (Modo Memória)!",
        text2: `Usando ${newDb.toUpperCase()} nesta sessão. Reinicie o app para fixar.`,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Armazenamento da API</Text>
          <Text style={styles.cardSubtitle}>
            Escolha onde a API deve salvar os seus dados de clientes.
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.dbLabel, dbType === "sqlite" && styles.dbLabelActive]}>
            SQLite
          </Text>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.border }}
            thumbColor={dbType === "mongo" ? COLORS.success : COLORS.primary}
            ios_backgroundColor={COLORS.border}
            onValueChange={toggleSwitch}
            value={dbType === "mongo"}
          />
          <Text style={[styles.dbLabel, dbType === "mongo" && styles.dbLabelActive]}>
            MongoDB
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            A API usa o Strategy Pattern. Essa opção define o cabeçalho X-Database-Type para interceptar as chamadas no backend.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 24,
    marginTop: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    ...SHADOW.md,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 20,
  },
  dbLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMuted,
    flex: 1,
    textAlign: "center",
  },
  dbLabelActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "rgba(6, 182, 212, 0.15)", // Primary with opacity
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
});
