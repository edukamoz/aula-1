import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { EditModal } from "../components/EditModal";
import {
  Banco,
  createTable,
  deletaUsuario,
  exibirUsuarios,
} from "../config/bd";
import { BORDER_RADIUS, COLORS, SHADOW } from "../constants/theme";

type SortType = "nome" | "email" | "cidade" | "data";

interface ListScreenProps {
  refreshTrigger?: number;
}

export function ListScreen({ refreshTrigger }: ListScreenProps) {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("nome");
  const [editingUsuarioId, setEditingUsuarioId] = useState<
    number | undefined
  >();
  const [showEditModal, setShowEditModal] = useState(false);

  // Refs para rastrear requisições e estado do componente
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUsuarios();

      return () => {
        // Cleanup: cancelar requisição se o componente for desmontado
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [refreshTrigger]),
  );

  const loadUsuarios = async () => {
    // Evitar requisições duplicadas
    if (loadingRef.current) {
      console.log("⏳ Já há uma requisição em andamento");
      return;
    }

    loadingRef.current = true;
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
      const db = await Banco();
      await createTable(db);

      // Verificar se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        console.log("❌ Requisição cancelada");
        return;
      }

      const resultado = await exibirUsuarios(db);

      if (isMountedRef.current) {
        setUsuarios(resultado || []);
        console.log("✅ Usuários carregados:", resultado?.length || 0);
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMsg = error instanceof Error ? error.message : String(error);
      if (!errorMsg.includes("abort")) {
        console.log("❌ Erro ao carregar usuários:", error);
        Toast.show({
          type: "error",
          text1: "Erro ao carregar",
          text2: "Não foi possível carregar os usuários.",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  // Filtrar com regex
  const filteredUsuarios = useMemo(() => {
    if (!searchText) return usuarios;

    try {
      const regex = new RegExp(searchText, "i");
      return usuarios.filter(
        (user) =>
          regex.test(user.NOME_US) ||
          regex.test(user.EMAIL_US) ||
          regex.test(user.CIDADE_US) ||
          regex.test(user.LOGRADOURO_US),
      );
    } catch {
      // Regex inválido
      return usuarios;
    }
  }, [usuarios, searchText]);

  // Ordenar
  const sortedUsuarios = useMemo(() => {
    const sorted = [...filteredUsuarios];

    switch (sortBy) {
      case "nome":
        sorted.sort((a, b) => a.NOME_US.localeCompare(b.NOME_US, "pt-BR"));
        break;
      case "email":
        sorted.sort((a, b) => a.EMAIL_US.localeCompare(b.EMAIL_US, "pt-BR"));
        break;
      case "cidade":
        sorted.sort((a, b) => a.CIDADE_US.localeCompare(b.CIDADE_US, "pt-BR"));
        break;
      case "data":
        sorted.sort(
          (a, b) =>
            new Date(b.DATA_CADASTRO || 0).getTime() -
            new Date(a.DATA_CADASTRO || 0).getTime(),
        );
        break;
    }

    return sorted;
  }, [filteredUsuarios, sortBy]);

  const handleDeleteUsuario = (usuarioId: number, nome: string) => {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja deletar "${nome}"?`,
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Deletar",
          onPress: () => deleteUsuario(usuarioId),
          style: "destructive",
        },
      ],
    );
  };

  const deleteUsuario = async (usuarioId: number) => {
    try {
      const db = await Banco();
      const success = await deletaUsuario(db, usuarioId);
      if (success) {
        Toast.show({
          type: "success",
          text1: "Usuário deletado!",
          text2: "O usuário foi removido com sucesso.",
        });
        loadUsuarios();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao deletar",
        text2: "Não foi possível deletar o usuário.",
      });
    }
  };

  const handleEditUsuario = (usuarioId: number) => {
    setEditingUsuarioId(usuarioId);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    loadUsuarios();
  };

  const renderUsuario = ({ item }: { item: any }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioInfo}>
        <Text style={styles.usuarioNome}>{item.NOME_US}</Text>
        <Text style={styles.usuarioEmail}>{item.EMAIL_US}</Text>
        <Text style={styles.usuarioEndereco}>
          {item.LOGRADOURO_US}, {item.NUMERO_US} • {item.CIDADE_US},{" "}
          {item.UF_US}
        </Text>
        <Text style={styles.usuarioCep}>{item.CEP_US}</Text>
      </View>
      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => handleEditUsuario(item.ID_US)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={COLORS.background}
          />
          <Text style={styles.btnTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnDeletar}
          onPress={() => handleDeleteUsuario(item.ID_US, item.NOME_US)}
        >
          <MaterialCommunityIcons
            name="trash-can"
            size={18}
            color={COLORS.background}
          />
          <Text style={styles.btnTexto}>Deletar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuários Cadastrados</Text>
        <Text style={styles.count}>{sortedUsuarios.length} cadastro(s)</Text>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={COLORS.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar (nome, email, cidade...)"
          placeholderTextColor={COLORS.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filtros e Ordenação */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Ordenar por:</Text>
        <View style={styles.sortButtons}>
          {(
            [
              { label: "Nome", value: "nome" },
              { label: "Email", value: "email" },
              { label: "Cidade", value: "cidade" },
              { label: "Data", value: "data" },
            ] as const
          ).map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortButton,
                sortBy === option.value && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(option.value)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === option.value && styles.sortButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista */}
      {sortedUsuarios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name={searchText ? "magnify-close" : "account-multiple"}
            size={48}
            color={COLORS.textMuted}
          />
          <Text style={styles.emptyText}>
            {searchText
              ? "Nenhum resultado encontrado"
              : "Nenhum usuário cadastrado"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchText
              ? "Tente uma pesquisa diferente"
              : "Vá para a aba 'Cadastro' para adicionar um novo usuário"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedUsuarios}
          keyExtractor={(item) => item.ID_US.toString()}
          renderItem={renderUsuario}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de Edição */}
      <EditModal
        visible={showEditModal}
        usuarioId={editingUsuarioId}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  count: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 10,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "transparent",
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  sortButtonTextActive: {
    color: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  usuarioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  usuarioInfo: {
    marginBottom: 12,
  },
  usuarioNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  usuarioEmail: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  usuarioEndereco: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  usuarioCep: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  acoes: {
    flexDirection: "row",
    gap: 8,
  },
  btnEditar: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  btnDeletar: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  btnTexto: {
    color: COLORS.background,
    fontWeight: "600",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
});
