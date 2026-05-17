import axios from "axios";

export async function findLeads(query) {
  const res = await axios.post("/api/find-leads", { query });
  return res.data.leads || res.data.results || res.data || [];
}
