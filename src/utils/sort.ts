export type CarNumberRegistration = { car_number: string; };

export const sortAlphaNum = (a: CarNumberRegistration, b: CarNumberRegistration) => a.car_number.localeCompare(b.car_number, 'en', { numeric: true });