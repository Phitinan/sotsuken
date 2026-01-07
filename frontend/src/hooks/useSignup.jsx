import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useSignup(url) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (object) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(object),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // success
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/"); // move only on success
      return data;

    } catch (err) {
      setError(err.message);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
}
