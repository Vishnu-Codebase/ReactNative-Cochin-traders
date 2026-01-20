// components/trader/PunchCard.tsx
import { Text, TextInput, View, useThemeColor } from "@/components/Themed";
import PunchSuccessModal from "@/components/trader/PunchSuccessModal";
import ShopInput from "@/components/trader/ShopInput";
import ShopSuggestions from "@/components/trader/ShopSuggestions";
import { useCompany } from "@/context/CompanyContext";
import { getCompanyParties, submitPunchIn } from "@/lib/api";
import * as Location from "expo-location";
import React, { memo, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  employeeName?: string | null;
  employeePhone?: string | null;
};

export default memo(function PunchCard({
  employeeName,
  employeePhone,
}: Props) {
  const { selected: companyName } = useCompany();
  const [shopName, setShopName] = useState("");
  const [amount, setAmount] = useState("");
  const [parties, setParties] = useState<{ name: string; closingBalance: number }[]>([]);
  const [showParties, setShowParties] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ shopName: string; amount: number; location?: string; time?: string } | null>(null);
  const cardBg = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "tabIconDefault");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
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


  // Fetch coordinates using Expo Location only
  useEffect(() => {
    let isMounted = true;
    setLocationLoading(true);
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) {
            setCoords(null);
            setLocationLoading(false);
          }
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isMounted) {
          setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
          setLocationLoading(false);
        }
      } catch {
        if (isMounted) {
          setCoords(null);
          setLocationLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const locText =
    locationLoading
      ? "Loading location..."
      : (coords ? `Lat: ${coords.lat.toFixed(5)} & Lon: ${coords.lon.toFixed(5)}` : "Location unavailable");

  const handlePress = async () => {
    if (submitting) return;

    if (!shopName.trim()) {
      Alert.alert(
        "Missing Shop",
        "Please enter shop/party name before punching in."
      );
      return;
    }

    const amt = Number(amount || 0) || 0;
    if (amt <= 0) {
      Alert.alert(
        "Missing Amount",
        "Please enter a valid amount before punching in."
      );
      return;
    }

    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert(
        "Enable Location",
        "Please enable location access to punch."
      );
      return;
    }

    if (!coords || locationLoading) {
      Alert.alert(
        "Missing Location",
        "Location not available. Please wait for GPS."
      );
      return;
    }

    const now = new Date();
    const payload = {
      employeeName: employeeName || "",
      employeePhone: employeePhone || "",
      companyName: companyName || "",
      shopName,
      amount: amt,
      location: `Lat: ${coords.lat.toFixed(5)} & Lon: ${coords.lon.toFixed(5)}`,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
    };

    try {
      setSubmitting(true);
      console.log("📤 Submitting punch in:", payload);
      await submitPunchIn(payload);
      console.log("✅ Punch in successful");
      setSuccessInfo({ shopName, amount: amt, location: payload.location, time: payload.time });
      setShowSuccess(true);
      setShopName("");
      setAmount("");
    } catch (error) {
      console.error("❌ Punch in error:", error);
      Alert.alert("Error", "Failed to submit punch. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={styles.title}>Punch In</Text>

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

        <View style={[styles.row, { backgroundColor: "transparent" }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "transparent" }}>
            {locationLoading && <ActivityIndicator size="small" style={{ marginRight: 8 }} />}
            <Text style={styles.location} numberOfLines={2}>
              {locText}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: buttonPrimary,
              opacity: submitting || locationLoading ? 0.6 : 1,
            },
          ]}
          onPress={handlePress}
          disabled={submitting || locationLoading}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? "Submitting..." : "Punch In"}
          </Text>
        </TouchableOpacity>
      </View>
      <PunchSuccessModal
        visible={showSuccess}
        shopName={successInfo?.shopName}
        amount={successInfo?.amount}
        location={successInfo?.location}
        onClose={() => setShowSuccess(false)}
        employeeName={employeeName || ""}
        time={successInfo?.time || ""}
      />
    </>
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
