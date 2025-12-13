import { AppProvider } from "./providers";
import AppContainer from "@app/AppContainer.tsx";

function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}

export default App;
