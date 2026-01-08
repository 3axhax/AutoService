import { ActionBlock } from "./ActionBlock";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getActiveShift } from "@entities/shifts";

export const WorkerShift = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getActiveShift());
  }, [dispatch]);

  return (
    <div>
      <ActionBlock />
    </div>
  );
};
