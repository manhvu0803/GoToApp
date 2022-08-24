import { DataSnapshot } from "firebase-admin/database";
import { AccountType, Account } from "./account";
import { handleError } from "../utilities";
import * as firestore from "../firebase/firestore";
import * as database from "../firebase/database"

console.log("Listening for new users");

export function enable()
{
    database.on("register", "value", handleData);
}

export function disable()
{
    database.off("register", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();

    if (!val)
        return;

    console.log("New user");
    console.log(val);
    
    try {
        let newAccount = new Account(val.name, val.phoneNumber, val.password, AccountType.Customer, val.deviceToken);
        await register(newAccount);
        console.log(`User ${newAccount.phoneNumber} registered successfully`)
    } 
    catch (error) {
        handleError(String(error));
        database.ref("registerStatus").set({
            phoneNumber: val.phoneNumber ?? "",
            successful: false,
            error: String(error),
            time: Date.now()
        });
    }
}

async function register(newAccount: Account)
{
    let existingAccount = await Account.TryFromFirestore(newAccount.phoneNumber);
    if (existingAccount != null) {
        throw new Error("Phone number has already been used")
    }
    
    await firestore.collection("users").doc().set(newAccount.jsObject());

    console.log(`Registered user ${newAccount.phoneNumber}`)
    
    database.ref("registerStatus").set({
        phoneNumber: newAccount.phoneNumber,
        id: newAccount.id,
        successful: true,
        time: Date.now()
    });
}
