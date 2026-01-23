// Sri Lankan Public Holidays
// Includes both fixed holidays and calculated holidays (like Sinhala & Tamil New Year, Vesak, etc.)

export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
  type: "national" | "religious" | "cultural";
  isFixed: boolean; // true for fixed dates, false for calculated dates
}

// Fixed holidays (same date every year)
const fixedHolidays: Omit<Holiday, "date">[] = [
  { name: "Duruthu Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Tamil Thai Pongal Day", type: "cultural", isFixed: false },
  { name: "Navam Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Independence Day", type: "national", isFixed: true }, // February 4
  { name: "Maha Shivaratri", type: "religious", isFixed: false },
  { name: "Medin Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Bak Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Good Friday", type: "religious", isFixed: false },
  { name: "Sinhala and Tamil New Year", type: "cultural", isFixed: false }, // April 13-14
  { name: "Vesak Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Day following Vesak Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Poson Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Esala Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Nikini Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Binara Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Vap Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Deepavali Festival Day", type: "religious", isFixed: false },
  { name: "Il Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Unduvap Full Moon Poya Day", type: "religious", isFixed: false },
  { name: "Christmas Day", type: "religious", isFixed: true }, // December 25
];

// Calculate holidays for a given year
export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // Fixed holidays
  holidays.push({
    name: "Independence Day",
    date: `${year}-02-04`,
    type: "national",
    isFixed: true,
  });

  holidays.push({
    name: "Christmas Day",
    date: `${year}-12-25`,
    type: "religious",
    isFixed: true,
  });

  // Sinhala and Tamil New Year (April 13-14)
  holidays.push({
    name: "Sinhala and Tamil New Year",
    date: `${year}-04-13`,
    type: "cultural",
    isFixed: false,
  });
  holidays.push({
    name: "Sinhala and Tamil New Year",
    date: `${year}-04-14`,
    type: "cultural",
    isFixed: false,
  });

  // Note: Full Moon Poya Days, Good Friday, Deepavali, etc. are calculated based on lunar calendar
  // For simplicity, we'll use approximate dates. In a production system, you'd want to use
  // a proper lunar calendar library or API to calculate these accurately.
  
  // Approximate Full Moon Poya Days for 2024-2025 (these should be calculated properly)
  // These are approximate and may need adjustment
  const poyaDays2024 = [
    { month: 1, day: 25, name: "Duruthu Full Moon Poya Day" },
    { month: 2, day: 24, name: "Navam Full Moon Poya Day" },
    { month: 3, day: 24, name: "Medin Full Moon Poya Day" },
    { month: 4, day: 23, name: "Bak Full Moon Poya Day" },
    { month: 5, day: 23, name: "Vesak Full Moon Poya Day" },
    { month: 6, day: 21, name: "Poson Full Moon Poya Day" },
    { month: 7, day: 21, name: "Esala Full Moon Poya Day" },
    { month: 8, day: 19, name: "Nikini Full Moon Poya Day" },
    { month: 9, day: 17, name: "Binara Full Moon Poya Day" },
    { month: 10, day: 17, name: "Vap Full Moon Poya Day" },
    { month: 11, day: 15, name: "Il Full Moon Poya Day" },
    { month: 12, day: 15, name: "Unduvap Full Moon Poya Day" },
  ];

  const poyaDays2025 = [
    { month: 1, day: 13, name: "Duruthu Full Moon Poya Day" },
    { month: 2, day: 12, name: "Navam Full Moon Poya Day" },
    { month: 3, day: 14, name: "Medin Full Moon Poya Day" },
    { month: 4, day: 12, name: "Bak Full Moon Poya Day" },
    { month: 5, day: 12, name: "Vesak Full Moon Poya Day" },
    { month: 6, day: 11, name: "Poson Full Moon Poya Day" },
    { month: 7, day: 10, name: "Esala Full Moon Poya Day" },
    { month: 8, day: 9, name: "Nikini Full Moon Poya Day" },
    { month: 9, day: 7, name: "Binara Full Moon Poya Day" },
    { month: 10, day: 6, name: "Vap Full Moon Poya Day" },
    { month: 11, day: 5, name: "Il Full Moon Poya Day" },
    { month: 12, day: 4, name: "Unduvap Full Moon Poya Day" },
  ];

  const poyaDays = year === 2024 ? poyaDays2024 : year === 2025 ? poyaDays2025 : poyaDays2024;

  poyaDays.forEach((poya) => {
    holidays.push({
      name: poya.name,
      date: `${year}-${String(poya.month).padStart(2, '0')}-${String(poya.day).padStart(2, '0')}`,
      type: "religious",
      isFixed: false,
    });
  });

  // Day following Vesak (usually May 24 in 2024, May 13 in 2025)
  if (year === 2024) {
    holidays.push({
      name: "Day following Vesak Full Moon Poya Day",
      date: `${year}-05-24`,
      type: "religious",
      isFixed: false,
    });
  } else if (year === 2025) {
    holidays.push({
      name: "Day following Vesak Full Moon Poya Day",
      date: `${year}-05-13`,
      type: "religious",
      isFixed: false,
    });
  }

  // Good Friday (calculated - approximate dates)
  if (year === 2024) {
    holidays.push({
      name: "Good Friday",
      date: `${year}-03-29`,
      type: "religious",
      isFixed: false,
    });
  } else if (year === 2025) {
    holidays.push({
      name: "Good Friday",
      date: `${year}-04-18`,
      type: "religious",
      isFixed: false,
    });
  }

  // Deepavali (approximate - usually in October/November)
  if (year === 2024) {
    holidays.push({
      name: "Deepavali Festival Day",
      date: `${year}-10-31`,
      type: "religious",
      isFixed: false,
    });
  } else if (year === 2025) {
    holidays.push({
      name: "Deepavali Festival Day",
      date: `${year}-10-20`,
      type: "religious",
      isFixed: false,
    });
  }

  // Maha Shivaratri (approximate - usually in February/March)
  if (year === 2024) {
    holidays.push({
      name: "Maha Shivaratri",
      date: `${year}-03-08`,
      type: "religious",
      isFixed: false,
    });
  } else if (year === 2025) {
    holidays.push({
      name: "Maha Shivaratri",
      date: `${year}-02-26`,
      type: "religious",
      isFixed: false,
    });
  }

  // Tamil Thai Pongal Day (usually January 15)
  holidays.push({
    name: "Tamil Thai Pongal Day",
    date: `${year}-01-15`,
    type: "cultural",
    isFixed: false,
  });

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

// Get holidays for a specific date range
export function getHolidaysForDateRange(startDate: Date, endDate: Date): Holiday[] {
  const holidays: Holiday[] = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    const yearHolidays = getHolidaysForYear(year);
    yearHolidays.forEach((holiday) => {
      const holidayDate = new Date(holiday.date);
      if (holidayDate >= startDate && holidayDate <= endDate) {
        holidays.push(holiday);
      }
    });
  }

  return holidays;
}

// Get holiday for a specific date
export function getHolidayForDate(date: Date): Holiday | undefined {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);
  return holidays.find((h) => h.date === dateStr);
}
