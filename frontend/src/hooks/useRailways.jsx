import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";

export default function useRailways(mapRef, filter, setFilter, addingRef) {
  const [railData, setRailData] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  // 1. Fetch Data
  useEffect(() => {
    fetch("/railway_lines.geojson")
      .then(r => r.json())
      .then(setRailData)
      .catch(err => console.error("Failed to load rail data", err));
  }, []);

  // 2. Add Layer & Interactions
  useEffect(() => {
    if (!mapRef.current || !railData) return;
    const map = mapRef.current;

    // Filter valid trains
    const VALID_RAILWAYS = ["rail", "light_rail", "subway", "monorail"];
    const trainFeatures = railData.features.filter(f => {
      const type = f.properties?.railway;
      if (!VALID_RAILWAYS.includes(type)) return false;
      if (!f.properties.operator) return false;
      const hasName = f.properties.name || f.properties.line_name;
      if (!hasName) return false;
      if (f.geometry?.type === "LineString" && f.geometry.coordinates.length < 2) return false;
      return true;
    });

    const sourceId = "railway-lines";
    const layerId = "railway-lines-layer";

    // Clean up old layer
    if (map.getSource(sourceId)) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: trainFeatures }
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
        "visibility": filter === "toritetsu" ? "visible" : "none"
      },
      paint: {
        "line-color": [
            "case",
            ["any", ["==", ["get", "name"], selectedLine || ""], ["==", ["get", "line_name"], selectedLine || ""]],
            "#ff0000",
            "#c28181ff"
        ],
        "line-width": [
            "case",
            ["any", ["==", ["get", "name"], selectedLine || ""], ["==", ["get", "line_name"], selectedLine || ""]],
            3.5,
            1.5
        ]
      }
    });

    // Interaction: Hover
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = addingRef.current ? 'crosshair' : 'grab'; });

    // Interaction: Click (Hit Box)
    const handleClick = (e) => {
      if (addingRef.current) return;
      if (map.getLayoutProperty(layerId, 'visibility') === 'none') return;

      const bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
      const features = map.queryRenderedFeatures(bbox, { layers: [layerId] });
      
      if (!features.length) return;

      const uniqueLines = new Map();
      features.forEach((f) => {
        const name = f.properties.name || f.properties.line_name || "Unknown";
        if (!uniqueLines.has(name)) uniqueLines.set(name, f.properties.operator || "");
      });

      let listHtml = '<ul class="railway-popup-list">';
      uniqueLines.forEach((op, name) => {
        listHtml += `<li class="railway-popup-item" data-line="${name}"><strong class="railway-popup-name">${name}</strong><br/><span class="railway-popup-operator">${op}</span></li>`;
      });
      listHtml += '</ul>';

      new maplibregl.Popup({ maxWidth: "300px" })
        .setLngLat(e.lngLat)
        .setHTML(`<div class="railway-popup-content"><h4 class="railway-popup-title">鉄道</h4>${listHtml}</div>`)
        .addTo(map);
      
      // Bind click events to popup items
      setTimeout(() => {
        document.querySelectorAll(".railway-popup-item").forEach(item => {
          item.addEventListener("click", () => {
            const lineName = item.getAttribute("data-line");
            setSelectedLine(lineName);
            setFilter("toritetsu");
            const popup = document.getElementsByClassName("maplibregl-popup")[0];
            if (popup) popup.remove();
          });
        });
      }, 50);
    };

    map.on('click', handleClick);

    // Cleanup listener on re-render to avoid duplicates
    return () => {
        map.off('click', handleClick);
        map.off('mouseenter', layerId);
        map.off('mouseleave', layerId);
    };

  }, [railData, selectedLine, mapRef]); // Re-run when data or selection changes

  // 3. Toggle Visibility based on Filter
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (map.getLayer("railway-lines-layer")) {
      map.setLayoutProperty("railway-lines-layer", "visibility", filter === "toritetsu" ? "visible" : "none");
    }
  }, [filter]);

  return { selectedLine, setSelectedLine };
}