"use client";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import { useEffect, useRef } from "react";

import { uploadFile } from "@/lib/client-requests/file";

export default function Editor({
  value,
  onChange,
  holder = "editorjs",
}: {
  value?: OutputData;
  onChange: { (value: object): void };
  holder?: string;
}) {
  const editorRef = useRef<null | EditorJS>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editorInstance = new EditorJS({
        holder: holder,
        data: value,
        tools: {
          header: Header,
          list: List,
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
        onReady: () => {},
        async onChange(api, event) {
          const data = await api.saver.save();
          onChange(data);
        },
      });
      editorRef.current = editorInstance;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
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
      }`}</style>
      <div className="w-full">
        <div className="bg-content1 rounded-xl mx-auto" id={holder} />
      </div>
    </>
  );
}
