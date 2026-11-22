import type {
  BlockTool,
  BlockToolConstructorOptions,
} from "@editorjs/editorjs";

import clsx from "clsx";

import { getArticleButtonUrl } from "@/lib/editorjs-parser/button";

const alignmentLabels = {
  left: "Слева",
  center: "По центру",
  right: "Справа",
} as const;

type ButtonData = {
  text: string;
  url: string;
  alignment: keyof typeof alignmentLabels;
  fullWidth: boolean;
};

export default class ButtonTool implements BlockTool {
  static get toolbox() {
    return {
      title: "Кнопка",
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="5.5" width="15" height="9" rx="3"/><path d="M6 10h8m-3-2.5L14 10l-3 2.5"/></svg>',
    };
  }

  static get sanitize() {
    return { text: false, url: false, alignment: false, fullWidth: false };
  }

  private alignment: ButtonData["alignment"];
  private fullWidth: boolean;
  private preview?: HTMLDivElement;

  constructor(
    private options: BlockToolConstructorOptions<Partial<ButtonData>>,
  ) {
    const { alignment, fullWidth } = options.data;

    this.alignment =
      alignment === "center" || alignment === "right" ? alignment : "left";
    this.fullWidth = fullWidth === true;
  }

  render(): HTMLElement {
    const container = document.createElement("div");
    container.className = "grid gap-2 sm:grid-cols-2";

    const preview = document.createElement("div");
    preview.setAttribute("aria-hidden", "true");
    const previewButton = document.createElement("span");
    previewButton.className = "button button--primary no-underline";
    previewButton.textContent = this.options.data.text?.trim() || "Кнопка";
    preview.append(previewButton);
    this.preview = preview;
    this.updatePreviewLayout();

    for (const [name, title, placeholder] of [
      ["text", "Текст кнопки", "Например, открыть вишлисты"],
      ["url", "Ссылка", "https://example.com или /wishlists"],
    ] as const) {
      const label = document.createElement("label");
      label.className = "grid gap-1 text-sm";
      label.textContent = title;

      const input = document.createElement("input");
      input.className = "cdx-input";
      input.name = name;
      input.placeholder = placeholder;
      input.value = this.options.data[name] ?? "";
      if (name === "text") {
        input.addEventListener("input", () => {
          previewButton.textContent = input.value.trim() || "Кнопка";
        });
      }
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      label.append(input);
      container.append(label);
    }

    container.append(preview);
    return container;
  }

  private updatePreviewLayout() {
    if (!this.preview) return;

    this.preview.className = clsx("flex sm:col-span-2", {
      "justify-center": this.alignment === "center",
      "justify-end": this.alignment === "right",
    });
    this.preview.firstElementChild?.classList.toggle("w-full", this.fullWidth);
  }

  renderSettings() {
    return [
      ...(["left", "center", "right"] as const).map((alignment) => ({
        name: alignment,
        title: alignmentLabels[alignment],
        toggle: "alignment",
        isActive: () => this.alignment === alignment,
        onActivate: () => {
          this.alignment = alignment;
          this.updatePreviewLayout();
          this.options.block.dispatchChange();
        },
      })),
      {
        name: "fullWidth",
        title: "На всю ширину",
        toggle: true,
        isActive: () => this.fullWidth,
        onActivate: () => {
          this.fullWidth = !this.fullWidth;
          this.updatePreviewLayout();
          this.options.block.dispatchChange();
        },
      },
    ];
  }

  save(container: HTMLElement): ButtonData {
    return {
      text: container
        .querySelector<HTMLInputElement>('[name="text"]')!
        .value.trim(),
      url: container
        .querySelector<HTMLInputElement>('[name="url"]')!
        .value.trim(),
      alignment: this.alignment,
      fullWidth: this.fullWidth,
    };
  }

  validate({ text, url }: ButtonData): boolean {
    return Boolean(text && getArticleButtonUrl(url));
  }
}
