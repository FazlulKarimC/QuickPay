# QuickPay Design System

> **Reference this document during Phase 6 (Frontend UI) implementation**  
> **UI Framework**: [shadcn/ui](https://ui.shadcn.com/) with custom fintech styling

---

## Quick Start

```bash
# Install shadcn/ui
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add button card table tabs dialog badge input skeleton toast
```

---

## Color Palette

### Primary Colors
| Token | Hex | CSS Variable |
|-------|-----|--------------|
| Primary | `#6366f1` | `var(--primary)` |
| Primary Dark | `#4f46e5` | `var(--primary-dark)` |
| Primary Light | `#818cf8` | `var(--primary-light)` |

### Semantic Colors
| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Success | `#22c55e` | `var(--success)` | Succeeded payments |
| Error | `#ef4444` | `var(--error)` | Failed payments |
| Warning | `#f59e0b` | `var(--warning)` | Refunds, alerts |
| Info | `#3b82f6` | `var(--info)` | Processing states |

### Surface Colors
| Token | Hex | CSS Variable |
|-------|-----|--------------|
| Background | `#0f172a` | `var(--bg)` |
| Surface | `#1e293b` | `var(--surface)` |
| Surface Light | `#334155` | `var(--surface-light)` |
| Border | `#475569` | `var(--border)` |

### Text Colors
| Token | Hex | CSS Variable |
|-------|-----|--------------|
| Primary | `#f8fafc` | `var(--text)` |
| Secondary | `#e2e8f0` | `var(--text-secondary)` |
| Muted | `#94a3b8` | `var(--text-muted)` |
| Disabled | `#64748b` | `var(--text-disabled)` |

---

## CSS Variables (globals.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Primary */
  --primary: 99 102 241;        /* #6366f1 */
  --primary-dark: 79 70 229;    /* #4f46e5 */
  --primary-light: 129 140 248; /* #818cf8 */
  
  /* Semantic */
  --success: 34 197 94;         /* #22c55e */
  --error: 239 68 68;           /* #ef4444 */
  --warning: 245 158 11;        /* #f59e0b */
  --info: 59 130 246;           /* #3b82f6 */
  
  /* Surfaces */
  --bg: 15 23 42;               /* #0f172a */
  --surface: 30 41 59;          /* #1e293b */
  --surface-light: 51 65 85;    /* #334155 */
  --border: 71 85 105;          /* #475569 */
  
  /* Text */
  --text: 248 250 252;          /* #f8fafc */
  --text-secondary: 226 232 240; /* #e2e8f0 */
  --text-muted: 148 163 184;    /* #94a3b8 */
  --text-disabled: 100 116 139; /* #64748b */
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: rgb(var(--bg));
  color: rgb(var(--text));
}
```

---

## Typography

```css
.font-sans { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* Sizes */
.text-xs   { font-size: 0.75rem; }   /* 12px - captions */
.text-sm   { font-size: 0.875rem; }  /* 14px - labels */
.text-base { font-size: 1rem; }      /* 16px - body */
.text-lg   { font-size: 1.125rem; }  /* 18px - large body */
.text-xl   { font-size: 1.25rem; }   /* 20px - subheadings */
.text-2xl  { font-size: 1.5rem; }    /* 24px - section headings */
.text-3xl  { font-size: 1.875rem; }  /* 30px - page titles */
.text-4xl  { font-size: 2.25rem; }   /* 36px - hero */
```

---

## Payment Status → UI Mapping

> **CRITICAL**: Use this mapping consistently across the entire app

| Status | Badge | Icon | Animation | CSS Class |
|--------|-------|------|-----------|-----------|
| `created` | Neutral | `Circle` | none | `badge-neutral` |
| `processing` | Info | `Loader2` | spin | `badge-info animate-pulse` |
| `succeeded` | Success | `CheckCircle` | none | `badge-success` |
| `failed` | Error | `XCircle` | none | `badge-error` |
| `canceled` | Neutral | `Ban` | none | `badge-neutral` |
| `refunded` | Warning | `RefreshCw` | none | `badge-warning` |

### Status Badge Component

```tsx
// components/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, RefreshCw, Circle, Ban } from "lucide-react";

const statusConfig = {
  created:    { variant: "neutral",  icon: Circle,      animate: false },
  processing: { variant: "info",     icon: Loader2,     animate: true },
  succeeded:  { variant: "success",  icon: CheckCircle, animate: false },
  failed:     { variant: "error",    icon: XCircle,     animate: false },
  canceled:   { variant: "neutral",  icon: Ban,         animate: false },
  refunded:   { variant: "warning",  icon: RefreshCw,   animate: false },
};

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge className={`badge-${config.variant}`}>
      <Icon className={`h-3 w-3 mr-1 ${config.animate ? 'animate-spin' : ''}`} />
      {status}
    </Badge>
  );
}
```

### Badge Styles (using semantic variables)

```css
.badge-neutral {
  background: rgba(var(--text-muted), 0.2);
  color: rgb(var(--text-muted));
}

.badge-success {
  background: rgba(var(--success), 0.2);
  color: rgb(var(--success));
}

.badge-error {
  background: rgba(var(--error), 0.2);
  color: rgb(var(--error));
}

.badge-warning {
  background: rgba(var(--warning), 0.2);
  color: rgb(var(--warning));
}

.badge-info {
  background: rgba(var(--info), 0.2);
  color: rgb(var(--info));
}
```

---

## Payment-Specific Components

### Amount Display

Large, bold amount for checkout and transaction details:

```tsx
// components/AmountDisplay.tsx
export function AmountDisplay({ 
  amount, 
  currency = "INR", 
  size = "lg" 
}: {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
  
  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-4xl font-bold",
    xl: "text-5xl font-bold tracking-tight",
  };
  
  return (
    <span className={`${sizeClasses[size]} text-[rgb(var(--text))]`}>
      {formatted}
    </span>
  );
}
```

```css
.amount-xl {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, rgb(var(--text)), rgb(var(--text-secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

### Merchant Header

Display merchant info on checkout:

```tsx
// components/MerchantHeader.tsx
export function MerchantHeader({
  name,
  logo,
  reference,
}: {
  name: string;
  logo?: string;
  reference?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))]">
      <div className="w-12 h-12 rounded-lg bg-[rgb(var(--surface-light))] flex items-center justify-center">
        {logo ? (
          <img src={logo} alt={name} className="w-8 h-8 rounded" />
        ) : (
          <span className="text-xl font-bold text-[rgb(var(--primary))]">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[rgb(var(--text))]">{name}</p>
        {reference && (
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Ref: {reference}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

### Payment Summary Rows

Label/value pairs for payment details:

```tsx
// components/PaymentSummary.tsx
export function PaymentSummary({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode; highlight?: boolean }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div 
          key={i} 
          className={`flex justify-between items-center py-2 
            ${i < items.length - 1 ? 'border-b border-[rgb(var(--border))]' : ''}
            ${item.highlight ? 'font-semibold' : ''}`}
        >
          <span className="text-[rgb(var(--text-muted))]">{item.label}</span>
          <span className={item.highlight ? 'text-[rgb(var(--text))]' : 'text-[rgb(var(--text-secondary))]'}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Usage
<PaymentSummary
  items={[
    { label: "Amount", value: <AmountDisplay amount={10000} size="sm" /> },
    { label: "Fee", value: "₹0.00" },
    { label: "Method", value: "UPI" },
    { label: "Status", value: <StatusBadge status="processing" /> },
    { label: "Total", value: <AmountDisplay amount={10000} size="md" />, highlight: true },
  ]}
/>
```

---

## Skeleton Loaders

### Base Skeleton Component

```tsx
// components/Skeleton.tsx (or use shadcn's Skeleton)
export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-[rgb(var(--surface-light))] rounded ${className}`}
    />
  );
}
```

### Transaction List Skeleton

```tsx
// components/TransactionListSkeleton.tsx
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 p-4 rounded-lg bg-[rgb(var(--surface))]"
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
```

### Dashboard Card Skeleton

```tsx
// components/DashboardCardSkeleton.tsx
export function DashboardCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))]">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
```

### Wallet Balance Skeleton

```tsx
// components/WalletBalanceSkeleton.tsx
export function WalletBalanceSkeleton() {
  return (
    <div className="p-8 rounded-2xl bg-linear-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))]">
      <Skeleton className="h-4 w-20 mb-3 bg-white/20" />
      <Skeleton className="h-12 w-40 mb-4 bg-white/20" />
      <Skeleton className="h-3 w-32 bg-white/20" />
    </div>
  );
}
```

### Skeleton Animation

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgb(var(--surface-light)) 0%,
    rgb(var(--surface)) 50%,
    rgb(var(--surface-light)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## Transaction Table

### Table Component (using shadcn/ui Table)

```tsx
// components/TransactionTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { AmountDisplay } from "./AmountDisplay";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface))]">
            <TableHead className="text-[rgb(var(--text-muted))]">ID</TableHead>
            <TableHead className="text-[rgb(var(--text-muted))]">Amount</TableHead>
            <TableHead className="text-[rgb(var(--text-muted))]">Method</TableHead>
            <TableHead className="text-[rgb(var(--text-muted))]">Status</TableHead>
            <TableHead className="text-[rgb(var(--text-muted))]">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow 
              key={tx.id}
              className="border-[rgb(var(--border))] hover:bg-[rgb(var(--surface-light))] transition-colors"
            >
              <TableCell className="font-mono text-sm text-[rgb(var(--text-muted))]">
                {tx.id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <AmountDisplay amount={tx.amount} size="sm" />
              </TableCell>
              <TableCell className="capitalize text-[rgb(var(--text-secondary))]">
                {tx.paymentMethod || '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={tx.status} />
              </TableCell>
              <TableCell className="text-[rgb(var(--text-muted))]">
                {new Date(tx.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Table Styles

```css
/* Custom table styling for fintech look */
.table-fintech {
  width: 100%;
  border-collapse: collapse;
}

.table-fintech th {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--text-muted));
  background: rgb(var(--surface));
  border-bottom: 1px solid rgb(var(--border));
}

.table-fintech td {
  padding: var(--space-md) var(--space-lg);
  color: rgb(var(--text-secondary));
  border-bottom: 1px solid rgb(var(--border));
}

.table-fintech tr:hover td {
  background: rgb(var(--surface-light));
}

.table-fintech tr:last-child td {
  border-bottom: none;
}
```

---

## shadcn/ui Customization

### Tailwind Config Extensions

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
          light: 'rgb(var(--primary-light) / <alpha-value>)',
        },
        success: 'rgb(var(--success) / <alpha-value>)',
        error: 'rgb(var(--error) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          light: 'rgb(var(--surface-light) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

### Button Variants (shadcn customization)

```tsx
// In your button component variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))] disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] text-white hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5",
        secondary: "bg-transparent border border-[rgb(var(--primary))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10",
        ghost: "bg-transparent text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-light))] hover:text-[rgb(var(--text))]",
        success: "bg-[rgb(var(--success))] text-white hover:bg-[rgb(var(--success))]/90",
        error: "bg-[rgb(var(--error))] text-white hover:bg-[rgb(var(--error))]/90",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
```

---

## Animations

### Loading Spinner

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgb(var(--border));
  border-top-color: rgb(var(--primary));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Pulse (for processing)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}
```

### Success Checkmark (SVG)

```css
@keyframes checkmark-stroke {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}

@keyframes checkmark-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.success-checkmark {
  animation: checkmark-scale 0.3s ease;
}

.success-checkmark path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: checkmark-stroke 0.5s ease forwards 0.2s;
}
```

---

## Icons (Lucide React)

```bash
npm install lucide-react
```

### Common Icons

| Usage | Icon | Import |
|-------|------|--------|
| Card | `CreditCard` | `lucide-react` |
| UPI | `Smartphone` | `lucide-react` |
| Netbanking | `Building` | `lucide-react` |
| Success | `CheckCircle` | `lucide-react` |
| Error | `XCircle` | `lucide-react` |
| Processing | `Loader2` | `lucide-react` |
| Refund | `RefreshCw` | `lucide-react` |
| Wallet | `Wallet` | `lucide-react` |
| Transfer | `Send` | `lucide-react` |
| History | `Clock` | `lucide-react` |
| Settings | `Settings` | `lucide-react` |

---

## Responsive Breakpoints

| Name | Width | Tailwind |
|------|-------|----------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |

---

*Reference this document when implementing UI components in Phase 6*
