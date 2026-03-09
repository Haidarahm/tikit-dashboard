import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const EDITOR_MIN_HEIGHT = 360;
const EDITOR_CONTENT_MIN_HEIGHT = 320;

/**
 * Normalize HTML for backend: <strong> -> <b>, keep <a href="..."> as is.
 */
export function normalizeDescriptionHtml(html) {
  if (!html || typeof html !== "string") return html ?? "";
  return html
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<em>/gi, "<i>")
    .replace(/<\/em>/gi, "</i>");
}

/** Strip HTML tags for plain text (e.g. when sending to translate API). */
export function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function MenuBar({ editor }) {
  const addLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2 mb-2">
      <Button
        type="text"
        size="small"
        icon={<BoldOutlined />}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-gray-200" : ""}
        title="Bold"
      />
      <Button
        type="text"
        size="small"
        icon={<ItalicOutlined />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-gray-200" : ""}
        title="Italic"
      />
      <Button
        type="text"
        size="small"
        icon={<UnorderedListOutlined />}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
        title="Bullet list"
      />
      <Button
        type="text"
        size="small"
        icon={<OrderedListOutlined />}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
        title="Numbered list"
      />
      <Button
        type="text"
        size="small"
        icon={<LinkOutlined />}
        onClick={addLink}
        className={editor.isActive("link") ? "bg-gray-200" : ""}
        title="Insert link"
      />
    </div>
  );
}

export default function RichTextEditor({ value = "", onChange, placeholder, readOnly, ...rest }) {
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
    ],
    content: value || "",
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-3 py-2 focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      const html = editor.getHTML();
      onChange?.(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external value into editor (e.g. form reset or translate)
  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const current = editor.getHTML();
    const next = value == null || value === "" ? "" : value;
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  if (!editor) return <div style={{ minHeight: EDITOR_MIN_HEIGHT }} className="border border-gray-200 rounded" />;

  return (
    <div
      className="rich-text-editor-wrapper border border-gray-200 rounded p-2 bg-white"
      style={{ minHeight: EDITOR_MIN_HEIGHT }}
      {...rest}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .rich-text-editor-wrapper [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #bfbfbf;
        }
        .rich-text-editor-wrapper .ProseMirror {
          min-height: ${EDITOR_CONTENT_MIN_HEIGHT}px;
        }
        .rich-text-editor-wrapper .ProseMirror p {
          margin: 0.25em 0;
        }
        .rich-text-editor-wrapper .ProseMirror ul,
        .rich-text-editor-wrapper .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.25em 0;
        }
        .rich-text-editor-wrapper .ProseMirror a {
          color: #1890ff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
