import { DataSnapshot } from "firebase-admin/database";
import { Account } from "./account";
import { handleError } from "../utilities";
import * as database from "../firebase/database";
import * as bcrypt from "bcrypt";
import * as firestore from "../firebase/firestore";

console.log("Listening for logins");

export function enable()
{
    database.on("login", "value", handleData);
}

export function disable()
{
    database.off("login", "value");
}

async function handleData(snapshot: DataSnapshot)
{
    let val = snapshot.val();

    if (!val)
        return;

    console.log("New login " + val.phoneNumber);
    
    try {
        await login(val.phoneNumber, val.password, val.deviceToken);
        console.log(val.phoneNumber + " logged in sucessfully")
    } 
    catch (error) {
        let errorString = String(error);
        handleError(errorString);
        database.ref("loginStatus").set({
            phoneNumber: val.phoneNumber ?? "",
            successful: false,
            error: errorString
        });    
    }
}

async function login(phoneNumber: string, password: string, deviceToken?: string)
{
    let account = await Account.FromFirestore(phoneNumber);

    if (!bcrypt.compareSync(password, account.password)) {
        throw new Error("Wrong phone number or password");
    }

    await firestore.collection("users").doc(account.id).update({ deviceToken: deviceToken });
    
    await database.ref("loginStatus").set({
        successful: true,
        name: account.name,
        phoneNumber: account.phoneNumber,
        accountType: account.type,
        token: "mock_token"
    });
}
