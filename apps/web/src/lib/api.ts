const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export async function fetchTraits(
  params: {
    search?: string;
    sort?: string;
    order?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const url = new URL(`${API_BASE}/traits`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch traits");
  return response.json();
}

export async function fetchUnits(
  params: {
    search?: string;
    cost?: number;
    trait?: string;
    sort?: string;
    order?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const url = new URL(`${API_BASE}/units`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch units");
  return response.json();
}
