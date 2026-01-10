const { getSetting } = require('./config.util');

const calculateDueDate = async (borrowDate) => {
  const loanDays = await getSetting('LOAN_PERIOD_DAYS');
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + loanDays);
  return dueDate;
};

module.exports = { calculateDueDate };
