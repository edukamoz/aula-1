import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { BORDER_RADIUS, COLORS, SHADOW } from "../constants/theme";
import { getClients, deleteClient, ClientData } from "../services/api";
import { EditModal } from "../components/EditModal";

type SortType = "nome" | "email" | "cidade";

interface ListScreenProps {
  refreshTrigger?: number;
}

export function ListScreen({ refreshTrigger }: ListScreenProps) {
  const [clientes, setClientes] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("nome");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClienteId, setEditingClienteId] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      loadClientes();
    }, [refreshTrigger])
  );

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClientes(data || []);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro na API",
        text2: "Verifique se o backend está rodando e a configuração do banco.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = useMemo(() => {
    if (!searchText) return clientes;
    try {
      const regex = new RegExp(searchText, "i");
      return clientes.filter(
        (c) =>
          regex.test(c.nome) ||
          regex.test(c.email) ||
          regex.test(c.localidade) ||
          regex.test(c.logradouro)
      );
    } catch {
      return clientes;
    }
  }, [clientes, searchText]);

  const sortedClientes = useMemo(() => {
    const sorted = [...filteredClientes];
    switch (sortBy) {
      case "nome":
        sorted.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        break;
      case "email":
        sorted.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        break;
      case "cidade":
        sorted.sort((a, b) => (a.localidade || "").localeCompare(b.localidade || ""));
        break;
    }
    return sorted;
  }, [filteredClientes, sortBy]);

  const handleOpenMap = (cliente: ClientData) => {
    const query = `${cliente.logradouro}, ${cliente.complemento || ""} ${cliente.bairro}, ${cliente.localidade} - ${cliente.uf}, ${cliente.cep}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(query)}`,
      android: `geo:0,0?q=${encodeURIComponent(query)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    });

    Linking.openURL(url!).catch(() => {
      // Fallback to browser if native app fails
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`).catch(() => {
        Toast.show({ type: "error", text1: "Erro", text2: "Não foi possível abrir o mapa." });
      });
    });
  };

  const handleEdit = (id: string) => {
    setEditingClienteId(id);
    setShowEditModal(true);
  };

  const handleDelete = (id: string, nome: string) => {
    Alert.alert("Remover Cliente", `Deseja realmente remover ${nome}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(id);
            Toast.show({ type: "success", text1: "Removido", text2: "Cliente deletado com sucesso." });
            loadClientes();
          } catch (error) {
            Toast.show({ type: "error", text1: "Erro", text2: "Falha ao remover cliente." });
          }
        },
      },
    ]);
  };

  const renderCliente = ({ item }: { item: ClientData }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nome?.charAt(0).toUpperCase() || "?"}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <TouchableOpacity onPress={() => handleEdit(item.id!)} style={{ marginRight: 15 }}>
          <MaterialCommunityIcons name="pencil-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id!, item.nome)}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.addressRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.addressText} numberOfLines={2}>
          {item.logradouro}, {item.complemento ? item.complemento + " - " : ""}{item.bairro}
          {"\n"}{item.localidade}/{item.uf} • CEP: {item.cep}
        </Text>
      </View>

      <TouchableOpacity style={styles.mapButton} onPress={() => handleOpenMap(item)}>
        <MaterialCommunityIcons name="map-search-outline" size={20} color={COLORS.primary} />
        <Text style={styles.mapButtonText}>Abrir no Mapa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRM Clientes</Text>
        <Text style={styles.count}>{sortedClientes.length} cliente(s)</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar (nome, email, cidade...)"
          placeholderTextColor={COLORS.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Ordenar por:</Text>
        <View style={styles.sortButtons}>
          {(["nome", "email", "cidade"] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : sortedClientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name={searchText ? "account-search" : "account-group"} size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{searchText ? "Nenhum cliente encontrado" : "Sua base está vazia"}</Text>
          <Text style={styles.emptySubtext}>Cadastre um novo cliente na aba lateral.</Text>
        </View>
      ) : (
        <FlatList
          data={sortedClientes}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderCliente}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}

      <EditModal
        visible={showEditModal}
        usuarioId={editingClienteId}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadClientes}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.primary },
  count: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8 },
  sortButtons: { flexDirection: "row", gap: 8 },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
  },
  sortButtonActive: { backgroundColor: COLORS.primary },
  sortButtonText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  sortButtonTextActive: { color: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.sm,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(6, 182, 212, 0.15)", // Primary with low opacity
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: COLORS.primary },
  cardInfo: { flex: 1 },
  nome: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  addressRow: { flexDirection: "row", marginBottom: 12, paddingRight: 16 },
  addressText: { fontSize: 13, color: COLORS.textMuted, marginLeft: 8, lineHeight: 18 },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  mapButtonText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 18, fontWeight: "600", color: COLORS.text, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: "center" },
});
