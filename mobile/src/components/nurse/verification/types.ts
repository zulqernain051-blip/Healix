export type DocStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type DocKey =
  | 'CNIC_FRONT'
  | 'CNIC_BACK'
  | 'NURSE_LICENSE'
  | 'DEGREE'
  | 'BACKGROUND_CHECK';

export interface CheckItem {
  key: DocKey;
  label: string;
  icon: string;
}
