export type ProfileRole = "athlete" | "coach" | "club" | "association";

export type ProfileSummary = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_verified?: boolean;
  primary_sport?: string;
};

export type Profile = ProfileSummary & {
  role: ProfileRole;
  bio: string;
  location: string;
  primary_sport: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
};

export type DirectoryProfile = Profile & { viewer_follows?: boolean };

export type PostMedia = {
  id: string;
  url: string | null;
  media_type: "image" | "video";
  sort_order: number;
};

export type Post = {
  id: string;
  content: string;
  visibility: "public" | "network";
  author_id: string;
  created_at: string;
  author: ProfileSummary | null;
  media: PostMedia[];
  reaction_count: number;
  comment_count: number;
  viewer_reacted: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: ProfileSummary | null;
};

export type OpportunityType = "trial" | "scholarship" | "scouting" | "camp" | "training_program" | "competition" | "other";

export type Opportunity = {
  id: string;
  created_by: string;
  title: string;
  organization: string;
  description: string;
  sport: string;
  type: OpportunityType;
  location: string;
  deadline: string | null;
  status: "draft" | "published" | "closed";
  created_at: string;
  creator: ProfileSummary | null;
};

export type AppNotification = {
  id: string;
  actor_id: string | null;
  type: string;
  entity_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  actor: ProfileSummary | null;
};

export type ConversationSummary = {
  id: string;
  created_at: string;
  participants: ProfileSummary[];
  last_message: { content: string; created_at: string; sender_id: string } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type Viewer = Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "role" | "primary_sport" | "location" | "bio" | "is_verified">;
