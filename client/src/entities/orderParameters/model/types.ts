export enum ParametersType {
  SELECT = "SELECT",
  SELECT_LIST = "SELECT_LIST",
  INPUT = "INPUT",
  GRAPH_INPUT = "GRAPH_INPUT",
  COMPOSITE_LIST = "COMPOSITE_LIST",
}

export interface ParametersItemOption {
  id: number;
  translationRu: string;
  optionGroup?: string;
  optionGroupTranslationRu?: string;
  optionGroupOrder?: number;
}

export interface ParametersItem {
  id: number;
  name: string;
  translationRu: string;
  type: ParametersType;
  order: number | null;
  options: ParametersItemOption[];
}

export interface OrderParametersState {
  pending: boolean;
  error: string;
  parametersList: ParametersItem[];
  parameterOptionDependence: Record<string, number[]>;
  optionOptionDependence: Record<string, Record<string, number[]>>;
}

export interface OrderParametersResponse {
  parameters: ParametersItem[];
  options: {
    parameterOptionDependence: string;
    optionOptionDependence: string;
  };
}
