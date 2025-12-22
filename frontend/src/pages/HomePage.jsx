import EventListings from "../components/EventListings";
import { useState, useEffect } from "react";


const Home = () => {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {},[]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {

        const res = await fetch("/api/events");
        if (!res.ok) {
          throw new Error("Failed to get event")
        }
        const data = await res.json();
        setIsLoading(false);
        setEvents(data)
        setError(null)
      } catch (error) {
        setIsLoading(false);
        setError(error.message);
      }
    }
    fetchEvents()
  }, []);


  return (
    <div className="home">
      {error && <div>{error}</div>}
      {isLoading && <div>Loading...</div>}
      {events && <EventListings events={events} />}
    </div>
  );
};

export default Home;
