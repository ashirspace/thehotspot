import { useState } from "react";
import { Badge, Card } from "../../components/ui";
import { leads as initialLeads } from "../../data/demo";
import type { LeadStatus } from "../../types";

const stages: LeadStatus[] = ["new", "contacted", "replied", "booked", "closed", "lost"];

export function CrmPage() {
  const [items, setItems] = useState(initialLeads);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1] tracking-[-0.02em]">CRM Lite</h1>
        <p className="mt-2 text-slate-600">Lead pipeline from new contact to booked or closed outcome.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-6">
        {stages.map((stage) => (
          <Card key={stage} className="min-h-72">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold capitalize">{stage}</h2>
              <Badge>{items.filter((lead) => lead.status === stage).length}</Badge>
            </div>
            <div className="space-y-3">
              {items.filter((lead) => lead.status === stage).map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      current.map((item) =>
                        item.id === lead.id
                          ? { ...item, status: stages[Math.min(stages.indexOf(item.status) + 1, stages.length - 1)] }
                          : item,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-[var(--orange)]"
                >
                  <div className="text-sm font-semibold">{lead.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{lead.company}</div>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
