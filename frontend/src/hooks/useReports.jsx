import { useState, useCallback } from "react";
import axios from "axios";

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
                `http://localhost:4000/api/spots/${spotId}/season-reports`
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

        try {
            const res = await axios.post(
                `http://localhost:4000/api/spots/${spotId}/season-reports`,
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
                `http://localhost:4000/api/spots/${spotId}/season-reports/${reportId}`,
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
                `http://localhost:4000/api/spots/${spotId}/season-reports/${reportId}`,
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
