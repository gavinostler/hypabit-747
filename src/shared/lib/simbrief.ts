type SimbriefAirport = {
    icao_code: string;
    name: string;
};

export type SimbriefOfp = {
    origin: SimbriefAirport;
    destination: SimbriefAirport;
    alternate: SimbriefAirport | Record<string, never>;
};

export const fetchSimbriefOfp = async (username: string): Promise<SimbriefOfp> => {
    const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${encodeURIComponent(username)}&json=1`);

    if (!response.ok) {
        throw new Error(`Failed to fetch SimBrief OFP: ${response.status} ${response.statusText}`);
    }

    const ofp = await response.json();

    // SimBrief returns an array when the flight plan has more than one alternate; the first one is the planned alternate.
    const alternate = Array.isArray(ofp.alternate) ? ofp.alternate[0] ?? {} : ofp.alternate ?? {};

    return { origin: ofp.origin, destination: ofp.destination, alternate };
};
