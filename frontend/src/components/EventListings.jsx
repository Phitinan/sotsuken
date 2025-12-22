import EventListing from "./EventListing";
import {Link} from "react-router-dom";

const EventListings = ({events}) => {
  console.log(events);

  return (
    <div className="property-list">
      {events.map((event) => (
        <Link to={`events/${event._id}`}>
          <EventListing key={event._id} event={event} />
        </Link>
      ))}
    </div>
  );
};

export default EventListings;
