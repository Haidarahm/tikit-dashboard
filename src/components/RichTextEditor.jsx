import { useEffect, useRef, useState } from "react";
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

/**
 * Split HTML into segments: either a tag (e.g. "<b>", "</p>") or a text node.
 */
function splitHtmlSegments(html) {
  const segments = [];
  const re = /(<[^>]+>)|([^<]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1]) segments.push({ type: "tag", value: m[1] });
    else if (m[2]) segments.push({ type: "text", value: m[2] });
  }
  return segments;
}

/**
 * Translate HTML content while preserving structure (bold, links, lists).
 * translateFn(text) should return Promise<{ ar: string, fr: string }>.
 * Returns Promise<{ arHtml: string, frHtml: string }>.
 */
export async function translateHtmlPreservingStructure(html, translateFn) {
  if (!html || typeof html !== "string") return { arHtml: "", frHtml: "" };
  const segments = splitHtmlSegments(html);
  const arParts = [];
  const frParts = [];
  for (const seg of segments) {
    if (seg.type === "tag") {
      arParts.push(seg.value);
      frParts.push(seg.value);
    } else {
      const trimmed = seg.value.trim();
      if (!trimmed) {
        arParts.push(seg.value);
        frParts.push(seg.value);
        continue;
      }
      const leading = seg.value.slice(0, seg.value.indexOf(trimmed));
      const trailing = seg.value.slice(seg.value.indexOf(trimmed) + trimmed.length);
      try {
        const result = await translateFn(trimmed);
        const ar = result?.ar ?? trimmed;
        const fr = result?.fr ?? trimmed;
        arParts.push(leading + ar + trailing);
        frParts.push(leading + fr + trailing);
      } catch {
        arParts.push(seg.value);
        frParts.push(seg.value);
      }
    }
  }
  return { arHtml: arParts.join(""), frHtml: frParts.join("") };
}

function MenuBar({ editor }) {
  const addLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  const activeClass = "!bg-blue-100 !text-blue-700 border border-blue-300";
  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2 mb-2">
      <Button
        type="text"
        size="small"
        icon={<BoldOutlined />}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? activeClass : ""}
        title="Bold"
      />
      <Button
        type="text"
        size="small"
        icon={<ItalicOutlined />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? activeClass : ""}
        title="Italic"
      />
      <Button
        type="text"
        size="small"
        icon={<UnorderedListOutlined />}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? activeClass : ""}
        title="Bullet list"
      />
      <Button
        type="text"
        size="small"
        icon={<OrderedListOutlined />}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? activeClass : ""}
        title="Numbered list"
      />
      <Button
        type="text"
        size="small"
        icon={<LinkOutlined />}
        onClick={addLink}
        className={editor.isActive("link") ? activeClass : ""}
        title="Insert link"
      />
    </div>
  );
}

export default function RichTextEditor({ value = "", onChange, placeholder, readOnly, ...rest }) {
  const isInternalChange = useRef(false);
  const [, setToolbarUpdate] = useState(0);

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

  // Re-render toolbar when selection or content changes so active states (bold, italic, etc.) update
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => setToolbarUpdate((n) => n + 1);
    editor.on("selectionUpdate", onUpdate);
    editor.on("transaction", onUpdate);
    return () => {
      editor.off("selectionUpdate", onUpdate);
      editor.off("transaction", onUpdate);
    };
  }, [editor]);

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
        .rich-text-editor-wrapper .ProseMirror ul {
          list-style-type: disc;
          list-style-position: outside;
          padding-left: 1.5em;
          margin: 0.25em 0;
        }
        .rich-text-editor-wrapper .ProseMirror ul li {
          display: list-item;
          margin: 0.2em 0;
        }
        .rich-text-editor-wrapper .ProseMirror ol {
          list-style-type: decimal;
          list-style-position: outside;
          padding-left: 1.5em;
          margin: 0.25em 0;
        }
        .rich-text-editor-wrapper .ProseMirror ol li {
          display: list-item;
          margin: 0.2em 0;
        }
        .rich-text-editor-wrapper .ProseMirror a {
          color: #1890ff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
