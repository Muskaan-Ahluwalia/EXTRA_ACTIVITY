const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  tripduration: Number,
  "start station id": Number,
  "start station name": String,
  "end station id": Number,
  "end station name": String,
  bikeid: Number,
  usertype: String,
  "birth year": Number,
  gender: Number,
  "start station location": {
    type: { type: String },
    coordinates: [Number],
  },
  "end station location": {
    type: { type: String },
    coordinates: [Number],
  },
  "start time": Date,
  "stop time": Date,
});

const Trip = mongoose.model("Trip", tripSchema);

class TripDB {
  async initialize(connectionString) {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected");
  }

  async addNewTrip(data) {
    const trip = new Trip(data);
    return await trip.save();
  }

  async getAllTrips(page, perPage) {
    return await Trip.find()
      .sort("_id")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
  }

  async getTripById(Id) {
    return await Trip.findById(Id).exec();
  }

  async updateTripById(data, Id) {
    return await Trip.findByIdAndUpdate(Id, data, { new: true }).exec();
  }

  async deleteTripById(Id) {
    return await Trip.findByIdAndDelete(Id).exec();
  }
}

module.exports = TripDB;
