import { Badge } from "@/components/ui/badge";
export function StatusBadge({ status }: { status: string }) { return <Badge tone={status}>{status.replace("_", " ")}</Badge>; }
