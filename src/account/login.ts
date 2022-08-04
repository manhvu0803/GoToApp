import { DataSnapshot } from "firebase-admin/database";
import { Account } from "./account";
import { handleError } from "../utilities";
import * as database from "../firebase/database"
import * as bcrypt from "bcrypt"

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

    console.log("New login " + val.username);
    
    try {
        await login(val.username, val.phoneNumber, val.password);
    } 
    catch (error) {
        let errorString = String(error);
        handleError(errorString);
        database.ref("loginStatus").set({
            username: val.username ?? "",
            phoneNumber: val.phoneNumber ?? "",
            successful: false,
            error: errorString
        });    
    }
}

async function login(username: string, phoneNumber: string, password: string)
{
    let account = await Account.FromFirestore(username, phoneNumber);

    if (!bcrypt.compareSync(password, account.password)) {
        throw new Error("Wrong usernanme, phone number or password");
    }
    
    await database.ref("loginStatus").set({
        successful: true,
        username: account.username,
        phoneNumber: account.phoneNumber,
        accountType: account.type,
        token: "mock_token"
    });
}