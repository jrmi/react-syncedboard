import React from "react";
import { useDebouncedEffect } from "@react-hookz/web/esm";
import { useSyncedItems } from "../store/items";

const useDebouncedItems = () => {
  const [items, getItemList] = useSyncedItems((state) => [
    state.getItemList(),
    getItemList,
  ]);
  const [debouncedItems, setDebouncedItems] = React.useState([]);

  const updateDebouncedItems = React.useCallback(async () => {
    const currentItemMap = getItemList();
    setDebouncedItems(currentItemMap);
  }, [getItemList]);

  useDebouncedEffect(updateDebouncedItems, [items], 300);

  return debouncedItems;
};

export default useDebouncedItems;
