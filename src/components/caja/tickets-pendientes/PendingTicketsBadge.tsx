export function PendingTicketsBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#D92D20] px-2 py-1 text-xs font-black text-white">
      {count}
    </span>
  );
}
