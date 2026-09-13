import dayjs from 'dayjs';

export const SPF_DATE_TIME_FORMAT = 'YYYY-MMM-DD hh:mm:ss';

const PARSE_FORMATS = [
  SPF_DATE_TIME_FORMAT,
  'YY:MM:DD HH:mm:ss',
  'YYYY/MM/DD - HH:mm:ss',
  'YYYY-MMM-DD hh:mm:ss',
  'YYYY-MMM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
  'YYYY-MMM-DD, h:mm A',
  'YYYY-MMM-DD, hh:mm A',
];

export const formatSpfDateTime = (value?: string | null) => {
  if (!value) return '-';

  const parsed = dayjs(value);
  if (parsed.isValid()) {
    return parsed.format(SPF_DATE_TIME_FORMAT);
  }

  const fallback = dayjs(value, PARSE_FORMATS, true);
  return fallback.isValid() ? fallback.format(SPF_DATE_TIME_FORMAT) : String(value);
};

export const parseSpfDateTime = (value?: string | null) => {
  if (!value) return dayjs('');

  const parsed = dayjs(value);
  if (parsed.isValid()) {
    return parsed;
  }

  return dayjs(value, PARSE_FORMATS, true);
};
