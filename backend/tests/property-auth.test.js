const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Express app
const api = supertest(app);
const Event = require("../models/eventModel");
const User = require("../models/userModel");

let token = null;

// --- Mock Event Data ---
const Events = [
  {
    title: "AI Conference 2025",
    date: new Date("2025-12-15"),
    location: "Helsinki Exhibition Center",
    organizer: {
      name: "Tech Finland",
      contactEmail: "info@techfinland.fi",
      contactPhone: "+358401234567",
    },
  },
  {
    title: "Startup Meetup Espoo",
    date: new Date("2025-11-20"),
    location: "Otaniemi Innovation Hub, Espoo",
    organizer: {
      name: "Espoo Innovators",
      contactEmail: "contact@espooinnovators.fi",
      contactPhone: "+358409876543",
    },
  },
];

// --- Setup User and Token ---
beforeAll(async () => {
  await User.deleteMany({});
  const result = await api.post("/api/users/signup").send({
    name: "John Doe",
    email: "john@example.com",
    password: "R3g5T7#gh",
    gender: "Male",
    date_of_birth: "1995-06-15",
    occupation: "Engineer",
    phone: "+358401112233",
  });

  token = result.body.token || null; // in case token is returned by signup route
});

// --- Test Suite ---
describe("Event Routes", () => {
  beforeEach(async () => {
    await Event.deleteMany({});
    await Promise.all([
      api.post("/api/Events").set("Authorization", "Bearer " + token).send(Events[0]),
      api.post("/api/Events").set("Authorization", "Bearer " + token).send(Events[1]),
    ]);
  });

  // GET all
  it("should return all Events as JSON when GET /api/Events is called", async () => {
    const response = await api
      .get("/api/Events").set("Authorization", "Bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(Events.length);
  });

  // POST create
  it("should create one event when POST /api/Events is called", async () => {
    const newEvent = {
      title: "AI Hackathon Tampere",
      date: new Date("2025-12-01"),
      location: "Tampere Tech Arena",
      organizer: {
        name: "Tampere Tech Community",
        contactEmail: "events@tamtech.fi",
        contactPhone: "+358408888888",
      },
    };

    const response = await api
      .post("/api/Events").set("Authorization", "Bearer " + token)
      .send(newEvent)
      .expect(201);

    expect(response.body.title).toBe(newEvent.title);
  });

  // GET by ID
  it("should return one event by ID", async () => {
    const event = await Event.findOne();
    const response = await api
      .get(`/api/Events/${event._id}`).set("Authorization", "Bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(event.title);
  });

  // PATCH update
  it("should update one event by ID", async () => {
    const event = await Event.findOne();
    const updatedEvent = {
      location: "Updated Venue, Helsinki",
      organizer: {
        name: "Updated Organizer",
        contactEmail: "updated@organizer.fi",
        contactPhone: "+358407777777",
      },
    };

    const response = await api
      .put(`/api/Events/${event._id}`).set("Authorization", "Bearer " + token)
      .send(updatedEvent)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.location).toBe(updatedEvent.location);

    const updatedEventCheck = await Event.findById(event._id);
    expect(updatedEventCheck.organizer.name).toBe(updatedEvent.organizer.name);
  });

  // DELETE
  it("should delete one event by ID", async () => {
    const event = await Event.findOne();
    await api.delete(`/api/Events/${event._id}`).set("Authorization", "Bearer " + token).expect(204);

    const eventCheck = await Event.findById(event._id);
    expect(eventCheck).toBeNull();
  });
});

// Close DB
afterAll(async () => {
  await mongoose.connection.close();
});
