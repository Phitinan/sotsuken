import { useState } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function useAddSpot(token) {
    const [adding, setAdding] = useState(false);
    const [tempCoords, setTempCoords] = useState(null); // { lat, lng }
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "",
        subtype: "",
        photos: [],
        shootingConditions: "",
        peakSeason: "",
        recommendedFocalLength: [],
        tripodUsage: "",
        accessTime: {
            days: [],
            openTime: "",
            closeTime: "",
            infoUrl: ""
        },
        accessFees: "",
        accessRules: ""
    });

    const startAdding = () => {
        console.log("startAdding called");
        setAdding(true);
    };

    const cancelAdding = () => {
        setAdding(false);
        setTempCoords(null);
        setFormData({
            name: "",
            description: "",
            type: "",
            subtype: "",
            photos: [],
            shootingConditions: "",
            peakSeason: "",
            recommendedFocalLength: [],
            tripodUsage: "",
            accessTime: {
                days: [],
                openTime: "",
                closeTime: "",
                infoUrl: ""
            },
            accessFees: "",
            accessRules: ""
        });
    };

    const setCoordinates = (lat, lng) => setTempCoords({ lat, lng });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "type") {
                return {
                    ...prev,
                    type: value,
                    subtype: ""  // reset when type changes
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const submitSpot = async () => {
        if (!tempCoords) return alert("Set a location first");

        try {
            const { data } = await axios.post(
                `${API_BASE}/api/spots`,
                {
                    ...formData,
                    location: {
                        type: "Point",
                        coordinates: [tempCoords.lng, tempCoords.lat],
                    },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            cancelAdding();
            return data; // newly created spot
        } catch (err) {
            console.error("Failed to add spot:", err);
            alert("Failed to add spot");
        }
    };

    return {
        adding,
        startAdding,
        cancelAdding,
        tempCoords,
        setCoordinates,
        formData,
        setFormData,
        handleChange,
        submitSpot,
    };
}



