import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { giteaApi, githubApi } from "@/lib/api";
import type { ConfigState } from "@/types/config";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { updateNestedConfig } from "@/lib/utils";

interface LeftConfigFormProps {
  config: ConfigState;
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>;
  onAutoSave?: (config: ConfigState) => Promise<void>;
  isAutoSaving?: boolean;
}

export function LeftConfigForm({
  config,
  setConfig,
  onAutoSave,
  isAutoSaving,
}: LeftConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const newConfig = updateNestedConfig(config, name, newValue);

    setConfig(newConfig);

    if (onAutoSave) {
      onAutoSave(newConfig);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);

    try {
      // Test GitHub connection
      if (!config.githubConfig.token) {
        toast.error("GitHub token is required to test the connection");
      } else {
        const githubResult = await githubApi.testConnection(
          config.githubConfig.token
        );
        if (githubResult.success) {
          toast.success("Successfully connected to GitHub!");
        } else {
          toast.error("Failed to connect to GitHub. Please check your token.");
        }
      }

      // Test Gitea connection
      if (!config.giteaConfig.url || !config.giteaConfig.token) {
        toast.error("Gitea URL and token are required to test the connection");
      } else {
        const giteaResult = await giteaApi.testConnection(
          config.giteaConfig.url,
          config.giteaConfig.token
        );
        if (giteaResult.success) {
          toast.success("Successfully connected to Gitea!");
        } else {
          toast.error(
            "Failed to connect to Gitea. Please check your URL and token."
          );
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full self-start">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Git Options</CardTitle>
        <Button
          type="button"
          variant="outline"
          onClick={testConnection}
          disabled={isLoading || !config.githubConfig.token}
        >
          {isLoading ? "Testing..." : "Test Connection"}
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-y-6">
        <div>
          <label
            htmlFor="github-username"
            className="block text-sm font-medium mb-1.5"
          >
            GitHub Username
          </label>
          <Input
            id="github-username"
            name="githubConfig.username"
            type="text"
            value={config.githubConfig.username}
            onChange={handleChange}
            placeholder="Your GitHub username"
            required
            className="bg-background"
          />
        </div>

        <div>
          <label
            htmlFor="github-token"
            className="block text-sm font-medium mb-1.5"
          >
            GitHub Token
          </label>

          <div className="relative">
            <Input
              id="github-token"
              name="githubConfig.token"
              type="password"
              value={config.githubConfig.token}
              onChange={handleChange}
              className="bg-background"
              placeholder="Your GitHub personal access token"
            />

            <Tooltip>
              <TooltipTrigger className="absolute flex items-center justify-center right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                <Info className="inline h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>

              <TooltipContent side="right">
                <div className="font-semibold mb-1">Note:</div>
                <div className="mb-1">
                  You need to create a{" "}
                  <span className="font-semibold">
                    Classic GitHub PAT Token
                  </span>{" "}
                  with following scopes:
                </div>
                <ul className="ml-4 mb-1 list-disc">
                  <li>
                    <code>repo</code>
                  </li>
                  <li>
                    <code>admin:org</code>
                  </li>
                </ul>
                <div className="mb-1">
                  The organization access is required for mirroring organization
                  repositories.
                </div>
                <div>
                  You can generate tokens at{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    github.com/settings/tokens
                  </a>
                  .
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Required for private repositories, organizations, and starred
            repositories.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Repository Access
          </h4>

          <div className="space-y-3">
            <div className="flex items-center">
              <Checkbox
                id="private-repositories"
                name="githubConfig.privateRepositories"
                checked={config.githubConfig.privateRepositories}
                onCheckedChange={(checked) =>
                  handleChange({
                    target: {
                      name: "githubConfig.privateRepositories",
                      type: "checkbox",
                      checked: Boolean(checked),
                      value: "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              <label
                htmlFor="private-repositories"
                className="ml-2 block text-sm select-none"
              >
                Include private repos
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="mirror-starred"
                name="githubConfig.mirrorStarred"
                checked={config.githubConfig.mirrorStarred}
                onCheckedChange={(checked) =>
                  handleChange({
                    target: {
                      name: "githubConfig.mirrorStarred",
                      type: "checkbox",
                      checked: Boolean(checked),
                      value: "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              <label
                htmlFor="mirror-starred"
                className="ml-2 block text-sm select-none"
              >
                Include starred repos
              </label>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="gitea-username"
            className="block text-sm font-medium mb-1.5"
          >
            Gitea Username
          </label>
          <input
            id="gitea-username"
            name="giteaConfig.username"
            type="text"
            value={config.giteaConfig.username}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Your Gitea username"
            required
          />
        </div>

        <div>
          <label
            htmlFor="gitea-token"
            className="block text-sm font-medium mb-1.5"
          >
            Gitea Token
          </label>
          <input
            id="gitea-token"
            name="giteaConfig.token"
            type="password"
            value={config.giteaConfig.token}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Your Gitea access token"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Create a token in your Gitea instance under Settings &gt;
            Applications.
          </p>
        </div>

        <div>
          <label
            htmlFor="gitea-url"
            className="block text-sm font-medium mb-1.5"
          >
            Gitea URL
          </label>
          <input
            id="gitea-url"
            name="giteaConfig.url"
            type="url"
            value={config.giteaConfig.url}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="https://your-gitea-instance.com"
            required
          />
        </div>
      </CardContent>

      <CardFooter className="pb-2.5" />
    </Card>
  );
}
