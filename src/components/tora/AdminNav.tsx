import Link from "next/link";
import { staffLogout } from "@/app/(admin)/admin/actions";

export function AdminNav({ name, role }: { name: string; role: string }) {
  return (
    <header className="adm-nav">
      <b>Tora Mari admin</b>
      <nav>
        <Link href="/admin">Orders & measures</Link>
        <Link href="/admin/new">Record an order</Link>
        <Link href="/admin/affiliates">Affiliates</Link>
        {role === "admin" && <Link href="/admin/staff">Staff</Link>}
      </nav>
      <form action={staffLogout}>
        <span>
          {name} ({role})
        </span>{" "}
        <button type="submit">Log out</button>
      </form>
    </header>
  );
}
