import CompanySelector from "@/components/CompanySelector";
import { SkeletonCardItem } from "@/components/Skeleton";
import BatchCartModal from "@/components/stocks/BatchCartModal";
import { Text, TextInput, View, useThemeColor } from "@/components/Themed";
import ThemeToggle from "@/components/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useCompany } from "@/context/CompanyContext";
import { getCompanyStocks, getStocksWithBatches } from "@/lib/api";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View as DefaultView,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";

export default function StocksScreen() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selected } = useCompany();
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "tabIconDefault");
  const cardBg = useThemeColor({}, "card");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const cart = useCart();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<any | null>(null);

  useEffect(() => {
    if (!selected) {
      setError("No company selected");
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    console.log("Fetching stocks for company:", selected);

    getStocksWithBatches(selected)
      .then((res: any) => {
        const rows = res && res.data ? res.data : [];
        const mapped = rows.map((s: any) => ({
          id: String(s.$Name || s.StockName || Math.random()),
          name: s.$Name || s.StockName || "",
          closingQty: Number(s.$ClosingBalance ?? s.ClosingQty ?? 0) || 0,
          openingQty: Number(s.$OpeningBalance ?? s.OpeningQty ?? 0) || 0,
          parent: s.$Parent || s.Category || "N/A",
          price: Number(s.$ClosingRate ?? s.ClosingRate ?? 0) || 0,
          batches: s.batches || [],
          totalQuantity: s.totalQuantity ?? (Number(s.ClosingQty ?? s.$ClosingBalance ?? 0) || 0),
        }));
        setItems(mapped);
        setLoading(false);
      })
      .catch(async (err) => {
        const msg = String(err?.message || err);
        if (msg.includes("404")) {
          try {
            const res = await getCompanyStocks(selected);
            const rows = res && res.data ? res.data : [];
            const fallbackMapped = rows.map((s: any) => ({
              id: String(s.$Name || s.StockName || Math.random()),
              name: s.$Name || s.StockName || "",
              closingQty: Number(s.$ClosingBalance ?? s.ClosingQty ?? 0) || 0,
              openingQty: Number(s.$OpeningBalance ?? s.OpeningQty ?? 0) || 0,
              parent: s.$Parent || s.Category || "N/A",
              price: Number(s.$ClosingRate ?? s.ClosingRate ?? 0) || 0,
              batches: [],
              totalQuantity: Number(s.ClosingQty ?? s.$ClosingBalance ?? 0) || 0,
            }));
            setItems(fallbackMapped);
            setError(null);
          } catch (err) {
            setError(String("Failed to load stocks: " + msg));
            setItems([]);
          } finally {
            setLoading(false);
          }
        } else {
          console.error("Failed to fetch stocks:", err);
          setError(msg || "Failed to load stocks");
          setItems([]);
          setLoading(false);
        }
      });
  }, [selected]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!selected) return;
      getStocksWithBatches(selected)
        .then((res: any) => {
          const rows = res && res.data ? res.data : [];
          const filteredRows = rows.filter((r: any) =>
            String(r.$Name || r.StockName || "")
              .toLowerCase()
              .includes(query.toLowerCase()),
          );
          const mapped = filteredRows.map((s: any) => ({
            id: String(s.$Name || s.StockName || Math.random()),
            name: s.$Name || s.StockName || "",
            closingQty: Number(s.$ClosingBalance ?? s.ClosingQty ?? 0) || 0,
            openingQty: Number(s.$OpeningBalance ?? s.OpeningQty ?? 0) || 0,
            parent: s.$Parent || s.Category || "N/A",
            price: Number(s.$ClosingRate ?? s.ClosingRate ?? 0) || 0,
            batches: s.batches || [],
            totalQuantity: s.totalQuantity ?? (Number(s.ClosingQty ?? s.$ClosingBalance ?? 0) || 0),
          }));
          setItems(mapped);
        })
        .catch(async (err) => {
          const msg = String(err?.message || err);
          if (msg.includes("404")) {
            try {
              const res = await getCompanyStocks(selected);
              const rows = res && res.data ? res.data : [];
              const filteredRows = rows.filter((r: any) =>
                String(r.$Name || r.StockName || "")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              );
              const fallbackMapped = filteredRows.map((s: any) => ({
                id: String(s.$Name || s.StockName || Math.random()),
                name: s.$Name || s.StockName || "",
                closingQty: Number(s.$ClosingBalance ?? s.ClosingQty ?? 0) || 0,
                openingQty: Number(s.$OpeningBalance ?? s.OpeningQty ?? 0) || 0,
                parent: s.$Parent || s.Category || "N/A",
                price: Number(s.$ClosingRate ?? s.ClosingRate ?? 0) || 0,
                batches: [],
                totalQuantity: Number(s.ClosingQty ?? s.$ClosingBalance ?? 0) || 0,
              }));
              setItems(fallbackMapped);
            } catch (inner) {
              console.error("Fallback search failed:", inner);
            }
          } else {
            console.error("Search failed:", err);
          }
        });
    }, 300);
    return () => clearTimeout(t);
  }, [query, selected]);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );

  // console.log("Filtered items:", filtered);
  // console.log("Total items:", items.length);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Stocks",
          headerRight: () => (
            <DefaultView style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemeToggle />
              <CompanySelector />
            </DefaultView>
          ),
        }}
      />

      {error && (
        <View style={{ backgroundColor: "#fee", padding: 12, marginBottom: 8 }}>
          <Text style={{ color: "#c33" }}>Error: {error}</Text>
        </View>
      )}

      {!selected && (
        <View
          style={{ backgroundColor: "#ffeaa7", padding: 12, marginBottom: 8 }}
        >
          <Text style={{ color: "#664400" }}>
            Please select a company first
          </Text>
        </View>
      )}

      <TextInput
        style={[
          styles.searchBar,
          {
            color: textColor,
            borderColor: borderColor,
            backgroundColor: cardBg,
          },
        ]}
        placeholder="Search stocks..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <DefaultView style={{ paddingHorizontal: 12 }}>
          {[...Array(6)].map((_, i) => <SkeletonCardItem key={i} />)}
        </DefaultView>
      ) : filtered.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: textColor }}>
            {items.length === 0 ? "No stocks found" : "No matching stocks"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item, index }) => (
            <DefaultView
              style={[
                styles.card,
                { backgroundColor: cardBg, borderColor: borderColor },
              ]}
            >
              <DefaultView style={styles.cardHeader}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.stockName, { color: textColor }]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.closingQty,
                    {
                      color: textColor,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: borderColor,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 4,
                      paddingBottom: 4,
                    },
                  ]}
                >
                  {`Qty: ` + item.totalQuantity}
                </Text>
              </DefaultView>

              <DefaultView style={styles.cardDetails}>
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>
                    Parent:
                  </Text>
                  <Text
                    style={[styles.value, { color: textColor }]}
                    numberOfLines={1}
                  >
                    {item.parent}
                  </Text>
                </DefaultView>

                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>
                    Opening Qty:
                  </Text>
                  <Text style={[styles.value, { color: textColor }]}>
                    {item.openingQty.toFixed(2)}
                  </Text>
                </DefaultView>

                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>
                    Rate:
                  </Text>
                  <Text style={[styles.value, { color: textColor }]}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                </DefaultView>
                <DefaultView style={styles.detailRow}>
                  <Text style={[styles.label, { color: borderColor }]}>
                    Closing in Tally:
                  </Text>
                  <Text style={[styles.value, { color: textColor }]}>
                    ₹{item.closingQty.toFixed(2)}
                  </Text>
                </DefaultView>
                {item.batches && item.batches.length > 0 && (
                  <DefaultView
                    style={[
                      styles.detailRow,
                      { flexDirection: "column", alignItems: "flex-start" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.label,
                        { color: borderColor, marginBottom: 6 },
                      ]}
                    >
                      Batches:
                    </Text>
                    {item.batches.map((batch: any, idx: number) => (
                      <Text
                        key={idx}
                        style={[
                          styles.batchItem,
                          { color: textColor, marginBottom: 4 },
                        ]}
                      >
                        Size {batch.size}: {batch.quantity} pcs
                      </Text>
                    ))}
                  </DefaultView>
                )}
              </DefaultView>
              {item.totalQuantity > 0 ? (
              <TouchableOpacity
                style={[styles.addButton, { marginTop: 12, backgroundColor: buttonPrimary }]}
                onPress={() => {
                  setModalItem(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
              ): null}
            </DefaultView>
          )}
        />
      )}
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: buttonPrimary }]}
        onPress={() => router.push("/cart")}
      >
        <Text style={styles.cartButtonText}>Open Cart</Text>
      </TouchableOpacity>

      <BatchCartModal
        visible={modalVisible}
        item={modalItem}
        onClose={() => setModalVisible(false)}
        onConfirm={(pieces) => {
          if (!modalItem) return;
          cart.add({
            id: `${modalItem.name}-${Date.now()}`,
            name: modalItem.name,
            pieces,
          });
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8, paddingHorizontal: 12 },
  searchBar: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  card: {
    margin: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stockName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  closingQty: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    flex: 0.4,
  },
  value: {
    fontSize: 13,
    flex: 0.6,
    textAlign: "right",
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cartButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  cartButtonText: { color: "#fff", fontWeight: "600" },
  batchItem: {
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  sectionLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
});
