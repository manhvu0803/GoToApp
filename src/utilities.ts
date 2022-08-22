export function handleError(error: any)
{
    if (process.env.NODE_ENV == "dev"){
        console.error("\x1b[31m%s\x1b[0m", error);
    }
    else {
        console.error(error);
    }
}