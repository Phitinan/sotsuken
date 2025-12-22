import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const EventPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"))
  console.log(user)
  const token = user ? user.token : null;
  console.log(token)

  const deleteEvent = async (id) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/JSON",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };



  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("id: ", id);
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const onDeleteClick = (eventId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this listing?" + eventId
    );
    if (!confirm) return;

    deleteEvent(eventId);
    navigate("/");
  };
  const onEditClick = (id) => {
    navigate(`/edit/${id}`);


  };

  return (
    <div className="event-preview">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>

          <h2>{event.title}</h2>
          <p>{event.date.split("T")[0]}</p>
          <p>Description: {event.location}</p>
          <h3>organizer: </h3>
          <p> name: {event.organizer.name}</p>
          <p> contactEmail: {event.organizer.contactEmail}</p>
          <p> contactPhone: {event.organizer.contactPhone}</p>

          <button onClick={() => onDeleteClick(event._id)}>delete</button>
          <button onClick={() => onEditClick(event._id)}>edit</button>
        </>
      )}
    </div>
  );
};

export default EventPage;