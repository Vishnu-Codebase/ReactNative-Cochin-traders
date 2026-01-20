import * as Location from 'expo-location';

export async function getAddressFromCoords(lat: number, lon: number, apiKey: string): Promise<string | null> {
  if (!apiKey) return null;
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;
  try {
    console.log("🔗 Geoapify URL:", url);
    const response = await fetch(url);
    console.log("🔗 Geoapify response ok:", response.ok, "status:", response.status);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const feature = data?.features?.[0];
    const address = feature?.properties?.formatted || null;
    console.log("📍 Geoapify parsed address:", address);
    return address || null;
  } catch {
    console.warn("❌ Geoapify fetch error");
    return null;
  }
}

export async function getUserAddress(apiKey: string): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn("❌ Location permission not granted");
      return null;
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.warn("❌ Location services disabled");
      return null;
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const location = await Location.getCurrentPositionAsync({});
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
      console.log("📍 Current coords:", latitude, longitude);
    } catch (e) {
      console.warn("❌ Current position unavailable, trying last known");
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        latitude = last.coords.latitude;
        longitude = last.coords.longitude;
        console.log("📍 Last known coords:", latitude, longitude);
      }
    }

    if (latitude == null || longitude == null) {
      return null;
    }

    const address = await getAddressFromCoords(latitude, longitude, apiKey);
    return address;
  } catch (e) {
    console.warn("❌ getUserAddress overall failure");
    return null;
  }
}
