import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, AlertTriangle } from "lucide-react";

interface EnvironmentVariablesModalProps {
  open: boolean;
  onDismiss: () => void;
  onTakeMeThere: () => void;
}

export function EnvironmentVariablesModal({
  open,
  onDismiss,
  onTakeMeThere,
}: EnvironmentVariablesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md bg-black/95 border-cyber-cyan/30 backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-500/20 rounded-full border border-orange-500/30">
              <Settings className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Environment Variables Required
          </DialogTitle>
          <DialogDescription className="text-cyber-cyan/70 text-center">
            To use all SCORPIUS services, please configure your environment
            variables in the Profile tab.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-orange-400 font-medium">
                Required Configuration:
              </p>
              <ul className="text-xs text-cyber-cyan/80 space-y-1">
                <li>• API Keys for security scanning tools</li>
                <li>• RPC endpoints for blockchain access</li>
                <li>• WebSocket connections for real-time data</li>
                <li>�� Third-party service integrations</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onDismiss}
            className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10"
          >
            Dismiss
          </Button>
          <Button onClick={onTakeMeThere} className="btn-primary font-medium">
            <Settings className="w-4 h-4 mr-2" />
            Take Me There
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
