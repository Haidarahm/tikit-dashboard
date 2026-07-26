import { useEffect, useMemo, useState } from "react";
import { Alert, Form, Modal, Select, Typography } from "antd";
import { getContentSections } from "../../apis/contentSections.js";
import { getWorksSections } from "../../apis/work/worksSection.js";
import {
  FALLBACK_SECTION_OPTIONS,
  sectionLabel,
  WORK_INFLUENCE_SECTION,
} from "../../constants/contentSections.js";

const { Text } = Typography;

const DROP_WARNINGS = {
  [`${WORK_INFLUENCE_SECTION}->other`]:
    "Approach (EN/AR/FR) and the linked work are not supported by the destination section and will be dropped.",
  [`other->${WORK_INFLUENCE_SECTION}`]:
    "The destination section has no sort order, and its approach fields will start empty.",
};

const describeFieldLoss = (sourceSection, targetSection) => {
  if (!targetSection || sourceSection === targetSection) return null;
  if (sourceSection === WORK_INFLUENCE_SECTION) {
    return DROP_WARNINGS[`${WORK_INFLUENCE_SECTION}->other`];
  }
  if (targetSection === WORK_INFLUENCE_SECTION) {
    return DROP_WARNINGS[`other->${WORK_INFLUENCE_SECTION}`];
  }
  return null;
};

/**
 * Destination picker for copying or moving a content item into another section.
 * A move cannot target its own section, so that option is hidden in move mode.
 *
 * @param {{
 *   open: boolean;
 *   mode: "copy" | "move";
 *   sourceSection: string;
 *   item: { id: number, title_en?: string, title?: string, work_id?: number } | null;
 *   onCancel: () => void;
 *   onSubmit: (payload: { targetSection: string, workId?: number }) => Promise<unknown>;
 * }} props
 */
const CopyMoveSectionModal = ({
  open,
  mode = "copy",
  sourceSection,
  item,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState(FALLBACK_SECTION_OPTIONS);
  const [works, setWorks] = useState([]);
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMove = mode === "move";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await getContentSections();
        const list = Array.isArray(resp?.data) ? resp.data : [];
        if (!cancelled && list.length > 0) {
          setSections(list);
        }
      } catch {
        // The hardcoded fallback keeps the picker usable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setTargetSection(null);
      setIsSubmitting(false);
    }
  }, [open, form]);

  const needsWork = targetSection === WORK_INFLUENCE_SECTION;
  const workIsRequired = needsWork && sourceSection !== WORK_INFLUENCE_SECTION;

  useEffect(() => {
    if (!open || !needsWork || works.length > 0 || isLoadingWorks) return;
    let cancelled = false;
    setIsLoadingWorks(true);
    (async () => {
      try {
        const resp = await getWorksSections({ per_page: 500 });
        const list = Array.isArray(resp?.data) ? resp.data : [];
        if (!cancelled) {
          setWorks(list.filter((work) => work?.type === "influence"));
        }
      } catch {
        if (!cancelled) setWorks([]);
      } finally {
        if (!cancelled) setIsLoadingWorks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, needsWork, works.length, isLoadingWorks]);

  const sectionOptions = useMemo(
    () =>
      sections
        .filter((section) => !isMove || section.key !== sourceSection)
        .map((section) => ({
          value: section.key,
          label:
            section.key === sourceSection
              ? `${section.label || sectionLabel(section.key)} (same section)`
              : section.label || sectionLabel(section.key),
        })),
    [sections, isMove, sourceSection]
  );

  const workOptions = useMemo(
    () =>
      works.map((work) => ({
        value: work.id,
        label: work.title || work.slug || `Work #${work.id}`,
      })),
    [works]
  );

  const lossWarning = describeFieldLoss(sourceSection, targetSection);

  const handleOk = async () => {
    if (isSubmitting) return;
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await onSubmit({
        targetSection: values.target_section,
        workId: values.work_id ?? undefined,
      });
    } catch {
      // Validation errors render inline; request errors are toasted by the store.
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemTitle = item?.title_en || item?.title || "";

  return (
    <Modal
      title={isMove ? "Move to another section" : "Copy to another section"}
      open={open}
      onCancel={isSubmitting ? undefined : onCancel}
      onOk={handleOk}
      okText={isMove ? "Move" : "Copy"}
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
    >
      <div className="space-y-4">
        <Text type="secondary">
          {isMove
            ? "The item is removed from its current section and recreated in the destination."
            : "A copy of the item is created in the destination section. The original stays where it is."}
          {itemTitle ? ` Item: "${itemTitle}".` : ""}
        </Text>

        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="target_section"
            label="Destination section"
            rules={[
              { required: true, message: "Select a destination section" },
            ]}
          >
            <Select
              placeholder="Select a section"
              options={sectionOptions}
              onChange={(value) => {
                setTargetSection(value);
                form.setFieldValue("work_id", undefined);
              }}
            />
          </Form.Item>

          {needsWork && (
            <Form.Item
              name="work_id"
              label="Work section"
              tooltip="Work influence items must belong to a work of type influence."
              rules={
                workIsRequired
                  ? [{ required: true, message: "Select a work section" }]
                  : []
              }
              extra={
                workIsRequired
                  ? undefined
                  : "Leave empty to keep the item's current work."
              }
            >
              <Select
                placeholder="Select a work"
                options={workOptions}
                loading={isLoadingWorks}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
          )}
        </Form>

        {lossWarning && (
          <Alert type="warning" showIcon message={lossWarning} />
        )}
      </div>
    </Modal>
  );
};

export default CopyMoveSectionModal;
