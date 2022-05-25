import { datetime } from '../../Types';

// date,time to date
export const getDate = (datetime: datetime): Date =>
    new Date(`${datetime.date}T${datetime.time}`);
