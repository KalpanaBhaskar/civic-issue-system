import clsx from "clsx";

export function StatusBadge({ status }: { status: "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" }) {
  return (
    <span
      className={clsx("rounded-full px-2 py-1 text-xs font-semibold", {
        "bg-amber-100 text-amber-800": status === "UNDER_REVIEW",
        "bg-blue-100 text-blue-800": status === "IN_PROGRESS",
        "bg-green-100 text-green-800": status === "RESOLVED",
      })}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
