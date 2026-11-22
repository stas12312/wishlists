import type {
  BlockTool,
  BlockToolConstructorOptions,
} from "@editorjs/editorjs";

import { getArticleButtonUrl } from "@/lib/editorjs-parser/button";

const alignmentLabels = {
  left: "Слева",
  center: "По центру",
  right: "Справа",
} as const;

const alignmentIconClasses = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
} as const;

type ButtonData = {
  text: string;
  url: string;
  alignment: string;
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

  constructor(
    private options: BlockToolConstructorOptions<Partial<ButtonData>>,
  ) {}

  render(): HTMLElement {
    const container = document.createElement("div");
    container.className = "grid gap-2 sm:grid-cols-2";

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
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      label.append(input);
      container.append(label);
    }

    const settings = document.createElement("div");
    settings.className =
      "mt-1 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-2xl bg-default/40 px-3 py-2 sm:col-span-2";
    settings.addEventListener("keydown", (event) => event.stopPropagation());

    const alignment = document.createElement("fieldset");
    alignment.className = "flex items-center gap-3";
    alignment.setAttribute("aria-label", "Выравнивание");

    const alignmentTitle = document.createElement("span");
    alignmentTitle.className = "text-xs font-medium text-muted";
    alignmentTitle.textContent = "Выравнивание";
    alignmentTitle.setAttribute("aria-hidden", "true");

    const segments = document.createElement("div");
    segments.className = "inline-flex gap-0.5 rounded-xl bg-surface p-0.5";

    const savedAlignment = this.options.data.alignment;
    const selectedAlignment =
      savedAlignment === "center" || savedAlignment === "right"
        ? savedAlignment
        : "left";

    for (const value of ["left", "center", "right"] as const) {
      const label = document.createElement("label");
      label.className = "relative cursor-pointer";
      label.title = alignmentLabels[value];

      const option = document.createElement("input");
      option.className = "peer sr-only";
      option.type = "radio";
      option.name = `alignment-${this.options.block.id}`;
      option.value = value;
      option.checked = value === selectedAlignment;
      option.setAttribute("aria-label", alignmentLabels[value]);

      const icon = document.createElement("span");
      icon.className =
        "flex size-8 items-center rounded-lg text-muted transition-colors hover:bg-default peer-checked:bg-accent-soft peer-checked:text-accent-soft-foreground peer-focus-visible:status-focused motion-reduce:transition-none";
      icon.setAttribute("aria-hidden", "true");

      const lines = document.createElement("span");
      lines.className = `mx-auto flex w-4 flex-col gap-0.5 ${alignmentIconClasses[value]}`;
      for (const width of ["w-full", "w-2.5", "w-full"]) {
        const line = document.createElement("span");
        line.className = `h-0.5 rounded-full bg-current ${width}`;
        lines.append(line);
      }

      icon.append(lines);
      label.append(option, icon);
      segments.append(label);
    }

    alignment.append(alignmentTitle, segments);

    const fullWidthLabel = document.createElement("label");
    fullWidthLabel.className =
      "relative flex cursor-pointer items-center gap-2 text-xs font-medium";

    const fullWidth = document.createElement("input");
    fullWidth.type = "checkbox";
    fullWidth.name = "fullWidth";
    fullWidth.className = "peer sr-only";
    fullWidth.setAttribute("role", "switch");
    fullWidth.checked = this.options.data.fullWidth === true;
    const track = document.createElement("span");
    track.className =
      "relative inline-flex h-5 w-9 shrink-0 rounded-full bg-default transition-colors before:absolute before:top-0.5 before:left-0.5 before:size-4 before:rounded-full before:bg-surface before:shadow-sm before:transition-transform peer-checked:bg-accent peer-checked:before:translate-x-4 peer-checked:before:bg-accent-foreground peer-focus-visible:status-focused motion-reduce:transition-none motion-reduce:before:transition-none";
    track.setAttribute("aria-hidden", "true");
    fullWidthLabel.append(fullWidth, track, "На всю ширину");

    settings.append(alignment, fullWidthLabel);
    container.append(settings);

    return container;
  }

  save(container: HTMLElement): ButtonData {
    return {
      text: container
        .querySelector<HTMLInputElement>('[name="text"]')!
        .value.trim(),
      url: container
        .querySelector<HTMLInputElement>('[name="url"]')!
        .value.trim(),
      alignment:
        container.querySelector<HTMLInputElement>('input[type="radio"]:checked')
          ?.value ?? "left",
      fullWidth:
        container.querySelector<HTMLInputElement>('[name="fullWidth"]')!
          .checked,
    };
  }

  validate({ text, url }: ButtonData): boolean {
    return Boolean(text && getArticleButtonUrl(url));
  }
}
