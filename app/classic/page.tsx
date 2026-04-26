import { Suspense } from "react";
import { ClassicBoard } from "@/components/ClassicBoard";

export default function ClassicPage() {
  return (
    <Suspense fallback={null}>
      <ClassicBoard mode="classic" enableArchive />
    </Suspense>
  );
}
