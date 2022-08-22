import * as signUp from "./account/signUp"
import * as login from "./account/login"
import * as logout from "./account/logout"
import * as bookingWeb from "./bookingWeb"
import * as express from "express"

let app = express();

app.listen(process.env.PORT || 5000, () => {
    signUp.enable();
    login.enable();
    logout.enable();
    bookingWeb.enable();
})

app.get("/", (req, res) => {
    res.send("OK");
})