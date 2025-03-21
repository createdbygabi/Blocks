import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class Analytics {
  constructor(businessId) {
    this.businessId = businessId;
    this.sessionId = Math.random().toString(36).substring(2, 15);
    this.endpoint = "/api/analytics";
    this.eventQueue = [];
    this.maxBatchSize = 10;

    if (typeof window !== "undefined") {
      // Send events when user leaves/closes page
      window.addEventListener("beforeunload", () => this.flush());

      // Send events when page becomes hidden (tab switch/close)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      });

      // Periodically flush events (as backup)
      setInterval(() => this.flush(), 30000); // Every 30 seconds

      // Try to restore any events from previous session
      this.restoreUnsentEvents();
    }
  }

  track(eventName, properties = {}) {
    if (typeof window === "undefined") return;

    const event = {
      business_id: this.businessId,
      session_id: this.sessionId,
      event_name: eventName,
      properties: {
        ...properties,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    };
    console.log("🔄 Analytics Event Tracked:", event.event_name);

    // Add to queue instead of sending immediately
    this.eventQueue.push(event);

    // If queue is full, flush it
    if (this.eventQueue.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  flush() {
    if (!this.eventQueue.length) return;

    const events = [...this.eventQueue];
    this.eventQueue = []; // Clear queue

    // Use Beacon API for better reliability during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(events)], {
        type: "application/json",
      });
      const sent = navigator.sendBeacon(this.endpoint, blob);

      if (!sent) {
        this.saveUnsentEvents(events);
      }
    } else {
      // Fallback to fetch with keepalive
      fetch(this.endpoint, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      }).catch(() => {
        this.saveUnsentEvents(events);
      });
    }
  }

  // Save unsent events to localStorage
  saveUnsentEvents(events) {
    try {
      const stored = JSON.parse(
        localStorage.getItem("unsent_analytics") || "[]"
      );
      localStorage.setItem(
        "unsent_analytics",
        JSON.stringify([...stored, ...events])
      );
    } catch (e) {
      console.warn("Failed to save unsent events");
    }
  }

  // Restore and try to send events from previous session
  restoreUnsentEvents() {
    try {
      const stored = JSON.parse(
        localStorage.getItem("unsent_analytics") || "[]"
      );
      if (stored.length) {
        this.eventQueue.push(...stored);
        localStorage.removeItem("unsent_analytics");
        this.flush();
      }
    } catch (e) {
      console.warn("Failed to restore unsent events");
    }
  }
}

// Singleton instance
let analytics = null;

export function initAnalytics(businessId) {
  // Skip analytics in development mode
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    return {
      track: () =>
        console.log("Analytics tracking disabled in development mode"),
    };
  }

  if (typeof window === "undefined") return null;
  if (!analytics) {
    analytics = new Analytics(businessId);
  }
  return analytics;
}
