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
import { Banco, atualizarUsuario, exibirUsuarioPorId } from "../config/bd";
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
  usuarioId?: number;
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
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    if (visible && usuarioId) {
      loadUsuarioData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [visible, usuarioId]);

  const loadUsuarioData = async () => {
    // Evitar requisições duplicadas
    if (loadingRef.current) {
      console.log("⏳ Já há uma requisição de usuário em andamento");
      return;
    }

    loadingRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const db = await Banco();
      const usuario = (await exibirUsuarioPorId(db, usuarioId!)) as any;

      if (isMountedRef.current && usuario) {
        setNome(usuario.NOME_US || "");
        setEmail(usuario.EMAIL_US || "");
        setCep(usuario.CEP_US || "");
        setLogradouro(usuario.LOGRADOURO_US || "");
        setNumero(usuario.NUMERO_US || "");
        setComplemento(usuario.COMPLEMENTO_US || "");
        setBairro(usuario.BAIRRO_US || "");
        setCidade(usuario.CIDADE_US || "");
        setUf(usuario.UF_US || "");
        console.log("✅ Dados do usuário carregados:", usuario.NOME_US);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (isMountedRef.current && !errorMsg.includes("abort")) {
        console.log("❌ Erro ao carregar usuário:", error);
      }
    } finally {
      loadingRef.current = false;
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
        `https://viacep.com.br/ws/${cleanCep}/json/`,
        { signal: abortControllerRef.current?.signal },
      );
      const data = await response.json();

      if (!isMountedRef.current) return;

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
      console.log("✅ CEP encontrado:", cleanCep);
      setTimeout(() => numRef.current?.focus(), 100);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (isMountedRef.current && !errorMsg.includes("abort")) {
        console.log("❌ Erro ao buscar CEP:", error);
        Toast.show({
          type: "error",
          text1: "Erro de conexão",
          text2: "Tente novamente mais tarde.",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingCep(false);
      }
    }
  };

  const handleSalvar = async () => {
    // Validações
    if (!validateName(nome)) {
      Toast.show({
        type: "error",
        text1: "Nome inválido",
        text2: "Digite um nome com pelo menos 3 caracteres.",
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Email inválido",
        text2: "Digite um email válido.",
      });
      return;
    }

    if (!validateCEP(cep)) {
      Toast.show({
        type: "error",
        text1: "CEP inválido",
        text2: "Digite um CEP válido.",
      });
      return;
    }

    if (!numero.trim()) {
      Toast.show({
        type: "error",
        text1: "Número obrigatório",
        text2: "Digite o número do imóvel.",
      });
      return;
    }

    if (!uf) {
      Toast.show({
        type: "error",
        text1: "Estado obrigatório",
        text2: "Selecione um estado.",
      });
      return;
    }

    setLoading(true);
    try {
      const db = await Banco();
      const success = await atualizarUsuario(
        db,
        usuarioId!,
        nome,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
      );

      if (success) {
        Toast.show({
          type: "success",
          text1: "Usuário atualizado!",
          text2: "Dados salvos com sucesso.",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao salvar",
        text2: "Tente novamente.",
      });
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
