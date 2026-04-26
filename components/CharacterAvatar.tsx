/* eslint-disable @next/next/no-img-element */
import type { OnePieceCharacter } from "@/lib/types";

interface Props {
  character: OnePieceCharacter;
  size?: number;
  silhouette?: boolean;
  brightness?: number; // 0..1 for silhouette reveal
}

export function CharacterAvatar({ character, size = 40, silhouette = false, brightness = 1 }: Props) {
  const filter = silhouette ? `brightness(${brightness})` : undefined;
  return (
    <img
      src={character.portraitUrl}
      alt={silhouette ? "Silhouette" : character.name}
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
