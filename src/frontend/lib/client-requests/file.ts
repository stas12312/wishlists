import { clientAxios } from "./base";

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await clientAxios.post("/images/upload", form);
  return response.data.image_url ?? "";
}
