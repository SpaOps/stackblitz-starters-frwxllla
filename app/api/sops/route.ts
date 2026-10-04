  // Load SOPs through the server (verifies Clerk login, scopes to this client)
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadSops() {
      setLoading(true);
      try {
        const res = await fetch("/api/sops");
        if (!res.ok) throw new Error("Failed to load SOPs");
        const json = await res.json();
        setSops(json.sops || []);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSops();
  }, [user, isLoaded]);
