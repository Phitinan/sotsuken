import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function useSpotMarkers(mapRef, spots, filter, selectedHanabi, setSelectedHanabi, setSelectedSpot, markerIcons, setSelectedLine, selectedSpot) {
  const markersRef = useRef(new Map());
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove markers that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!spots.find(s => s._id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    spots.forEach((spot) => {
      if (filter !== "all" && spot.type !== filter) return;
      if (markersRef.current.has(spot._id)) return; // already exists

      const el = document.createElement("div");
      el.className = `marker marker-${spot.type}`;

      Object.assign(el.style, {
        backgroundImage: `url("${markerIcons[spot.type]}")`,
        width: "35px",
        height: "35px",
        cursor: "pointer",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(spot.location.coordinates)
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedSpot(spot);
        setSelectedLine(spot.type === "toritetsu" ? spot.subtype : "");
        setSelectedHanabi(spot.type === "hanabi" ? spot.subtype : "");
      });

      markersRef.current.set(spot._id, { marker, el, spot });
    });

  }, [spots, filter, mapRef]);


  useEffect(() => {
    markersRef.current.forEach(({ el, spot }) => {
      const isSelected = selectedSpot?._id === spot._id;
      const iconKey = isSelected ? `${spot.type}Red` : spot.type;

      el.style.backgroundImage = `url("${markerIcons[iconKey]}")`;
      el.style.zIndex = isSelected ? "10" : "1";
    });
  }, [selectedSpot]);

}