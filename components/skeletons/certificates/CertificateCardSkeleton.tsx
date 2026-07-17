export default function CertificateCardSkeleton() {
  return (
    <div className="w-full rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-200 bg-[#FBFAF7] animate-pulse">
      {/* Header */}
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

      {/* Body */}
      <div className="px-4 py-5 md:p-10 flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-16 md:w-24 h-1.5 md:h-2.5 bg-gray-200 rounded" />
          <div className="w-40 md:w-64 h-4 md:h-9 bg-gray-200 rounded" />
          <div className="w-36 md:w-52 h-2 md:h-3.5 bg-gray-200 rounded" />
        </div>

        {/* Plate */}
        <div className="mx-auto w-full max-w-[340px] md:max-w-[440px]">
          <div className="w-full aspect-[748/180] bg-gray-200 rounded-md" />
        </div>

        {/* Values */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-md md:rounded-xl border border-gray-200 px-1.5 py-2 md:p-4 flex flex-col items-center gap-1.5"
            >
              <div className="w-10 md:w-16 h-1.5 md:h-2.5 bg-gray-200 rounded" />
              <div className="w-12 md:w-20 h-2.5 md:h-5 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Methodology + Sales */}
        <div className="grid grid-cols-2 gap-3 md:gap-8">
          <div className="space-y-2">
            <div className="w-16 md:w-24 h-1.5 md:h-2.5 bg-gray-200 rounded" />
            <div className="w-full h-2 md:h-3 bg-gray-200 rounded" />
            <div className="w-5/6 h-2 md:h-3 bg-gray-200 rounded" />
            <div className="w-4/6 h-2 md:h-3 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-20 md:w-28 h-1.5 md:h-2.5 bg-gray-200 rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between gap-2">
                <div className="w-20 md:w-28 h-2 md:h-3 bg-gray-200 rounded" />
                <div className="w-12 md:w-16 h-2 md:h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 md:gap-10">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="w-24 md:w-36 h-3 md:h-5 bg-gray-200 rounded" />
              <div className="h-px w-full bg-gray-200" />
              <div className="w-20 md:w-28 h-1.5 md:h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-4 border-t border-gray-200 bg-gray-50/80">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="size-7 md:size-12 bg-gray-200 rounded shrink-0" />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="w-full max-w-[220px] h-1.5 md:h-3 bg-gray-200 rounded" />
            <div className="w-3/4 max-w-[180px] h-1.5 md:h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="size-7 md:size-12 rounded shrink-0 border border-gray-200 bg-white" />
      </div>
    </div>
  );
}
