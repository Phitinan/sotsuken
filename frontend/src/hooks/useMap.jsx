import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function useMap(containerRef, addingRef, setCoordinates, setSelectedSpot) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://api.maptiler.com/maps/019a54ba-978b-7da2-9fb6-fa6d55ef2b9f/style.json?key=ydsc4Xv0HW4ptPOyTzWD",
      center: [139.6917, 35.6895],
      zoom: 10,
    });

    // Hide hiking trails to clean up the map
    map.on('style.load', () => {
      const layers = map.getStyle().layers;
      layers.forEach((layer) => {
        if (
          layer.id.includes('path') ||
          layer.id.includes('trail') ||
          layer.id.includes('track') ||
          layer.id.includes('footway') ||
          layer.id.includes('cycle')
        ) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Handle "Add Spot" clicks
    map.on("click", (e) => {
      if (addingRef.current && setCoordinates) {
        setCoordinates(e.lngLat.lat, e.lngLat.lng);
        setSelectedSpot("");
      }
    });

    // Cursor styling based on mode
    map.on('mousemove', () => {
      map.getCanvas().style.cursor = addingRef.current ? "crosshair" : "";
    });


    mapRef.current = map;

    return () => map.remove();
  }, []); // Run once on mount

  function flyToUserLocation(map) {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        map.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          essential: true,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
      }
    );
  }

  const flyToPlace = async (query) => {
    if (!query || !mapRef.current) return;

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      query
    )}.json?key=ydsc4Xv0HW4ptPOyTzWD&limit=1`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.features?.length) return;

    const [lng, lat] = data.features[0].center;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 12,
      essential: true,
    });
  };



  return { mapRef, flyToUserLocation, flyToPlace };
}