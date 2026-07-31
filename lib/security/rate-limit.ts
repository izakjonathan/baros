import { db } from "@/lib/db/client";
export async function enforceRateLimit(key:string, limit=10, windowSeconds=60){
 const [row]=await db()`insert into rate_limit_buckets(key,count,window_started_at,expires_at) values(${key},1,now(),now()+(${windowSeconds}||' seconds')::interval)
 on conflict(key) do update set count=case when rate_limit_buckets.expires_at<now() then 1 else rate_limit_buckets.count+1 end,
 window_started_at=case when rate_limit_buckets.expires_at<now() then now() else rate_limit_buckets.window_started_at end,
 expires_at=case when rate_limit_buckets.expires_at<now() then now()+(${windowSeconds}||' seconds')::interval else rate_limit_buckets.expires_at end returning count,expires_at`;
 if(Number(row.count)>limit) throw new Error("RATE_LIMITED");
}
