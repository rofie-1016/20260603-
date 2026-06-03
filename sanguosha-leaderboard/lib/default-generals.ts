/** 内置武将库入口（数据见 default-generals.json） */
import generals from "./default-generals.json";

export const DEFAULT_GENERALS = generals as readonly string[];
export const DEFAULT_GENERALS_COUNT = generals.length;
