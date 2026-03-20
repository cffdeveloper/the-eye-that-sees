import { useState } from "react";
import { Search } from "lucide-react";
import { DeepDiveDialog } from "./DeepDiveDialog";

interface ClickableItemProps {
  title: string;
  detail?: string;
  industryName?: string;
  subFlowName?: string;
  children: React.ReactNode;
  className?: string;
}

export function ClickableItem({ title, detail, industryName, subFlowName, children, className }: ClickableItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`cursor-pointer group relative ${className || ""}`}
      >
        {children}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Search className="w-3 h-3 text-primary" />
        </div>
      </div>
      <DeepDiveDialog
        open={open}
        onClose={() => setOpen(false)}
        topic={title}
        context={detail}
        industryName={industryName}
        subFlowName={subFlowName}
      />
    </>
  );
}
