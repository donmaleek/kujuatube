import { useEffect } from "react";

export function useInfiniteScroll(ref, onLoadMore, enabled = true) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "320px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, onLoadMore, enabled]);
}
