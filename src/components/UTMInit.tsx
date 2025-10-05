// src\components\UTMInit.tsx
"use client";

import { useEffect } from "react";

function getUTMsFromUrl(){
    const sp = new URLSearchParams(window.location.search);
    const pick = (k:string)=>sp.get(k) || undefined;

    return{
        utm_source:pick("utm_source"),
        utm_medium:pick("utm_medium"),
        utm_campaign:pick("utm_campaign"),
        utm_content:pick("utm_content"),
        utm_term:pick("utm_term"),
    };
}

export default function UTMInit(){
    useEffect(() =>{
        // session id (persist for this tab)
        let sid = sessionStorage.getItem("sid");
        if(!sid){
            sid = (globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2));
            sessionStorage.setItem("sid",sid);
        }

        const variantRaw = sessionStorage.getItem("variant");
        const variant = variantRaw ? JSON.parse(variantRaw) : undefined;

        const utm = getUTMsFromUrl();
        const payload = {
            sessionId: sid,
            utm,
            pageUrl:window.location.href,
            referrer:document.referrer || undefined,
            variant: variant ? {_id: variant._id, name: variant.name} : undefined
        };

        const API = process.env.NEXT_PUBLIC_API_URL ;

        // fire and forget; no need to block UI
        fetch(`${API}/api/sessions/start`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(payload),
            keepalive:true,

        }).catch(()=>{   });
                
    }, []);

    return null;

}