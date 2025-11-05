import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface POVCameraProps {
  isActive: boolean;
}

export const POVCamera = ({ isActive }: POVCameraProps) => {
  return (
    <Card className="cyber-border bg-card/50 backdrop-blur-sm p-4 overflow-hidden relative">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">Drone POV Camera</h3>
        {isActive && (
          <div className="ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs text-destructive">LIVE</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="aspect-video bg-background/50 rounded border border-border/50 relative overflow-hidden">
        {isActive ? (
          <>
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-primary/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-primary animate-pulse-glow" />
                </div>
                <p className="text-xs text-primary">Scanning terrain...</p>
              </div>
            </div>
            {/* Scan line effect */}
            <motion.div
              className="absolute inset-x-0 h-1 bg-primary/50"
              animate={{ y: [0, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Camera Offline</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
