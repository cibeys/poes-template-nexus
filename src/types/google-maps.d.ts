
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getCenter(): LatLng;
      setMapTypeId(mapTypeId: string): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      setTitle(title: string): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setAnimation(animation: any): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: MVCObject | Marker): void;
      setContent(content: string | Node): void;
      close(): void;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      [key: string]: any;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map | null;
      title?: string;
      animation?: any;
      [key: string]: any;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
      [key: string]: any;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      placeId?: string;
      [key: string]: any;
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[];
      formatted_address: string;
      geometry: GeocoderGeometry;
      place_id: string;
      [key: string]: any;
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: string;
      viewport: LatLngBounds;
      [key: string]: any;
    }

    interface LatLngBounds {
      contains(latLng: LatLng | LatLngLiteral): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toSpan(): LatLng;
      toString(): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
      toJSON(): LatLngLiteral;
      toString(): string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapsEventListener {
      remove(): void;
    }

    class MVCObject {
    }

    type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';

    const Animation: {
      BOUNCE: number;
      DROP: number;
      [key: string]: number;
    };
  }
}
