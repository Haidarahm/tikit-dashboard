import React, { createContext, useContext, useMemo } from "react";
import { Button, Col, Row } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CardContext = createContext({});

/**
 * Drag handle to be rendered inside a card (via the renderItem prop).
 */
export const CardDragHandle = (props) => {
  const { setActivatorNodeRef, listeners } = useContext(CardContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move", touchAction: "none" }}
      ref={setActivatorNodeRef}
      {...listeners}
      {...props}
    />
  );
};

const SortableCell = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 999, position: "relative" } : {}),
  };

  const contextValue = useMemo(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <CardContext.Provider value={contextValue}>
      <div ref={setNodeRef} style={style} {...attributes}>
        {children}
      </div>
    </CardContext.Provider>
  );
};

/**
 * Drag-to-reorder grid of cards using dnd-kit while preserving Ant Design's
 * responsive Row/Col layout. `renderItem(item)` should render the card and
 * include a <CardDragHandle /> somewhere inside it.
 */
export default function SortableCards({
  items = [],
  rowKey = "id",
  onReorder,
  renderItem,
  colProps = { xs: 24, sm: 12, md: 8, lg: 6 },
  gutter = [24, 24],
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } })
  );

  const getKey = (item) =>
    typeof rowKey === "function" ? rowKey(item) : item?.[rowKey];

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => getKey(item) === active.id);
    const newIndex = items.findIndex((item) => getKey(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder?.(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => getKey(item))}
        strategy={rectSortingStrategy}
      >
        <Row gutter={gutter}>
          {items.map((item) => (
            <Col key={getKey(item)} {...colProps}>
              <SortableCell id={getKey(item)}>{renderItem(item)}</SortableCell>
            </Col>
          ))}
        </Row>
      </SortableContext>
    </DndContext>
  );
}
