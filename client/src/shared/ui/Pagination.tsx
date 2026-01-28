import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
}
export const Pagination = ({
  currentPage,
  totalPages,
  onPageSelect,
}: PaginationProps) => {
  const buttonsList = [
    ...new Set([
      1,
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      totalPages,
    ]),
  ].filter((num) => num > 0 && num <= totalPages);

  const buttonsCommonClass = `shadow-sm font-medium text-base hover:scale-125 transition-transform duration-200 cursor-pointer shadow-gray-800/20 hover:shadow-gray-800/50 h-7 w-7 rounded-full border-1 border-blue-900 text-blue-900 mx-1`;

  return (
    <div className={"flex gap-1 justify-center m-2"}>
      <button
        className={`${buttonsCommonClass} flex justify-center items-center disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-300`}
        disabled={currentPage === 1}
        onClick={() => onPageSelect(currentPage - 1)}
      >
        <ChevronLeftIcon className="h-[20px] w-[20px] text-blue-900" />
      </button>
      {buttonsList.map((page, index) => (
        <div key={page}>
          {buttonsList[index - 1] && page - buttonsList[index - 1] > 1 && (
            <span className={"text-xl font-bold text-blue-900"}>..</span>
          )}
          <button
            className={`${buttonsCommonClass} ${currentPage === page ? "bg-blue-900 text-white" : "bg-white"}`}
            onClick={() => onPageSelect(page)}
          >
            {page}
          </button>
        </div>
      ))}
      <button
        className={`${buttonsCommonClass} flex justify-center items-center disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-300`}
        disabled={currentPage >= totalPages}
        onClick={() => onPageSelect(currentPage + 1)}
      >
        <ChevronRightIcon className="h-[20px] w-[20px] text-blue-900" />
      </button>
    </div>
  );
};
