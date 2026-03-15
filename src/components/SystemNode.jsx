import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GlowCard } from './GlowCard';

function SystemNode({ data }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} id="top" className="!opacity-0" />
      <Handle type="target" position={Position.Right} id="right" className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="!opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="!opacity-0" />
      <Handle type="source" position={Position.Top} id="s-top" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="s-right" className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="!opacity-0" />
      <Handle type="source" position={Position.Left} id="s-left" className="!opacity-0" />

      <GlowCard active={data.active !== false} className="w-[170px]">
        {/* Icon */}
        <div className="w-11 h-11 rounded-lg bg-[#1c2127] border border-white/[0.06] flex items-center justify-center mx-auto mb-3 text-xl">
          {data.icon}
        </div>

        {/* Title */}
        <div className="text-[13px] font-semibold text-zinc-100 text-center">
          {data.label}
        </div>

        {/* Subtitle */}
        {data.subtitle && (
          <div className="text-[11px] text-zinc-500 text-center mt-1">
            {data.subtitle}
          </div>
        )}
      </GlowCard>
    </div>
  );
}

export default memo(SystemNode);
