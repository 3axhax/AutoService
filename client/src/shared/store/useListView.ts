import { useEffect, useId } from "react";
import { useAppDispatch } from "./hooks";
import {
  listViewOpened,
  listViewClosed,
  type ListResource,
  type ListView,
} from "./listView";

export function useListView(
  resource: ListResource,
  kind: ListView["kind"],
  shiftId?: number,
) {
  const dispatch = useAppDispatch();
  const owner = useId();
  useEffect(() => {
    dispatch(listViewOpened({ resource, kind, shiftId, owner }));
    return () => {
      dispatch(listViewClosed({ resource, owner }));
    };
  }, [dispatch, resource, kind, shiftId, owner]);
}
