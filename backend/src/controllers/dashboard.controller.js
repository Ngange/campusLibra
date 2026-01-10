const Borrow = require('../models/borrow.model');
const Fine = require('../models/fine.model');
const User = require('../models/user.model');
const BookAudit = require('../models/bookAudit.model');

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

const getAuditTrail = async (req, res, next) => {
  try {
    const {
      userId,
      bookId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;
    const filter = {};

    if (userId) filter.performedBy = userId;
    if (bookId) filter.book = bookId;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const audits = await BookAudit.find(filter)
      .populate('performedBy', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await BookAudit.countDocuments(filter);

    res.json({
      success: true,
      data: {
        audits,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookPopularity = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNumber);

    const popularity = await Borrow.aggregate([
      { $match: { borrowDate: { $gte: startDate } } },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookData',
        },
      },
      { $unwind: '$bookData' },
      {
        $group: {
          _id: '$book',
          title: { $first: '$bookData.title' },
          author: { $first: '$bookData.author' },
          borrowCount: { $sum: 1 },
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, data: popularity });
  } catch (error) {
    next(error);
  }
};

const getUserEngagement = async (req, res, next) => {
  try {
    const [totalUsers, distinctBorrowers, repeatBorrowersAgg] =
      await Promise.all([
        User.countDocuments(),
        Borrow.distinct('user'),
        Borrow.aggregate([
          { $group: { _id: '$user', count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } },
          { $project: { _id: 1 } },
        ]),
      ]);

    const engagedUsers = distinctBorrowers.length;
    const repeatBorrowers = repeatBorrowersAgg.map((r) => r._id).length;
    const engagementRate = totalUsers
      ? Number(((engagedUsers / totalUsers) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        engagedUsers,
        repeatBorrowers,
        engagementRate,
      },
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
  getAuditTrail,
  getBookPopularity,
  getUserEngagement,
};
