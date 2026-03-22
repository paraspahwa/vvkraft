import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import type { Generation } from "@videoforge/shared";
import { formatDuration } from "@videoforge/shared";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
};

function VideoThumbnail({ generation }: { generation: Generation }) {
  const statusColor =
    generation.status === "completed"
      ? "#22C55E"
      : generation.status === "failed"
      ? "#EF4444"
      : "#F59E0B";

  const handlePress = () => {
    if (generation.status === "completed") {
      router.push(`/video/${generation.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={generation.status === "completed" ? 0.75 : 1}
    >
      <View style={styles.thumbnail}>
        {generation.thumbnailUrl ? (
          <Image
            source={{ uri: generation.thumbnailUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            {["pending", "queued", "processing"].includes(generation.status) ? (
              <Ionicons name="hourglass" size={24} color={COLORS.textMuted} />
            ) : generation.status === "failed" ? (
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            ) : (
              <Ionicons name="film" size={24} color={COLORS.textMuted} />
            )}
          </View>
        )}

        {/* Status dot */}
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

        {/* Play overlay for completed videos */}
        {generation.status === "completed" && (
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.85)" />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.promptText} numberOfLines={2}>
          {generation.prompt}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatDuration(generation.durationSeconds)}</Text>
          <Text style={styles.metaText}>{generation.resolution}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GalleryScreen() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = trpc.generation.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const generations = data?.pages.flatMap((page) => page.items) ?? [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.count}>{generations.length} videos</Text>
      </View>

      <FlatList
        data={generations}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <VideoThumbnail generation={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="film-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No videos yet</Text>
              <Text style={styles.emptySubtitle}>
                Generate your first video on the Generate tab
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  count: { fontSize: 14, color: COLORS.textMuted },
  list: { padding: 16, gap: 12 },
  row: { gap: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#1A1A2E",
    position: "relative",
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cardContent: { padding: 10, gap: 4 },
  promptText: { color: COLORS.text, fontSize: 12, lineHeight: 16 },
  metaRow: { flexDirection: "row", gap: 8 },
  metaText: { fontSize: 10, color: COLORS.textMuted },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
});
