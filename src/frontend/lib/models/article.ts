import { OutputData } from "@editorjs/editorjs";

export interface IArticle {
  id: number;
  title: string;
  description: string;
  content?: OutputData;
  create_at?: string;
  is_published: boolean;
  published_at?: string;
  image: string;
  slug: string;
}
