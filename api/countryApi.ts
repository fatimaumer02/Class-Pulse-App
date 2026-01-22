export const getAllCountries = async (): Promise<string[]> => {
  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=name'
    );

    // ❌ If request failed
    if (!response.ok) {
      console.log('Country API failed:', response.status);
      return [];
    }
    const json = await response.json();
    const data = Array.isArray(json) ? json : []; 
    // tell us If API gives:
    // ❌ object
    // ❌ error
    // ❌ null
    // ➡️ We force it to be an empty array []
    const countries: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const countryName = data[i]?.name?.common;
      if (typeof countryName === 'string') {
        countries.push(countryName);
      }
    }

    return countries.sort();

  } catch (error) {
    console.log('Country API error:', error);
    return [];
  }
};

