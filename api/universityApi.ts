// api/universities.ts
export const fetchAllUniversities = async () => {
  try {
    const res = await fetch('https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json'); // no country filter
    if (!res.ok) return [];

    const data = await res.json();
    const universities: { label: string; value: string }[] = [];

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const uniName = data[i]?.name;
        if (uniName && typeof uniName === 'string') {
          universities.push({ label: uniName, value: uniName });
        }
      }
    }

    return universities;
  } catch (error) {
    console.log('University API error:', error);
    return [];
  }
};
