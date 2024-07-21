import useMainStore from "../store/main";

const useGetSelectedItems = () => {
  const [getSelection] = useMainStore((state) => [state.getSelection]);
  return getSelection;
};

export default useGetSelectedItems;
