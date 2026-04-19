interface DateGroupHeaderProps {
  label: string
}

export function DateGroupHeader({ label }: DateGroupHeaderProps) {
  return (
    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-surface-1 sticky top-0">
      {label}
    </div>
  )
}
