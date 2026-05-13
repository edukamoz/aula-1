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
import { createClient, AddressData } from "../services/api";
import { BORDER_RADIUS, COLORS, SHADOW } from "../constants/theme";
import { validateCEP, validateEmail, validateName } from "../utils/validation";

const ESTADOS_BRASIL = [
  { label: "Acre", value: "AC" },
  { label: "Alagoas", value: "AL" },
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
  onSuccess?: () => void;
}

export function RegisterScreen({ onSuccess }: RegisterScreenProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [address, setAddress] = useState<Partial<AddressData>>({});

  const numRef = useRef<TextInput>(null);

  const handleCepChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const masked = cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    setCep(masked);
  };

  const handleSearchCep = async () => {
    if (!validateCEP(cep)) {
      Toast.show({ type: "error", text1: "CEP Inválido", text2: "Digite os 8 números do CEP." });
      return;
    }

    setLoadingCep(true);
    try {
      const cleanCep = cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Toast.show({ type: "error", text1: "Não encontrado", text2: "Verifique o número e tente novamente." });
        return;
      }

      setAddress({
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi
      });
      
      setTimeout(() => numRef.current?.focus(), 100);
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro de conexão", text2: "Tente novamente mais tarde." });
    } finally {
      setLoadingCep(false);
    }
  };

  const updateField = (field: keyof AddressData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUsuario = async () => {
    if (!validateName(nome) || !validateEmail(email) || !validateCEP(cep)) {
      Toast.show({ type: "error", text1: "Dados inválidos", text2: "Preencha nome, email e CEP corretamente." });
      return;
    }

    if (!address.uf) {
      Toast.show({ type: "error", text1: "Estado obrigatório", text2: "Busque o CEP e confirme o endereço." });
      return;
    }

    setLoading(true);
    try {
      await createClient({
        nome,
        email,
        cep: address.cep || cep,
        logradouro: address.logradouro || "",
        complemento: address.complemento || "",
        bairro: address.bairro || "",
        localidade: address.localidade || "",
        uf: address.uf || "",
        ibge: address.ibge,
        gia: address.gia,
        ddd: address.ddd,
        siafi: address.siafi
      });

      Toast.show({ type: "success", text1: "Cliente cadastrado!", text2: "Sincronizado via API." });

      setNome("");
      setEmail("");
      setCep("");
      setAddress({});
      onSuccess?.();
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro na API", text2: "Verifique se o backend está rodando." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Novo Cliente</Text>
        <Text style={styles.subtitle}>Adicione um cliente para gerenciar suas entregas.</Text>

        <View style={styles.card}>
          <InputField label="Nome Completo" placeholder="Ex: João da Silva" value={nome} onChangeText={setNome} />
          <InputField label="Email" placeholder="contato@cliente.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          
          <View style={styles.cepRow}>
            <View style={{ flex: 1 }}>
              <InputField label="Buscar por CEP" placeholder="00000-000" value={cep} onChangeText={handleCepChange} keyboardType="numeric" maxLength={9} />
            </View>
            <TouchableOpacity style={[styles.botaoBusca, loadingCep && styles.botaoDisabled]} onPress={handleSearchCep} disabled={loadingCep}>
              {loadingCep ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textBtn}>Buscar</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {Object.keys(address).length > 0 && (
          <View style={styles.card}>
            <InputField label="Logradouro" value={address.logradouro} editable={false} />

            <View style={styles.row}>
              <View style={{ flex: 1.5 }}>
                <InputField ref={numRef} label="Número/Complemento" value={address.complemento} onChangeText={(t) => updateField("complemento", t)} placeholder="Ex: Apto 12" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <SelectField label="UF" value={address.uf || ""} items={ESTADOS_BRASIL} onValueChange={(v) => updateField("uf", v)} />
              </View>
            </View>

            <InputField label="Bairro" value={address.bairro} editable={false} />
            <InputField label="Cidade" value={address.localidade} editable={false} />

            <TouchableOpacity style={[styles.botaoSalvar, loading && styles.botaoDisabled]} onPress={handleSaveUsuario} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textBtnSalvar}>Cadastrar Cliente na Base</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: BORDER_RADIUS.lg, marginBottom: 20, ...SHADOW.sm },
  cepRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  botaoBusca: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 16
  },
  botaoSalvar: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...SHADOW.md
  },
  botaoDisabled: { opacity: 0.7 },
  textBtn: { color: COLORS.background, fontWeight: "600" },
  textBtnSalvar: { color: COLORS.background, fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row" },
});
