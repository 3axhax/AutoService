import { Pagination } from "@shared/ui/Pagination.tsx";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getShiftsList,
  SelectShiftPaginationCurrentPage,
  SelectShiftPaginationTotalPage,
  setCurrentPage,
} from "@entities/shifts";

export const WorkerShiftsHistoryPagination = () => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(SelectShiftPaginationCurrentPage);
  const totalPages = useAppSelector(SelectShiftPaginationTotalPage);

  const onPageSelect = (num: number) => {
    dispatch(setCurrentPage(num));
    dispatch(getShiftsList());
  };

  return (
    <>
      {totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageSelect={onPageSelect}
        />
      ) : null}
    </>
  );
};
