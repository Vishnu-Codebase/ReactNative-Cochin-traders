// import * as Location from 'expo-location';
// let Geolocation: any = null;
// try {
//   // Optional fallback; will work only with dev client / prebuild
//   Geolocation = require('react-native-geolocation-service');
// } catch {
//   Geolocation = null;
// }

// export async function getCoords(): Promise<{ latitude: number; longitude: number } | null> {
//   try {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       console.warn('❌ Permission not granted');
//       return null;
//     }

//     const servicesEnabled = await Location.hasServicesEnabledAsync();
//     if (!servicesEnabled) {
//       console.warn('❌ Services disabled');
//       return null;
//     }

//     try {
//       const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
//       return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
//     } catch (e) {
//       console.warn('❌ Expo current position failed, trying last known');
//       const last = await Location.getLastKnownPositionAsync();
//       if (last) {
//         return { latitude: last.coords.latitude, longitude: last.coords.longitude };
//       }
//     }

//     if (Geolocation?.getCurrentPosition) {
//       return new Promise((resolve) => {
//         Geolocation.getCurrentPosition(
//           (pos: any) => {
//             resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
//           },
//           (_err: any) => {
//             console.warn('❌ RN Geolocation fallback failed');
//             resolve(null);
//           },
//           { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//         );
//       });
//     }

//     return null;
//   } catch (e) {
//     console.warn('❌ getCoords overall failure');
//     return null;
//   }
// }
