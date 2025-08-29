// components/paris-hero.tsx
export default function ParisFrance() {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 text-white p-8">
      {/* Texte Paris */}
      <h1 className="text-5xl font-serif tracking-[.5em]">PARIS</h1>

      {/* Ligne + drapeau */}
      <div className="inline-flex items-center gap-4 my-4">
        <div className="w-20 border-t-4 border-white" />
        <div className="flex w-12 h-6">
          <div className="flex-1 bg-blue-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-red-600" />
        </div>
        <div className="w-20 border-t-4 border-white" />
      </div>

      {/* Texte France */}
      <p className="text-lg tracking-widest font-serif">FRANCE</p>
    </div>
  );
}

