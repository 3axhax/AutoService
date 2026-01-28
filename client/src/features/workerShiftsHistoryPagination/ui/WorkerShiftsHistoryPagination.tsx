import { useState } from "react";
import { Pagination } from "@shared/ui/Pagination.tsx";

export const WorkerShiftsHistoryPagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 30;
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={setCurrentPage}
    />
  );
};
