import { useAppSelector } from "@shared/store/hooks.ts";
import { selectErrorOrderParameters } from "@entities/orderParameters";

export const MainPage = () => {
  const error = useAppSelector(selectErrorOrderParameters);

  return (
    <main className="main">
      <div className="container px-4 lg:px-8">
        <h1 className="text-4xl font-sans  text-gray-900 dark:text-white mb-4">
          MainPage
        </h1>
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
      </div>
    </main>
  );
};
