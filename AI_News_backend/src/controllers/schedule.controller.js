const InjectionScheduleModel = require("../models/InjectionScheduleModel");


exports.createSchedule = async (req, res) => {
  try {
    const { category, articlesPerDay, daysRemaining } = req.body;

    // Deactivate any existing active rule for this category to avoid conflicts
    await InjectionScheduleModel.updateMany(
      { category, status: 'active' },
      { status: 'completed' }
    );

    const newSchedule = await InjectionScheduleModel.create({
      category,
      articlesPerDay,
      daysRemaining,
      status: 'active'
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveSchedules = async (req, res) => {
  try {
    const schedules = await InjectionScheduleModel.find({ status: 'active' });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await InjectionScheduleModel.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await InjectionScheduleModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Rule terminated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};