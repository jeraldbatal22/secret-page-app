// export type ErrorType =
//   | 'authentication'
//   | 'database'
//   | 'network'
//   | 'unknown';

// // components/error-display.tsx
// export function ErrorDisplay({
//   error,
//   type,
// }: {
//   error: string;
//   type: ErrorType;
// }) {
//   const getIcon = () => {
//     switch (type) {
//       case "authentication":
//         return "🔒";
//       case "database":
//         return "💾";
//       case "network":
//         return "🌐";
//       default:
//         return "⚠️";
//     }
//   };

//   const getAction = () => {
//     switch (type) {
//       case "authentication":
//         return (
//           <a href="/login" className="text-blue-600 underline">
//             Log in
//           </a>
//         );
//       case "database":
//       case "network":
//         return (
//           <button
//             onClick={() => window.location.reload()}
//             className="text-blue-600 underline"
//           >
//             Retry
//           </button>
//         );
//       default:
//         return (
//           <button
//             onClick={() => window.location.reload()}
//             className="text-blue-600 underline"
//           >
//             Refresh page
//           </button>
//         );
//     }
//   };

//   return (
//     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//       <div className="text-4xl mb-3">{getIcon()}</div>
//       <h3 className="text-yellow-900 font-semibold mb-2">
//         Unable to load messages
//       </h3>
//       <p className="text-yellow-700 mb-4">{error}</p>
//       {getAction()}
//     </div>
//   );
// }

"use client";

// components/error-display.tsx
export function ErrorDisplay({
  error,
  code,
}: {
  error: string | undefined;
  code?: string;
}) {
  const isAuthError = code === "AUTH_REQUIRED";

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 className="text-red-800 font-semibold mb-2">
        {isAuthError ? "Authentication Required" : "Unable to Load"}
      </h3>
      <p className="text-red-600 mb-4">{error}</p>

      {isAuthError ? (
        <a
          href="/login"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Log In
        </a>
      ) : (
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
