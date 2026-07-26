import { useEffect, useState } from "react";
import { Switch, Tooltip } from "antd";

/**
 * Switch bound to an item's `is_active` flag. Shows the requested state right
 * away, keeps itself disabled while the request is in flight and rolls back to
 * the server value when the toggle fails (the store raises the error toast).
 *
 * @param {{
 *   isActive?: boolean;
 *   onToggle: (nextValue: boolean) => Promise<unknown>;
 *   disabled?: boolean;
 *   size?: "default" | "small";
 * }} props
 */
const ActiveStatusSwitch = ({
  isActive,
  onToggle,
  disabled = false,
  size = "default",
}) => {
  const [pendingValue, setPendingValue] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPendingValue(null);
  }, [isActive]);

  const checked = pendingValue ?? Boolean(isActive);

  const handleChange = async (nextValue) => {
    if (isSaving) return;
    setIsSaving(true);
    setPendingValue(nextValue);
    try {
      await onToggle(nextValue);
    } catch {
      setPendingValue(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tooltip
      title={
        checked
          ? "Visible on the public website"
          : "Hidden from the public website"
      }
    >
      <Switch
        size={size}
        checked={checked}
        loading={isSaving}
        disabled={disabled || isSaving}
        onChange={handleChange}
        checkedChildren="Active"
        unCheckedChildren="Hidden"
      />
    </Tooltip>
  );
};

export default ActiveStatusSwitch;
