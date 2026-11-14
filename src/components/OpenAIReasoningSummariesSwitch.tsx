import { useSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function OpenAIReasoningSummariesSwitch() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="openai-reasoning-summaries"
        aria-label="OpenAI Reasoning Summaries"
        checked={!settings?.disableOpenAIReasoningSummaries}
        onCheckedChange={(checked) => {
          updateSettings({ disableOpenAIReasoningSummaries: !checked });
        }}
      />
      <Label htmlFor="openai-reasoning-summaries">
        OpenAI Reasoning Summaries
      </Label>
    </div>
  );
}
