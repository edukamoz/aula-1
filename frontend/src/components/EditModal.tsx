import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { InputField } from "../components/InputField";
import { SelectField } from "../components/SelectField";
import { getClientById, updateClient } from "../services/api";
import { BORDER_RADIUS, COLORS, SHADOW } from "../constants/theme";
import { validateCEP, validateEmail, validateName } from "../utils/validation";

const ESTADOS_BRASIL = [
  { label: "Acre", value: "AC" },
  { label: "Alagoas", value: "AL" },
  { label: "Amapá", value: "AP" },
  { label: "Amazonas", value: "AM" },
  { label: "Bahia", value: "BA" },
  { label: "Ceará", value: "CE" },
  { label: "Distrito Federal", value: "DF" },
  { label: "Espírito Santo", value: "ES" },
  { label: "Goiás", value: "GO" },
  { label: "Maranhão", value: "MA" },
  { label: "Mato Grosso", value: "MT" },
  { label: "Mato Grosso do Sul", value: "MS" },
  { label: "Minas Gerais", value: "MG" },
  { label: "Pará", value: "PA" },
  { label: "Paraíba", value: "PB" },
  { label: "Paraná", value: "PR" },
  { label: "Pernambuco", value: "PE" },
  { label: "Piauí", value: "PI" },
  { label: "Rio de Janeiro", value: "RJ" },
  { label: "Rio Grande do Norte", value: "RN" },
  { label: "Rio Grande do Sul", value: "RS" },
  { label: "Rondônia", value: "RO" },
  { label: "Roraima", value: "RR" },
  { label: "Santa Catarina", value: "SC" },
  { label: "São Paulo", value: "SP" },
  { label: "Sergipe", value: "SE" },
  { label: "Tocantins", value: "TO" },
];

interface EditModalProps {
  visible: boolean;
  usuarioId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditModal({
  visible,
  usuarioId,
  onClose,
  onSuccess,
}: EditModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const numRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && usuarioId) {
      loadUsuarioData();
    }
  }, [visible, usuarioId]);

  const loadUsuarioData = async () => {
    try {
      const usuario = await getClientById(usuarioId!);

      if (usuario) {
        setNome(usuario.nome || "");
        setEmail(usuario.email || "");
        setCep(usuario.cep || "");
        setLogradouro(usuario.logradouro || "");
        setNumero(usuario.complemento || ""); // API só tem complemento, usando como tudo
        setComplemento(usuario.complemento || "");
        setBairro(usuario.bairro || "");
        setCidade(usuario.localidade || "");
        setUf(usuario.uf || "");
      }
    } catch (error) {
      console.log("❌ Erro ao carregar usuário:", error);
    }
  };

  const handleCepChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const masked = cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    setCep(masked);
  };

  const handleSearchCep = async () => {
    if (!validateCEP(cep)) {
      Toast.show({
        type: "error",
        text1: "CEP Inválido",
        text2: "Digite os 8 números do CEP.",
      });
      return;
    }

    setLoadingCep(true);
    try {
      const cleanCep = cep.replace(/\D/g, "");
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        Toast.show({
          type: "error",
          text1: "Não encontrado",
          text2: "Verifique o número e tente novamente.",
        });
        return;
      }

      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setUf(data.uf || "");
      setComplemento(data.complemento || "");
      setTimeout(() => numRef.current?.focus(), 100);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "Tente novamente mais tarde.",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSalvar = async () => {
    if (!validateName(nome) || !validateEmail(email) || !validateCEP(cep)) {
      Toast.show({ type: "error", text1: "Dados inválidos", text2: "Preencha os campos corretamente." });
      return;
    }

    if (!uf) {
      Toast.show({ type: "error", text1: "Estado obrigatório", text2: "Selecione um estado." });
      return;
    }

    setLoading(true);
    try {
      await updateClient(usuarioId!, {
        nome,
        email,
        cep,
        logradouro,
        complemento: numero ? `${numero} ${complemento}`.trim() : complemento,
        bairro,
        localidade: cidade,
        uf,
      });

      Toast.show({ type: "success", text1: "Cliente atualizado!" });
      onSuccess();
      onClose();
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro ao salvar", text2: "Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={28}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Usuário</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Conteúdo */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <InputField
            label="Nome Completo"
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
          />

          <InputField
            label="Email"
            placeholder="seu.email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            label="Buscar por CEP"
            placeholder="00000-000"
            value={cep}
            onChangeText={handleCepChange}
            keyboardType="numeric"
            maxLength={9}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.botao, loadingCep && styles.botaoDisabled]}
            onPress={handleSearchCep}
            disabled={loadingCep}
          >
            {loadingCep ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.botaoTexto}>Buscar CEP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <InputField label="Logradouro" value={logradouro} editable={false} />

          <View style={styles.row}>
            <View style={{ flex: 1.5 }}>
              <InputField
                ref={numRef}
                label="Número"
                keyboardType="numeric"
                value={numero}
                onChangeText={setNumero}
                placeholder="123"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <SelectField
                label="UF"
                value={uf}
                items={ESTADOS_BRASIL}
                onValueChange={setUf}
                enabled={true}
              />
            </View>
          </View>

          <InputField
            label="Complemento"
            placeholder="Ex: Apto 12"
            value={complemento}
            onChangeText={setComplemento}
          />

          <InputField label="Bairro" value={bairro} editable={false} />
          <InputField label="Cidade" value={cidade} editable={false} />

          {/* Botões de ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.btnCancelar]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSalvar, loading && styles.botaoDisabled]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.btnSalvarTexto}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  botao: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...SHADOW.md,
  },
  botaoTexto: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  botaoDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: COLORS.border,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.sm,
  },
  btnCancelarTexto: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: COLORS.success,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.md,
  },
  btnSalvarTexto: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
