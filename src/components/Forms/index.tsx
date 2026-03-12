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
import { InputField } from "../InputField";
import { SelectField } from "../SelectField";

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

export function Forms() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Partial<AddressData>>({});

  const numRef = useRef<TextInput>(null);

  const handleCepChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const masked = cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    setCep(masked);
  };

  const handleSearchCep = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      Toast.show({
        type: "error",
        text1: "CEP Inválido",
        text2: "Digite os 8 números do CEP.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
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

      setAddress(data);
      setTimeout(() => numRef.current?.focus(), 100);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AddressData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
          style={[styles.botao, loading && styles.botaoDisabled]}
          onPress={handleSearchCep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.text}>Buscar CEP</Text>
          )}
        </TouchableOpacity>

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
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <SelectField
              label="UF"
              value={address.uf || ""}
              items={ESTADOS_BRASIL}
              onValueChange={(value) => updateField("uf", value)}
              enabled={true} // Mude para false se quiser travar após a busca
            />
          </View>
        </View>

        <InputField
          label="Complemento"
          placeholder="Ex: Apto 12"
          value={address.complemento}
          onChangeText={(t) => updateField("complemento", t)}
        />

        <InputField label="Bairro" value={address.bairro} editable={false} />
        <InputField
          label="Cidade"
          value={address.localidade}
          editable={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20 },
  botao: {
    backgroundColor: "#6366f1",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoDisabled: { backgroundColor: "#a5a6f6" },
  text: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 20 },
});
