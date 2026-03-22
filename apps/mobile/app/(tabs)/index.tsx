import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "@/lib/trpc";
import type { GenerationRequestInput } from "@videoforge/shared";
import { generationRequestSchema } from "@videoforge/shared";

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
  error: "#EF4444",
};

type AspectRatio = "16:9" | "9:16" | "1:1";

export default function GenerateScreen() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: user } = trpc.user.me.useQuery();
  const createMutation = trpc.generation.create.useMutation({
    onSuccess: (data) => {
      setActiveGenerationId(data.id);
      setPrompt("");
      void utils.generation.list.invalidate();
    },
    onError: (err) => {
      Alert.alert("Generation Failed", err.message);
    },
  });

  const { data: generation } = trpc.generation.getById.useQuery(
    { id: activeGenerationId! },
    {
      enabled: !!activeGenerationId,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (!status || ["completed", "failed", "cancelled"].includes(status)) return false;
        return 3000;
      },
    }
  );

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt");
      return;
    }

    const input: GenerationRequestInput = {
      prompt: prompt.trim(),
      durationSeconds: duration,
      aspectRatio,
    };

    const validation = generationRequestSchema.safeParse(input);
    if (!validation.success) {
      Alert.alert("Validation Error", validation.error.errors[0]?.message);
      return;
    }

    createMutation.mutate(input);
  };

  const maxDuration = user?.tier === "free" ? 5 : user?.tier === "creator" ? 10 : 15;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>VideoForge</Text>
          <View style={styles.creditsBadge}>
            <Ionicons name="flash" size={14} color={COLORS.accent} />
            <Text style={styles.creditsText}>{user?.credits ?? 0}</Text>
          </View>
        </View>

        {/* Prompt input */}
        <View style={styles.card}>
          <Text style={styles.label}>Describe your video</Text>
          <TextInput
            style={styles.textArea}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="A cinematic aerial shot of a neon-lit city at night..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{prompt.length}/2000</Text>
        </View>

        {/* Duration */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.accentText}>{duration}s</Text>
          </View>
          {/* Simple duration buttons */}
          <View style={styles.buttonRow}>
            {[3, 5, 8, 10, 15].filter((d) => d <= maxDuration).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
                onPress={() => setDuration(d)}
              >
                <Text
                  style={[
                    styles.durationBtnText,
                    duration === d && styles.durationBtnTextActive,
                  ]}
                >
                  {d}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aspect ratio */}
        <View style={styles.card}>
          <Text style={styles.label}>Aspect Ratio</Text>
          <View style={styles.buttonRow}>
            {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((ratio) => (
              <TouchableOpacity
                key={ratio}
                style={[styles.ratioBtn, aspectRatio === ratio && styles.ratioBtnActive]}
                onPress={() => setAspectRatio(ratio)}
              >
                <Text
                  style={[
                    styles.ratioBtnText,
                    aspectRatio === ratio && styles.ratioBtnTextActive,
                  ]}
                >
                  {ratio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status card for active generation */}
        {activeGenerationId && generation && (
          <View
            style={[
              styles.statusCard,
              generation.status === "failed" && styles.statusCardError,
              generation.status === "completed" && styles.statusCardSuccess,
            ]}
          >
            <View style={styles.row}>
              <Text style={styles.statusLabel}>
                {generation.status === "completed"
                  ? "✅ Video Ready"
                  : generation.status === "failed"
                  ? "❌ Generation Failed"
                  : generation.status === "processing"
                  ? "⚡ Processing..."
                  : "⏳ Queued"}
              </Text>
              {["pending", "queued", "processing"].includes(generation.status) && (
                <ActivityIndicator size="small" color={COLORS.accent} />
              )}
            </View>
            {generation.errorMessage && (
              <Text style={styles.errorText}>{generation.errorMessage}</Text>
            )}
            {generation.status === "completed" && generation.videoUrl && (
              <Text style={styles.videoUrlText}>Video is ready in your gallery!</Text>
            )}
          </View>
        )}

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, createMutation.isPending && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={createMutation.isPending}
          activeOpacity={0.85}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Ionicons name="sparkles" size={20} color="white" />
          )}
          <Text style={styles.generateBtnText}>
            {createMutation.isPending ? "Generating..." : "Generate Video"}
          </Text>
        </TouchableOpacity>

        {user?.tier === "free" && (
          <Text style={styles.freeNote}>
            Free plan: 3 videos/day, 5s max, 480p with watermark
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6366F120",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6366F130",
  },
  creditsText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#D1D5DB" },
  textArea: {
    color: COLORS.text,
    fontSize: 15,
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: "right" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  accentText: { color: COLORS.accent, fontWeight: "700", fontSize: 16 },
  buttonRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  durationBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationBtnActive: { borderColor: COLORS.accent, backgroundColor: "#6366F115" },
  durationBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  durationBtnTextActive: { color: COLORS.accent },
  ratioBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  ratioBtnActive: { borderColor: COLORS.accent, backgroundColor: "#6366F115" },
  ratioBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  ratioBtnTextActive: { color: COLORS.accent },
  statusCard: {
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusCardError: { borderColor: "#EF4444" + "40" },
  statusCardSuccess: { borderColor: "#22C55E" + "40" },
  statusLabel: { color: COLORS.text, fontWeight: "600" },
  errorText: { color: COLORS.error, fontSize: 13 },
  videoUrlText: { color: "#22C55E", fontSize: 13 },
  generateBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  freeNote: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -8,
  },
});
