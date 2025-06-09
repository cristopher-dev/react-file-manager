import { api } from "./api";

export const createFolderAPI = async (name, parentId) => {
  const response = await api.post("/folder", { name, parentId });
  return response;
};
