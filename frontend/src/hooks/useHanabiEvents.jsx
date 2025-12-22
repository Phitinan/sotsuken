import { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios";

export default function useHanabiEvents(mapRef, filter, selectedHanabi, setSelectedHanabi, markerIcon) {
  const [hanabiEvents, setHanabiEvents] = useState([]);
  const markersRef = useRef([]);

  // Load Data
  useEffect(() => {
    axios.get("http://localhost:4000/api/hanabi")
      .then(res => setHanabiEvents(res.data))
      .catch(err => console.error("Failed to load hanabi events:", err));
  }, []);

  // Manage Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!hanabiEvents.length) return;
    if (filter !== "hanabi" && selectedHanabi === "") return;

    hanabiEvents.forEach((festival) => {
      if (!festival.location?.coordinates) return;
      if (filter !== "hanabi" && festival.name !== selectedHanabi) return;

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "25px", height: "25px",
        backgroundImage: `url("${markerIcon}")`,
        backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
        borderRadius: "50%",
        border: selectedHanabi === festival.name ? "2px solid rgba(236, 25, 25, 1)" : "2px solid #a6a6a6ff"
      });
      const popup = new maplibregl.Popup({ maxWidth: "300px" }).setHTML(`
  <strong>${festival.name} 打ち上げ場所</strong><br/>
  ${festival.area}<br/>${festival.date}<br/>
  <a href="${festival.link}" target="_blank">詳細</a>
`);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(festival.location.coordinates)
        .setPopup(popup)
        .addTo(map);

      if (selectedHanabi === festival.name) {
        marker.togglePopup();
      }

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedHanabi(festival.name);
        marker.togglePopup();
      });

      markersRef.current.push(marker);
    });

  }, [hanabiEvents, filter, selectedHanabi, mapRef]);

  return { hanabiEvents };
}