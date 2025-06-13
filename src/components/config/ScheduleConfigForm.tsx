import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "../ui/checkbox";
import type { ConfigState, ScheduleConfig } from "@/types/config";
import { formatDate, updateNestedConfig } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RefreshCw } from "lucide-react";

interface ScheduleConfigFormProps {
  config: ConfigState;
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>;
  onAutoSave?: (config: ConfigState) => Promise<void>;
  isAutoSaving?: boolean;
}

export function ScheduleConfigForm({
  config,
  setConfig,
  onAutoSave,
  isAutoSaving = false,
}: ScheduleConfigFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const newConfig = updateNestedConfig(config, name, newValue);
    setConfig(newConfig);

    if (onAutoSave) {
      onAutoSave(newConfig);
    }
  };

  // Predefined intervals
  const intervals: { value: number; label: string }[] = [
    { value: 3600, label: "1 hour" },
    { value: 7200, label: "2 hours" },
    { value: 14400, label: "4 hours" },
    { value: 28800, label: "8 hours" },
    { value: 43200, label: "12 hours" },
    { value: 86400, label: "1 day" },
    { value: 172800, label: "2 days" },
    { value: 604800, label: "1 week" },
  ];

  return (
    <Card className="self-start">
      <CardContent className="pt-6 relative">
        {isAutoSaving && (
          <div className="absolute top-4 right-4 flex items-center text-sm text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            <span className="text-xs">Auto-saving...</span>
          </div>
        )}
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center">
            <Checkbox
              id="enabled"
              name="scheduleConfig.enabled"
              checked={config.scheduleConfig.enabled}
              onCheckedChange={(checked) =>
                handleChange({
                  target: {
                    name: "scheduleConfig.enabled",
                    type: "checkbox",
                    checked: Boolean(checked),
                    value: "",
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            />
            <label
              htmlFor="enabled"
              className="select-none ml-2 block text-sm font-medium"
            >
              Enable Automatic Mirroring
            </label>
          </div>

          {config.scheduleConfig.enabled && (
            <div>
              <label
                htmlFor="interval"
                className="block text-sm font-medium mb-1.5"
              >
                Mirroring Interval
              </label>

              <Select
                name="interval"
                value={String(config.scheduleConfig.interval)}
                onValueChange={(value) =>
                  handleChange({
                    target: { name: "scheduleConfig.interval", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              >
                <SelectTrigger className="w-full border border-input dark:bg-background dark:hover:bg-background">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border border-input shadow-sm">
                  {intervals.map((interval) => (
                    <SelectItem
                      key={interval.value}
                      value={interval.value.toString()}
                      className="cursor-pointer text-sm px-3 py-2 hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                    >
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground mt-1">
                How often the mirroring process should run.
              </p>
              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Sync Schedule:</strong> Repositories will be
                  synchronized at the specified interval. Choose shorter
                  intervals for frequently updated repositories, longer
                  intervals for stable ones.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Last Sync
              </label>
              <div className="text-sm">
                {config.scheduleConfig.lastRun
                  ? formatDate(config.scheduleConfig.lastRun)
                  : "Never"}
              </div>
            </div>

            {config.scheduleConfig.enabled && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Next Sync
                </label>
                <div className="text-sm">
                  {config.scheduleConfig.nextRun
                    ? formatDate(config.scheduleConfig.nextRun)
                    : "Never"}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
