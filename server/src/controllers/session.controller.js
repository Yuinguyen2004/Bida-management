const sessionService = require('../services/session.service');
const { getIO } = require('../config/socket');

exports.startSession = async (req, res, next) => {
  try {
    const { tableId } = req.body;
    const session = await sessionService.startSession({
      tableId,
      staffId: req.user._id,
    });

    const io = getIO();
    io.to('tables').emit('table:statusChange', {
      tableId: session.tableId._id,
      status: 'playing',
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

exports.endSession = async (req, res, next) => {
  try {
    const session = await sessionService.endSession(req.params.id);

    const io = getIO();
    io.to('tables').emit('table:statusChange', {
      tableId: session.tableId._id,
      status: 'available',
    });

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getSessions(req.query);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};
