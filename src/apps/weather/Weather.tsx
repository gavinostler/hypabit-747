import React, { FC, useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { parseMetar, parseTAF } from "@ninjomcs/metar-taf-parser-msfs";
import { WeatherContext } from "./WeatherContext";
import { determineTheme } from "./themes";
import { WeatherData } from "../../shared/lib/weather";
import { SettingsContext } from "../../shared/SettingsContext";
import { TopBar } from "./components/TopBar";
import { AirportSelector } from "../../shared/components/airport-selector";
import { useSimVar } from "../../shared/hooks";
import { FlightContext } from "../../shared/lib/FlightContext";
import { fetchSimbriefOfp } from "../../shared/lib/simbrief";
import { ModalContext } from "../../shared/ModalContext";
import { InfoModal } from "../../shared/components/InfoModal";
import { UpperInfo } from "./components/UpperInfo";
import { Loaded } from "./components/Loaded";
import { SettingsPanel } from "./components/SettingsPanel";

export const Weather: FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [airportSelectorDisplayed, setAirportSelectorDisplayed] = useState<boolean>(false);
    const [settingsDisplayed, setSettingsDisplayed] = useState<boolean>(false);

    const { metar, setMetar, taf, setTaf, atis, setAtis, theme, setTheme, selectedAirport, setSelectedAirport } = useContext(WeatherContext);
    const { metarSource, tafSource, atisSource, simbriefUsername } = useContext(SettingsContext);
    const { setOfp } = useContext(FlightContext);
    const { setModal } = useContext(ModalContext);

    const timeOfDay = useSimVar("E:TIME OF DAY", "enum");

    const handleSelectAirport = async (icao: string) => {
        setLoading(true);
        setAirportSelectorDisplayed(false);
        setSelectedAirport(icao);

        try {
            const [metarMessage, tafMessage, atisMessage] = await Promise.all([
                WeatherData.fetchMetar(icao, metarSource),
                WeatherData.fetchTaf(icao, tafSource).catch(() => null),
                WeatherData.fetchAtis(icao, atisSource).catch(() => null),
            ]);

            if (metarMessage) {
                const parsedMetar = parseMetar(metarMessage);
                setMetar(parsedMetar);
                setTheme(determineTheme(parsedMetar.clouds, timeOfDay));
                setTaf(tafMessage ? parseTAF(tafMessage) : null);
                setAtis(atisMessage);
            } else {
                setSelectedAirport(null);
                setModal(<InfoModal title="Error" description="Failed to fetch METAR" />);
            }
        } catch (_) {
            setSelectedAirport(null);
            setModal(<InfoModal title="Error" description="Failed to fetch METAR" />);
        }

        setLoading(false);
    };

    const onUplink = async () => {
        if (!simbriefUsername) {
            setModal(<InfoModal title="SimBrief" description="Set your SimBrief username in the settings first" />);
            return;
        }

        try {
            const newOfp = await fetchSimbriefOfp(simbriefUsername);
            setOfp(newOfp);
            handleSelectAirport(newOfp.origin.icao_code);
        } catch (_) {
            setModal(<InfoModal title="Error" description="Failed to fetch SimBrief OFP" />);
        }
    };

    useEffect(() => {
        if (metar) {
            setTheme(determineTheme(metar.clouds, timeOfDay));
        }
    }, []);

    return (
        <WeatherContainer>
            <LoadingBackground opacity={loading || !selectedAirport ? 1 : 0} />
            <Background src={theme.background} opacity={!loading && selectedAirport ? 1 : 0} />
            <TopBar
                openAirportSelector={() => setAirportSelectorDisplayed(!airportSelectorDisplayed)}
                onRefresh={() => selectedAirport && handleSelectAirport(selectedAirport)}
                onUplink={onUplink}
                openSettings={() => setSettingsDisplayed(!settingsDisplayed)}
            />
            {airportSelectorDisplayed && <AirportSelector selectedAirport={selectedAirport} setSelectedAirport={handleSelectAirport} />}
            {settingsDisplayed && <SettingsPanel onClose={() => setSettingsDisplayed(false)} />}
            {!loading && metar ? (
                <Loaded metar={metar} taf={taf} atis={atis} />
            ) : (
                !metar && (
                    <>
                        <UpperInfo>
                            <div>----</div>
                            <div className="temp">--° C</div>
                        </UpperInfo>
                        <NotLoaded>Select an airport or import from SimBrief</NotLoaded>
                    </>
                )
            )}
        </WeatherContainer>
    );
};

const NotLoaded = styled.div`
    width: 100%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
`;

const Bg = css`
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    transition: opacity 1s;
    opacity: ${(props: { opacity: number }) => props.opacity};
`;

const LoadingBackground = styled.img`
    ${Bg}
    background: linear-gradient(0deg, rgba(76, 153, 226, 1) 0%, rgba(0, 45, 164, 1) 100%);
`;

const Background = styled.img`
    object-fit: cover;
    opacity: 0;
    ${Bg}
`;

const WeatherContainer = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    font-family: Roboto, sans-serif;
    overflow: hidden;
    z-index: 0;
`;
