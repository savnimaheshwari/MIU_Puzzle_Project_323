// common.js: shared UI helpers and colour tables.
export const h=React.createElement;
export const {useState,useMemo,useEffect,useRef}=React;
export const RC=[0x8a8f98,0x14b8a6,0x84cc16,0xa855f7,0xec4899],RCs=["#8a8f98","#14b8a6","#84cc16","#a855f7","#ec4899"];
export const MC=[0xe5484d,0x4f8ef7,0xf5a524],MCs=["#e5484d","#4f8ef7","#f5a524"];
export const short=(t,m=16)=>t.length>m?t.slice(0,m-2)+"…":t;
