import axios from "axios";
import ApiResponse from "@/types/ApiResponse";
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as ApiResponse | undefined)?.message ?? fallback
    );
  }
  return fallback;
}
