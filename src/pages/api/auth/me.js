import { getSession } from "../../../lib/auth";

export default function handler(req, res) {
  const session = getSession(req);
  return res.status(200).json({ ok: true, authed: !!session });
}
