const sessionService = require('../services/session.service');

exports.startSession = async (req, res) => {
  const { tableId } = req.body;
  const session = await sessionService.startSession(tableId, req.user._id);
  res.status(201).json({ success: true, data: session });
};

exports.endSession = async (req, res) => {
  const session = await sessionService.endSession(req.params.id);
  res.json({ success: true, data: session });
};

exports.getSessionById = async (req, res) => {
  const data = await sessionService.getSessionById(req.params.id);
  res.json({ success: true, data });
};

exports.getSessions = async (req, res) => {
  const { status, date } = req.query;
  const sessions = await sessionService.getSessions({ status, date });
  res.json({ success: true, data: sessions });
};
