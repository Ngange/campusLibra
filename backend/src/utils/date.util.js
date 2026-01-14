const { getSetting } = require('./config.util');

const calculateDueDate = async (borrowDate) => {
  const loanPeriod = await getSetting('LOAN_PERIOD_DAYS');
  const loanUnit = await getSetting('LOAN_PERIOD_UNIT');
  const dueDate = new Date(borrowDate);

  switch (loanUnit?.toLowerCase()) {
    case 'minutes':
      dueDate.setMinutes(dueDate.getMinutes() + loanPeriod);
      break;
    case 'hours':
      dueDate.setHours(dueDate.getHours() + loanPeriod);
      break;
    case 'days':
    default:
      dueDate.setDate(dueDate.getDate() + loanPeriod);
      break;
  }

  return dueDate;
};

module.exports = { calculateDueDate };
