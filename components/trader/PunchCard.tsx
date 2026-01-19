// components/trader/PunchCard.tsx
import { Text, TextInput, View, useThemeColor } from "@/components/Themed";
import PunchSuccessModal from "@/components/trader/PunchSuccessModal";
import ShopInput from "@/components/trader/ShopInput";
import ShopSuggestions from "@/components/trader/ShopSuggestions";
import { useCompany } from "@/context/CompanyContext";
import { getCompanyParties, submitPunchIn } from "@/lib/api";
import * as Location from "expo-location";
import { LocationSubscription } from "expo-location";
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
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

  // Fetch location with proper error handling
  useEffect(() => {
    let subscription: LocationSubscription | null = null;
    let isMounted = true;

    const getAddressFromCoords = async (lat: number, lon: number): Promise<string | null> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "CochinTradersApp",
            },
          },
        );

        if (!response.ok) {
          console.warn("Nominatim API returned status:", response.status);
          return null;
        }

        const data = await response.json();
        const village =
          data.address?.village ||
          data.address?.city ||
          data.address?.town ||
          "";
        const district =
          data.address?.state_district || data.address?.county || "";

        if (!village && !district) {
          return null;
        }

        const locationName = [village, district].filter(Boolean).join(", ");
        return locationName;
      } catch (error) {
        console.warn("Nominatim geocoding error:", error);
        return null;
      }
    };

    const updateLocation = async (lat: number, lng: number) => {
      if (!isMounted) return;

      console.log("📍 Updating location:", lat, lng);
      setCoords({ lat, lng });
      setLocationName("Fetching address...");

      try {
        let addressName: string | null = null;

        // Try Nominatim first
        try {
          addressName = await getAddressFromCoords(lat, lng);
          console.log("✅ Nominatim address:", addressName);
        } catch (osmErr) {
          console.error("❌ Nominatim failed:", osmErr);
        }

        // Fallback to Expo reverse geocode
        if (!addressName && isMounted) {
          try {
            const address = await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });
            if (isMounted && address && address.length > 0) {
              const a = address[0];
              const parts = [
                a.name !== a.street ? a.name : null,
                a.street,
                a.city || a.subregion,
              ].filter((p): p is string => !!p && p.trim().length > 0);
              const uniqueParts = [...new Set(parts)];
              if (uniqueParts.length > 0) {
                addressName = uniqueParts.join(", ");
              }
              console.log("✅ Expo address:", addressName);
            }
          } catch (nativeErr) {
            console.warn("❌ Expo geocoding failed:", nativeErr);
          }
        }

        if (isMounted) {
          if (addressName) {
            setLocationName(addressName);
          } else {
            // Fallback to coordinates
            setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
          setLocationLoading(false);
        }
      } catch (e) {
        console.warn("❌ All geocoding failed:", e);
        if (isMounted) {
          setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          setLocationLoading(false);
        }
      }
    };

    (async () => {
      try {
        console.log("📍 Requesting location permissions...");
        const { status: permissionStatus } =
          await Location.requestForegroundPermissionsAsync();

        console.log("📍 Permission status:", permissionStatus);

        if (!isMounted || permissionStatus !== "granted") {
          console.warn("❌ Location permission not granted");
          setLocationName("Location permission denied");
          setLocationLoading(false);
          Alert.alert(
            "Location Permission Required",
            "Please enable location access in your device settings to use punch-in feature."
          );
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          console.warn("❌ Location services disabled");
          setLocationName("Location services disabled");
          setLocationLoading(false);
          Alert.alert(
            "Enable Location Services",
            "Current location is unavailable. Please enable GPS/location services."
          );
          return;
        }

        console.log("📍 Getting initial location...");
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          console.log("✅ Got location:", loc.coords.latitude, loc.coords.longitude);
          if (isMounted) {
            await updateLocation(loc.coords.latitude, loc.coords.longitude);
          }
        } catch (locError) {
          console.warn("❌ Error getting initial location:", locError);
          try {
            const last = await Location.getLastKnownPositionAsync();
            if (last && isMounted) {
              console.log("✅ Using last known location:", last.coords.latitude, last.coords.longitude);
              await updateLocation(last.coords.latitude, last.coords.longitude);
            } else {
              setLocationName("Location unavailable");
              setLocationLoading(false);
              Alert.alert(
                "Location Unavailable",
                "Current location is unavailable. Make sure that location services are enabled."
              );
              return;
            }
          } catch (lastErr) {
            console.warn("❌ No last known location:", lastErr);
            setLocationName("Location unavailable");
            setLocationLoading(false);
            Alert.alert(
              "Location Unavailable",
              "Current location is unavailable. Make sure that location services are enabled."
            );
            return;
          }
        }

        if (!isMounted) return;

        console.log("📍 Starting location watch...");
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 10, // Or when moved 10 meters
          },
          (l) => {
            console.log("📍 Location update:", l.coords.latitude, l.coords.longitude);
            updateLocation(l.coords.latitude, l.coords.longitude);
          },
        );

        if (!isMounted) {
          sub.remove();
        } else {
          subscription = sub;
        }
      } catch (error) {
        console.warn("❌ Location setup error:", error);
        if (isMounted) {
          setLocationName("Location unavailable");
          setLocationLoading(false);
        }
      }
    })();

    return () => {
      console.log("🧹 Cleaning up location subscription");
      isMounted = false;
      if (subscription) {
        try {
          subscription.remove();
        } catch (e) {
          console.error("Error removing subscription:", e);
        }
      }
    };
  }, []);

  const locText = locationLoading
    ? "Loading location..."
    : locationName ||
      (coords?.lat ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Location unavailable");

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

    if (!locationName || locationLoading) {
      Alert.alert(
        "Missing Location",
        "Address not available. Please wait for location or enable GPS."
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
      location: locationName || "",
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
    };

    try {
      setSubmitting(true);
      console.log("📤 Submitting punch in:", payload);
      await submitPunchIn(payload);
      console.log("✅ Punch in successful");
      setSuccessInfo({ shopName, amount: amt, location: locationName || "", time: payload.time });
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
