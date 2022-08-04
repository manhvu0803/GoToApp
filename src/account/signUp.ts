import { DataSnapshot } from "firebase-admin/database";
import { AccountType, Account } from "./account";
import { handleError } from "../utilities";
import * as firestore from "../firebase/firestore";
import * as database from "../firebase/database"

console.log("Listening for new users");

export function enable()
{
    database.on("newUser", "value", handleData);
}

export function disable()
{
    database.off("newUSer", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();

    if (!val)
        return;

    console.log("New user")
    console.log(val);
    
    try {
        let newAccount = new Account(val.username, val.phoneNumber, val.password, AccountType.Customer);
        await register(newAccount);
    } 
    catch (error) {
        handleError(String(error));
        database.ref("registerStatus").set({
            username: val.username ?? "",
            successful: false,
            error: String(error)
        });
    }
}

async function register(newAccount: Account)
{
    let existingAccount = await Account.TryFromFirestore(newAccount.username, newAccount.phoneNumber);
    if (existingAccount != null) {
        if (newAccount.username == existingAccount.username) {
            throw new Error("Username has already been used")
        }

        throw new Error("Phone number has already been used")
    }
    
    await firestore.collection("users").doc().set(newAccount.jsObject());

    console.log(`Registered user ${newAccount.username}`)
    
    database.ref("registerStatus").set({
        username: newAccount.username,
        successful: true
    });
}