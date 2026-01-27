import { Text, TextInput, View, useThemeColor } from "@/components/Themed";
import React, { useEffect, useMemo, useState } from "react";
import {
    View as DefaultView,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
} from "react-native";

type Batch = {
  size: number;
  quantity: number;
};

type StockItem = {
  name: string;
  totalQuantity: number;
  batches: Batch[];
};

type Props = {
  visible: boolean;
  item: StockItem | null;
  onClose: () => void;
  onConfirm: (pieces: Record<number, number>) => void;
};

export default function BatchCartModal({
  visible,
  item,
  onClose,
  onConfirm,
}: Props) {
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "tabIconDefault");
  const cardBg = useThemeColor({}, "card");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");

  useEffect(() => {
    if (!visible || !item || !item.batches) {
      setQuantities({});
      return;
    }
    const initial: Record<number, string> = {};
    item.batches.forEach((b) => {
      initial[b.size] = "0";
    });
    setQuantities(initial);
  }, [visible, item]);

  const hasQuantity = useMemo(
    () => Object.values(quantities).some((v) => v && Number(v) > 0),
    [quantities],
  );

  const hasInvalid = useMemo(() => {
    if (!item || !item.batches) return false;
    return item.batches.some((b) => {
      const v = Number(quantities[b.size] || 0);
      return v > (b.quantity || 0);
    });
  }, [item, quantities]);

  const disabledOk = !hasQuantity || hasInvalid;

  if (!item) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {item.name}
            </Text>
            <Text style={{ marginBottom: 12, color: textColor }}>
              Available: {item.totalQuantity ?? 0}
            </Text>

            <DefaultView style={styles.sizesGrid}>
              {item.batches && item.batches.length > 0 ? (
                item.batches.map((batch) => {
                  const batchQty = batch.quantity || 0;
                  const inputValue = quantities[batch.size] || "";
                  const numericValue = Number(inputValue || 0);
                  const over = numericValue > batchQty;

                  return (
                    <DefaultView
                      key={batch.size}
                      style={styles.sizeInputBox}
                    >
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
                          value={inputValue}
                          onChangeText={(value) => {
                            const clean = value.replace(/[^0-9]/g, "");
                            setQuantities((prev) => ({
                              ...prev,
                              [batch.size]: clean,
                            }));
                          }}
                          style={[
                            styles.sizeInput,
                            {
                              borderColor: over ? "#dc2626" : borderColor,
                              color: textColor,
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
                justifyContent: "center",
                marginTop: 16,
                backgroundColor: "transparent",
              }}
            >
              <Pressable
                onPress={onClose}
                style={[styles.modalButton, { backgroundColor: buttonPrimary }]}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={disabledOk}
                onPress={() => {
                  if (!item) return;
                  const pieces: Record<number, number> = {};
                  item.batches.forEach((b) => {
                    const v = Number(quantities[b.size] || 0);
                    if (v > 0 && v <= (b.quantity || 0)) {
                      pieces[b.size] = v;
                    }
                  });
                  if (Object.keys(pieces).length === 0) return;
                  onConfirm(pieces);
                }}
                style={[
                  styles.modalButton,
                  {
                    marginLeft: 8,
                    backgroundColor: buttonPrimary,
                    opacity: disabledOk ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>OKAY</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: "40%",
    alignItems: "center",
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
});

