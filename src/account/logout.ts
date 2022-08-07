import * as firestore from "../firebase/firestore";
import { DataSnapshot } from "firebase-admin/database";
import * as database from "../firebase/database";
import { handleError } from "../utilities";
import { Account } from "./account";

console.log("Listening for logouts");

export function enable()
{
    database.on("logout", "value", handleData);
}

export function disable()
{
    database.off("logout", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();
    
    if (!val)
        return;

    console.log(val.phoneNumber + " logging out");
    
    try {
        await logout(val.phoneNumber);
        console.log(val.phoneNumber + " logged out")
    } 
    catch (error) {
        let errorString = String(error);
        handleError(errorString);
        database.ref("logoutStatus").set({
            phoneNumber: val.phoneNumber ?? "",
            successful: false,
            error: errorString
        });    
    }
}

async function logout(phoneNumber: string) 
{
    let account = await Account.FromFirestore(phoneNumber);

    await firestore.collection("users").doc(account.id).update({ deviceToken: null });
}