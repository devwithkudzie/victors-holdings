import { redirect } from "next/navigation";

/** Payouts now live on the Orders tab */
export default function Payouts() {
  redirect("/tora-mari/dashboard/orders");
}
