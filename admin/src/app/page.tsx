import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Good morning, Jonas</h1>
        <p className="text-muted-foreground">Here is your Company Digital Twin status for today.</p>
      </div>

      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass border-white/5 bg-black/20">
          <CardHeader>
            <CardTitle className="text-xl">Business Brain Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time cross-department intelligence</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-lg">
              <p className="text-muted-foreground text-sm">3D Digital Twin Visualization (Three.js) will render here in Phase 5</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-black/20">
          <CardHeader>
            <CardTitle>AI Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="bg-rose-500/20 text-rose-500 hover:bg-rose-500/30">High Priority</Badge>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">Approve Payroll for July</h4>
                  <p className="text-xs text-muted-foreground">The AI has verified all attendance logs against biometric data. 2 anomalies resolved.</p>
                  <button className="text-xs text-primary font-medium hover:underline text-left mt-1">Review & Approve &rarr;</button>
                </div>

                <Separator className="bg-white/5" />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">Opportunity</Badge>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">Inventory Restock (Laptops)</h4>
                  <p className="text-xs text-muted-foreground">Predicted shortage in 14 days based on recent sales velocity. Suggested PO created.</p>
                  <button className="text-xs text-primary font-medium hover:underline text-left mt-1">View Purchase Order &rarr;</button>
                </div>

                <Separator className="bg-white/5" />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">Insight</Badge>
                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">Tax Compliance Check</h4>
                  <p className="text-xs text-muted-foreground">FDRE VAT report generated and ready for your final signature.</p>
                  <button className="text-xs text-primary font-medium hover:underline text-left mt-1">View Report &rarr;</button>
                </div>

              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
