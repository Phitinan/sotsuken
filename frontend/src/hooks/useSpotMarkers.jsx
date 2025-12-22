import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function useSpotMarkers(mapRef, spots, filter, selectedHanabi, setSelectedHanabi, setSelectedSpot, markerIcons) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker?.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      if (filter !== "all" && spot.type !== filter) return;

      const el = document.createElement("div");
      el.className = `marker marker-${spot.type}`;
      
      // Icon Logic
      let iconUrl = markerIcons[spot.type];
      if (selectedHanabi === spot.subtype && selectedHanabi && spot.type === "hanabi") {
        iconUrl = markerIcons.hanabiRed; // Use red icon if it matches selected hanabi
      }

      Object.assign(el.style, {
        backgroundImage: `url("${iconUrl}")`,
        width: "45px", height: "45px", cursor: "pointer",
        backgroundSize: "contain", backgroundRepeat: "no-repeat"
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(spot.location.coordinates)
        .addTo(map);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedSpot(spot);
        if (spot.type === "hanabi") setSelectedHanabi(spot.subtype);
        else setSelectedHanabi("");
      });

      markersRef.current.push(marker);
    });

  }, [spots, filter, selectedHanabi, mapRef]);
}