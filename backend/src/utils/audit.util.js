const BookAudit = require('../models/bookAudit.model');

const createBookAudit = async (
  bookId,
  bookCopyId,
  action,
  performedBy,
  details = {}
) => {
  return await BookAudit.create({
    book: bookId,
    bookCopy: bookCopyId,
    action,
    performedBy,
    details,
  });
};

module.exports = { createBookAudit };
