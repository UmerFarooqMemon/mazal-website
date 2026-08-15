export default function CertificateCardSkeleton() {
  return (
    <div className="w-full rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-200 bg-[#FBFAF7] animate-pulse">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-6 bg-gray-200">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="shrink-0 size-[18px] md:size-11 rounded-[3px] md:rounded-md bg-gray-300" />
          <div className="space-y-1.5 min-w-0">
            <div className="w-28 md:w-40 h-2.5 md:h-5 bg-gray-300 rounded" />
            <div className="w-20 md:w-28 h-1.5 md:h-2.5 bg-gray-300/80 rounded" />
          </div>
        </div>
        <div className="space-y-1.5 shrink-0">
          <div className="w-14 md:w-20 h-1.5 md:h-2.5 bg-gray-300/80 rounded ml-auto" />
          <div className="w-20 md:w-28 h-2 md:h-3.5 bg-gray-300 rounded" />
        </div>
      </div>

      <div className="px-5 py-6 md:px-10 md:py-8 space-y-4">
        <div className="mx-auto w-48 md:w-72 h-4 bg-gray-200 rounded" />

        <div className="mx-auto w-[240px] sm:w-[320px] md:w-[454px] max-w-full">
          <div className="border-2 border-gray-200 p-1.5">
            <div className="w-full aspect-[748/180] bg-gray-200" />
          </div>
        </div>
        <div className="mx-auto w-16 h-3 bg-gray-200 rounded" />
        <div className="h-[2px] w-full bg-gray-200" />

        <div className="w-24 h-3 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="w-12 h-2 bg-gray-200 rounded" />
              <div className="w-16 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="flex justify-between py-2.5">
              <div className="w-28 h-3 bg-gray-200 rounded" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
            <div className="h-[2px] w-full bg-gray-200" />
          </div>
        ))}

        <div className="flex justify-between items-center py-2.5">
          <div className="space-y-1.5">
            <div className="w-36 h-3 bg-gray-200 rounded" />
            <div className="w-28 h-3 bg-gray-200 rounded" />
          </div>
          <div className="size-[64px] md:size-[78px] bg-gray-200" />
        </div>

        <div className="mx-auto w-28 h-8 bg-gray-200 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
        </div>
        <div className="h-[2px] w-full bg-gray-200" />
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-gray-200 rounded" />
          <div className="w-5/6 h-2 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
