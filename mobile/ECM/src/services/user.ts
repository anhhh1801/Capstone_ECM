import api from "../utils/axiosConfig";

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users/admin/all");
  return response.data;
};
