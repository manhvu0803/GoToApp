import * as bcrypt from "bcrypt";
import * as firestore from "../firebase/firestore"

export enum AccountType
{
    Customer,
    Driver,
    Admin,
}

export class Account
{
    username: string;
    phoneNumber: string;
    password: string;
    type: AccountType;

    static async TryFromFirestore(username: string, phoneNumber?: string)
    {
        try {
            return await Account.FromFirestore(username, phoneNumber);
        }
        catch {
            return null;
        }
    }

    /**
     * Get account info from Firestore with either username or phone number.
     * Username will be used first. If it fail, phone number will be used
     * @param phoneNumber
     * @param username
     * @returns account info
     */
    static async FromFirestore(username: string, phoneNumber?: string)
    {
        let val = null;
        if (username) {
            val = await Account.TryGet("username", username);
        }
        
        if (val == null && phoneNumber) {
            val = await Account.TryGet("phoneNumber", phoneNumber);
        }

        if (val == null) {
            throw new Error("User does not exists");
        }
        
        let accountType = AccountType[AccountType[val["accountType"]]];
        return new Account(val["username"], val["phoneNumber"], val["password"], accountType, false)
    }

    private static async TryGet(fieldName: string, value: string)
    {
        let result = await firestore.query(firestore.collection("users").where(fieldName, "==", value));

        if (result.length <= 0) {
            return null;
        }

        return result[0];
    }

    constructor(username: string, phoneNumber: string, password: string, accountType: AccountType, hashPassword: boolean = true)
    {
        if (!username) {
            throw new Error("No username");
        }

        if (!phoneNumber) {
            throw new Error("No phone number");
        }

        if (!password) {
            throw new Error("No password");
        }
        
        this.username = username;
        this.phoneNumber = phoneNumber;

        if (hashPassword) {
            this.password = bcrypt.hashSync(password, 5);
        }
        else {
            this.password = password;
        }

        this.type = accountType;
    }

    public jsObject() {
        return {
            username: this.username,
            phoneNumber: this.phoneNumber,
            password: this.password,
            accountType: AccountType[this.type]
        };
    }
}