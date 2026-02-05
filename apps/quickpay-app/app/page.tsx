import { redirect } from "next/navigation";

export default function HomePage() {
    // For now, redirect to user login
    // TODO: Create a proper landing page
    redirect("/login");
}
