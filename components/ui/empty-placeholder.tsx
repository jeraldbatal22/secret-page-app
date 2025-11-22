import { cn } from "@/lib/utils"

interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType
  title: string
  description?: string
  children?: React.ReactNode
}

const EmptyPlaceholder = ({
  icon: Icon,
  title,
  description,
  children,
  className,
  ...props
}: EmptyPlaceholderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm ring-1 ring-slate-200">
          <Icon className="size-6" strokeWidth={1.6} />
        </div>
      ) : null}

      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-800">{title}</p>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>

      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  )
}

export { EmptyPlaceholder }

