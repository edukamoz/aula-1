import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { InputField } from "../components/InputField";
import { SelectField } from "../components/SelectField";
import {
  Banco,
  atualizarUsuario,
  createTable,
  exibirUsuarioPorId,
  inserirUsuario,
} from "../config/bd";
import { BORDER_RADIUS, COLORS, SHADOW } from "../constants/theme";
import { validateCEP, validateEmail, validateName } from "../utils/validation";

interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero?: string;
}

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

interface RegisterScreenProps {
  usuarioId?: number;
  onSuccess?: () => void;
}

export function RegisterScreen({ usuarioId, onSuccess }: RegisterScreenProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [address, setAddress] = useState<Partial<AddressData>>({});
  const [isEditMode, setIsEditMode] = useState(!!usuarioId);

  const numRef = useRef<TextInput>(null);
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Carregar dados do usuário se estiver editando
  React.useEffect(() => {
    isMountedRef.current = true;

    if (usuarioId) {
      loadUsuarioData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [usuarioId]);

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
        setAddress({
          cep: usuario.CEP_US || "",
          logradouro: usuario.LOGRADOURO_US || "",
          complemento: usuario.COMPLEMENTO_US || "",
          bairro: usuario.BAIRRO_US || "",
          localidade: usuario.CIDADE_US || "",
          uf: usuario.UF_US || "",
          numero: usuario.NUMERO_US || "",
        });
        setIsEditMode(true);
        console.log("✅ Dados do usuário carregados para edição");
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

      setAddress(data);
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

  const updateField = (field: keyof AddressData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUsuario = async () => {
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

    if (!address.numero || address.numero.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Número obrigatório",
        text2: "Digite o número do imóvel.",
      });
      return;
    }

    if (!address.uf) {
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
      await createTable(db);

      let success;
      if (isEditMode && usuarioId) {
        success = await atualizarUsuario(
          db,
          usuarioId,
          nome,
          email,
          cep,
          address.logradouro || "",
          address.numero || "",
          address.complemento || "",
          address.bairro || "",
          address.localidade || "",
          address.uf || "",
        );
      } else {
        success = await inserirUsuario(
          db,
          nome,
          email,
          cep,
          address.logradouro || "",
          address.numero || "",
          address.complemento || "",
          address.bairro || "",
          address.localidade || "",
          address.uf || "",
        );
      }

      if (success) {
        Toast.show({
          type: "success",
          text1: isEditMode ? "Usuário atualizado!" : "Usuário cadastrado!",
          text2: "Dados salvos com sucesso.",
        });

        // Limpar formulário
        setNome("");
        setEmail("");
        setCep("");
        setAddress({});

        // Callback para atualizar listagem
        onSuccess?.();
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEditMode ? "Editar Usuário" : "Cadastrar Novo Usuário"}
        </Text>

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
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.text}>Buscar CEP</Text>
          )}
        </TouchableOpacity>

        {Object.keys(address).length > 0 && (
          <>
            <View style={styles.divider} />

            <InputField
              label="Logradouro"
              value={address.logradouro}
              editable={false}
            />

            <View style={styles.row}>
              <View style={{ flex: 1.5 }}>
                <InputField
                  ref={numRef}
                  label="Número"
                  keyboardType="numeric"
                  value={address.numero}
                  onChangeText={(t) => updateField("numero", t)}
                  placeholder="123"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <SelectField
                  label="UF"
                  value={address.uf || ""}
                  items={ESTADOS_BRASIL}
                  onValueChange={(value) => updateField("uf", value)}
                  enabled={true}
                />
              </View>
            </View>

            <InputField
              label="Complemento"
              placeholder="Ex: Apto 12"
              value={address.complemento}
              onChangeText={(t) => updateField("complemento", t)}
            />

            <InputField
              label="Bairro"
              value={address.bairro}
              editable={false}
            />
            <InputField
              label="Cidade"
              value={address.localidade}
              editable={false}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.botaoSalvar, loading && styles.botaoDisabled]}
              onPress={handleSaveUsuario}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.text}>
                  {isEditMode ? "Atualizar Usuário" : "Salvar Usuário"}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  botao: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...SHADOW.md,
  },
  botaoSalvar: {
    backgroundColor: COLORS.success,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    ...SHADOW.md,
  },
  botaoDisabled: {
    opacity: 0.6,
  },
  text: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
});
