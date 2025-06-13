import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { giteaApi } from "@/lib/api";
import type { ConfigState, GiteaOrgVisibility } from "@/types/config";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { updateNestedConfig } from "@/lib/utils";

interface RightConfigFormProps {
  config: ConfigState;
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>;
  onAutoSave?: (config: ConfigState) => Promise<void>;
  isAutoSaving?: boolean;
}

export function RightConfigForm({
  config,
  setConfig,
  onAutoSave,
  isAutoSaving,
}: RightConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Special toast case
    if (
      name === "giteaConfig.preserveOrgStructure" &&
      config.giteaConfig.preserveOrgStructure !== checked
    ) {
      toast.info(
        "Changing this setting may affect how repositories are accessed in Gitea. " +
          "Existing mirrored repositories will still be accessible during sync operations.",
        {
          duration: 6000,
          position: "top-center",
        }
      );
    }

    const newConfig = updateNestedConfig(config, name, newValue);
    setConfig(newConfig);

    if (onAutoSave) {
      onAutoSave(newConfig);
    }
  };

  return (
    <Card className="w-full self-start">
      {/* {min height to keep both left and right headers at same height} */}
      <CardHeader className="flex flex-row items-center justify-between gap-4 min-h-[84px]">
        <CardTitle className="text-lg font-semibold">Mirror Options</CardTitle>
        {/* <Button
          type="button"
          variant="outline"
          onClick={testConnection}
          disabled={
            isLoading || !config.giteaConfig.url || !config.giteaConfig.token
          }
        >
          {isLoading ? "Testing..." : "Test Connection"}
        </Button> */}
      </CardHeader>

      <CardContent className="flex flex-col gap-y-6">
        <div>
          <label
            htmlFor="organization"
            className="block text-sm font-medium mb-1.5"
          >
            Destination organisation (optional)
          </label>
          <input
            id="organization"
            name="giteaConfig.organization"
            type="text"
            value={config.giteaConfig.organization}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Organization name"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Repos are created here if no per-repo org is set.
          </p>
        </div>

        <div className="flex items-center">
          <Checkbox
            id="preserve-org-structure"
            name="giteaConfig.preserveOrgStructure"
            checked={config.giteaConfig.preserveOrgStructure}
            onCheckedChange={(checked) =>
              handleChange({
                target: {
                  name: "preserveOrgStructure",
                  type: "checkbox",
                  checked: Boolean(checked),
                  value: "",
                },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          />
          <label
            htmlFor="preserve-org-structure"
            className="ml-2 text-sm select-none flex items-center"
          >
            Mirror GitHub org / team hierarchy
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="ml-1 cursor-pointer align-middle text-muted-foreground"
                  role="button"
                  tabIndex={0}
                >
                  <Info size={16} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs text-xs">
                Creates nested orgs or prefixes in Gitea so the layout matches
                GitHub. When enabled, organization repositories will be mirrored
                to the same organization structure in Gitea. When disabled, all
                repositories will be mirrored under your Gitea username.
              </TooltipContent>
            </Tooltip>
          </label>
        </div>

        <div>
          <label
            htmlFor="visibility"
            className="block text-sm font-medium mb-1.5"
          >
            Organization Visibility
          </label>
          <Select
            name="giteaConfig.visibility"
            value={config.giteaConfig.visibility}
            onValueChange={(value) =>
              handleChange({
                target: { name: "giteaConfig.visibility", value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          >
            <SelectTrigger className="w-full border border-input dark:bg-background dark:hover:bg-background">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border border-input shadow-sm">
              {(["public", "private", "limited"] as GiteaOrgVisibility[]).map(
                (option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="cursor-pointer text-sm px-3 py-2 hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="starred-repos-org"
            className="block text-sm font-medium mb-1.5"
          >
            Starred Repositories Organization
          </label>
          <input
            id="starred-repos-org"
            name="giteaConfig.starredReposOrg"
            type="text"
            value={config.giteaConfig.starredReposOrg}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="github"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave blank to use 'github'.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Repository Content
          </h4>

          <div className="flex justify-between gap-x-4 items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <Checkbox
                  id="mirror-metadata"
                  checked={config.mirrorOptions.mirrorMetadata}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "mirrorOptions.mirrorMetadata",
                        type: "checkbox",
                        checked: Boolean(checked),
                        value: "",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                />
                <label
                  htmlFor="mirror-metadata"
                  className="ml-2 text-sm select-none flex items-center"
                >
                  Mirror metadata
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 cursor-pointer text-muted-foreground">
                        <Info size={14} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      Include issues, pull requests, labels, milestones, and
                      wiki
                    </TooltipContent>
                  </Tooltip>
                </label>
              </div>

              {/* Metadata Components */}
              <div className="mt-3 ml-6 space-y-3 border-l-2 border-muted pl-4">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Metadata Components
                </h5>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="metadata-issues"
                      checked={config.mirrorOptions.metadataComponents.issues}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: "mirrorOptions.metadataComponents.issues",
                            type: "checkbox",
                            checked: Boolean(checked),
                            value: "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      disabled={!config.mirrorOptions.mirrorMetadata}
                    />
                    <label
                      htmlFor="metadata-issues"
                      className="ml-2 text-sm select-none"
                    >
                      Issues
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="metadata-pullRequests"
                      checked={
                        config.mirrorOptions.metadataComponents.pullRequests
                      }
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: "mirrorOptions.metadataComponents.pullRequests",
                            type: "checkbox",
                            checked: Boolean(checked),
                            value: "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      disabled={!config.mirrorOptions.mirrorMetadata}
                    />
                    <label
                      htmlFor="metadata-pullRequests"
                      className="ml-2 text-sm select-none"
                    >
                      Pull requests
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="metadata-labels"
                      checked={config.mirrorOptions.metadataComponents.labels}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: "mirrorOptions.metadataComponents.labels",
                            type: "checkbox",
                            checked: Boolean(checked),
                            value: "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      disabled={!config.mirrorOptions.mirrorMetadata}
                    />
                    <label
                      htmlFor="metadata-labels"
                      className="ml-2 text-sm select-none"
                    >
                      Labels
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="metadata-milestones"
                      checked={
                        config.mirrorOptions.metadataComponents.milestones
                      }
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: "mirrorOptions.metadataComponents.milestones",
                            type: "checkbox",
                            checked: Boolean(checked),
                            value: "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      disabled={!config.mirrorOptions.mirrorMetadata}
                    />
                    <label
                      htmlFor="metadata-milestones"
                      className="ml-2 text-sm select-none"
                    >
                      Milestones
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="metadata-wiki"
                      checked={config.mirrorOptions.metadataComponents.wiki}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: "mirrorOptions.metadataComponents.wiki",
                            type: "checkbox",
                            checked: Boolean(checked),
                            value: "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      disabled={!config.mirrorOptions.mirrorMetadata}
                    />
                    <label
                      htmlFor="metadata-wiki"
                      className="ml-2 text-sm select-none"
                    >
                      Wiki
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center">
                <Checkbox
                  id="mirror-releases"
                  checked={config.mirrorOptions.mirrorReleases}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "mirrorOptions.mirrorReleases",
                        type: "checkbox",
                        checked: Boolean(checked),
                        value: "",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                />
                <label
                  htmlFor="mirror-releases"
                  className="ml-2 text-sm select-none flex items-center"
                >
                  Mirror releases
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 cursor-pointer text-muted-foreground">
                        <Info size={14} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      Include GitHub releases and tags in the mirror
                    </TooltipContent>
                  </Tooltip>
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="skip-forks"
                  checked={config.advancedOptions.skipForks}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "advancedOptions.skipForks",
                        type: "checkbox",
                        checked: Boolean(checked),
                        value: "",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                />
                <label
                  htmlFor="skip-forks"
                  className="ml-2 text-sm select-none"
                >
                  Skip forks
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="skip-starred-issues"
                  checked={config.advancedOptions.skipStarredIssues}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "advancedOptions.skipStarredIssues",
                        type: "checkbox",
                        checked: Boolean(checked),
                        value: "",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                />
                <label
                  htmlFor="skip-starred-issues"
                  className="ml-2 text-sm select-none"
                >
                  Don't fetch issues for starred repos
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
