// components/trader/PunchCard.tsx
import ErrorModal from "@/components/ErrorModal";
import ApiResponseMessage from "@/components/ApiResponseMessage";
import { SkeletonLine } from "@/components/Skeleton";
import { Text, TextInput, View, useThemeColor } from "@/components/Themed";
import PunchSuccessModal from "@/components/trader/PunchSuccessModal";
import ShopInput from "@/components/trader/ShopInput";
import ShopSuggestions from "@/components/trader/ShopSuggestions";
import { useCompany } from "@/context/CompanyContext";
import { getCompanyParties, submitPunchIn } from "@/lib/api";
import React, { memo, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useCart } from "@/context/CartContext";

type Props = {
  employeeName?: string | null;
  employeePhone?: string | null;
};

export default memo(function PunchCard({ employeeName, employeePhone }: Props) {
  const { selected: companyName } = useCompany();
  const cart = useCart();
  const [shopName, setShopName] = useState("");
  const [amount, setAmount] = useState("");
  const [parties, setParties] = useState<
    { name: string; closingBalance: number }[]
  >([]);
  const [showParties, setShowParties] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    shopName: string;
    amount: number;
    location?: string;
    time?: string;
  } | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [respVisible, setRespVisible] = useState(false);
  const [respSuccess, setRespSuccess] = useState(true);
  const [respMessage, setRespMessage] = useState<string | undefined>(undefined);
  const cardBg = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "tabIconDefault");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const textColor = useThemeColor({}, "text");
  // const clearBg = useThemeColor({}, 'clearBg');

  // Fetch parties
  useEffect(() => {
    if (!companyName) return;
    getCompanyParties(companyName)
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
            closingBalance:
              Number(p.$ClosingBalance ?? p.ClosingBalance ?? p.Balance ?? 0) ||
              0,
          }));
        setParties(debtors.filter((d: any) => !!d.name));
      })
      .catch((err) => {
        console.error("Failed to fetch parties:", err);
        setParties([]);
      });
  }, [companyName]);

  const handlePress = async () => {
    if (submitting) return;

    if (!employeePhone || String(employeePhone).trim().length < 10) {
      Alert.alert("Missing Employee Phone", "Please add employee phone in the dashboard before punching in.");
      return;
    }

    if (!companyName || !String(companyName).trim()) {
      Alert.alert("Missing Company", "Please select a company before punching in.");
      return;
    }

    if (!shopName.trim()) {
      Alert.alert(
        "Missing Shop",
        "Please enter shop/party name before punching in.",
      );
      return;
    }

    const amt = Number(amount || 0) || 0;

    // Location not required

    const now = new Date();
    const payload = {
      employeeName: employeeName ?? "",
      employeePhone: employeePhone ?? "",
      companyName: companyName ?? "",
      shopName: shopName.trim(),
      amount: amt,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
    };

    try {
      setSubmitting(true);
      console.log("📤 Submitting punch in:", payload);
      const result = await submitPunchIn(payload);
      console.log("✅ Punch in successful");
      setRespSuccess(true);
      setRespMessage(String(result?.message || "Punch in recorded successfully"));
      setRespVisible(true);
      setSuccessInfo({
        shopName: shopName.trim(),
        amount: amt,
        time: now.toLocaleTimeString(),
      });
      cart.setOrdered(true);
      setShowSuccess(true);
      setShopName("");
      setAmount("");
    } catch (error) {
      console.error("❌ Punch in error:", error);
      const msg = String((error as any)?.message || error);
      const code = typeof (error as any)?.status === "number" ? (error as any).status : (msg.match(/(\d{3})/) ? Number(msg.match(/(\d{3})/)![1]) : null);
      if (code) {
        setErrorCode(code)
        setRespSuccess(false);
        setRespMessage(msg);
        setRespVisible(true);
      }
      else Alert.alert("Error", "Failed to submit punch. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <React.Fragment>
      <ApiResponseMessage
        visible={respVisible}
        success={respSuccess}
        title={respSuccess ? "✓ Punch In Successful" : "Punch In Error"}
        message={respMessage}
        details={respSuccess ? { Employee: employeeName || "", Shop: successInfo?.shopName || "", Amount: successInfo?.amount } : undefined}
        onClose={() => setRespVisible(false)}
      />
      <ErrorModal visible={!!errorCode} status={errorCode ?? undefined} onClose={() => setErrorCode(null)} onRetry={() => { setErrorCode(null); handlePress(); }} />
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={styles.title}>Punch In</Text>

        <View style={[styles.row, { backgroundColor: "transparent" }]}>
          <Text style={styles.label}>Employee:</Text>
          {employeeName ? (
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {employeeName}
            </Text>
          ) : (
            <SkeletonLine width="50%" height={16} style={{ alignSelf: "center" }} />
          )}
        </View>

        {companyName && (
          <View style={[styles.row, { backgroundColor: "transparent" }]}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {companyName}
            </Text>
          </View>
        )}

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
          <ShopSuggestions
            show={showParties}
            parties={parties}
            query={shopName}
            onPick={(item) => {
              setShopName(item.name);
              if (typeof item.closingBalance === "number") {
                setAmount(String(Math.abs(item.closingBalance)));
              }
              setShowParties(false);
            }}
          />
        </View>

        <TextInput
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={[styles.input, { borderColor: borderColor }]}
        />
        {/* <Text style={[styles.location, { color: textColor }]}>{locText}</Text> */}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: buttonPrimary,
              opacity: submitting ? 0.6 : 1,
            },
          ]}
          onPress={handlePress}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? "Submitting..." : "Punch In"}
          </Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "stretch",
    position: "relative",
    zIndex: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 70,
    color: "#666",
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  company: {
    maxWidth: "75%",
    marginLeft: 5,
    fontSize: 14,
  },
  location: {
    flex: 1,
    flexWrap: "wrap",
    fontSize: 14,
  },
  inputWrap: {
    position: "relative",
    marginBottom: 8,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
