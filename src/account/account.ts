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
    id: string;
    name: string;
    phoneNumber: string;
    password: string;
    type: AccountType;
    deviceToken: string;

    static async TryFromFirestore(phoneNumber: string)
    {
        try {
            return await Account.FromFirestore(phoneNumber);
        }
        catch {
            return null;
        }
    }

    /**
     * Get account info from Firestore by or phone number
     * @param phoneNumber
     * @returns account info
     */
    public static async FromFirestore(phoneNumber: string)
    {
        let val = await Account.GetByPhone(phoneNumber);

        if (val == null) {
            throw new Error("User does not exists");
        }
        
        return val;
    }

    /**
     * Try to get info of an account from Firestore by phone number 
     * @param phoneNumber
     * @returns 
     */
    public static async GetByPhone(phoneNumber: string)
    {
        let query = firestore.collection("users").where("phoneNumber", "==", phoneNumber);
        let result = await firestore.query(query);

        if (result.length <= 0) {
            return null;
        }

        let val = result[0];
        
        let accountType = AccountType[AccountType[val.accountType]];
        return new Account(val.name, val.phoneNumber, val.password, accountType, val.deviceToken, val.id, false);
    }

    constructor(name: string, phoneNumber: string, password: string, accountType: AccountType, deviceToken: string, id?: string, hashPassword: boolean = true)
    {
        if (!name) {
            throw new Error("Name is empty");
        }

        if (!phoneNumber) {
            throw new Error("No phone number");
        }
 
        this.name = name;
        this.phoneNumber = phoneNumber;

        if (hashPassword) {
            this.password = bcrypt.hashSync(password, 5);
        }
        else {
            this.password = password;
        }

        if (!accountType) {
            this.type = AccountType.Customer;
        }
        else {
            this.type = accountType;
        }

        if (id) {
            this.id = id; 
        }
        
        this.deviceToken = deviceToken;
    }

    public jsObject() {
        return {
            id: this.id,
            name: this.name,
            phoneNumber: this.phoneNumber,
            password: this.password,
            accountType: AccountType[this.type],
            devicetoken: this.deviceToken
        };
    }
}