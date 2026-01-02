declare module 'react-native-geocoder' {
    export interface GeocodingObject {
      position: { lat: number; lng: number };
      formattedAddress: string;
      feature: string | null;
      streetNumber: string | null;
      streetName: string | null;
      postalCode: string | null;
      locality: string | null;
      country: string;
      countryCode: string;
      adminArea: string | null;
      subAdminArea: string | null;
      subLocality: string | null;
    }
  
    const Geocoder: {
      geocodePosition(position: { lat: number; lng: number }, options?: { language?: string }): Promise<GeocodingObject[]>;
      geocodeAddress(address: string): Promise<GeocodingObject[]>;
    };
    export default Geocoder;
  }
