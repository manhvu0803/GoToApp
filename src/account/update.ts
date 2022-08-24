import { DataSnapshot } from "firebase-admin/database";
import { Account } from "./account";
import { handleError } from "../utilities";
import * as database from "../firebase/database";
import * as firestore from "../firebase/firestore";

console.log("Listening for account update");

export function enable()
{
    database.on("update", "value", handleData);
}

export function disable()
{
    database.off("update", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();

    if (!val) {
        return;
    }

    console.log("New update for " + val.phoneNumber);

    try {
        let account = await Account.FromFirestore(val.phoneNumber);
        firestore.update(firestore.collection("users").doc(account.id), val);

        await database.ref("updateStatus").set({
            phoneNumber: val.phoneNumber,
            successful: true,
            time: Date.now(),
        });
        
        console.log("Updated " + val.phoneNumber);
    }
    catch (error) {
        let errorString = String(error);
        handleError(errorString);
        
        database.ref("updateStatus").set({
            phoneNumber: val.phoneNumber ?? "",
            successful: false,
            error: errorString,
            time: Date.now()
        });
    }
}
