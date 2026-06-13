import { createClient } from "@supabase/supabase-js";

export type StoreInfo = {
  storeName: string;
  contactEmail: string;
};

export const DEFAULT_STORE_INFO: StoreInfo = {
  storeName: "Cloe Studio",
  contactEmail: "contacto@cloe.com",
};

export async function getStoreInfo(): Promise<StoreInfo> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data } = await supabase
      .from("custom_pages")
      .select("content")
      .eq("slug", "store_info")
      .single();

    if (data && data.content) {
      const parsed = JSON.parse(data.content);
      return {
        storeName: parsed.storeName || DEFAULT_STORE_INFO.storeName,
        contactEmail: parsed.contactEmail || DEFAULT_STORE_INFO.contactEmail,
      };
    }
  } catch (error) {
    console.error("Error fetching store info:", error);
  }

  return DEFAULT_STORE_INFO;
}
