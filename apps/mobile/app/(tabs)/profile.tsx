import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "@/lib/trpc";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { TIER_LIMITS } from "@videoforge/shared";
import type { SubscriptionTier } from "@videoforge/shared";

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
  error: "#EF4444",
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: "#6B7280",
  creator: "#22C55E",
  pro: "#6366F1",
  studio: "#F59E0B",
};

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as "flash"} size={20} color={COLORS.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: stats } = trpc.user.stats.useQuery();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => void signOut(auth),
      },
    ]);
  };

  const limits = user ? TIER_LIMITS[user.tier] : null;
  const tierColor = user ? TIER_COLORS[user.tier] : COLORS.textMuted;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar and name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.displayName ?? user?.email ?? "U")[0]?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName ?? "VideoForge User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierColor + "20", borderColor: tierColor + "40" }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>
              {user?.tier?.toUpperCase()} PLAN
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Credits"
            value={(user?.credits ?? 0).toLocaleString()}
            icon="flash"
          />
          <StatCard
            label="Total Videos"
            value={(stats?.totalGenerations ?? 0).toLocaleString()}
            icon="film"
          />
          <StatCard
            label="This Month"
            value={(stats?.generationsThisMonth ?? 0).toLocaleString()}
            icon="calendar"
          />
          <StatCard
            label="Max Duration"
            value={limits ? `${limits.maxDurationSeconds}s` : "—"}
            icon="time"
          />
        </View>

        {/* Plan limits */}
        {limits && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Features</Text>
            <View style={styles.featureList}>
              {[
                { label: "Max Resolution", value: limits.maxResolution },
                { label: "Watermark", value: limits.watermark ? "Yes" : "No" },
                { label: "Motion Control", value: limits.motionControl ? "Yes" : "No" },
                { label: "Priority Queue", value: limits.priorityQueue ? "Yes" : "No" },
              ].map(({ label, value }) => (
                <View key={label} style={styles.featureRow}>
                  <Text style={styles.featureLabel}>{label}</Text>
                  <Text style={styles.featureValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu items */}
        <View style={styles.card}>
          {[
            { icon: "card", label: "Billing & Subscription", color: COLORS.accent },
            { icon: "settings", label: "Account Settings", color: COLORS.accent },
            { icon: "help-circle", label: "Help & Support", color: COLORS.accent },
          ].map(({ icon, label, color }) => (
            <TouchableOpacity key={label} style={styles.menuItem}>
              <Ionicons name={icon as "card"} size={18} color={color} />
              <Text style={styles.menuLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: "white" },
  displayName: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textMuted },
  tierBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: "center" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  featureList: { gap: 10 },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  featureLabel: { fontSize: 13, color: COLORS.textMuted },
  featureValue: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.error + "10",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  signOutText: { color: COLORS.error, fontSize: 15, fontWeight: "600" },
});
