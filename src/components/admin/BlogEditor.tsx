"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize } from "@/lib/admin/tiptap-font-size";
import { CalloutBlock } from "@/lib/admin/tiptap-callout";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaFile } from "@/lib/admin/repositories/media.repository";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Info,
  AlertTriangle,
  Lightbulb,
  Underline as UnderlineIcon,
  Strikethrough,
  Palette,
  Type,
} from "lucide-react";

type BlogEditorProps = {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>, html: string) => void;
};

export function BlogEditor({ content, onChange }: BlogEditorProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto" },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#2b5cff] underline" },
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CalloutBlock,
    ],
    content: content ?? undefined,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as Record<string, unknown>, ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[400px] px-5 py-4 focus:outline-none text-[#0f172a] prose-headings:text-[#0f172a] prose-p:text-[#475569] prose-li:text-[#475569] prose-a:text-[#2b5cff]",
      },
    },
  });

  if (!editor) {
    return <div className="h-[400px] animate-pulse rounded-lg bg-[#f1f5f9]" />;
  }

  const addLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    setShowImagePicker(true);
  };

  const handleImageSelected = (media: MediaFile | null) => {
    if (media && editor) {
      editor.chain().focus().setImage({ src: media.publicUrl, alt: media.altText ?? media.originalFilename }).run();
    }
    setShowImagePicker(false);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
      {/* Toolbar */}
      <div className="relative flex flex-wrap items-center gap-0.5 border-b border-[#e2e8f0] bg-[#f8fafc] px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold — Make text stand out. Use for key terms, important numbers, or emphasis."
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic — Subtle emphasis. Use for book titles, technical terms, or soft highlights."
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline — Emphasize important text. Use sparingly."
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough — Show removed or outdated information."
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const color = window.prompt("Enter color (e.g. #ff0000, red, blue):");
            if (color) editor.chain().focus().setColor(color).run();
          }}
          title="Text Color — Change text color. Enter hex (#ff0000) or name (red, blue)."
        >
          <Palette className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const sizes: Record<string, string> = { small: "14px", normal: "16px", large: "20px", xlarge: "24px" };
            const size = window.prompt("Size: small, normal, large, xlarge");
            if (size && sizes[size]) editor.chain().focus().setFontSize(sizes[size]).run();
          }}
          title="Font Size — Change text size (small/normal/large/xlarge)."
        >
          <Type className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Section Heading (H2) — Main sections of your article. Google uses these for SEO and Table of Contents."
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Sub-heading (H3) — Subsections within a main section. Improves readability and scanning."
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List — Unordered list for features, benefits, or steps without sequence."
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List — Ordered steps, rankings, or sequential instructions."
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote Block — Highlight an expert quote, statistic, or key statement from a source."
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider Line — Visual separator between sections. Helps readers know a new topic starts."
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insert Link — Add a clickable link to another page or website. Good for internal linking (SEO) and references.">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert Image — Upload or select an image from the Media Library. Breaks up text and improves engagement.">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        {/* Inline image picker - appears below toolbar when active */}
        {showImagePicker && (
          <div className="absolute left-0 right-0 top-full z-10 border-b border-[#e2e8f0] bg-[#f8fafc] p-3">
            <p className="mb-2 text-xs font-medium text-[#64748b]">Insert image from Media Library:</p>
            <MediaPicker value={null} onChange={handleImageSelected} placeholder="Upload or select an image" />
            <button type="button" onClick={() => setShowImagePicker(false)} className="mt-2 text-xs text-[#94a3b8] hover:text-red-500">Cancel</button>
          </div>
        )}
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: "callout", attrs: { type: "info" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Key information here..." }] }] }).run()}
          title="ℹ️ Info Box — Highlight key facts, definitions, or important information readers shouldn't miss."
        >
          <Info className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: "callout", attrs: { type: "warning" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Warning: important note here..." }] }] }).run()}
          title="⚠️ Warning Box — Alert readers about common mistakes, risks, or things to avoid."
        >
          <AlertTriangle className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertContent({ type: "callout", attrs: { type: "tip" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Pro tip here..." }] }] }).run()}
          title="💡 Pro Tip Box — Share expert advice, shortcuts, or insider tips that add extra value."
        >
          <Lightbulb className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo — Reverse your last change. Press Ctrl+Z as a shortcut.">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo — Bring back a change you just undid. Press Ctrl+Y as a shortcut.">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-[#2b5cff]/10 text-[#2b5cff]"
          : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-[#e2e8f0]" />;
}
