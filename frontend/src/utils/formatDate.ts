import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const formatDate = (date: Date): string => {
  return format(date, 'd MMMM, yyyy', { locale: ar });
};

export default formatDate;
