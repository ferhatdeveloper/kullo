export type DriverTripKind = "taxi" | "shared" | "airport" | "parcel";

export type DemoDriverTrip = {
  id: string;
  kind: DriverTripKind;
  from: string;
  to: string;
  fare: number;
  currency: "IQD";
  seats?: number;
  status: "incoming" | "active" | "done";
  etaMin: number;
};

export const DEMO_DRIVER_STATS = {
  todayEarnings: 186_000,
  tripsToday: 7,
  rating: 4.9,
  onlineHours: 5.2,
};

export const DEMO_DRIVER_TRIPS: DemoDriverTrip[] = [
  {
    id: "dt1",
    kind: "taxi",
    from: "Erbil Downtown",
    to: "Ankawa",
    fare: 28_000,
    currency: "IQD",
    status: "incoming",
    etaMin: 4,
  },
  {
    id: "dt2",
    kind: "shared",
    from: "Erbil",
    to: "Duhok",
    fare: 18_000,
    currency: "IQD",
    seats: 2,
    status: "incoming",
    etaMin: 12,
  },
  {
    id: "dt3",
    kind: "airport",
    from: "Erbil Airport",
    to: "Italian Village",
    fare: 42_000,
    currency: "IQD",
    status: "active",
    etaMin: 18,
  },
  {
    id: "dt5",
    kind: "parcel",
    from: "Family Mall",
    to: "Ankawa Gate",
    fare: 14_000,
    currency: "IQD",
    status: "incoming",
    etaMin: 9,
  },
  {
    id: "dt4",
    kind: "taxi",
    from: "Family Mall",
    to: "100m Street",
    fare: 16_000,
    currency: "IQD",
    status: "done",
    etaMin: 0,
  },
];
