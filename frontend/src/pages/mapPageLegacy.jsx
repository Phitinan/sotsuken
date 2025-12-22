import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import './MapPage.css';
import useAddSpot from "../hooks/useAddSpot";
import { useUploadPhotos } from "../hooks/useUpload";
import useSubtypeLibrary from "../hooks/useSubtypes";
import CreatableSelect from "react-select/creatable";


export default function MapPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [spots, setSpots] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const { uploadPhotos, loading: uploadingPhotos } = useUploadPhotos();
  const markerIcons = {
    hanabi: "https://res.cloudinary.com/dz2xri489/image/upload/v1764618894/Image_3_bug7ov.png",
    toritetsu: "https://res.cloudinary.com/dz2xri489/image/upload/v1764621671/Image_4_d8ozmy.png",
    seasonal: "https://res.cloudinary.com/dz2xri489/image/upload/v1764618894/Image_5_hxanim.png",
    hanabiEvent: "https://res.cloudinary.com/dz2xri489/image/upload/v1765306226/ha_vjjb59.png",
    hanabiRed: "https://res.cloudinary.com/dz2xri489/image/upload/v1765312141/Image_8_h9s3mw.png"
  };
  const [railData, setRailData] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const { subtypeLibrary, loadSubtypes, createSubtype } = useSubtypeLibrary();
  const [hanabiEvents, setHanabiEvents] = useState([]);
  const [selectedHanabi, setSelectedHanabi] = useState("");
  const hanabiMarkersRef = useRef([]);


  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const {
    adding,
    startAdding,
    cancelAdding,
    tempCoords,
    setCoordinates,
    formData,
    setFormData,
    handleChange,
    submitSpot,
  } = useAddSpot(token);

  const addingRef = useRef(adding);
  useEffect(() => { addingRef.current = adding }, [adding]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.maptiler.com/maps/019a54ba-978b-7da2-9fb6-fa6d55ef2b9f/style.json?key=ydsc4Xv0HW4ptPOyTzWD",
      center: [139.6917, 35.6895],
      zoom: 12,
    });
    map.on('style.load', () => {
      const layers = map.getStyle().layers;

      // Loop through all layers and hide the ones related to hiking/cycling
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

    map.on("click", (e) => {
      console.log("Map clicked", e.lngLat);
    });

    map.on("click", (e) => {
      if (!addingRef.current) return;
      setCoordinates(e.lngLat.lat, e.lngLat.lng);
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => map.remove();
  }, []);


  useEffect(() => {
    const loadSpots = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/spots");
        setSpots(data);
      } catch (err) {
        console.error("Failed to load spots:", err);
      }
    };
    loadSpots();
  }, []);

  useEffect(() => {
    if (formData.type) loadSubtypes(formData.type);
  }, [formData.type, loadSubtypes]);

  useEffect(() => {
    fetch("/railway_lines.geojson")
      .then(r => r.json())
      .then(setRailData);
  }, []);

  useEffect(() => {
    axios.get("http://localhost:4000/api/hanabi")
      .then(res => setHanabiEvents(res.data))
      .catch(err => console.error("Failed to load hanabi events:", err));
  }, []);

  useEffect(() => {
    if (!mapRef.current || !railData) return;

    const map = mapRef.current;

    // Filter Data
    const VALID_RAILWAYS = ["rail", "light_rail", "subway", "monorail"];
    const trainFeatures = railData.features.filter(f => {
      const type = f.properties?.railway;
      if (!VALID_RAILWAYS.includes(type)) return false;
      if (!f.properties.operator) return false;
      const hasName = f.properties.name || f.properties.line_name;
      if (!hasName) return false;
      if (f.geometry && f.geometry.type === "LineString") {
        const coords = f.geometry.coordinates;
        if (coords.length < 2) return false;
      }
      return true;
    });

    const filteredRailData = {
      type: "FeatureCollection",
      features: trainFeatures
    };

    //Add Source & Layer 
    if (map.getSource("railway-lines")) {
      if (map.getLayer("railway-lines-layer")) {
        map.removeLayer("railway-lines-layer");
      }
      map.removeSource("railway-lines");
    }

    map.addSource("railway-lines", {
      type: "geojson",
      data: filteredRailData
    });

    map.addLayer({
      id: "railway-lines-layer",
      type: "line",
      source: "railway-lines",
      layout: {
        "line-join": "round",
        "line-cap": "round",
        "visibility": filter === "toritetsu" ? "visible" : "none"
      },
      paint: {
        "line-color": [
          "case",


          // ELSE if line matches selectedLine → highlight
          ["any",
            ["==", ["get", "name"], selectedLine || ""],
            ["==", ["get", "line_name"], selectedLine || ""]
          ],
          "#ff0000",

          // ELSE → muted
          "#c28181ff"
        ],
        "line-width": [
          "case",
          ["any",
            ["==", ["get", "name"], selectedLine || ""],
            ["==", ["get", "line_name"], selectedLine || ""]
          ],
          3.5,
          1.5
        ]

      }
    });



    map.off('click');

    map.on('click', (e) => {
      // Guard Clauses: Don't popup if adding a spot or if layer is hidden
      if (addingRef.current) return;
      if (map.getLayoutProperty('railway-lines-layer', 'visibility') === 'none') return;

      // Define a "Hit Box" (10x10 pixels around the mouse)
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
      ];

      // Query features inside that box
      const features = map.queryRenderedFeatures(bbox, {
        layers: ['railway-lines-layer']
      });

      if (!features.length) return;

      // Deduplicate Lines (prevent showing "Yamanote Line" 5 times)
      const uniqueLines = new Map();

      features.forEach((feature) => {
        const name = feature.properties.name || feature.properties.line_name || "Unknown Line";
        const operator = feature.properties.operator || "";

        if (!uniqueLines.has(name)) {
          uniqueLines.set(name, operator);
        }
      });

      // HTML list
      let listHtml = '<ul class="railway-popup-list">';

      uniqueLines.forEach((operator, name) => {
        listHtml += `
          <li class="railway-popup-item" data-line="${name}">
            
            <strong class="railway-popup-name">${name}</strong><br/>
            <span class="railway-popup-operator">${operator}</span>
          </li>
        `;
      });
      listHtml += '</ul>';

      // Show Popup
      new maplibregl.Popup({ maxWidth: "300px" })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="railway-popup-content">
            <h4 class="railway-popup-title">Railways Here</h4>
            ${listHtml}
          </div>
        `)
        .addTo(map);
      setTimeout(() => {
        document.querySelectorAll(".railway-popup-item").forEach(item => {
          item.addEventListener("click", () => {
            const clickedLine = item.getAttribute("data-line");
            setSelectedLine(clickedLine);
            setFilter("toritetsu");         // Show only toritetsu

            // Close popup
            const popups = document.getElementsByClassName("maplibregl-popup");
            if (popups[0]) popups[0].remove();
          });
        });
      }, 50);

    });

    map.on('mouseenter', 'railway-lines-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });


    map.on('mouseleave', 'railway-lines-layer', () => {
      map.getCanvas().style.cursor = adding ? 'crosshair' : 'grab';
    });

  }, [railData, selectedLine]);
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (map.getLayer("railway-lines-layer")) {
      const visibility = filter === "toritetsu" ? "visible" : "none";
      map.setLayoutProperty("railway-lines-layer", "visibility", visibility);
    }
  }, [filter]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!hanabiEvents || hanabiEvents.length === 0) return;
    if (filter !== "hanabi" && selectedHanabi=="") return;
    

    const map = mapRef.current;

    // Keep track of festival markers 
    const festivalMarkers = [];
    

    hanabiEvents.forEach((festival, index) => {
      if (!festival.location || !festival.location.coordinates) return;
      if (filter !== "hanabi" && festival.name !== selectedHanabi) return

      const coords = festival.location.coordinates;

      const el = document.createElement("div");
      el.style.width = "25px";
      el.style.height = "25px";
      el.style.backgroundImage = `url("${markerIcons["hanabiEvent"]}")`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      el.style.borderRadius = "50%";
      if (selectedHanabi==festival.name) el.style.border = "2px solid rgba(236, 25, 25, 1)";
      else el.style.border = "2px solid #a6a6a6ff";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup({ maxWidth: "300px", color: "#0000" }).setHTML(`
          <strong>${festival.name} 打ち上げ場所</strong><br/>
          ${festival.area}<br/>
          ${festival.date}<br/>
          <a href="${festival.link}" target="_blank">More info</a>
        `)
        )
        .addTo(map);
      marker.getElement().addEventListener("pointerdown", () => {
        console.log("Clicked event:", festival.name);
        setSelectedHanabi(festival.name);
        
      });

      festivalMarkers.push(marker);
    });


    return () => {
      festivalMarkers.forEach(marker => marker.remove());
    };
  }, [hanabiEvents, filter, selectedHanabi]);



  useEffect(() => {
    if (!mapRef.current) return;

    if (adding) {
      mapRef.current.getCanvas().style.cursor = "crosshair";
    } else {
      mapRef.current.getCanvas().style.cursor = "grab";
    }
  }, [adding]);

  useEffect(() => {
    if (!mapRef.current) return;


    markersRef.current.forEach(marker => marker?.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      if (filter !== "all" && spot.type !== filter) return;



      const el = document.createElement("div");
      el.className = `marker marker-${spot.type}`;

      // Apply Cloudinary icon
      el.style.backgroundImage = `url("${markerIcons[spot.type]}")`;
      el.style.width = "45px";
      el.style.height = "45px";
      el.style.cursor = "pointer";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      console.log(selectedHanabi, ", ", spot.subtype);
      if (selectedHanabi==spot.subtype&& selectedHanabi ) el.style.backgroundImage = `url("${markerIcons.hanabiRed}")`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(spot.location.coordinates)
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("Clicked spot:", spot);
        setSelectedSpot(spot);
        if (spot.type == "hanabi") setSelectedHanabi(spot.subtype);
        else setSelectedHanabi("");
        console.log(selectedHanabi, ", ", spot.subtype);
      });



      markersRef.current.push(marker);
    });
  }, [spots, filter, selectedHanabi]);

  const handleFilterClick = (type) => {
    setFilter(type);
    console.log(type);
    setSelectedSpot(null);

    if (window.innerWidth < 900) {
      setIsFilterOpen(false);
    }
  };



  return (
    <div className="map-page-container">
      <div ref={mapContainer} className="map-container" />
      {selectedSpot && (
        <div className="bottom-info-panel">
          <button className="close-btn" onClick={() => setSelectedSpot(null)}>✕</button>

          <h2>{selectedSpot.name}</h2>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.location.coordinates[1]},${selectedSpot.location.coordinates[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gmaps-button"
          >
            Open in Google Maps
          </a>

          {selectedSpot.subtype ? (
            <p><b>Type:</b> {selectedSpot.type} <b>:</b> {selectedSpot.subtype}</p>
          ) : (
            <p><b>Type:</b> {selectedSpot.type}</p>
          )}
          {selectedSpot.photos && selectedSpot.photos.length > 0 ? (
            <div className="carousel-container">
              <div className="carousel-wrapper">
                {selectedSpot.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt=""
                    className="carousel-image"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p>No photos yet</p>
          )}
          <p>{selectedSpot.description}</p>
          {/* Add more fields later */}
        </div>
      )}



      <div className="filter-bar-wrapper">

        <button
          className="filter-toggle"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          ☰ Filter Spots
        </button>

        <div className={`filter-bar ${isFilterOpen ? 'open' : 'closed'}`}>
          <button onClick={() => handleFilterClick("all")}>All</button>
          <button onClick={() => handleFilterClick("hanabi")}>Hanabi</button>
          <button onClick={() => handleFilterClick("toritetsu")}>Toritetsu</button>
          <button onClick={() => handleFilterClick("seasonal")}>Seasonal</button>
          <button onClick={() => {
            console.log("Add Spot button clicked");
            startAdding();
            setIsFilterOpen(false);
          }}>Add Spot</button>
        </div>
      </div>

      {/* Add Spot */}
      {adding && tempCoords && (
        <div className="add-spot-panel">
          <button className="close-btn" onClick={() => {
            cancelAdding();
          }}>✕</button>

          <h2>Add New Spot</h2>

          <p className="coords-display">
            Lat: {tempCoords?.lat.toFixed(5)}, Lng: {tempCoords?.lng.toFixed(5)}
          </p>

          <input
            type="text"
            name="name"
            placeholder="Spot Name"
            value={formData.name}
            onChange={handleChange}
            className="input"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="textarea"
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                photos: e.target.files
              }))
            }
            className="input-file"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="textarea"
          >
            <option value="" disabled>
              Enter type here
            </option>
            <option value="hanabi">Hanabi</option>
            <option value="toritetsu">Toritetsu</option>
            <option value="seasonal">Seasonal</option>
          </select>
          {formData.type && (
            <CreatableSelect
              isClearable
              className="CreatableSelect"
              styles={{
                control: (base) => ({ ...base, color: "#353535" }),
                singleValue: (base) => ({ ...base, color: "#353535" }),
                input: (base) => ({ ...base, color: "#353535" }),
                option: (base) => ({ ...base, color: "#353535" }),
              }}

              options={(subtypeLibrary[formData.type] || []).map((st) => ({
                value: st,
                label: st,
              }))}

              onChange={(selected) => {
                setFormData(prev => ({
                  ...prev,
                  subtype: selected ? selected.value : ""
                }));
              }}

              onCreateOption={async (newValue) => {
                const newSubtype = await createSubtype(formData.type, newValue);

                setFormData(prev => ({
                  ...prev,
                  subtype: newSubtype,
                }));
              }}

              value={
                formData.subtype
                  ? { label: formData.subtype, value: formData.subtype }
                  : null
              }
            />
          )}


          <button
            className="submit-btn"
            onClick={async () => {
              const createdSpot = await submitSpot();

              if (createdSpot) {
                if (formData.photos?.length > 0) {
                  await uploadPhotos({
                    spotId: createdSpot._id,
                    files: formData.photos,
                    token,
                  });
                }
              }

              setSelectedSpot(createdSpot);
              cancelAdding();
            }}
          >
            Submit
          </button>
        </div>
      )}

    </div>
  );
}