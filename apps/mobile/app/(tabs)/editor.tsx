import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { trpc } from "@/lib/trpc";
import type { VideoEditorProject, VideoEditorClip, VideoEditorTextOverlay } from "@videoforge/shared";

/** Simple cross-platform random ID that works in all React Native environments */
function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
};

// ── Paid-gate screen ───────────────────────────────────────────────────────────

function PaidGateScreen({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.gateContainer}>
        <View style={styles.gateIconWrapper}>
          <Ionicons name="lock-closed" size={36} color={COLORS.accent} />
        </View>
        <Text style={styles.gateTitle}>Video Editor</Text>
        <Text style={styles.gateSubtitle}>Available on paid plans</Text>
        <Text style={styles.gateDesc}>
          Unlock the full-featured video editor with Creator, Pro, or Studio plans. Trim
          clips, merge AI-generated and uploaded videos, add text overlays, and export
          polished videos.
        </Text>
        <View style={styles.featureList}>
          {[
            "Trim & cut clips",
            "Merge multiple videos",
            "Text overlays with custom fonts",
            "Background audio mixing",
            "Export to MP4",
            "Auto-save projects",
          ].map((f) => (
            <View key={f} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade to Unlock</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Project list ───────────────────────────────────────────────────────────────

function ProjectListScreen({
  projects,
  isLoading,
  onOpen,
  onDelete,
  onNew,
  isCreating,
}: {
  projects: VideoEditorProject[];
  isLoading: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  isCreating: boolean;
}) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Editor</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={onNew}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Ionicons name="add" size={20} color={COLORS.text} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to create your first editing project
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={onNew}
            disabled={isCreating}
          >
            <Text style={styles.createFirstButtonText}>Create Project</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={() => onOpen(item.id)}
              activeOpacity={0.75}
            >
              <View style={styles.projectIconWrapper}>
                <Ionicons name="film" size={22} color={COLORS.accent} />
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectMeta}>
                  {item.clips.length} clip{item.clips.length !== 1 ? "s" : ""} ·{" "}
                  {item.status === "draft"
                    ? "Draft"
                    : item.status === "exporting"
                    ? "Exporting…"
                    : item.status === "exported"
                    ? "Exported"
                    : "Failed"}
                </Text>
              </View>
              <View style={styles.projectActions}>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Delete Project", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => onDelete(item.id),
                      },
                    ])
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ── Project editor ─────────────────────────────────────────────────────────────

function ProjectEditorScreen({
  projectId,
  onBack,
}: {
  projectId: string;
  onBack: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: project, isLoading } = trpc.videoEditor.getById.useQuery({ projectId });
  const saveMutation = trpc.videoEditor.save.useMutation({
    onSuccess: () => void utils.videoEditor.getById.invalidate({ projectId }),
  });
  const exportMutation = trpc.videoEditor.export.useMutation({
    onSuccess: (result) => {
      void utils.videoEditor.getById.invalidate({ projectId });
      if (result.status === "exporting") {
        Alert.alert("Export Started", "Your video is being assembled. Check back in a few minutes.");
      } else if (result.status === "exported" && result.downloadUrl) {
        Alert.alert("Export Ready", "Your video export is ready to download.");
      }
    },
  });

  const { data: galleryData } = trpc.generation.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const galleryVideos =
    galleryData?.pages.flatMap((p) => p.items).filter((g) => g.status === "completed") ?? [];

  const [clips, setClips] = useState<VideoEditorClip[]>([]);
  const [overlays, setOverlays] = useState<VideoEditorTextOverlay[]>([]);
  const [projectName, setProjectName] = useState("");
  const [activeTab, setActiveTab] = useState<"clips" | "text" | "audio">("clips");

  // Sync from project once loaded — using useEffect avoids setState-in-render
  useEffect(() => {
    if (!project) return;
    setClips(project.clips);
    setOverlays(project.textOverlays);
    setProjectName(project.name);
  }, [project]);

  const addFromGallery = useCallback(
    (gen: { id: string; videoUrl: string | null; durationSeconds: number; prompt: string }) => {
      if (!gen.videoUrl) return;
      const newClip: VideoEditorClip = {
        id: randomId(),
        sourceType: "generated",
        sourceUrl: gen.videoUrl,
        generationId: gen.id,
        durationSeconds: gen.durationSeconds,
        trimStart: 0,
        trimEnd: 0,
        order: clips.length,
        label: gen.prompt.slice(0, 40),
      };
      setClips((prev) => [...prev, newClip]);
    },
    [clips.length]
  );

  const removeClip = useCallback((id: string) => {
    setClips((prev) =>
      prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i }))
    );
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await saveMutation.mutateAsync({
        projectId,
        name: projectName,
        clips,
        textOverlays: overlays,
      });
      Alert.alert("Saved", "Your project has been saved.");
    } catch {
      Alert.alert("Error", "Failed to save project.");
    }
  }, [projectId, projectName, clips, overlays, saveMutation]);

  const handleExport = useCallback(async () => {
    if (clips.length === 0) {
      Alert.alert("No Clips", "Add at least one clip before exporting.");
      return;
    }
    try {
      await exportMutation.mutateAsync({ projectId });
    } catch {
      Alert.alert("Export Failed", "Unable to start export. Please try again.");
    }
  }, [projectId, clips.length, exportMutation]);

  const addTextOverlay = useCallback(() => {
    const newOv: VideoEditorTextOverlay = {
      id: randomId(),
      text: "Your text here",
      startTime: 0,
      endTime: 3,
      position: "bottom",
      fontSize: 32,
      color: "#FFFFFF",
      backgroundColor: "#00000066",
    };
    setOverlays((prev) => [...prev, newOv]);
  }, []);

  const removeOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Editor header */}
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.projectNameInput}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Project name"
          placeholderTextColor={COLORS.textMuted}
        />
        <TouchableOpacity
          onPress={() => void handleSave()}
          disabled={saveMutation.isPending}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <Ionicons name="save-outline" size={22} color={COLORS.accent} />
          )}
        </TouchableOpacity>
      </View>

      {/* Timeline summary */}
      <View style={styles.timelineSummary}>
        <Ionicons name="film-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.timelineText}>
          {clips.length} clip{clips.length !== 1 ? "s" : ""} on timeline
        </Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["clips", "text", "audio"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === "clips" ? "film" : tab === "text" ? "text" : "musical-notes"}
              size={16}
              color={activeTab === tab ? COLORS.accent : COLORS.textMuted}
            />
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={styles.tabContent} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {activeTab === "clips" && (
          <>
            {/* Current clips */}
            {clips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeline Clips</Text>
                {clips.map((clip) => (
                  <View key={clip.id} style={styles.clipItem}>
                    <View style={styles.clipThumbnail}>
                      <Ionicons name="film" size={18} color={COLORS.textMuted} />
                    </View>
                    <View style={styles.clipInfo}>
                      <Text style={styles.clipLabel} numberOfLines={1}>
                        {clip.label ?? `Clip ${clip.order + 1}`}
                      </Text>
                      <Text style={styles.clipMeta}>
                        {clip.durationSeconds}s · {clip.sourceType}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeClip(clip.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Gallery picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add from Gallery</Text>
              {galleryVideos.length === 0 ? (
                <Text style={styles.emptyHint}>No completed videos in gallery yet</Text>
              ) : (
                galleryVideos.map((gen) => (
                  <TouchableOpacity
                    key={gen.id}
                    style={styles.galleryItem}
                    onPress={() => addFromGallery(gen)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.galleryThumb}>
                      {gen.thumbnailUrl ? (
                        <Image
                          source={{ uri: gen.thumbnailUrl }}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                        />
                      ) : (
                        <Ionicons name="film" size={16} color={COLORS.textMuted} />
                      )}
                    </View>
                    <View style={styles.galleryInfo}>
                      <Text style={styles.galleryPrompt} numberOfLines={2}>
                        {gen.prompt}
                      </Text>
                      <Text style={styles.galleryMeta}>{gen.durationSeconds}s</Text>
                    </View>
                    <Ionicons name="add-circle" size={22} color={COLORS.accent} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        {activeTab === "text" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Text Overlays</Text>
              <TouchableOpacity onPress={addTextOverlay}>
                <Ionicons name="add-circle" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
            {overlays.length === 0 ? (
              <Text style={styles.emptyHint}>Tap + to add a text overlay</Text>
            ) : (
              overlays.map((ov) => (
                <View key={ov.id} style={styles.overlayItem}>
                  <TextInput
                    style={styles.overlayTextInput}
                    value={ov.text}
                    onChangeText={(t) =>
                      setOverlays((prev) =>
                        prev.map((o) => (o.id === ov.id ? { ...o, text: t } : o))
                      )
                    }
                    placeholder="Text content…"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <View style={styles.overlayMeta}>
                    <Text style={styles.overlayMetaText}>
                      {ov.startTime}s – {ov.endTime}s · {ov.position}
                    </Text>
                    <TouchableOpacity onPress={() => removeOverlay(ov.id)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "audio" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background Audio</Text>
            <Text style={styles.emptyHint}>
              Paste an audio URL (MP3 or AAC) to add background music to your project. Volume
              and timing controls are available in the web editor.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Export button */}
      <View style={styles.exportBar}>
        <TouchableOpacity
          style={[
            styles.exportButton,
            (clips.length === 0 || exportMutation.isPending) && styles.exportButtonDisabled,
          ]}
          onPress={() => void handleExport()}
          disabled={clips.length === 0 || exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <>
              <Ionicons name="download" size={18} color={COLORS.text} />
              <Text style={styles.exportButtonText}>Export Video</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Root screen ────────────────────────────────────────────────────────────────

export default function EditorScreen() {
  const { data: user } = trpc.user.me.useQuery();
  const {
    data: projects,
    isLoading,
    refetch,
  } = trpc.videoEditor.list.useQuery(
    { limit: 20 },
    { enabled: !!user && user.tier !== "free" }
  );
  const createMutation = trpc.videoEditor.create.useMutation({
    onSuccess: (project) => {
      void refetch();
      setActiveProjectId(project.id);
    },
  });
  const deleteMutation = trpc.videoEditor.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const isPaidUser = user && user.tier !== "free";

  if (!isPaidUser) {
    return (
      <PaidGateScreen
        onUpgrade={() =>
          // Open the web billing/pricing page so the user can upgrade
          void Linking.openURL("https://videoforge.app/pricing")
        }
      />
    );
  }

  if (activeProjectId) {
    return (
      <ProjectEditorScreen
        projectId={activeProjectId}
        onBack={() => setActiveProjectId(null)}
      />
    );
  }

  return (
    <ProjectListScreen
      projects={projects ?? []}
      isLoading={isLoading}
      onOpen={(id) => setActiveProjectId(id)}
      onDelete={(id) => void deleteMutation.mutateAsync({ projectId: id })}
      onNew={() => void createMutation.mutateAsync({ name: "Untitled Project" })}
      isCreating={createMutation.isPending}
    />
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Gate
  gateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  gateIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: `${COLORS.accent}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  gateTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  gateSubtitle: { fontSize: 14, color: COLORS.textMuted },
  gateDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  featureList: { alignSelf: "stretch", gap: 8, paddingHorizontal: 16 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, color: COLORS.text },
  upgradeButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
  },
  upgradeButtonText: { fontSize: 15, fontWeight: "700", color: COLORS.text },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  newButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  // Project list
  centeredLoader: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
  createFirstButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  createFirstButtonText: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  projectIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.accent}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  projectMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  projectActions: { flexDirection: "row", alignItems: "center", gap: 12 },

  // Editor
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  projectNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    padding: 0,
  },
  timelineSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timelineText: { fontSize: 12, color: COLORS.textMuted },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: { fontSize: 13, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.accent, fontWeight: "600" },
  tabContent: { flex: 1 },

  // Section
  section: { gap: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  emptyHint: { fontSize: 13, color: COLORS.textMuted, fontStyle: "italic" },

  // Clip item
  clipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clipThumbnail: {
    width: 44,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  clipInfo: { flex: 1 },
  clipLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  clipMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  // Gallery
  galleryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  galleryThumb: {
    width: 56,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  galleryInfo: { flex: 1 },
  galleryPrompt: { fontSize: 12, color: COLORS.text, lineHeight: 16 },
  galleryMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  // Text overlay
  overlayItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  overlayTextInput: {
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  overlayMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overlayMetaText: { fontSize: 11, color: COLORS.textMuted },

  // Export bar
  exportBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
  },
  exportButtonDisabled: { opacity: 0.5 },
  exportButtonText: { fontSize: 15, fontWeight: "700", color: COLORS.text },
});
