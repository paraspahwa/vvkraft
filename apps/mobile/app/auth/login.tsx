import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
  error: "#EF4444",
};

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      Alert.alert("Error", message.replace("Firebase: ", "").split(" (")[0]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="film" size={32} color="white" />
            </View>
            <Text style={styles.appName}>VideoForge</Text>
            <Text style={styles.tagline}>AI Video Generation</Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isRegister && styles.toggleBtnActive]}
              onPress={() => setIsRegister(false)}
            >
              <Text style={[styles.toggleText, !isRegister && styles.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isRegister && styles.toggleBtnActive]}
              onPress={() => setIsRegister(true)}
            >
              <Text style={[styles.toggleText, isRegister && styles.toggleTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={isRegister ? "At least 8 characters" : "••••••••"}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </View>

            <TouchableOpacity
              style={[styles.authBtn, isLoading && styles.authBtnDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authBtnText}>
                  {isRegister ? "Create Account" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            {isRegister && (
              <Text style={styles.disclaimer}>
                By registering you agree to our Terms of Service and Privacy Policy.
                Free tier: 3 videos/day.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { padding: 24, flexGrow: 1, justifyContent: "center", gap: 24 },
  logoContainer: { alignItems: "center", gap: 8, marginBottom: 8 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  tagline: { fontSize: 14, color: COLORS.textMuted },
  toggle: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  toggleText: { fontWeight: "600", color: COLORS.textMuted },
  toggleTextActive: { color: "white" },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#D1D5DB" },
  input: {
    height: 48,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  authBtn: {
    height: 52,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  authBtnDisabled: { opacity: 0.6 },
  authBtnText: { fontSize: 16, fontWeight: "700", color: "white" },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
