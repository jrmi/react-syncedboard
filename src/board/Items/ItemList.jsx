import React from "react";
import { useRecoilValue } from "recoil";
import Item from "./Item";
import useItemActions from "./useItemActions";

import { ItemListAtom, ItemMapAtom, SelectedItemsAtom } from "../atoms";
import { ConfigurationAtom } from "..";

/** Allow to operate on locked items while u or l key is pressed  */
const useUnlock = () => {
  const [unlock, setUnlock] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "u" || e.key === "l") {
        setUnlock(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "u" || e.key === "l") {
        setUnlock(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return unlock;
};

const ItemList = ({ itemTemplates }) => {
  const { updateItem } = useItemActions();
  const itemList = useRecoilValue(ItemListAtom);
  const itemMap = useRecoilValue(ItemMapAtom);
  const selectedItems = useRecoilValue(SelectedItemsAtom);
  const { boardSize } = useRecoilValue(ConfigurationAtom);
  const unlocked = useUnlock();

  return itemList.map((itemId) => (
    <Item
      key={itemId}
      state={itemMap[itemId]}
      setState={updateItem}
      isSelected={selectedItems.includes(itemId)}
      unlocked={unlocked}
      itemMap={itemTemplates}
      boardSize={boardSize}
    />
  ));
};

export default ItemList;
