import { ChevronRight } from 'lucide-react'

interface DateGroupHeaderProps {
  label: string
  count?: number
  collapsed?: boolean
  onToggle?: () => void
}

export function DateGroupHeader({ label, count, collapsed = false, onToggle }: DateGroupHeaderProps) {
  return (
    <div
      className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-surface-1 sticky top-0 z-[1] flex items-center gap-1 cursor-pointer select-none hover:text-gray-400 transition-colors"
      onClick={onToggle}
    >
      <ChevronRight
        size={12}
        className={`transition-transform duration-150 flex-shrink-0 ${collapsed ? '' : 'rotate-90'}`}
      />
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="text-gray-600 font-normal ml-auto flex-shrink-0">{count}</span>
      )}
    </div>
  )
}
