import { UserType } from "@utils/generateTokens";



export { };

declare global {
    namespace Express {
        interface Request {
            user?: UserType
        }
    }
}