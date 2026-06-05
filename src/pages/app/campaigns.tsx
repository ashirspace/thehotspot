import { Link } from "react-router-dom";
import { Badge, Button, Card } from "../../components/ui";
import { useCampaigns } from "../../lib/data-hooks";
import { percent } from "../../lib/utils";

export function CampaignsPage() {
  const campaignsQuery = useCampaigns();
  const campaigns = campaignsQuery.data || [];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading italic text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1] tracking-[-0.02em]">Campaigns</h1>
          <p className="mt-2 text-slate-600">Create, pause, monitor, and optimize outbound campaigns.</p>
        </div>
        <Link to="/app/sequences"><Button>Create sequence</Button></Link>
      </div>
      <Card className="p-0">
        <div className="overflow-hidden">
          {campaignsQuery.isLoading ? (
            <div className="p-5 text-sm text-slate-500">Loading campaigns...</div>
          ) : campaignsQuery.isError ? (
            <div className="p-5 text-sm text-red-700">Could not load campaigns.</div>
          ) : campaigns.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">No campaigns yet.</div>
          ) : campaigns.map((campaign) => (
            <div key={campaign.id} className="grid gap-3 border-b border-slate-100 p-5 last:border-b-0 lg:grid-cols-[1.4fr_100px_repeat(4,1fr)_120px] lg:items-center">
              <div>
                <div className="font-semibold">{campaign.name}</div>
                <div className="text-sm text-slate-500">Stops immediately on reply, bounce, unsubscribe, or pause.</div>
              </div>
              <Badge tone={campaign.status === "active" ? "green" : "slate"}>{campaign.status}</Badge>
              <Stat label="Sent" value={String(campaign.sent)} />
              <Stat label="Delivered" value={percent(campaign.delivered, campaign.sent)} />
              <Stat label="Replied" value={percent(campaign.replied, campaign.sent)} />
              <Stat label="Booked" value={String(campaign.booked)} />
              <Button variant="secondary">Open</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
