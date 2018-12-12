
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const calendarDateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;

export const CalendarDate = {
  fromJson: (json: string) => {
    const m = json.match(calendarDateRegex);
    if (!m) {
      throw new Error(`Not a calendar date: ${json}`);
    }
    return {
      year: +m[3],
      month: +m[2] - 1, // months are 0-indexed :(
      day: m[1]         // days are 1-indexed
    };
  },
  toJson: (calendarDate: CalendarDate) => {
    const {day, month, year} = calendarDate;
    return `${format(day)}-${format(month + 1 /* months are 0-indexed */)}-${format(year)}`;

    function format(num: number) {
      const digits = num.toFixed(0);
      return digits.length < 2 ? '0' + digits : digits;
    }
  }
};
