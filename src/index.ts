import * as signUp from "./signUp"
import * as express from "express"

let app = express();

app.listen(process.env.PORT || 5000, () => {
    signUp.enable();
})