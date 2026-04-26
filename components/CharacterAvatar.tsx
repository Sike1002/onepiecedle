/* eslint-disable @next/next/no-img-element */
import type { OnePieceCharacter } from "@/lib/types";

interface Props {
  character: OnePieceCharacter;
  size?: number;
  silhouette?: boolean;
  brightness?: number; // 0..1 for silhouette reveal
  alt?: string;
  decorative?: boolean;
}

export function CharacterAvatar({
  character,
  size = 40,
  silhouette = false,
  brightness = 1,
  alt,
  decorative = false,
}: Props) {
  const filter = silhouette ? `brightness(${brightness})` : undefined;
  return (
    <img
      src={character.portraitUrl}
      alt={decorative ? "" : alt ?? character.name}
      aria-hidden={decorative ? "true" : undefined}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        filter,
        display: "block",
        objectFit: "cover",
        backgroundColor: "#0a0a0a",
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
