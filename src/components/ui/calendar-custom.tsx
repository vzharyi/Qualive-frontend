import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface CalendarCustomProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

export function CalendarCustom({ selected, onSelect }: CalendarCustomProps) {
  return (
    <Card className="mx-auto w-fit p-0 border-white/[0.08] bg-[#1e1e1e] shadow-2xl rounded-xl">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
        />
      </CardContent>
    </Card>
  )
}
