import { useEffect, useState, useRef } from "react";

export function useScrollSync() {
  const [scroll, setScroll] = useState(0);
  const lastScrollTime = useRef(Date.now());
  const scrollAccumulator = useRef(0);
  const lastRawScroll = useRef(0);
  const stickyLocked = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const rawScroll = window.scrollY / max;
      const now = Date.now();
      const deltaTime = now - lastScrollTime.current;

      // Define demo section boundaries (section index 3 out of total sections)
      const totalSections = 11;
      const demoSectionIndex = 3;
      const demoStartPercent = demoSectionIndex / totalSections;
      const demoEndPercent = (demoSectionIndex + 1) / totalSections;
      const demoCenter =
        demoStartPercent + 0.5 * (demoEndPercent - demoStartPercent);

      let adjustedScrollValue = rawScroll;

      // Check if we're in demo section
      const inDemoSection =
        rawScroll >= demoStartPercent && rawScroll <= demoEndPercent;

      if (inDemoSection) {
        const demoProgress =
          (rawScroll - demoStartPercent) / (demoEndPercent - demoStartPercent);

        // Calculate scroll delta since last frame
        const scrollDelta = Math.abs(rawScroll - lastRawScroll.current);

        // Accumulate scroll intent when in sticky zone (middle 70% of demo section)
        if (demoProgress >= 0.15 && demoProgress <= 0.85) {
          if (!stickyLocked.current) {
            stickyLocked.current = true;
            scrollAccumulator.current = 0;
          }

          // Accumulate scroll attempts
          if (deltaTime > 0) {
            scrollAccumulator.current += scrollDelta * 100; // Amplify small movements
          }

          // Require significant accumulated scroll to exit (much higher threshold)
          const exitThreshold = 0.15; // Need 15% worth of scroll accumulation to exit

          if (scrollAccumulator.current < exitThreshold) {
            // Lock to demo center until enough scroll accumulated
            adjustedScrollValue = demoCenter;
          } else {
            // Allow exit once threshold met
            stickyLocked.current = false;
            scrollAccumulator.current = 0;
            adjustedScrollValue = rawScroll;
          }
        } else {
          // At edges of demo section - allow easier entry/exit
          stickyLocked.current = false;
          scrollAccumulator.current = 0;
          adjustedScrollValue = rawScroll;
        }
      } else {
        // Outside demo section - reset sticky state
        stickyLocked.current = false;
        scrollAccumulator.current = 0;
        adjustedScrollValue = rawScroll;
      }

      lastScrollTime.current = now;
      lastRawScroll.current = rawScroll;
      setScroll(adjustedScrollValue);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scroll;
}
