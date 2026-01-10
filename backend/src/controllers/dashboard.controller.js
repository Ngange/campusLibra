const Borrow = require('../models/borrow.model');
const Fine = require('../models/fine.model');
const User = require('../models/user.model');
const Book = require('../models/book.model');

const getBorrowsPerMonth = async (req, res, next) => {
  try {
    const borrows = await Borrow.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$borrowDate' },
            month: { $month: '$borrowDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: '%b %Y',
              date: {
                $dateFromParts: { year: '$_id.year', month: '$_id.month' },
              },
            },
          },
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);
    res.json({ success: true, data: borrows });
  } catch (error) {
    next(error);
  }
};

const getOverdueStats = async (req, res, next) => {
  try {
    const [overdue, active] = await Promise.all([
      Borrow.countDocuments({ status: 'overdue' }),
      Borrow.countDocuments({ status: 'active' }),
    ]);
    res.json({ success: true, data: { overdue, active } });
  } catch (error) {
    next(error);
  }
};

const getFineSummary = async (req, res, next) => {
  try {
    const [collected, unpaid] = await Promise.all([
      Fine.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Fine.aggregate([
        { $match: { isPaid: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        collected: collected[0]?.total || 0,
        unpaid: unpaid[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getActiveUsers = async (req, res, next) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'borrows',
          localField: '_id',
          foreignField: 'user',
          as: 'borrows',
        },
      },
      {
        $match: {
          'borrows.0': { $exists: true }, // Users with at least one borrow
        },
      },
      {
        $count: 'activeUsers',
      },
    ]);

    res.json({
      success: true,
      data: { activeUsers: users[0]?.activeUsers || 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBorrowsPerMonth,
  getOverdueStats,
  getFineSummary,
  getActiveUsers,
};
