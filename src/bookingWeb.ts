import { DataSnapshot } from "firebase-admin/database";
import { handleError } from "./utilities";
import * as database from "./firebase/database";
import * as firestore from "./firebase/firestore";
import { Account, AccountType } from "./account/account";
import { FieldValue } from "firebase-admin/firestore";

console.log("Listening for booking");

export function enable()
{
    database.on("bookingWeb", "value", handleData);
}

export function disable()
{
    database.off("bookingWeb", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();

    if (!val)
        return;

    console.log("New web booking from " + val.phoneNumber);

    try {
        let account = await Account.GetByPhone(val.phoneNumber);
    
        if (account == null) {
            await CreateTempAccount(val);
        }
        else {
            await AddBookingToHistory(account, val)
        }
    }
    catch (err) {
        let errorString = String(err);
        handleError(err);
        database.ref("bookingWebStatus").set({
            error: errorString,
            time: Date.now()
        })
    }
}

async function CreateTempAccount(val: { phoneNumber: string; endPoint: { name: any; }; }) 
{
    await firestore.collection("users").add({
        name: "Temporary user",
        type: AccountType[AccountType.Customer],
        phoneNumber: val.phoneNumber,
        history: FieldValue.arrayUnion(val.endPoint.name)
    });

    let account = await Account.FromFirestore(val.phoneNumber);
    NotifyBooking(account, val);

    console.log("Created temporary user " + val.phoneNumber);
}

async function AddBookingToHistory(account: Account, val: { endPoint: { name: any; } }) {
    await firestore.collection("users").doc(account.id).update({
        history: FieldValue.arrayUnion(val.endPoint.name),
        nearsest: FieldValue.arrayUnion({ 
            time: new Date(),
            destination: val.endPoint.name
        })
    });

    console.log("Added " + val.endPoint.name + " to " + account.phoneNumber + " history");

    NotifyBooking(account, val);
}

async function NotifyBooking(account: Account, val: any) {
    val.phoneNumber = account.phoneNumber;
    val.id = account.id;
    val.customerId = account.id;
    val.isWeb = true;
    await database.set(database.ref("booking"), val);

    console.log("Notify booking for " + account.phoneNumber);
}