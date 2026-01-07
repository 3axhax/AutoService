export enum ParametersType {
  SELECT = "SELECT",
  SELECT_LIST = "SELECT_LIST",
  INPUT = "INPUT",
  RADIO = "RADIO",
  GRAPH_INPUT = "GRAPH_INPUT",
}

export interface ParametersItemOption {
  id: number;
  translationRu: string;
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
