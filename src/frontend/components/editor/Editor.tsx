"use client";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import { useEffect, type RefObject } from "react";

import ButtonTool from "./ButtonTool";

import { uploadFile } from "@/lib/client-requests/file";

export default function Editor({
  value,
  editorRef,
  holder = "editorjs",
}: {
  value?: OutputData;
  editorRef: RefObject<EditorJS | null>;
  holder?: string;
}) {
  useEffect(() => {
    if (!editorRef.current) {
      const editorInstance = new EditorJS({
        holder: holder,
        data: value,
        i18n: {
          messages: {
            tools: {
              image: {
                "Stretch image": "На всю ширину",
              },
            },
          },
        },
        tools: {
          header: Header,
          list: List,
          button: ButtonTool,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const savedFile = await uploadFile(file);
                  return {
                    success: 1,
                    file: {
                      url: savedFile,
                    },
                  };
                },
              },
            },
          },
        },
        minHeight: 300,
      });
      editorRef.current = editorInstance;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <style type="text/css">{`    
      .codex-editor h1 {
        font-size: var(--text-3xl);
        font-weight: var(--font-weight-bold)
      }
      .codex-editor h2 {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold)
      }
      .codex-editor h3 {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold)
      }
      .article-editor .ce-block--stretched .ce-block__content {
        max-width: 650px;
      }
      .article-editor .image-tool .image-tool__image-picture {
        margin-inline: auto;
        max-width: min(70%, 32rem);
      }
      .article-editor .image-tool--stretched .image-tool__image-picture {
        width: 100%;
        max-width: 100%;
      }`}</style>
      <div className="w-full">
        <div
          className="article-editor bg-content1 rounded-xl mx-auto"
          id={holder}
        />
      </div>
    </>
  );
}
