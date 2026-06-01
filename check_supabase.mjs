const SUPABASE_URL = "https://rmdmrtsbbymorsumijph.supabase.co";
const SUPABASE_KEY = "sb_publishable_K5lZGI9ackUvUIx3fd6Fog_cI4Sug7U";

async function check() {
  const url = `${SUPABASE_URL}/rest/v1/products?select=condition,variants&limit=1`;
  const res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  if (res.ok) {
    console.log("SUCCESS: The columns exist!");
  } else {
    const error = await res.text();
    console.log("ERROR: The columns DO NOT exist.", res.status, error);
  }
}

check();
