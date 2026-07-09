import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
// ... (keep all your other imports)

export const Route = createFileRoute("/super-admin/client-control")({
  head: () => ({
    meta: [
      { title: "Client Control — Mcphilix Go ERP" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientControl,
});

function ClientControl() {
  const navigate = useNavigate();
  const { accounts, superAdminAuthed } = useAdmin(); 
  
  // This effect ensures that if the state resets to false,
  // we handle it cleanly.
  useEffect(() => {
    if (!superAdminAuthed) {
      navigate({ to: "/super-admin/login" });
    }
  }, [superAdminAuthed, navigate]);

  // If not authenticated, return null immediately so nothing flickers
  if (!superAdminAuthed) return null;

  // ... (rest of your component code stays exactly as it was)
