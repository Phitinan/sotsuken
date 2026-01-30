import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export default function useSpotMarkers(
  mapRef,
  spots,
  filter,
  selectedHanabi,
  setSelectedHanabi,
  setSelectedSpotId,
  markerIcons,
  setSelectedLine,
  selectedSpot
) {
  const markersRef = useRef(new Map());

  // 1️ Create markers ONCE
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const createMarkers = () => {
      spots.forEach((spot) => {
        if (markersRef.current.has(spot._id)) return;

        const el = document.createElement("div");
        el.className = `marker marker-${spot.type}`;

        Object.assign(el.style, {
          backgroundImage: `url("${markerIcons[spot.type]}")`,
          width: "35px",
          height: "35px",
          cursor: "pointer",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          opacity: "1",
          transition: "opacity 0.15s ease",
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(spot.location.coordinates)
          .addTo(map);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedSpotId(spot._id);
          setSelectedLine(spot.type === "toritetsu" ? spot.subtype : "");
          setSelectedHanabi(spot.type === "hanabi" ? spot.subtype : "");
        });

        markersRef.current.set(spot._id, { marker, el, spot });
      });

      map.triggerRepaint();
    };

    if (map.isStyleLoaded()) {
      createMarkers();
    } else {
      map.once("load", createMarkers);
    }
  }, [spots, markerIcons]);


  // 2️ Fast filter: show / hide only
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach(({ marker, spot }) => {
      const visible = filter === "all" || spot.type === filter;

      const isOnMap = marker._map != null; // MapLibre internal, safe enough

      if (visible && !isOnMap) {
        marker.addTo(map);
      }

      if (!visible && isOnMap) {
        marker.remove();
      }
    });
  }, [filter]);



  // 3️ Selected marker styling
  useEffect(() => {
    markersRef.current.forEach(({ el, spot }) => {
      const isSelected = selectedSpot?._id === spot._id;
      const iconKey = isSelected ? `${spot.type}Red` : spot.type;

      el.style.backgroundImage = `url("${markerIcons[iconKey]}")`;
      el.style.zIndex = isSelected ? "2" : "1";
    });
  }, [selectedSpot, markerIcons]);
}
