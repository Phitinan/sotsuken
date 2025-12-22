import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useField from "../hooks/useField";

const EditPropertyPage = () => {
    const title = useField("title");
    const date = useField("date");
    const location = useField("location");
    const name = useField("name");
    const contactEmail = useField("contactEmail");
    const contactPhone = useField("contactPhone");
    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem("user"))
    const token = user ? user.token : null;
    console.log(token)

    const navigate = useNavigate();

    const editEvent = async (newEvent) => {

        try {
            console.log(newEvent)
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/JSON",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newEvent),
            });
            if (!res.ok) {
                throw new Error("Failed to edit property")
            }
        } catch (error) {
            console.error(error);
            return false;
        }
        return true;
    };

    const submitForm = async (e) => {
        e.preventDefault();

        const newEvent = {
            title: title.value,
            date: date.value,
            location: location.value,

            organizer: {
                name: name.value,
                contactEmail: contactEmail.value,
                contactPhone: contactPhone.value,
            }
        };

        const success = await editEvent(newEvent);
        if (success) {
            console.log("event edited successfully");
            navigate("/");
        } else {
            console.error("Failed to edit event");
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
                title.setValue(data.title || "");
                date.setValue(data.date ? data.date.split("T")[0] : ""); 
                location.setValue(data.location || "");
                name.setValue(data.organizer?.name || "");
                contactEmail.setValue(data.organizer?.contactEmail || "");
                contactPhone.setValue(data.organizer?.contactPhone || "");

            } catch (err) {
                setError(err.message);
            } finally {
                /* setLoading(false); */
            }
        };

        fetchEvent();
    }, [id]);

    return (
        <div className="create">
            <h2>Edit Property</h2>
            <form onSubmit={submitForm}>
                <label>Event title:</label>
                <input
                    type="text"
                    required
                    {...title}
                />
                <label>event date:</label>
                <input
                    type="date"
                    required
                    {...date}
                />

                <label>location:</label>
                <textarea
                    required
                    {...location}

                ></textarea>
                <label>Organiszer name</label>
                <input
                    type="text"
                    required
                    {...name}
                />
                <label>Organiszer email:</label>
                <input
                    type="text"
                    required
                    {...contactEmail}
                /><label>Organiszer phone:</label>
                <input
                    type="text"
                    required
                    {...contactPhone}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default EditPropertyPage;
