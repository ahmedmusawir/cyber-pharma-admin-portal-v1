import SpinnerLarge from "@/components/common/SpinnerLarge";

// Route-group loading state: Next swaps ONLY the page slot — the Shell
// (sidebar / mobile top bar) persists. Covers hard loads / first paint;
// client-side navs are handled by Shell's isPending slot (same spinner).
// Operator's kit SpinnerLarge by explicit direction (Rule Zero-B exception
// logged — hardcoded palette colors live inside it).
export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <SpinnerLarge />
    </div>
  );
}
