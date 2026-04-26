import { Suspense } from "react";
import { ClassicBoard } from "@/components/ClassicBoard";
import { SpoilerGate } from "@/components/SpoilerGate";
import { deepcutPool, fullPool } from "@/lib/characterPools";

export default function DeepCutPage() {
  return (
    <SpoilerGate>
      <Suspense fallback={null}>
        <ClassicBoard
          mode="deepcut"
          title="Deep-Cut"
          poolDescription={`Today's answer is one of ${deepcutPool.length} manga-only deep cuts. All ${fullPool.length} pirates are valid guesses.`}
        />
      </Suspense>
    </SpoilerGate>
  );
}
