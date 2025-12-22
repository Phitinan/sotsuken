import {
  getSpotWithSubdocs,
  findSubdocOrFail,
  assertOwnerOrAdmin
} from "../services/spotSubdocService.js";

export const getSeasonReports = async (req, res) => {
  try {
    const spot = await getSpotWithSubdocs({
      spotId: req.params.spotId,
      subdocField: "seasonReports",
      populate: "username"
    });

    res.json(spot.seasonReports);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const addSeasonReport = async (req, res) => {
  const { year, date, status, note } = req.body;

  if (!year || !date || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const spot = await getSpotWithSubdocs({
      spotId: req.params.spotId,
      subdocField: "seasonReports"
    });

    spot.seasonReports.push({
      year,
      date,
      status,
      note,
      userId: req.user._id
    });

    await spot.save();
    res.status(201).json(spot.seasonReports);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteSeasonReport = async (req, res) => {
  const { spotId, reportId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(spotId) ||
    !mongoose.Types.ObjectId.isValid(reportId)
  ) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }

    const report = spot.seasonReports.id(reportId);
    if (!report) {
      return res.status(404).json({ error: "Season report not found" });
    }

    // Author or admin only
    if (
      report.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    report.deleteOne();

    await spot.save();

    res.status(200).json({
      seasonReports: spot.seasonReports
    });
  } catch (error) {
    console.error("Delete season report error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
/**
 * PUT /spots/:spotId/season-reports/:reportId
 * Update own season report (or admin)
 */
export const updateSeasonReport = async (req, res) => {
  const { spotId, reportId } = req.params;
  const { year, date, status, note } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(spotId) ||
    !mongoose.Types.ObjectId.isValid(reportId)
  ) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }

    const report = spot.seasonReports.id(reportId);
    if (!report) {
      return res.status(404).json({ error: "Season report not found" });
    }

    // Authorization
    if (
      report.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Partial updates
    if (year !== undefined) report.year = year;
    if (date !== undefined) report.date = date;
    if (status !== undefined) report.status = status;
    if (note !== undefined) report.note = note;

    await spot.save();

    res.status(200).json({
      seasonReports: spot.seasonReports
    });
  } catch (error) {
    console.error("Update season report error:", error);
    res.status(500).json({ error: "Server error" });
  }
};