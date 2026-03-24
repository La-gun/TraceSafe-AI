import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/lib/base44Client";
import Navbar from "../components/landing/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import IncidentStats from "../components/incidents/IncidentStats";
import IncidentTable from "../components/incidents/IncidentTable";
import IncidentDetailPanel from "../components/incidents/IncidentDetailPanel";
import { ShieldAlert } from "lucide-react";
import usePullToRefresh from "@/hooks/usePullToRefresh.jsx";

const QUERY_KEY = ["consumer-reports"];

export default function IncidentManager() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { containerRef, PullIndicator } = usePullToRefresh(() =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  );

  const { data: reports = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => base44.entities.ConsumerReport.list("-created_date", 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConsumerReport.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (old = []) =>
        old.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const filtered =
    filterStatus === "all"
      ? reports
      : reports.filter((r) => r.incident_status === filterStatus);

  const selected = reports.find((r) => r.id === selectedId) || null;

  const handleUpdate = (id, data) => updateMutation.mutate({ id, data });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#060B18] overflow-y-auto">
      <PullIndicator />
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-8 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-red-500/4 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-400 tracking-widest uppercase">Regulator Module</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Incident Manager</h1>
            </div>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl mt-1">
            Consumer-reported serial numbers escalated for investigation. Flag verified counterfeits, assign quarantine actions, and track resolution.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <IncidentStats reports={reports} />
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5">
          {/* Table */}
          <div className="flex-1 min-w-0">
            <IncidentTable
              reports={filtered}
              isLoading={isLoading}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="lg:w-96 shrink-0"
              >
                <IncidentDetailPanel
                  report={selected}
                  onUpdate={handleUpdate}
                  onClose={() => setSelectedId(null)}
                  isPending={updateMutation.isPending}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}