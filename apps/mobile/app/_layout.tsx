import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc, getApiUrl } from "@/lib/trpc";
import { useState } from "react";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#0A0A0F" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#0A0A0F" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: "Sign In", headerShown: false }} />
          <Stack.Screen
            name="video/[id]"
            options={{
              title: "Video",
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
