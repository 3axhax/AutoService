import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { Pagination } from "@shared/ui/Pagination.tsx";
import {
  getOrdersListForAdmin,
  SelectOrdersPaginationCurrentPage,
  SelectOrdersPaginationTotalPage,
  setCurrentPage,
} from "@entities/order";

export const AdminOrdersListPagination = () => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(SelectOrdersPaginationCurrentPage);
  const totalPages = useAppSelector(SelectOrdersPaginationTotalPage);

  const onPageSelect = (num: number) => {
    dispatch(setCurrentPage(num));
    dispatch(getOrdersListForAdmin());
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
