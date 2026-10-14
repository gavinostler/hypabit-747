type SimbriefAirport = {
    icao_code: string;
    name: string;
};

export type SimbriefLoad = {
    pax: number;
    cargoLb: number;
    fuelLb: number;
    zfwLb: number;
};

export type SimbriefOfp = {
    origin: SimbriefAirport;
    destination: SimbriefAirport;
    alternate: SimbriefAirport | Record<string, never>;
    load: SimbriefLoad;
};

const KG_TO_LB = 2.20462262;

export const fetchSimbriefOfp = async (username: string): Promise<SimbriefOfp> => {
    const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${encodeURIComponent(username)}&json=1`);

    if (!response.ok) {
        throw new Error(`Failed to fetch SimBrief OFP: ${response.status} ${response.statusText}`);
    }

    const ofp = await response.json();

    // SimBrief returns an array when the flight plan has more than one alternate; the first one is the planned alternate.
    const alternate = Array.isArray(ofp.alternate) ? ofp.alternate[0] ?? {} : ofp.alternate ?? {};

    const toPounds = ofp.params?.units === "kgs" ? KG_TO_LB : 1;
    const load = {
        pax: Number(ofp.weights?.pax_count ?? 0),
        cargoLb: Number(ofp.weights?.cargo ?? 0) * toPounds,
        fuelLb: Number(ofp.fuel?.plan_ramp ?? 0) * toPounds,
        zfwLb: Number(ofp.weights?.est_zfw ?? 0) * toPounds,
    };

    return { origin: ofp.origin, destination: ofp.destination, alternate, load };
};
