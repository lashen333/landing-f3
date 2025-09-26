// src\components\dashboard\campaigns\useCampaigns.ts
"use client";

 const API = process.env.NEXT_PUBLIC_API_URL;

 export type CampaignRow = {
    source: string;
    campaign: string;
    sessions: number;
    users: number;
    ctaClicks: number;
    ctr: number;     //clicks/sessions
    avgTimePerSession: number;  //seconds
    avgHero: number;
    avgServices: number;
    avgContact: number;

 };

 export async function fetchCampaignsOverview(){
    const res = await fetch(`${API}/api/analytics/campaigns/overview`, {cache:"no-store"});
    if(!res.ok) throw new Error("overview failed");
    return res.json() as Promise<{ok:true;rows:CampaignRow[];bySource:{source:string;sessions:number;users:number;ctaClicks:number;ctr:number}[]}>;

 }

 export async function fetchCampaignDetail(source: string, campaign: string){
    const url = `${API}/api/analytics/campaigns/detail?source=${encodeURIComponent(source)}&campaign=${encodeURIComponent(campaign)}`;
    const res = await fetch(url,{cache:"no-store"});
    if(!res.ok) throw new Error("detail failed");
    return res.json() as Promise<{
        ok:true;
        head:CampaignRow | null;
        devices:{label: string; count: number}[];
        geo:{location:string; sessions:number; uniqueUsers: number}[];
    }>;
 }