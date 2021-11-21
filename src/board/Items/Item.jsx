import React, { memo } from "react";

import styled from "@emotion/styled";
import lockIcon from "../../images/lock.svg";

const ItemWrapper = styled.div`
  display: inline-block;
  transition: transform 150ms;
  user-select: none;
  padding: 4px;
  transform: rotate(${({ rotation }) => rotation}deg);

  & .corner {
    position: absolute;
    width: 0px;
    height: 0px;
  }

  & .top-left {
    top: 0;
    left: 0;
  }
  & .top-right {
    top: 0;
    right: 0;
  }
  & .bottom-left {
    bottom: 0;
    left: 0;
  }
  & .bottom-right {
    bottom: 0;
    right: 0;
  }

  &.selected {
    border: 2px dashed #db5034;
    padding: 2px;
    cursor: pointer;
  }

  &.locked::after {
    content: "";
    position: absolute;
    width: 24px;
    height: 30px;
    top: 4px;
    right: 4px;
    opacity: 0.1;
    background-image: url("${lockIcon}");
    background-size: cover;
    user-select: none;
  }

  &.locked:hover::after {
    opacity: 0.3;
  }
`;

const DefaultErrorComponent = ({ onReload }) => (
  <div
    style={{
      width: "100px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      color: "red",
    }}
    className="syncboard-error-item"
  >
    Sorry, this item seems broken.
    <button onClick={onReload}>Reload it</button>
  </div>
);

/* Error boundary for broken item */
class ItemErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, itemId: props.itemId };
    this.onReload = this.onReload.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.log(`Error for item ${this.state.itemId}`, error, this.props.state);
  }

  onReload() {
    this.setState({ hasError: false });
  }

  render() {
    const { ErrorComponent } = this.props;
    if (this.state.hasError) {
      return <ErrorComponent onReload={this.onReload} />;
    }
    return this.props.children;
  }
}

const Item = ({
  setState,
  state: { type, rotation = 0, id, locked, layer, ...rest } = {},
  animate = "hvr-pop",
  isSelected,
  itemMap,
  unlocked,
}) => {
  const isMountedRef = React.useRef(false);
  const animateRef = React.useRef(null);

  const Component = itemMap[type].component || null;

  const updateState = React.useCallback(
    (callbackOrItem, sync = true) => setState(id, callbackOrItem, sync),
    [setState, id]
  );

  // Update actual size when update
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    animateRef.current.className = animate;
  }, [animate]);

  const removeClass = (e) => {
    e.target.className = "";
  };
  let className = "item";
  if (locked) {
    className += " locked";
  }
  if (isSelected) {
    className += " selected";
  }
  return (
    <ItemWrapper
      rotation={rotation}
      locked={locked && !unlocked}
      selected={isSelected}
      layer={layer}
      id={id}
      className={className}
    >
      <div
        ref={animateRef}
        onAnimationEnd={removeClass}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      >
        <ItemErrorBoundary
          itemId={id}
          state={rest}
          setState={updateState}
          ErrorComponent={itemMap?.error?.component || DefaultErrorComponent}
        >
          <Component {...rest} id={id} setState={updateState} />
        </ItemErrorBoundary>
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
    </ItemWrapper>
  );
};

const MemoizedItem = memo(
  Item,
  (
    {
      state: prevState,
      setState: prevSetState,
      isSelected: prevIsSelected,
      unlocked: prevUnlocked,
    },
    {
      state: nextState,
      setState: nextSetState,
      isSelected: nextIsSelected,
      unlocked: nextUnlocked,
    }
  ) =>
    prevIsSelected === nextIsSelected &&
    prevUnlocked === nextUnlocked &&
    prevSetState === nextSetState &&
    JSON.stringify(prevState) === JSON.stringify(nextState)
);

// Exclude positionning from memoization
const PositionedItem = ({
  state: { x = 0, y = 0, layer, moving, ...stateRest } = {},
  ...rest
}) => (
  <div
    style={{
      transform: `translate(${x}px, ${y}px)`,
      display: "inline-block",
      zIndex: ((layer || 0) + 4) * 10 + 100 + (moving ? 5 : 0), // Items z-index between 100 and 200
      position: "absolute",
      top: 0,
      left: 0,
    }}
  >
    <MemoizedItem {...rest} state={stateRest} />
  </div>
);

const MemoizedPositionedItem = memo(PositionedItem);

export default MemoizedPositionedItem;
