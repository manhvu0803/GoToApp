import * as firebaseApp from "./firebaseApp";
import { DataSnapshot, EventType, getDatabase, Reference } from "firebase-admin/database";
import { handleError } from "../utilities"

firebaseApp.initialize();

const database = getDatabase();

export function on(reference: string, listenType: EventType, dataCallback: (a: DataSnapshot, b?: string | null) => any, errorCallback?: Object | ((a: Error) => any))
{
    if (!errorCallback)
        errorCallback = handleError;
    database.ref(reference).on(listenType, dataCallback, errorCallback);
}

export function off(reference: string, listenType: EventType, dataCallback?: (a: DataSnapshot, b?: string | null) => any, errorCallback?: Object | ((a: Error) => any))
{
    if (!errorCallback)
        errorCallback = handleError;
    database.ref(reference).off(listenType, dataCallback, errorCallback);
}

export function ref(reference: string | Reference)
{
    return database.ref(reference);
}