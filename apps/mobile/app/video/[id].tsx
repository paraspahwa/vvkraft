import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
};

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: generation, isLoading } = trpc.generation.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const positionMs = status?.isLoaded ? status.positionMillis : 0;
  const durationMs = status?.isLoaded && status.durationMillis ? status.durationMillis : 1;
  const progress = positionMs / durationMs;

  useEffect(() => {
    // Start playing automatically when video loads
    if (generation?.videoUrl && videoRef.current) {
      void videoRef.current.playAsync();
    }
  }, [generation?.videoUrl]);

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleDownload = async () => {
    if (!generation?.videoUrl) return;
    setIsDownloading(true);
    try {
      const fileName = `videoforge-${generation.id.slice(0, 8)}.mp4`;
      const downloadDir =
        FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "";
      const fileUri = downloadDir + fileName;

      await FileSystem.downloadAsync(generation.videoUrl, fileUri);

      Alert.alert("Downloaded", `Video saved to ${fileUri}`);
    } catch {
      Alert.alert("Download Failed", "Could not download the video. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || !generation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={40} color={COLORS.textMuted} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {generation.prompt}
        </Text>
        <TouchableOpacity
          onPress={handleDownload}
          style={styles.downloadBtn}
          disabled={isDownloading || !generation.videoUrl}
        >
          {isDownloading ? (
            <Ionicons name="hourglass" size={18} color={COLORS.accent} />
          ) : (
            <Ionicons name="download-outline" size={20} color={COLORS.accent} />
          )}
        </TouchableOpacity>
      </View>

      {/* Video player */}
      {generation.videoUrl ? (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: generation.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(s) => setStatus(s)}
          />

          {/* Play / pause overlay */}
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={togglePlayPause}
            activeOpacity={0.9}
          >
            {!isPlaying && (
              <View style={styles.playIconContainer}>
                <Ionicons name="play" size={40} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      ) : (
        <View style={styles.noVideoContainer}>
          <Ionicons name="film-outline" size={60} color={COLORS.textMuted} />
          <Text style={styles.noVideoText}>Video not available</Text>
          <Text style={styles.statusText}>Status: {generation.status}</Text>
        </View>
      )}

      {/* Metadata */}
      <View style={styles.metaContainer}>
        <Text style={styles.prompt} numberOfLines={3}>
          {generation.prompt}
        </Text>

        <View style={styles.metaRow}>
          {[
            { label: "Duration", value: `${generation.durationSeconds}s` },
            { label: "Resolution", value: generation.resolution },
            { label: "Credits", value: `${generation.creditsCost}` },
            { label: "Status", value: generation.status },
          ].map(({ label, value }) => (
            <View key={label} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{label}</Text>
              <Text style={styles.metaValue}>{value}</Text>
            </View>
          ))}
        </View>

        {generation.status !== "completed" && generation.errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{generation.errorMessage}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 15 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  downloadBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },

  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16),
    backgroundColor: "#000",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
  },

  noVideoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  noVideoText: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
  statusText: { color: COLORS.textMuted, fontSize: 13 },

  metaContainer: {
    padding: 20,
    gap: 16,
    flex: 1,
  },
  prompt: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
  },
  metaLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  metaValue: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  errorBox: {
    backgroundColor: "#EF444410",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EF444430",
  },
  errorText: { color: "#EF4444", fontSize: 13 },
});
