import CompanySelector from "@/components/CompanySelector";
import { Text, TextInput, View, useThemeColor } from "@/components/Themed";
import { useCart } from "@/context/CartContext";
import { useCompany } from "@/context/CompanyContext";
import { getStocksWithBatches } from "@/lib/api";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  View as DefaultView,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [batchData, setBatchData] = useState<any[]>([]);

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
        // console.log("Stocks API Response:", res);
        const rows = res && res.data ? res.data : [];
        // console.log("Rows:", rows);

        const mapped = rows.map((s: any) => ({
          id: String(s.$Name || s.StockName || Math.random()),
          name: s.$Name || s.StockName || "",
          closingQty: Number(s.$ClosingBalance ?? s.ClosingQty ?? 0) || 0,
          openingQty: Number(s.$OpeningBalance ?? s.OpeningQty ?? 0) || 0,
          parent: s.$Parent || s.Category || "N/A",
          price: Number(s.$ClosingRate ?? s.ClosingRate ?? 0) || 0,
          batches: s.batches || [],
          totalQuantity: s.totalQuantity || 0,
        }));
        // console.log("Mapped items:", mapped);
        setItems(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stocks:", err);
        setError(err.message || "Failed to load stocks");
        setItems([]);
        setLoading(false);
      });
  }, [selected]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!selected) return;
      getStocksWithBatches(selected)
        .then((res: any) => {
          const rows = res && res.data ? res.data : [];
          const filtered = rows.filter((r: any) =>
            String(r.$Name || r.StockName || "")
              .toLowerCase()
              .includes(query.toLowerCase()),
          );
          const mapped = filtered.map((s: any) => ({
            id: String(s.$Name || s.StockName || Math.random()),
            name: s.$Name || s.StockName || "",
            closingQty: Number(s.$ClosingBalance ?? s.ClosingQty ?? 0) || 0,
            openingQty: Number(s.$OpeningBalance ?? s.OpeningQty ?? 0) || 0,
            parent: s.$Parent || s.Category || "N/A",
            price: Number(s.$ClosingRate ?? s.ClosingRate ?? 0) || 0,
            batches: s.batches || [],
            totalQuantity: s.totalQuantity || 0,
          }));
          setItems(mapped);
        })
        .catch((err) => console.error("Search failed:", err));
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
          headerRight: () => <CompanySelector />,
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: textColor }}>Loading stocks...</Text>
        </View>
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

              <TouchableOpacity
                style={[styles.addButton, { marginTop: 12, backgroundColor: buttonPrimary }]}
                onPress={() => {
                  setModalItem(item);
                  setQuantities({});

                  // Use batches already loaded from the stock data
                  const batches = item.batches || [];
                  setBatchData(batches);

                  // Pre-fill the quantities from batch data
                  const initialQty: Record<number, string> = {};
                  batches.forEach((batch: any) => {
                    initialQty[batch.size] = batch.quantity.toString();
                  });
                  setQuantities(initialQty);

                  setModalVisible(true);
                }}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {modalItem?.name}
              </Text>
              <Text style={{ marginBottom: 12, color: textColor }}>
                Available: {modalItem?.totalQuantity ?? 0}
              </Text>

              {/* Batch Input Boxes - Only from Database */}
              <DefaultView style={styles.sizesGrid}>
                {batchData.length > 0 ? (
                  batchData.map((batch: any) => {
                    const batchQty = batch.quantity || 0;
                    const inputValue = Number(quantities[batch.size]) || 0;

                    return (
                      <DefaultView key={batch.size} style={styles.sizeInputBox}>
                        <Text
                          style={[styles.sizeLabel, { color: borderColor }]}
                        >
                          Size {batch.size}
                        </Text>
                        <Text
                          style={[
                            styles.sizeLabel,
                            { color: "#999", fontSize: 12 },
                          ]}
                        >
                          Available: {batchQty}
                        </Text>
                        {batchQty === 0 ? null : (
                          <TextInput
                            keyboardType="numeric"
                            placeholder={batchQty.toString()}
                            value={quantities[batch.size]?.toString() || ""}
                            onChangeText={(value) => {
                              const cleanValue = value.replace(/[^0-9]/g, "");
                              const numValue = Number(cleanValue) || 0;

                              if (cleanValue === "") {
                                // Allow clearing the value
                                setQuantities((prev) => ({
                                  ...prev,
                                  [batch.size]: "",
                                }));
                              } else if (numValue <= batchQty) {
                                // Allow only values <= batch quantity
                                setQuantities((prev) => ({
                                  ...prev,
                                  [batch.size]: cleanValue,
                                }));
                              } else {
                                // Show error if value exceeds batch quantity
                                Alert.alert(
                                  "Invalid Quantity",
                                  `Value cannot exceed available quantity (${batchQty})`,
                                  [{ text: "OK" }],
                                );
                                // Clear the invalid input
                                setQuantities((prev) => ({
                                  ...prev,
                                  [batch.size]: "",
                                }));
                              }
                            }}
                            style={[
                              styles.sizeInput,
                              {
                                borderColor,
                                color: textColor,
                                minWidth: 60,
                                flex: 1,
                              },
                            ]}
                          />
                        )}
                      </DefaultView>
                    );
                  })
                ) : (
                  <Text
                    style={{
                      color: textColor,
                      textAlign: "center",
                      marginVertical: 16,
                    }}
                  >
                    No batches available for this item
                  </Text>
                )}
              </DefaultView>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 16,
                  backgroundColor: "transparent",
                }}
              >
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalButton, { backgroundColor: buttonPrimary }]}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!modalItem) return;
                    const hasQuantity = Object.values(quantities).some(
                      (v) => v && Number(v) > 0,
                    );
                    if (!hasQuantity) return;

                    // Add to cart with pieces as object for each size (1-12)
                    const piecesObj: Record<number, number> = {};
                    Object.entries(quantities).forEach(([size, qty]) => {
                      const num = Number(qty) || 0;
                      if (num > 0) {
                        piecesObj[Number(size)] = num;
                      }
                    });

                    cart.add({
                      id: `${modalItem.name}-${Date.now()}`,
                      name: modalItem.name,
                      pieces: piecesObj,
                    });

                    setModalVisible(false);
                  }}
                  style={[styles.modalButton, { marginLeft: 8, backgroundColor: buttonPrimary }]}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    OKAY
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 50,
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  modalInput: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 8 },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  sizesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  sizeInputBox: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    maxHeight: "50%",
  },
  sizeLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  sizeInput: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    width: "100%",
    minWidth: 60,
    textAlign: "center",
    fontSize: 12,
  },
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
