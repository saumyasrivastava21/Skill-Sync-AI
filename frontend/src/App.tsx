import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { useAppDispatch } from "./app/hooks";
import { initializeTheme } from "./features/theme/themeSlice";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;