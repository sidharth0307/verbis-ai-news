import api from "./axios";


export const getActiveSchedules = async () => {
  try {
    const { data } = await api.get("/schedules/active");
    return data;
  } catch (error) {
    console.error("Error fetching active schedules:", error);
    return [];
  }
};


export const getAllSchedules = async () => {
  try {
    const { data } = await api.get("/schedules/all");
    return data;
  } catch (error) {
    console.error("Error fetching all schedules:", error);
    return [];
  }
};


export const createSchedule = async (scheduleData) => {
  try {
    // Matches backend: exports.createSchedule
    const { data } = await api.post("/schedules/create", scheduleData);
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create schedule";
    console.error("Schedule creation error:", message);
    throw new Error(message);
  }
};


export const deleteSchedule = async (id) => {
  try {
    // Matches backend: exports.deleteSchedule
    const { data } = await api.delete(`/schedules/${id}`);
    return data;
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};