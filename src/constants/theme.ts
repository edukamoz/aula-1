export const COLORS = {
  // Background
  background: "#0f172a",
  surface: "#1e293b",
  surfaceLight: "#334155",

  // Primário
  primary: "#06b6d4", // Cyan vibrante
  primaryDark: "#0891b2", // Cyan mais escuro
  primaryLight: "#14b8a6", // Cyan mais claro

  // Secundário
  secondary: "#8b5cf6", // Roxo para destaque
  secondaryDark: "#7c3aed",

  // Sucesso
  success: "#10b981", // Verde

  // Erro
  error: "#ef4444", // Vermelho

  // Aviso
  warning: "#f59e0b", // Laranja

  // Texto
  text: "#f1f5f9", // Branco gelo (texto principal)
  textSecondary: "#cbd5e1", // Cinza claro (texto secundário)
  textMuted: "#94a3b8", // Cinza médio (texto desabilitado)

  // Bordas
  border: "#334155", // Cinza escuro para bordas
  borderLight: "#64748b", // Cinza mais claro para bordas sutis

  // Especial
  accent: "#06b6d4", // Accent (mesmo que primary)
  accentGradient: ["#06b6d4", "#8b5cf6"], // Gradiente cyan para roxo
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const SHADOW = {
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
};
