import mongoose from "mongoose";
import Spot from "../models/spotModel.js";

export const getSpotWithSubdocs = async ({
  spotId,
  subdocField,
  populate
}) => {
  if (!mongoose.Types.ObjectId.isValid(spotId)) {
    throw { status: 400, message: "Invalid spot ID" };
  }

  const query = Spot.findById(spotId).select(subdocField);

  if (populate) {
    query.populate(`${subdocField}.userId`, populate);
  }

  const spot = await query;
  if (!spot) {
    throw { status: 404, message: "Spot not found" };
  }

  return spot;
};

export const findSubdocOrFail = (spot, field, subdocId) => {
  const subdoc = spot[field].id(subdocId);
  if (!subdoc) {
    throw { status: 404, message: "Entry not found" };
  }
  return subdoc;
};

export const assertOwnerOrAdmin = (subdoc, user) => {
  if (
    subdoc.userId.toString() !== user._id.toString() &&
    user.role !== "admin"
  ) {
    throw { status: 403, message: "Not authorized" };
  }
};
