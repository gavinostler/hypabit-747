import { EventBus, FacilityLoader, FacilityRepository } from "@microsoft/msfs-sdk";

export const facilityLoader = new FacilityLoader(FacilityRepository.getRepository(new EventBus()));

export const getIdentFromIcao = (icao: string): string => icao.slice(-5).trim();

export const getAirportIcaoFromIdent = (ident: string): string => `A      ${ident.padEnd(5)}`;