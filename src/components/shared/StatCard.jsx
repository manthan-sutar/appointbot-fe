import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function StatCard({ label, value, sublabel, variant = 'default' }) {
  const variants = {
    default: 'border-border',
    emerald: 'border-emerald-200 bg-emerald-50',
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
  };

  const textColors = {
    default: 'text-foreground',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
  };

  return (
    <Card className={variants[variant] || variants.default}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${textColors[variant] || textColors.default}`}>{value}</div>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}
