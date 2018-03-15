import { CommandType } from "./CommandType";

export interface ICommand {
    type: CommandType;
    stream: string;
}
