import { Country, City } from "country-state-city";

const getCountries = (): string[] => {
  const countries = Country.getAllCountries();
  return countries.map((country) => country.isoCode);
};

const getCitiesForCountry = (countryCode: string): string[] => {
  const cities = City.getCitiesOfCountry(countryCode);
  if (!cities) return [];

  return cities.map((city) => city.name);
};


export { getCountries, getCitiesForCountry };