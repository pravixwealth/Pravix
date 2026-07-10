import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutType = "info" | "warning" | "tip";

/**
 * Tiptap Callout Block Extension
 * Renders as colored boxes: Info (blue), Warning (amber), Tip (green)
 * Usage in editor: toolbar button inserts a callout node
 * Renders as: <div data-callout="info|warning|tip" class="callout-*">...</div>
 */
export const CalloutBlock = Node.create({
  name: "callout",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-callout") || "info",
        renderHTML: (attributes) => ({ "data-callout": attributes.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes["data-callout"] || "info";
    const classes: Record<string, string> = {
      info: "callout-info",
      warning: "callout-warning",
      tip: "callout-tip",
    };
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: classes[type] || "callout-info" }),
      0,
    ];
  },
});
