"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function SupabaseProvider({ children }: Props) {
  // Keep a local client instance so we don't recreate on every render
  const [client] = useState<SupabaseClient>(() => supabase);

  return (
    <SessionContextProvider supabaseClient={client}>{children}</SessionContextProvider>
  );
}
