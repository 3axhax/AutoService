export interface ParametersItemOption {
  id: number;
  translationRu: string;
}

export interface ParametersItem {
  id: number;
  name: string;
  translationRu: string;
  type: "SELECT" | "SELECT_LIST" | "INPUT" | "RADIO" | "GRAPH_INPUT";
  options: ParametersItemOption[];
}

export interface OrderParametersState {
  pending: boolean;
  error: string;
  parametersList: ParametersItem[];
}
