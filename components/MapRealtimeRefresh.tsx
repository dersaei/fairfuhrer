"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function MapRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const channel = supabase
      .channel("orte-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Orte" },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
