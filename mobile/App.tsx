import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

type DailyQuote = {
  quoteText: string;
  category: string;
  date: string;
};

type AppStateView =
  | { kind: "loading" }
  | { kind: "quote"; quote: DailyQuote }
  | { kind: "error"; message: string };

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
const monkeyBounce = new Animated.Value(0);

async function fetchDailyQuote(): Promise<DailyQuote> {
  if (!apiUrl) {
    throw new Error("Set EXPO_PUBLIC_API_URL to your deployed Monkey Sage website.");
  }

  const response = await fetch(`${apiUrl}/api/daily-quote`, {
    headers: { Accept: "application/json" },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Today's wisdom could not be reached.";
    throw new Error(message);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("quoteText" in payload) ||
    typeof payload.quoteText !== "string" ||
    !("category" in payload) ||
    typeof payload.category !== "string" ||
    !("date" in payload) ||
    typeof payload.date !== "string"
  ) {
    throw new Error("The wisdom service returned an unexpected response.");
  }

  return {
    quoteText: payload.quoteText,
    category: payload.category,
    date: payload.date,
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MonkeySageScreen />
    </SafeAreaProvider>
  );
}

function MonkeySageScreen() {
  const [view, setView] = useState<AppStateView>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    void fetchDailyQuote()
      .then((quote) => {
        if (isCurrent) {
          setView({ kind: "quote", quote });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setView({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Today's wisdom could not be reached.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(monkeyBounce, {
          toValue: 1,
          duration: 2_400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(monkeyBounce, {
          toValue: 0,
          duration: 2_400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setView({ kind: "loading" });
        setAttempt((current) => current + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  const shareQuote = async () => {
    if (view.kind !== "quote") {
      return;
    }

    setShareError("");
    try {
      await Share.share({
        message: `“${view.quote.quoteText}”\n\n${view.quote.category} · Monkey Sage`,
      });
    } catch {
      setShareError("The share sheet could not be opened.");
    }
  };

  const translatedY = monkeyBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });
  const dateLabel =
    view.kind === "quote"
      ? new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${view.quote.date}T00:00:00.000Z`))
      : null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.monkeySeal}>
              <Animated.Text
                accessibilityLabel="Monkey"
                style={[styles.monkey, { transform: [{ translateY: translatedY }] }]}
              >
                🐒
              </Animated.Text>
            </View>
            <Text style={styles.eyebrow}>A quiet moment, once a day</Text>
            <Text style={styles.title}>Monkey Sage</Text>
          </View>

          {view.kind === "loading" ? (
            <View accessibilityLiveRegion="polite" style={styles.messageBlock}>
              <ActivityIndicator color={colors.amber} size="small" />
              <Text style={styles.messageText}>Unrolling today&apos;s scroll</Text>
            </View>
          ) : null}

          {view.kind === "error" ? (
            <View accessibilityLiveRegion="polite" style={styles.messageBlock}>
              <Text style={styles.messageTitle}>The wisdom is quiet for now.</Text>
              <Text style={styles.messageText}>{view.message}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setView({ kind: "loading" });
                  setAttempt((current) => current + 1);
                }}
                style={({ pressed }) => [
                  styles.shareButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.shareButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : null}

          {view.kind === "quote" ? (
            <>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                  &ldquo;{view.quote.quoteText}&rdquo;
                </Text>
                <Text style={styles.category}>{view.quote.category}</Text>
              </View>
              <Pressable
                accessibilityLabel="Share today's wisdom"
                accessibilityRole="button"
                onPress={shareQuote}
                style={({ pressed }) => [
                  styles.shareButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.shareButtonText}>Share today&apos;s wisdom</Text>
              </Pressable>
              {shareError ? (
                <Text accessibilityLiveRegion="polite" style={styles.shareError}>
                  {shareError}
                </Text>
              ) : null}
            </>
          ) : null}

          <Text style={styles.footer}>One monkey. One quote. One day.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  paper: "#F1E7D5",
  paperLight: "#FBF7EF",
  ink: "#332C22",
  muted: "#766C5D",
  amber: "#8D5426",
  amberDark: "#70401E",
  sage: "#5D694D",
  rule: "#D9CBB5",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  content: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  monkeySeal: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 52,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: "#E9DCC7",
  },
  monkey: {
    fontSize: 62,
    lineHeight: 76,
    textAlign: "center",
  },
  eyebrow: {
    marginTop: 20,
    color: colors.sage,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 5,
    color: colors.ink,
    fontFamily: "serif",
    fontSize: 34,
    fontWeight: "400",
  },
  dateLabel: {
    marginTop: 36,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  quoteCard: {
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 25,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 7,
    backgroundColor: colors.paperLight,
    shadowColor: "#403018",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  quoteText: {
    color: colors.ink,
    fontFamily: "serif",
    fontSize: 27,
    fontStyle: "italic",
    lineHeight: 39,
    textAlign: "center",
  },
  category: {
    marginTop: 22,
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  messageBlock: {
    minHeight: 150,
    width: "100%",
    marginTop: 38,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  messageTitle: {
    color: colors.ink,
    fontFamily: "serif",
    fontSize: 21,
    fontStyle: "italic",
    textAlign: "center",
  },
  messageText: {
    maxWidth: 300,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  shareButton: {
    minHeight: 50,
    minWidth: 190,
    marginTop: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: colors.amber,
  },
  buttonPressed: {
    backgroundColor: colors.amberDark,
    transform: [{ scale: 0.985 }],
  },
  shareButtonText: {
    color: colors.paperLight,
    fontSize: 15,
    fontWeight: "600",
  },
  shareError: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 12,
  },
  footer: {
    marginTop: 36,
    color: colors.muted,
    fontFamily: "serif",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
