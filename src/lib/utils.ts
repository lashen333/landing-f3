// src\lib\utils.ts
export const cx = (...classes:Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join("");