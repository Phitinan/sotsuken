import { useState, useCallback } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function useSeasonReports(token) {
    const [seasonReports, setSeasonReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    /* -----------------------------
       Fetch
    ----------------------------- */
    const fetchSeasonReports = useCallback(async (spotId) => {
        if (!spotId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(
                `${API_BASE}/api/spots/${spotId}/season-reports`
            );
            
            setSeasonReports(res.data.seasonReports || []);

        } catch (err) {
            setError(err.response?.data?.error || "Failed to load season reports");
        } finally {
            setLoading(false);
        }
    }, []);

    /* -----------------------------
       Add
    ----------------------------- */
    const addSeasonReport = async (spotId, payload) => {
        if (!token) throw new Error("Authentication required");
        console.log(token);

        try {
            const res = await axios.post(
                `${API_BASE}/api/spots/${spotId}/season-reports`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSeasonReports(res.data.seasonReports);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.error || "Failed to add season report");
        }
    };

    /* -----------------------------
       Update
    ----------------------------- */
    const updateSeasonReport = async (spotId, reportId, payload) => {
        if (!token) throw new Error("Authentication required");

        try {
            const res = await axios.put(
                `${API_BASE}/api/spots/${spotId}/season-reports/${reportId}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSeasonReports(res.data.seasonReports);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.error || "Failed to update season report");
        }
    };

    /* -----------------------------
       Delete
    ----------------------------- */
    const deleteSeasonReport = async (spotId, reportId) => {
        if (!token) throw new Error("Authentication required");

        try {
            const res = await axios.delete(
                `${API_BASE}/api/spots/${spotId}/season-reports/${reportId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSeasonReports(res.data.seasonReports);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.error || "Failed to delete season report");
        }
    };

    return {
        seasonReports, setSeasonReports, 
        loading,
        error,
        addSeasonReport,
        updateSeasonReport,
        deleteSeasonReport
    };
}
