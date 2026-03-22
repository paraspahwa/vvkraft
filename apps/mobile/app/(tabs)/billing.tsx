import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "@/lib/trpc";
import { TIER_LIMITS } from "@videoforge/shared";
import type { SubscriptionTier } from "@videoforge/shared";

const COLORS = {
  background: "#0A0A0F",
  card: "#16161F",
  border: "#2A2A3A",
  accent: "#6366F1",
  text: "#FFFFFF",
  textMuted: "#6B7280",
  success: "#22C55E",
  warning: "#F59E0B",
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: "#6B7280",
  creator: "#22C55E",
  pro: "#6366F1",
  studio: "#F59E0B",
};

const PLANS = [
  { tier: "creator" as SubscriptionTier, name: "Creator", price: "$19/mo", color: "#22C55E" },
  { tier: "pro" as SubscriptionTier, name: "Pro", price: "$49/mo", color: "#6366F1" },
  { tier: "studio" as SubscriptionTier, name: "Studio", price: "$149/mo", color: "#F59E0B" },
];

const CREDIT_PACKS = [
  { credits: 50, price: "$5" },
  { credits: 150, price: "$14" },
  { credits: 500, price: "$40" },
  { credits: 1500, price: "$100" },
];

const APP_URL = process.env.EXPO_PUBLIC_API_URL;

function openPricingPage() {
  if (!APP_URL) {
    Alert.alert(
      "Configuration Required",
      "Please set EXPO_PUBLIC_API_URL in your environment to open the pricing page."
    );
    return;
  }
  void Linking.openURL(`${APP_URL}/pricing`);
}

export default function BillingScreen() {
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const { data: stats } = trpc.user.stats.useQuery();

  const tier = user?.tier ?? "free";
  const tierColor = TIER_COLORS[tier];
  const limits = user ? TIER_LIMITS[tier] : null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current plan card */}
        <View style={[styles.planCard, { borderColor: tierColor + "50" }]}>
          <View style={styles.planCardRow}>
            <View>
              <Text style={styles.planCardLabel}>Current Plan</Text>
              <Text style={[styles.planCardTier, { color: tierColor }]}>
                {tier.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: tierColor + "20", borderColor: tierColor + "40" }]}>
              <Text style={[styles.tierBadgeText, { color: tierColor }]}>
                {tier}
              </Text>
            </View>
          </View>

          {/* Credits */}
          <View style={styles.creditsRow}>
            <Ionicons name="flash" size={16} color={COLORS.accent} />
            <Text style={styles.creditsText}>
              <Text style={styles.creditsCount}>{(user?.credits ?? 0).toLocaleString()}</Text>
              {" credits remaining"}
            </Text>
          </View>

          {/* Usage */}
          {limits?.videosPerMonth && (
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Videos this month</Text>
              <Text style={styles.usageValue}>
                {stats?.generationsThisMonth ?? 0} / {limits.videosPerMonth}
              </Text>
            </View>
          )}

          {/* Plan features */}
          <View style={styles.featureGrid}>
            {[
              { label: "Max resolution", value: limits?.maxResolution ?? "480p" },
              { label: "Max duration", value: `${limits?.maxDurationSeconds ?? 5}s` },
              { label: "Watermark", value: limits?.watermark ? "Yes" : "No" },
              { label: "Priority queue", value: limits?.priorityQueue ? "Yes" : "No" },
            ].map(({ label, value }) => (
              <View key={label} style={styles.featureItem}>
                <Text style={styles.featureLabel}>{label}</Text>
                <Text style={styles.featureValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upgrade section (only show for non-studio) */}
        {tier !== "studio" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upgrade Your Plan</Text>
            <Text style={styles.sectionSubtitle}>
              Full checkout is available on our website. Tap a plan to get started.
            </Text>

            <View style={styles.planGrid}>
              {PLANS.filter((p) => {
                const order: SubscriptionTier[] = ["free", "creator", "pro", "studio"];
                return order.indexOf(p.tier) > order.indexOf(tier);
              }).map((plan) => (
                <TouchableOpacity
                  key={plan.tier}
                  style={[styles.planOption, { borderColor: plan.color + "40" }]}
                  onPress={openPricingPage}
                  activeOpacity={0.75}
                >
                  <View style={[styles.planDot, { backgroundColor: plan.color }]} />
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Credit packs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy Credits</Text>
          <Text style={styles.sectionSubtitle}>
            Top up your credits anytime. 1 credit = $0.10
          </Text>

          <View style={styles.packGrid}>
            {CREDIT_PACKS.map((pack) => (
              <TouchableOpacity
                key={pack.credits}
                style={styles.packCard}
                onPress={openPricingPage}
                activeOpacity={0.75}
              >
                <Ionicons name="flash" size={18} color={COLORS.accent} />
                <Text style={styles.packCredits}>{pack.credits.toLocaleString()}</Text>
                <Text style={styles.packLabel}>credits</Text>
                <Text style={styles.packPrice}>{pack.price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.webLink} onPress={openPricingPage} activeOpacity={0.8}>
            <Ionicons name="globe-outline" size={16} color={COLORS.accent} />
            <Text style={styles.webLinkText}>Open full pricing page</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Manage subscription */}
        {user?.razorpaySubscriptionId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Subscription</Text>
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => {
              if (APP_URL) void Linking.openURL(`${APP_URL}/settings`);
            }}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={16} color={COLORS.text} />
              <Text style={styles.manageBtnText}>Manage on website</Text>
              <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },

  content: { padding: 16, gap: 20, paddingBottom: 32 },

  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 16,
  },
  planCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planCardLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  planCardTier: { fontSize: 22, fontWeight: "800" },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },

  creditsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.accent + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent + "20",
  },
  creditsText: { color: COLORS.textMuted, fontSize: 14 },
  creditsCount: { color: COLORS.text, fontWeight: "800", fontSize: 16 },

  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  usageLabel: { fontSize: 13, color: COLORS.textMuted },
  usageValue: { fontSize: 13, color: COLORS.text, fontWeight: "600" },

  featureGrid: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureLabel: { fontSize: 13, color: COLORS.textMuted },
  featureValue: { fontSize: 13, color: COLORS.text, fontWeight: "600" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  sectionSubtitle: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },

  planGrid: { gap: 8 },
  planOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  planDot: { width: 10, height: 10, borderRadius: 5 },
  planName: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: "600" },
  planPrice: { fontSize: 14, fontWeight: "700" },

  packGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  packCard: {
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
  packCredits: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  packLabel: { fontSize: 11, color: COLORS.textMuted },
  packPrice: { fontSize: 16, fontWeight: "700", color: COLORS.accent, marginTop: 4 },

  webLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webLinkText: { flex: 1, fontSize: 14, color: COLORS.text },

  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manageBtnText: { flex: 1, fontSize: 14, color: COLORS.text },
});
