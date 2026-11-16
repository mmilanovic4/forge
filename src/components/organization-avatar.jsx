import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Up to two letters: the first of each of the first two words. Array.from
// rather than word[0], so a letter outside the basic plane isn't cut in half.
const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();

/**
 * An organization's picture. There is no logo upload yet, so for now it is
 * always the initials — the same fallback a user without a profile picture
 * gets. Once logos exist, the image belongs here.
 */
export function OrganizationAvatar({ name, size = "sm", className }) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn("font-medium", size === "sm" ? "text-[10px]" : "text-xs")}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
