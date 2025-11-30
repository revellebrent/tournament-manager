import { api } from "@/utils/apiClient";

export async function submitApplication(payload) {
  return api.post("/api/applications", payload);
}
