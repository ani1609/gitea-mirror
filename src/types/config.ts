import { type Config as ConfigType } from "@/lib/db/schema";

export type GiteaOrgVisibility = "public" | "private" | "limited";

export interface GiteaConfig {
  url: string;
  username: string;
  token: string;
  organization: string;
  visibility: GiteaOrgVisibility;
  starredReposOrg: string;
  preserveOrgStructure: boolean;
}

export interface ScheduleConfig {
  enabled: boolean;
  interval: number;
  lastRun?: Date;
  nextRun?: Date;
}

export interface DatabaseCleanupConfig {
  enabled: boolean;
  retentionDays: number; // Actually stores seconds, but keeping the name for compatibility
  lastRun?: Date;
  nextRun?: Date;
}

export interface GitHubConfig {
  username: string;
  token: string;
  privateRepositories: boolean;
  mirrorStarred: boolean;
}

export interface MirrorOptions {
  mirrorReleases: boolean;
  mirrorMetadata: boolean;
  metadataComponents: {
    issues: boolean;
    pullRequests: boolean;
    labels: boolean;
    milestones: boolean;
    wiki: boolean;
  };
}

export interface AdvancedOptions {
  skipForks: boolean;
  skipStarredIssues: boolean;
}

export interface SaveConfigApiRequest {
  userId: string;
  githubConfig?: GitHubConfig;
  giteaConfig?: GiteaConfig;
  scheduleConfig?: ScheduleConfig;
  cleanupConfig?: DatabaseCleanupConfig;
  mirrorOptions?: MirrorOptions;
  advancedOptions?: AdvancedOptions;
}

export interface SaveConfigApiResponse {
  success: boolean;
  message: string;
}

export interface Config extends ConfigType {}

export interface ConfigApiRequest {
  userId: string;
}

export interface ConfigApiResponse {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  githubConfig: GitHubConfig;
  giteaConfig: GiteaConfig;
  scheduleConfig: ScheduleConfig;
  cleanupConfig: DatabaseCleanupConfig;
  mirrorOptions?: MirrorOptions;
  advancedOptions?: AdvancedOptions;
  include: string[];
  exclude: string[];
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export type ConfigState = {
  githubConfig: GitHubConfig;
  giteaConfig: GiteaConfig;
  scheduleConfig: ScheduleConfig;
  cleanupConfig: DatabaseCleanupConfig;
  mirrorOptions: MirrorOptions;
  advancedOptions: AdvancedOptions;
};
