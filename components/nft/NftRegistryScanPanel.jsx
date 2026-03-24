import React from "react";
import { Hexagon } from "lucide-react";

/**
 * Shows NFT registry row from scanTag when DATABASE_URL / NFT_REGISTRY_DATABASE_URL is configured.
 */
export default function NftRegistryScanPanel({ nft }) {
  if (!nft || typeof nft !== "object") return null;

  const hasToken =
    nft.contract_address &&
    nft.token_id != null &&
    String(nft.token_id).length > 0;

  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 px-3 py-2.5 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/90 flex items-center gap-2">
        <Hexagon className="w-3.5 h-3.5" />
        NFT tag registry
      </p>
      <dl className="grid grid-cols-1 gap-1.5 text-[10px] text-gray-400">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-600 shrink-0">Assignment</dt>
          <dd className="text-gray-300 font-mono text-right">{nft.assignment_status}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-600 shrink-0">Catalog node</dt>
          <dd className="text-gray-300 font-mono text-right truncate" title={nft.hierarchy_code}>
            {nft.node_kind} · {nft.hierarchy_code}
          </dd>
        </div>
        {nft.path && (
          <div className="pt-0.5">
            <dt className="text-gray-600 mb-0.5">Hierarchy path</dt>
            <dd className="text-[9px] font-mono text-gray-500 break-all leading-relaxed">{nft.path}</dd>
          </div>
        )}
        {nft.lifecycle_state && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-600 shrink-0">Token lifecycle</dt>
            <dd className="text-gray-300">{nft.lifecycle_state}</dd>
          </div>
        )}
        {hasToken && (
          <div className="pt-1 border-t border-white/[0.06] space-y-1">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-600 shrink-0">Chain</dt>
              <dd className="text-gray-300 font-mono">{nft.chain_id}</dd>
            </div>
            <div>
              <dt className="text-gray-600 mb-0.5">Contract</dt>
              <dd className="text-[9px] font-mono text-gray-400 break-all">{nft.contract_address}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-600 shrink-0">Token id</dt>
              <dd className="text-gray-300 font-mono truncate" title={String(nft.token_id)}>
                {String(nft.token_id)}
              </dd>
            </div>
          </div>
        )}
        {!hasToken && (
          <p className="text-[9px] text-gray-600 pt-1 border-t border-white/[0.06]">
            On-chain token not bound yet — physical tag is catalogued under SKU hierarchy.
          </p>
        )}
      </dl>
    </div>
  );
}
