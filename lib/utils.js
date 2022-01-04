function formatDate(date) {
  try {
    let month = `${date.getMonth() + 1}`;
    let day = `${date.getDate()}`;
    const year = date.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
  } catch (err) {
    return null;
  }
}

function getDateGivenIncreMonths(dateObj, increMonth) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDay();
  const newDate = new Date(fullYear, month + increMonth, day, 0, 0, 0);
  // const newDateString = formatDate(newDate);
  return newDate;
}

module.exports = { formatDate, getDateGivenIncreMonths };
