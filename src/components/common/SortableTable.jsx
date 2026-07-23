import React, { createContext, useContext, useMemo } from "react";
import { Button, Table } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const RowContext = createContext({});

/**
 * Drag handle to be placed inside a table column's render function.
 * Example column: { key: "sort", width: 48, render: () => <DragHandle /> }
 */
export const DragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move", touchAction: "none" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const SortableRow = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 999 } : {}),
  };

  const contextValue = useMemo(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

/**
 * A thin wrapper around Ant Design's Table that enables drag-to-reorder rows
 * using dnd-kit. Pass an `onReorder(reorderedItems)` callback that receives the
 * full data array in its new order.
 */
export default function SortableTable({
  dataSource = [],
  columns,
  rowKey = "id",
  onReorder,
  ...rest
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } })
  );

  const getKey = (item) =>
    typeof rowKey === "function" ? rowKey(item) : item?.[rowKey];

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = dataSource.findIndex((item) => getKey(item) === active.id);
    const newIndex = dataSource.findIndex((item) => getKey(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(dataSource, oldIndex, newIndex);
    onReorder?.(reordered);
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={dataSource.map((item) => getKey(item))}
        strategy={verticalListSortingStrategy}
      >
        <Table
          {...rest}
          rowKey={rowKey}
          columns={columns}
          dataSource={dataSource}
          components={{ body: { row: SortableRow } }}
        />
      </SortableContext>
    </DndContext>
  );
}
