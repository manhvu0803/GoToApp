import { DataSnapshot } from "firebase-admin/database";
import { handleError } from "./utilities";
import * as database from "./firebase/database";
import * as firestore from "./firebase/firestore";
import { Account, AccountType } from "./account/account";
import { FieldValue } from "firebase-admin/firestore";

console.log("Listening for booking");

export function enable()
{
    database.on("booking", "value", handleData);
}

export function disable()
{
    database.off("booking", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();

    if (!val)
        return;

    console.log("New booking from " + val.phoneNumber);

    let account = await Account.GetByPhone(val.phoneNumber);

    try {
        if (account == null) {
            await firestore.collection("users").add({
                name: "Temporary user",
                type: AccountType[AccountType.Customer],
                phoneNumber: val.phoneNumber,
                history: FieldValue.arrayUnion(val.endPoint.name)
            })
            console.log("Created temporary user " + val.phoneNumber);
        }
        else {
            await firestore.collection("users").doc(account.id).update({
                history: FieldValue.arrayUnion(val.endPoint.name)
            })
            console.log("Added to " + val.phoneNumber + " history");
        }
    }
    catch (err) {
        let errorString = String(err);
        console.log(errorString);
        database.ref("bookingStatus").set({
            error: errorString,
            time: Date.now()
        })
    }
}