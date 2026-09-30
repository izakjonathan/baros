import { createHash } from "node:crypto";
import { db } from "@/lib/db/client";
import { ActivationForm } from "./activation-form";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export default async function ActivatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rows = await db()<Array<{ name: string; email: string; role: string; existing_account: boolean }>>`
    select i.name,i.email,i.role,exists(select 1 from users u where u.email=i.email) existing_account
    from operation_user_invitations i
    where i.token_hash=${tokenHash(token)} and i.status='PENDING' and i.expires_at>now()
    limit 1`;
  const invitation = rows[0];
  if (!invitation) {
    return <main className="login-page"><section className="card login-card"><div className="login-brand"><span>Bar</span><b>Os</b></div><h1>Invitation unavailable</h1><p>This invitation has expired, was revoked, or has already been used. Ask the owner to create a new invitation.</p></section></main>;
  }
  return <ActivationForm token={token} userName={invitation.name} email={invitation.email} role={invitation.role} existingAccount={invitation.existing_account} />;
}
