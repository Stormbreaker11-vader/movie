import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface Props {
  type: "movie" | "tv";
  tmdbId: string;
  title: string;
  episodeData?: {
    season: number;
    episode: number;
  };
}

// List of streaming sources to try
const SOURCES = [
  {
    name: "VidSrc",
    getUrl: (type: string, id: string, season?: number, episode?: number) =>
      type === "tv" && season && episode
        ? `https://vidsrc.cc/v2/embed/${type}/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/${type}/${id}`,
  },
  {
    name: "2Embed.cc",
    getUrl: (type: string, id: string, season?: number, episode?: number) => {
      if (type === "tv" && season && episode) {
        return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
      } else {
        return `https://www.2embed.cc/embed/${id}`;
      }
    },
  },
  // Note: 2embed.skin often redirects or might be the same backend as .cc
  // Keeping it for variety but it might behave identically to 2embed.cc
  {
    name: "2Embed.skin",
    getUrl: (type: string, id: string, season?: number, episode?: number) => {
      if (type === "tv" && season && episode) {
        return `https://www.2embed.skin/embedtv/${id}&s=${season}&e=${episode}`;
      } else {
        return `https://www.2embed.skin/embed/${id}`;
      }
    },
  },
  // Added another potential source (Verify if it works and adjust URL structure if needed)
  // Example: SuperEmbed - often used, might require different URL params
  // {
  //   name: 'SuperEmbed',
  //   getUrl: (type: string, id: string, season?: number, episode?: number) =>
  //     type === 'tv' && season && episode
  //       ? `https://multiembed.mov/?video_id=${id}&s=${season}&e=${episode}` // Example URL structure
  //       : `https://multiembed.mov/?video_id=${id}` // Example URL structure
  // },
];

export default function StreamPlayer({
  type,
  tmdbId,
  title,
  episodeData,
}: Props) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [allAttemptsFailed, setAllAttemptsFailed] = useState(false); // Track if all sources failed in a cycle

  // Use a ref to track mounted state to avoid state updates on unmounted component
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Use a ref to track the timeout ID
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Function to clear existing timeout
  const clearTimeoutSafe = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  // Function to switch to the next source
  const tryNextSource = useCallback(
    (isAutomatic = false) => {
      clearTimeoutSafe(); // Clear any pending timeout before switching
      if (!isMounted.current) return; // Prevent state updates if unmounted

      setActiveSourceIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SOURCES.length;

        // If we've wrapped around back to the start *automatically*
        // and the first source also failed previously, mark all as failed.
        if (isAutomatic && nextIndex === 0) {
          console.log("Automatic cycle complete, all sources likely failed.");
          setAllAttemptsFailed(true);
          setHasError(true); // Show final error state
          setIsLoading(false);
          return prevIndex; // Stay on the last index technically, but show error
        }

        // If manually switching or automatically moving to a source > 0
        console.log(
          `Switching source to: ${SOURCES[nextIndex].name} (Index: ${nextIndex})`,
        );
        setIsLoading(true); // Start loading the new source
        setHasError(false); // Reset error state for the new source
        setAllAttemptsFailed(false); // Reset all failed flag
        return nextIndex;
      });
    },
    [clearTimeoutSafe],
  ); // Add dependency

  // Get current source details
  const currentSource = SOURCES[activeSourceIndex];
  const currentUrl = currentSource?.getUrl(
    type,
    tmdbId,
    episodeData?.season,
    episodeData?.episode,
  );

  // Reset states when props change (e.g., different movie/episode)
  useEffect(() => {
    clearTimeoutSafe(); // Clear timeout on prop change
    if (!isMounted.current) return;
    console.log(
      "Props changed (tmdbId or episodeData). Resetting player state.",
    );
    setActiveSourceIndex(0);
    setIsLoading(true);
    setHasError(false);
    setAllAttemptsFailed(false);
  }, [tmdbId, episodeData, clearTimeoutSafe]); // Add clearTimeoutSafe

  // Handle iframe loading timeout
  useEffect(() => {
    // Don't run if not loading, if there's already an error, or if URL is missing
    if (!isLoading || hasError || !currentUrl) {
      clearTimeoutSafe(); // Clear timeout if loading completes or errors out early
      return;
    }

    console.log(`Setting timeout for ${currentSource?.name} (12s)`);
    // Set a new timeout
    timeoutIdRef.current = setTimeout(() => {
      if (isLoading && isMounted.current) {
        // Check again if still loading and mounted
        console.warn(`${currentSource?.name} timed out after 12 seconds.`);
        // Treat timeout as an error and try the next source automatically
        tryNextSource(true); // true indicates automatic switch
      }
    }, 12000); // 12 seconds timeout

    // Cleanup function to clear timeout
    return () => clearTimeoutSafe();
  }, [
    isLoading,
    currentUrl,
    currentSource?.name,
    tryNextSource,
    hasError,
    clearTimeoutSafe,
  ]); // Add dependencies

  const handleIframeLoad = useCallback(() => {
    clearTimeoutSafe(); // Clear timeout on successful load
    if (isMounted.current && isLoading) {
      // Prevent updates if not loading anymore
      console.log(`${currentSource?.name} loaded successfully.`);
      setIsLoading(false);
      setHasError(false);
      setAllAttemptsFailed(false); // Success resets this flag
    }
  }, [clearTimeoutSafe, currentSource?.name, isLoading]); // Add isLoading

  const handleIframeError = useCallback(() => {
    // This catches explicit iframe errors (e.g., network error, CORS, 404 on the src)
    // NOTE: It often does NOT catch errors *within* the iframe's content (like "Invalid source" messages)
    clearTimeoutSafe(); // Clear timeout on error
    if (isMounted.current && isLoading) {
      // Prevent updates if not loading anymore
      console.error(
        `Iframe error detected for ${currentSource?.name}. Trying next source automatically.`,
      );
      // Treat iframe error like a timeout, try next source automatically
      tryNextSource(true); // true indicates automatic switch
    }
  }, [clearTimeoutSafe, currentSource?.name, tryNextSource, isLoading]); // Add isLoading

  const handleManualRetry = () => {
    console.log("Manual Retry: Trying all sources again from the beginning.");
    clearTimeoutSafe();
    if (!isMounted.current) return;
    setActiveSourceIndex(0); // Start from the first source
    setIsLoading(true);
    setHasError(false);
    setAllAttemptsFailed(false);
  };

  // Determine Player State for Rendering
  const showLoadingIndicator = isLoading;
  // Show the final error state only if all automatic attempts failed
  const showFinalErrorState = hasError && allAttemptsFailed;
  // Show the iframe if we have a URL and are not in the final error state
  // Allow iframe to render even while loading=true initially to catch load/error events
  const showIframe = currentUrl && !showFinalErrorState;

  // --- Explanation for "Invalid source, please switch servers!" ---
  // The message "Invalid source, please switch servers!" that you saw likely comes
  // *from inside* the content loaded into the iframe (e.g., from VidSrc or 2Embed directly).
  // The `StreamPlayer` component itself cannot read the content inside the iframe due to
  // browser security restrictions (cross-origin policies).
  // It can only detect if the iframe itself failed to load (`onError`) or if it didn't signal
  // successful loading within the timeout (`onLoad`).
  // The automatic switching implemented here handles *those* cases. If the iframe loads but
  // *then* displays an error message internally, the component won't automatically know.
  // In such cases, the manual "Switch Source" button becomes necessary.
  // ---

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center dark:text-white">
        <Play className="w-6 h-6 mr-2" />
        Watch {title}
      </h2>

      <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-black relative">
        {/* Loading Indicator - Shown while isLoading is true */}
        {showLoadingIndicator && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-85 text-white z-10">
            <RefreshCw className="w-12 h-12 animate-spin mb-4" />
            <p className="text-center">Loading player...</p>
            <p className="text-sm mt-2 text-gray-400">
              Trying source: {currentSource?.name} ({activeSourceIndex + 1}/
              {SOURCES.length})
            </p>
          </div>
        )}

        {/* Final Error State - Shown only after all sources failed automatically */}
        {showFinalErrorState && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-95 text-white p-6 z-10">
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <p className="text-center mb-2 text-lg">
              All streaming sources failed
            </p>
            <p className="text-center mb-6 text-sm text-gray-400">
              Could not load the video after trying all available sources. This
              might be temporary, or due to network or regional issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleManualRetry} // Renamed for clarity
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again From Start
              </button>
              <a
                href={`https://www.themoviedb.org/${type}/${tmdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md flex items-center justify-center text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on TMDB
              </a>
            </div>
          </div>
        )}

        {/* Iframe - Rendered if we have a URL and aren't in the final error state */}
        {showIframe && (
          <iframe
            // Key change forces iframe re-creation when source changes
            key={`${currentSource?.name}-${activeSourceIndex}`}
            src={currentUrl}
            width="100%"
            height="100%"
            allowFullScreen
            allow="autoplay; fullscreen" // Allow autoplay and fullscreen
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation" // Security sandbox
            referrerPolicy="origin" // Control referrer information
            title={`Stream Player - ${title} - Source: ${currentSource?.name}`}
            className={`w-full h-full ${isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`} // Fade in on load
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          ></iframe>
        )}
      </div>

      {/* Player Controls / Status */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
          {/* Display current source unless all failed */}
          {!showFinalErrorState
            ? `Using source: ${currentSource?.name}`
            : "No working source found"}
        </p>

        {/* Manual Switch Source Button */}
        {/* Show button if not loading, not in final error, and more than one source exists */}
        {!isLoading && !showFinalErrorState && SOURCES.length > 1 && (
          <button
            onClick={() => tryNextSource(false)} // false indicates manual switch
            className="px-3 py-1 bg-gray-500 hover:bg-gray-700 text-white rounded text-sm flex items-center justify-center sm:justify-start sm:ml-auto"
            title="Switch to the next available streaming source"
          >
            Switch Source
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
      {/* Optional: Add a note about potential iframe-internal errors */}
      {!isLoading && !showFinalErrorState && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          If the video shows an error message inside the player (like 'invalid
          source'), please use the 'Switch Source' button.
        </p>
      )}
    </div>
  );
}
