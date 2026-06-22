export type ContactStatus = "new" | "contacted" | "follow_up" | "replied" | "qualified" | "not_interested";

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title: string;
  status: ContactStatus;
  notes: string;
  created_at: string;
};

export type FollowUp = {
  id: string;
  contact_id: string;
  contact_name: string;
  company: string;
  subject: string;
  follow_up_due: string;
};

export type Campaign = {
  id: string;
  name: string;
  status: "draft" | "active" | "completed";
  sent_count: number;
  reply_count: number;
  created_at: string;
};
