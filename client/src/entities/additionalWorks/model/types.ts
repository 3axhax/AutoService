export interface AdditionalWorkValue {
  id: number;
  active: boolean;
  description: string;
  totalValue: number | null;
  [key: string]: string | number | boolean | null;
}

export interface AdditionalWorkItem extends AdditionalWorkValue {
  createdAt: string;
}

export interface AdditionalWorksState {
  pending: boolean;
  error: string;
  additionalWorksValue: Record<number, AdditionalWorkValue>;
  additionalWorksList: Record<number, AdditionalWorkItem>;
}
