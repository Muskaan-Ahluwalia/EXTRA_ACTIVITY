require("dotenv").config();
const express = require("express");
const cors = require("cors");
const TripDB = require("./modules/tripDB.js");
const { engine } = require("express-handlebars");
const app = express();
const port = process.env.PORT || 3000;

const db = new TripDB();
app.use(express.static("public"));
// Set up express-handlebars
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    defaultLayout: "main",
  })
);

app.set("view engine", "hbs");
app.set("views", "./views");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

db.initialize(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });

app.get("/add-trip", (req, res) => {
  res.render("addTrip");
});

app.post("/api/trips", async (req, res) => {
  try {
    const newTrip = await db.addNewTrip(req.body);
    res.status(201).json(newTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding new trip" });
  }
});

app.get("/api/trips", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const trips = await db.getAllTrips(page, perPage);
    res.render("listTrips", { trips });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Error fetching trips" });
  }
});

app.get("/api/trips/:id", async (req, res) => {
  try {
    const trip = await db.getTripById(req.params.id);
    if (trip) {
      res.render("tripDetails", { trip });
    } else {
      res.status(404).render("error", { message: "Trip not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Error fetching trip" });
  }
});

app.put("/api/trips/:id", async (req, res) => {
  try {
    const updatedTrip = await db.updateTripById(req.body, req.params.id);
    if (updatedTrip) {
      res.json({ message: "Trip updated successfully" });
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating trip" });
  }
});
app.delete("/api/trips/:id", async (req, res) => {
  try {
    const result = await db.deleteTripById(req.params.id);
    if (result.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting trip" });
  }
});
