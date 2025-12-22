import { useState } from "react";

export const useUploadPhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadPhotos = async ({ spotId, files, token }) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append("photos", file));

      const response = await fetch(`http://localhost:4000/api/spots/${spotId}/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload photos");
      }

      const data = await response.json();
      setLoading(false);
      return data.photos; // updated spot with photos
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { uploadPhotos, loading, error };
};
