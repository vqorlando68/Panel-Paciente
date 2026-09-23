"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { setSessionCookie, deleteCookie } from "@/app/actions";

export default function useSessionRefresh(
  userData,
  inactivityTimeout = 30,
  refreshInterval = 5,
) {
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const lastRefreshRef = useRef(Date.now());

  const logout = useCallback(async () => {
    console.log("Session expired - logging out");
    await deleteCookie([
      "tkr_usr_session",
      "tkr_usr_role",
      "tkr_usr_id",
      "tkr_has_session",
    ]);
    router.push("/login");
  }, [router]);

  const refreshSession = useCallback(async () => {
    if (!userData) {
      return;
    }

    try {
      const roleId = userData?.accessData?.roleId || 3;

      await setSessionCookie(
        { ...userData },
        userData?.accessData?.ID_USUARIO,
        roleId,
      );

      lastRefreshRef.current = Date.now();
      // console.log("Session refreshed at ", new Date().toLocaleTimeString());
    } catch (error) {
      // console.error("Failed to refresh session:", error);
    }
  }, [userData]);

  const resetInactivityTimer = useCallback(() => {
    if (!userData) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const timeSinceLastRefresh = (now - lastRefreshRef.current) / 1000 / 60;
    if (timeSinceLastRefresh >= refreshInterval) {
      // console.log(
      //   "Refreshing session due to activity (been",
      //   timeSinceLastRefresh.toFixed(1),
      //   "minutes)"
      // );
      refreshSession();
    } else {
      const refreshTime = refreshInterval * 60 * 1000;
      refreshTimerRef.current = setTimeout(() => {
        // console.log("Scheduled refresh triggered");
        refreshSession();
      }, refreshTime);
    }

    inactivityTimerRef.current = setTimeout(
      () => {
        // console.log("Inactivity timeout reached");
        logout();
      },
      inactivityTimeout * 60 * 1000,
    );
  }, [userData, inactivityTimeout, refreshInterval, refreshSession, logout]);

  useEffect(() => {
    if (!userData) {
      return;
    }

    // console.log(
    //   "Session manager initialized - inactivity timeout:",
    //   inactivityTimeout,
    //   "min, refresh interval:",
    //   refreshInterval,
    //   "min"
    // );

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    let throttleTimeout;
    const throttledReset = () => {
      if (!throttleTimeout) {
        resetInactivityTimer();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledReset, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledReset);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [userData, resetInactivityTimer]);

  return { refreshSession, logout };
}
