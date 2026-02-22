/**
 * Convex document field names only allow non-control ASCII.
 * Map emoji to ASCII-safe keys for storage.
 */
export const EMOJI_TO_KEY: Record<string, string> = {
  "👍": "thumbs_up",
  "❤": "heart",
  "😂": "joy",
  "😮": "astonished",
  "😢": "cry",
};

export const REACTION_KEYS = Object.values(EMOJI_TO_KEY);

export function emojiToKey(emoji: string): string | null {
  return EMOJI_TO_KEY[emoji] ?? null;
}
