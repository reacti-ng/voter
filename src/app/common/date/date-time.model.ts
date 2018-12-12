import {parse as parseDate} from 'date-fns';

export type DateTime = Date;

export const DateTime = {
  fromJson: (value: string) => parseDate(value),
  toJson: (value: Date) => value.toISOString()
};

