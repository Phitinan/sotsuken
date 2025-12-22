import { Link } from "react-router-dom";

const EventListing = ({event})=> {
  return (
    <div className="property-preview">
      <h2>{event.title}</h2>
      <p>{event.date}</p>
      <p>Description: {event.location}</p>
      <h3>organizer: </h3>
      <p> name: {event.organizer.name}</p>
      <p> contactEmail: {event.organizer.contactEmail}</p>
      <p> contactPhone: {event.organizer.contactPhone}</p>
      
    </div>
  );
};

export default EventListing;
