import { Text, View } from "@/components/Themed";
import { useCart } from "@/context/CartContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Animated, FlatList, Pressable, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import ApiResponseMessage from "@/components/ApiResponseMessage";
import ShopInput from "../components/trader/ShopInput";
import { useCompany } from "../context/CompanyContext";
import { getCompanyParties, submitOrder } from "../lib/api";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/components/Themed";

export default function CartScreen() {
  const cart = useCart();
  const [shopName, setShopName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const proceedScale = new Animated.Value(1);
  const [showParties, setShowParties] = useState(false);
  const [parties, setParties] = useState<{ name: string }[]>([]);
  const { selectedCompany: selected } = useCompany();
  const [respVisible, setRespVisible] = useState(false);
  const [respSuccess, setRespSuccess] = useState(true);
  const [respMessage, setRespMessage] = useState<string | undefined>(undefined);
  const router = useRouter();
  const buttonPrimary = useThemeColor({}, "buttonPrimary");

  const hasDuplicate = useMemo(() => {
    const names = cart.items.map((i) => i.name);
    const seen = new Set<string>();
    for (const n of names) {
      if (seen.has(n)) return true;
      seen.add(n);
    }
    return false;
  }, [cart.items]);

  useEffect(() => {
    if (!selected) return;
    getCompanyParties(selected)
      .then((res: any) => {
        const rows = res && res.data ? res.data : [];
        const debtors = (rows || [])
          .filter((r: any) => {
            const grp =
              r.$_PrimaryGroup || r._PrimaryGroup || r.PrimaryGroup || "";
            return String(grp).toLowerCase().includes("sundry debtors");
          })
          .map((p: any) => ({
            name: String(p.$Name || p.MailingName || p.Name || ""),
          }));
        setParties(debtors.filter((d: any) => !!d.name));
      })
      .catch(() => setParties([]));
  }, [selected]);

  const proceed = async () => {
    if (!shopName || cart.items.length === 0 || !selected) return;
    setSubmitting(true);
    try {
      console.log("Submitting order for:", {
        companyName: selected,
        shopName,
        itemsCount: cart.items.length,
        items: cart.items,
      });

      // Map cart items to API order items
      const orderItems = cart.items.map((i) => ({
        stockItem: i.name,
        pieces: i.pieces,
      }));

      // Send all items in one request
      const response = await submitOrder(selected, shopName, orderItems);
      console.log("Order submitted successfully:", response);
      setRespSuccess(true);
      setRespMessage(String(response?.message || "Order submitted successfully!"));
      setRespVisible(true);
      cart.clear();
    } catch (e) {
      console.error("Order submission failed:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setRespSuccess(false);
      setRespMessage(msg);
      setRespVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ApiResponseMessage
        visible={respVisible}
        success={respSuccess}
        title={respSuccess ? "✓ Order Submitted" : "Order Error"}
        message={respMessage}
        details={respSuccess ? { Shop: shopName, Items: cart.items.length } : undefined}
        onClose={() => {
          setRespVisible(false);
          router.push("/(tabs)/stocks");
        }}
      />
      <View style={styles.inputWrap}>
        <ShopInput
          value={shopName}
          onChange={(v) => {
            setShopName(v);
            setShowParties(true);
          }}
          showClear={showParties || !!shopName}
          onClear={() => {
            setShopName("");
            setShowParties(false);
          }}
        />
        {showParties && parties.length > 0 ? (
          <View style={styles.suggestions}>
            <FlatList
              data={parties
                .filter((p) =>
                  p.name.toLowerCase().includes(shopName.toLowerCase()),
                )
                .slice(0, 5)}
              keyExtractor={(i) => i.name}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setShopName(item.name);
                    setShowParties(false);
                  }}
                  style={styles.suggestionItem}
                >
                  <Text numberOfLines={1}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text>{item.name}</Text>
              <Text>
                {Object.entries(item.pieces).map(([size, qty]) => (
                  <Text style={styles.pieces} key={size}>
                    {size} Size: Qty {qty}
                    {"\n"}
                  </Text>
                ))}
              </Text>
            </View>
            <TouchableOpacity onPress={() => cart.remove(item.id)}>
              <MaterialIcons name="delete" size={24} color="#ff4d4f" />
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableWithoutFeedback
        disabled={cart.items.length === 0}
        onPress={() => {
          if (submitting || hasDuplicate) return;
          Animated.sequence([
            Animated.timing(proceedScale, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(proceedScale, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
          proceed();
        }}
      >
        <Animated.View
          style={[
            styles.proceedButton,
            {
              backgroundColor: buttonPrimary,
              opacity:
                submitting || hasDuplicate || cart.items.length === 0 ? 0.5 : 1,
              transform: [{ scale: proceedScale }],
            },
          ]}
        >
          <Text style={styles.proceedButtonText}>
            {hasDuplicate ? "Resolve duplicate items" : "Proceed"}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  inputWrap: { position: "relative", marginVertical: 8, zIndex: 1 },
  suggestions: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 200,
    zIndex: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  proceedButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  proceedButtonText: { color: "#fff", fontWeight: "600" },
  pieces: {
    fontSize: 14,
    color: "#ee0000",
    marginRight: 4,
    paddingHorizontal: 2,
    textAlign: "justify",
    fontWeight: "600",
  },
});
